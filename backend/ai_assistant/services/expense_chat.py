# ai_assistant/services/expense_chat.py
import json
from typing import List, Dict
import google.generativeai as genai
from django.conf import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


def _build_rag_context(raw_text: str, question: str, max_chars: int = 4000) -> str:
    """
    Very simple RAG-style context builder:
    - split text into paragraphs
    - score by keyword overlap with question
    - pick top paragraphs up to `max_chars`
    """
    if not raw_text:
        return ""

    paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
    question_tokens = set(question.lower().split())

    def score(p: str) -> int:
        tokens = set(p.lower().split())
        return len(tokens & question_tokens)

    ranked = sorted(paragraphs, key=score, reverse=True)
    selected: List[str] = []
    total_len = 0

    for p in ranked:
        if total_len + len(p) > max_chars:
            break
        selected.append(p)
        total_len += len(p)

    return "\n\n".join(selected)


def chat_with_expense_data(question: str, expense_doc: dict) -> str:
    """
    Non-streaming LLM call using Gemini with:
    - Mongo 'extracted_data' (expenses + summary)
    - Mongo 'raw_text' (for naive RAG context)
    """
    extracted = expense_doc.get("extracted_data") or {}
    if isinstance(extracted, str):
        try:
            extracted = json.loads(extracted)
        except json.JSONDecodeError:
            extracted = {}

    expenses: List[Dict] = (extracted.get("expenses") or [])[:80]
    summary: Dict = extracted.get("summary") or {}
    raw_text = expense_doc.get("raw_text") or ""

    rag_context = _build_rag_context(raw_text, question)

    context_json = {
        "summary": summary,
        "sample_expenses": expenses,
    }

    system_prompt = """
You are Finexa AI, an agentic financial decision assistant.

Your role is to understand the user's financial profile, continuously track their balance, obligations, and spending patterns, 
analyze financial risk, and provide clear YES/NO spending decisions, budget guidance, and personalized recommendations.

You must ask clarifying questions when needed, explain your reasoning, and prioritize financial safety, sustainability, and fraud awareness.

CONTEXT PROVIDED:
- A summary of the user's expenses
- A sample list of expense records (date, amount, category, merchant, etc.)
- Some relevant text snippets from the original statement

YOU MUST:
- Answer the user's question using this data
- Be specific with numbers and categories
- Answer in clear, concise language
- Answer should be Short and to the point (max 2-3 lines)
- Answer as a helpful financial assistant
- Propose saving strategies when relevant
- If User asks "Can I spend/buy/invest X?" respond with YES/NO first, then clarify with a single line
- Show confidence level: High/Medium/Low
- If data is insufficient, clearly say what is missing
"""

    user_content = (
        f"User question:\n{question}\n\n"
        "Structured expense JSON:\n"
        f"{json.dumps(context_json, ensure_ascii=False)}\n\n"
        "Relevant text snippets from the document:\n"
        f"{rag_context}"
    )

    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(
        f"{system_prompt}\n\n{user_content}",
        generation_config=genai.types.GenerationConfig(
            temperature=0.4,
            max_output_tokens=900,
        )
    )

    return response.text
