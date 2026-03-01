# gamification/urls.py
from django.urls import path
from .views import (
    ChallengeListView,
    UserChallengeListView,
    toggle_challenge,
    BadgeListView,
    UserBadgeListView,
    gamification_summary,
)

urlpatterns = [
    # Challenges
    path('challenges/', ChallengeListView.as_view(), name='challenge-list'),
    path('my-challenges/', UserChallengeListView.as_view(), name='user-challenge-list'),
    path('my-challenges/<int:pk>/toggle/', toggle_challenge, name='toggle-challenge'),

    # Badges
    path('badges/', BadgeListView.as_view(), name='badge-list'),
    path('my-badges/', UserBadgeListView.as_view(), name='user-badge-list'),

    # Summary
    path('summary/', gamification_summary, name='gamification-summary'),
]
