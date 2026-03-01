from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Q
from django.utils import timezone
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

        totals = qs.aggregate(
            total_income=Sum('amount', filter=Q(type='income')),
            total_expense=Sum('amount', filter=Q(type='expense')),
        )
        total_income = float(totals['total_income'] or 0)
        total_expense = float(totals['total_expense'] or 0)

        # Per-category expense breakdown
        cat_qs = (
            qs.filter(type='expense')
              .values('category')
              .annotate(total=Sum('amount'))
              .order_by('-total')
        )
        categories = [{"name": c['category'], "amount": float(c['total'])} for c in cat_qs]

        # User's saved monthly income from profile
        profile_income = float(request.user.income or 0)

        # Total savings across all time (income - expenses)
        all_totals = Transaction.objects.filter(user=request.user).aggregate(
            all_income=Sum('amount', filter=Q(type='income')),
            all_expense=Sum('amount', filter=Q(type='expense')),
        )
        all_time_savings = float(all_totals['all_income'] or 0) - float(all_totals['all_expense'] or 0)

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
