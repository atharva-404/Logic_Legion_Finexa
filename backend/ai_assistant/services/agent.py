import json
import asyncio
from typing import Any, Callable, Dict, Optional
import google.generativeai as genai
from django.conf import settings

from .expense_chat import chat_with_expense_data
from .expense_extraction import get_mongo_collection
from .expense_summary import summarize_expenses_from_data

from transactions.models import Transaction

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class Agent:
    """A simple LLM-guided agent that can call a small set of tools.

    Tools supported:
      - answer_with_doc: use the document-aware QA LLM to answer the user's question
      - summarize_document: produce a short JSON summary using the summarizer LLM
      - list_transactions: list recent transactions from the SQL DB

    The agent streams structured messages by calling the provided send_fn callback.
    """

    def __init__(self, model: str = "gemini-1.5-flash"):
        self.model = model

    async def run(
        self,
        question: str,
        user,  # Django user or None
        mongo_doc: Optional[Dict[str, Any]],
        send_fn: Callable[[Dict[str, Any]], Any],
    ) -> str:
        """Run the agent on a single user question.

        send_fn: async callable that accepts a payload dict and streams it (await send_fn(payload)).
        Returns final answer string.
        """
        # 1) Ask LLM to choose a tool and plan (JSON)
        prompt = self._build_planning_prompt(question)

        await send_fn({"type": "agent_thought", "text": "Forming plan..."})

        # call LLM in a thread to avoid blocking event loop
        raw_plan = await asyncio.to_thread(self._call_llm_for_plan, prompt)

        try:
            plan = json.loads(raw_plan)
        except Exception:
            # If plan is not JSON, treat the whole as final answer
            await send_fn({"type": "agent_result", "text": raw_plan})
            return raw_plan

        # plan is expected to be something like {"action": "answer_with_doc", "reason": "..."}
        action = plan.get("action")
        await send_fn({"type": "agent_thought", "text": f"Planned action: {action}"})

        # Execute action
        if action == "summarize_document":
            await send_fn({"type": "agent_action", "text": "Running summarizer..."})
            result = await asyncio.to_thread(self._tool_summarize_document, mongo_doc)
            await send_fn({"type": "agent_result", "text": json.dumps(result)})
            final = json.dumps(result)
        elif action == "list_transactions":
            await send_fn({"type": "agent_action", "text": "Fetching recent transactions..."})
            result = await asyncio.to_thread(self._tool_list_transactions, user)
            await send_fn({"type": "agent_result", "text": result})
            final = result
        else:
            # default to answering with document (QA)
            await send_fn({"type": "agent_action", "text": "Answering using document context..."})
            final = await asyncio.to_thread(self._tool_answer_with_doc, question, mongo_doc)
            await send_fn({"type": "agent_result", "text": final})

        return final

    def _call_llm_for_plan(self, prompt: str) -> str:
        model = genai.GenerativeModel(self.model)
        response = model.generate_content(
            f"You are Finexa AI agent that chooses which tool to call.\n\n{prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,
                max_output_tokens=300,
            )
        )
        return response.text

    def _build_planning_prompt(self, question: str) -> str:
        return (
            "You are given a user's question about their expenses. Decide which single action to take "
            "from the following options and return a JSON object with keys: action, reason. "
            "Actions: summarize_document, list_transactions, answer_with_doc. "
            f"Question: {question}\n"
            "Return e.g. {\"action\": \"summarize_document\", \"reason\": \"short reason\"}"
        )

    def _tool_summarize_document(self, mongo_doc: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not mongo_doc:
            return {"error": "Document not provided"}
        extracted = mongo_doc.get("extracted_data") or {}
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except Exception:
                extracted = {}
        return summarize_expenses_from_data(extracted)

    def _tool_list_transactions(self, user) -> str:
        if not user or getattr(user, 'is_anonymous', True):
            return "User not authenticated."
        qs = Transaction.objects.filter(user=user).order_by('-date')[:20]
        lines = []
        for t in qs:
            lines.append(f"{t.date.date()} | {t.category} | {t.type} | {t.amount}")
        if not lines:
            return "No transactions found."
        return "\n".join(lines)

    def _tool_answer_with_doc(self, question: str, mongo_doc: Optional[Dict[str, Any]]) -> str:
        # fallback to the existing QA pipeline
        return chat_with_expense_data(question, mongo_doc or {})
