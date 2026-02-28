# ai_assistant/views.py
from rest_framework.views import APIView
import rest_framework.generics as generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from .models import ChatMessage, ChatSession, Document
from .serializers import ChatMessageSerializer, ChatSessionSerializer, DocumentSerializer, DocumentListSerializer
from .services.expense_extraction import (
    extract_text_from_uploaded_file,
    call_llm_for_expense_extraction,
    save_expense_document_to_mongo,
    get_expense_document_by_id,
)
from .services.expense_summary import summarize_expenses_from_data

import json
from collections import defaultdict
from datetime import timedelta
from django.utils import timezone


from django.db import transaction

def deduct_credits(user, amount):
    if user.credits < amount:
        raise ValueError(f"Insufficient credits. Required: {amount}")
    user.credits -= amount
    user.save()
    return user.credits


class DocumentProcessAPIView(APIView):
    """
    POST /api/ai/document/process/
    Cost: 5 Credits
    """

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 0. Deduct Credits (5 Credits)
        try:
            with transaction.atomic():
                deduct_credits(request.user, 5)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            # Refund if no file (simple reversal since we just deducted)
            request.user.credits += 5
            request.user.save()
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # STEP 1: Extract raw text
        try:
            raw_text = extract_text_from_uploaded_file(uploaded_file)
        except Exception as e:
            import traceback
            traceback.print_exc()  # Print full error to console
            return Response({"error": "Text extraction failed", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # STEP 2: Save raw text in SQL Document model
        document = Document.objects.create(
            user=request.user,
            file_name=uploaded_file.name,
            content=raw_text,
        )

        # STEP 3: Run LLM structured extraction
        try:
            structured_data = call_llm_for_expense_extraction(raw_text)
        except Exception as e:
            import traceback
            traceback.print_exc()  # Print full error to console
            return Response({"error": "LLM extraction failed", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # STEP 4: Save structured JSON to Mongo
        try:
            mongo_id = save_expense_document_to_mongo(
                user_id=request.user.id,
                uploaded_file=uploaded_file,
                raw_text=raw_text,
                structured_data=structured_data
            )
        except Exception as e:
            import traceback
            traceback.print_exc()  # Print full error to console
            return Response({"error": "MongoDB save failed", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # STEP 5: Summary using structured JSON + LLM summary generation
        try:
            summary_data = summarize_expenses_from_data(structured_data)
        except Exception as e:
            summary_data = {"error": f"Summary generation failed: {str(e)}"}

        # STEP 5b: Persist mongo_id and summary back to SQL Document
        summary_text = ""
        if isinstance(summary_data, dict):
            summary_text = summary_data.get("summary", "") or summary_data.get("text", "") or str(summary_data)
        elif isinstance(summary_data, str):
            summary_text = summary_data
        document.mongo_doc_id = mongo_id or ""
        document.summary = summary_text
        document.save(update_fields=["mongo_doc_id", "summary"])

        # STEP 6: Auto-create Transaction records from extracted expenses
        created_tx_count = 0
        try:
            from transactions.models import Transaction as TxModel
            expenses_list = structured_data.get("expenses", []) if isinstance(structured_data, dict) else []
            for exp in expenses_list:
                item_name = exp.get("item") or exp.get("description") or "PDF Expense"
                amount_val = exp.get("amount", 0)
                cat = exp.get("category", "Other")
                if amount_val and float(amount_val) > 0:
                    TxModel.objects.create(
                        user=request.user,
                        type="expense",
                        category=cat,
                        amount=float(amount_val),
                        description=item_name,
                        source="pdf",
                        source_document=uploaded_file.name,
                    )
                    created_tx_count += 1
        except Exception as e:
            print(f"[WARN] Failed to create transactions from PDF: {e}")

        return Response(
            {
                "message": "Processed successfully",
                "document_id": document.id,
                "sql_document_id": document.id,
                "mongo_id": mongo_id,
                "summary": summary_data,
                "transactions_created": created_tx_count,
            },
            status=status.HTTP_201_CREATED,
        )


class DocumentListAPIView(APIView):
    """GET /api/ai/documents/  -> list documents stored in SQL"""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        docs = Document.objects.filter(user=request.user).order_by("-created_at")
        serializer = DocumentListSerializer(docs, many=True)
        return Response(serializer.data)


class DocumentContentAPIView(APIView):
    """GET /api/ai/documents/<document_id>/content/ -> return extracted raw text"""

    permission_classes = [IsAuthenticated]

    def get(self, request, document_id, *args, **kwargs):
        try:
            doc = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        serializer = DocumentSerializer(doc)
        return Response(serializer.data)


class ExpenseDocumentSummaryAPIView(APIView):
    """GET /api/ai/expense-document/<mongo_doc_id>/summary/"""

    permission_classes = [IsAuthenticated]

    def get(self, request, doc_id, *args, **kwargs):
        doc = get_expense_document_by_id(doc_id)
        if not doc:
            return Response({"error": "Document not found"}, status=404)

        extracted = doc.get("extracted_data") or {}
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except:
                extracted = {}

        expenses = extracted.get("expenses", [])
        llm_summary = extracted.get("summary", {})

        total_amount = 0.0
        record_count = 0
        currency = llm_summary.get("currency")

        category_totals = defaultdict(lambda: {"total": 0.0, "count": 0})
        merchant_totals = defaultdict(lambda: {"total": 0.0, "count": 0})

        for e in expenses:
            try:
                amount = float(e.get("amount"))
            except:
                continue

            total_amount += amount
            record_count += 1

            category = e.get("category") or "Uncategorized"
            merchant = e.get("merchant") or "Unknown"

            category_totals[category]["total"] += amount
            category_totals[category]["count"] += 1
            merchant_totals[merchant]["total"] += amount
            merchant_totals[merchant]["count"] += 1

        by_category = sorted(
            [{"category": k, "total_amount": v["total"], "count": v["count"]}
             for k, v in category_totals.items()],
            key=lambda x: x["total_amount"],
            reverse=True,
        )

        by_merchant = sorted(
            [{"merchant": k, "total_amount": v["total"], "count": v["count"]}
             for k, v in merchant_totals.items()],
            key=lambda x: x["total_amount"],
            reverse=True,
        )[:10]

        return Response(
            {
                "mongo_id": doc_id,
                "summary": llm_summary,
                "computed": {
                    "total_amount": round(total_amount, 2),
                    "record_count": record_count,
                    "currency": currency,
                    "average": round(total_amount / record_count, 2) if record_count else None,
                },
                "breakdown": {
                    "by_category": by_category,
                    "by_merchant": by_merchant,
                },
            },
            status=200,
        )


class ExpenseSuggestionAPIView(APIView):
    """
    GET /api/ai/expense-document/<mongo_id>/suggestions/
    
    Generate actionable saving suggestions based on spending patterns.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, mongo_id, *args, **kwargs):
        # Fetch expense structured data from MongoDB
        doc = get_expense_document_by_id(mongo_id)
        if not doc:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        extracted = doc.get("extracted_data") or {}
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except:
                extracted = {}

        from .services.expense_suggestions import generate_saving_suggestions

        suggestions = generate_saving_suggestions(extracted)

        return Response(
            {
                "mongo_id": mongo_id,
                "suggestions": suggestions.get("suggestions", []),
            },
            status=200,
        )




class ChatSessionListAPIView(generics.ListAPIView):
    """
    GET /api/socket/chat-sessions/
    List user's chat sessions (paginated).
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by("-created_at")


class ChatMessageListAPIView(generics.ListAPIView):
    """
    GET /api/socket/chat-sessions/<session_id>/messages/
    Paginated messages within a session.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs["session_id"]
        return ChatMessage.objects.filter(
            session__id=session_id,
            session__user=self.request.user,
        ).order_by("-created_at")



from .services.simulation_service import simulate_financial_impact, analyze_credit_health

class SimulationAPIView(APIView):
    """
    POST /api/ai/simulate/
    Body: { "scenario": "loan", "amount": 50000 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        scenario = request.data.get("scenario")
        amount = request.data.get("amount")
        
        if not scenario or not amount:
            return Response(
                {"error": "Please provide both 'scenario' and 'amount'"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Deduct Credits
            deduct_credits(request.user, 10)

            # In a real app, we'd fetch the actual user's current score from DB
            # For now, we default to 750 or allow client to pass it
            current_score = request.data.get("current_score", 750)
            details = request.data.get("details", {})
            
            result = simulate_financial_impact(
                scenario_type=scenario, 
                amount=float(amount),
                current_score=current_score,
                scenario_details=details
            )
            
            return Response(result)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from .services.spending_analysis import analyze_user_spending
from .models import SpendingPattern

class SpendingAnalysisAPIView(APIView):
    """
    GET /api/ai/spending-analysis/
    
    Returns the latest AI spending analysis.
    If no recent analysis (last 24h) exists, it triggers a new one.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Check for recent cached analysis (e.g., last 24 hours)
        last_24h = timezone.now() - timedelta(hours=24)
        recent_pattern = SpendingPattern.objects.filter(
            user=request.user,
            analysis_date__gte=last_24h
        ).first()

        force_refresh = request.query_params.get('refresh') == 'true'

        if recent_pattern and not force_refresh:
            return Response(recent_pattern.analysis_data)
        
        # 2. If no recent analysis or forced refresh, run AI analysis
        # Optional: Deduct credits here if this is a premium feature
        # try:
        #     deduct_credits(request.user, 5)
        # except ValueError as e:
        #      return Response({"error": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        result = analyze_user_spending(request.user)
        
        if "error" in result:
             return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             
        return Response(result)



from .models import Loan
from .serializers import LoanSerializer

class LoanListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /api/ai/loans/ -> List user loans
    POST /api/ai/loans/ -> Create new loan
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LoanSerializer

    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CreditAnalysisAPIView(APIView):
    """
    POST /api/ai/credit-analysis/
    Body: { "loans": [...], "score": 750 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        loans = request.data.get("loans", [])
        score = request.data.get("score", 750)
        
        try:
            # Deduct Credits (10 Credits)
            deduct_credits(request.user, 10)

            result = analyze_credit_health(loans, score)
            return Response(result)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─── Goal Planning API ─────────────────────────────────────────

class GoalPlanAnalysisAPIView(APIView):
    """
    GET /api/ai/goal-plan/
    Returns AI-powered comprehensive goal planning analysis.
    Optional ?refresh=true to force re-analyze.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from .services.goal_planning import analyze_goal_plan
        refresh = request.query_params.get('refresh', 'false').lower() == 'true'
        try:
            if refresh:
                deduct_credits(request.user, 15)
            result = analyze_goal_plan(request.user, refresh=refresh)
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoalIncomeSimulationAPIView(APIView):
    """
    POST /api/ai/goal-plan/simulate/
    Body: { "change_pct": -20 }
    Simulates income change impact on all goals.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from .services.goal_planning import simulate_income_change
        change_pct = request.data.get('change_pct', 0)
        try:
            result = simulate_income_change(request.user, float(change_pct))
            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BudgetAdviceAPIView(APIView):
    """
    GET /api/ai/budget-advice/
    Returns AI-generated budget recommendations based on user's actual spending vs 50/30/20 rule.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from google import genai
        from google.api_core.exceptions import ResourceExhausted
        from django.conf import settings
        from transactions.models import Transaction
        from django.utils import timezone
        from datetime import timedelta

        user = request.user
        income = float(user.income or 0)
        if income <= 0:
            return Response({"tips": ["Set your monthly income in settings to get budget advice."]})

        # Gather this month's expenses
        thirty_days = timezone.now() - timedelta(days=30)
        txns = Transaction.objects.filter(user=user, type='expense', date__gte=thirty_days)
        cat_totals = {}
        for t in txns:
            cat_totals[t.category] = cat_totals.get(t.category, 0) + float(t.amount)
        total_expense = sum(cat_totals.values())
        savings = income - total_expense

        # Classify into needs/wants
        needs_cats = {'Food', 'Groceries', 'Rent', 'Utilities', 'Bills', 'Transportation', 'Health', 'Household', 'Gas', 'Insurance', 'Education'}
        needs = sum(v for k, v in cat_totals.items() if k in needs_cats)
        wants = sum(v for k, v in cat_totals.items() if k not in needs_cats)

        # Build context
        spending_lines = "\n".join(f"  - {k}: ₹{v:,.0f}" for k, v in sorted(cat_totals.items(), key=lambda x: -x[1]))
        context = (
            f"Monthly Income: ₹{income:,.0f}\n"
            f"Total Expenses: ₹{total_expense:,.0f}\n"
            f"Savings: ₹{savings:,.0f} ({savings/income*100:.0f}%)\n"
            f"Needs (50% ideal = ₹{income*0.5:,.0f}): ₹{needs:,.0f}\n"
            f"Wants (30% ideal = ₹{income*0.3:,.0f}): ₹{wants:,.0f}\n"
            f"Category Breakdown:\n{spending_lines}"
        )

        prompt = (
            "You are a friendly personal finance advisor for an Indian user.\n"
            "Analyze this budget data and give 4-5 specific, actionable tips.\n\n"
            f"{context}\n\n"
            "Rules:\n"
            "- Compare to the 50/30/20 rule\n"
            "- Mention specific categories where they can save\n"
            "- Give a concrete monthly saving estimate per tip\n"
            "- Be encouraging, not judgmental\n"
            '- Output MUST be valid JSON array of objects:\n'
            '  [{"tip": "string", "category": "string", "save_per_month": number}]\n'
        )

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            resp = client.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            raw = resp.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]
            tips = json.loads(raw.strip())
            return Response({"tips": tips, "income": income, "expense": total_expense, "savings": savings})
        except ResourceExhausted:
            return Response({"tips": [{"tip": "AI service is busy. Try again later.", "category": "System", "save_per_month": 0}]})
        except Exception as e:
            print(f"Budget advice error: {e}")
            return Response({"tips": [{"tip": "Could not generate advice right now.", "category": "System", "save_per_month": 0}]})