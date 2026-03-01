from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from decimal import Decimal
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        tx = serializer.save(user=self.request.user)
        # Create notification for the transaction
        try:
            from users.notifications import notify_transaction
            notify_transaction(self.request.user, float(tx.amount), tx.category, tx.type)
        except Exception:
            pass  # Don't fail the transaction if notification fails


class TransactionSummaryView(APIView):
    """Return aggregated income/expense totals + per-category breakdown for current month."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from dateutil.relativedelta import relativedelta
        now = timezone.now()
        month_start = now.replace(day=1).date()

        qs = Transaction.objects.filter(user=request.user, date__gte=month_start)

        # If no transactions this month, fall back to last month
        display_month = now
        if not qs.exists():
            prev = (now - relativedelta(months=1))
            prev_start = prev.replace(day=1).date()
            qs = Transaction.objects.filter(
                user=request.user, date__gte=prev_start, date__lt=month_start
            )
            display_month = prev

        # Python-level aggregation (encrypted fields can't use SQL SUM)
        total_income = Decimal('0')
        total_expense = Decimal('0')
        cat_totals = {}
        for t in qs:
            amt = Decimal(str(t.amount or 0))
            if t.type == 'income':
                total_income += amt
            elif t.type == 'expense':
                total_expense += amt
                cat_totals[t.category] = cat_totals.get(t.category, Decimal('0')) + amt

        total_income = float(total_income)
        total_expense = float(total_expense)

        # Per-category expense breakdown
        categories = [
            {"name": cat, "amount": float(amt)}
            for cat, amt in sorted(cat_totals.items(), key=lambda x: -x[1])
        ]

        # User's saved monthly income from profile
        profile_income = float(request.user.income or 0)

        # Total savings across all time (income - expenses)
        all_income = Decimal('0')
        all_expense = Decimal('0')
        for t in Transaction.objects.filter(user=request.user):
            amt = Decimal(str(t.amount or 0))
            if t.type == 'income':
                all_income += amt
            elif t.type == 'expense':
                all_expense += amt
        all_time_savings = float(all_income) - float(all_expense)

        return Response({
            'month': display_month.strftime('%B %Y'),
            'profile_income': profile_income,
            'transaction_income': total_income,
            'total_income': max(profile_income, total_income),
            'total_expense': total_expense,
            'savings': max(profile_income, total_income) - total_expense,
            'all_time_savings': max(0, all_time_savings),
            'categories': categories,
        })
