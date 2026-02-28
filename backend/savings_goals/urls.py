# goals/urls.py
from django.urls import path
from .views import GoalListCreateView, GoalDetailView

urlpatterns = [
    path('', GoalListCreateView.as_view(), name="goals"),
    path('<int:pk>/', GoalDetailView.as_view(), name="goal-detail"),
]
