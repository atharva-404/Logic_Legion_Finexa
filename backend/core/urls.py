"""
URL configuration for core project.

Routes all application URLs including authentication, AI assistant, 
transactions, savings goals, and gamification endpoints.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
    
Examples:
    - POST /auth/register - User registration
    - POST /auth/login - User login
    - GET /auth/me - Get current user profile (requires token)
    - POST /auth/refresh - Refresh access token
    - POST /api/ai/expense-upload/ - Upload expenses
    - GET /api/documents/ - List documents
"""
from django.urls import path, include

urlpatterns = [
    # Authentication endpoints (JWT-based)
    path('auth/', include('users.urls')),
    
    # API endpoints
    path('api/ai/', include('ai_assistant.urls')),
    path('api/users/', include('users.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/goals/', include('savings_goals.urls')),
    path('api/gamification/', include('gamification.urls')),
]

