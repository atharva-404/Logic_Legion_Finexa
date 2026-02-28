"""
URL routing for authentication endpoints.
Provides REST API endpoints for user registration, login, profile, and token management.
"""

from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    UserProfileAPIView,
    refresh_token_view,
    ProfileUpdateAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    VerifyEmailAPIView,
    SendVerificationEmailAPIView,
    NotificationListAPIView,
    MarkNotificationReadAPIView,
    MarkAllNotificationsReadAPIView,
    DeleteNotificationAPIView,
    OnboardingAPIView,
    CardListCreateAPIView,
    CardDeleteAPIView,
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('refresh/', refresh_token_view, name='token_refresh'),
    
    # Email verification endpoints
    path('verify-email/', VerifyEmailAPIView.as_view(), name='verify_email'),
    path('send-verification-email/', SendVerificationEmailAPIView.as_view(), name='send_verification_email'),
    
    # Password reset endpoints
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset_password'),
    
    # Protected endpoints
    path('me/', UserProfileAPIView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateAPIView.as_view(), name='profile_update'),
    path('onboarding/', OnboardingAPIView.as_view(), name='onboarding'),
    
    # Notification endpoints
    path('notifications/', NotificationListAPIView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadAPIView.as_view(), name='notification_read'),
    path('notifications/<int:pk>/delete/', DeleteNotificationAPIView.as_view(), name='notification_delete'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadAPIView.as_view(), name='notification_mark_all'),
    
    # Card management endpoints
    path('cards/', CardListCreateAPIView.as_view(), name='card_list_create'),
    path('cards/<int:pk>/', CardDeleteAPIView.as_view(), name='card_delete'),
]

