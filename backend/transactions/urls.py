# transactions/urls.py
from django.urls import path
from .views import TransactionListCreateView, TransactionSummaryView

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name="transactions"),
    path('summary/', TransactionSummaryView.as_view(), name="transaction-summary"),
]
