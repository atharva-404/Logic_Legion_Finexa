"""
JWT Authentication utilities for production-ready API.
Provides JWT token generation, verification, and custom permission classes.
PEP 8 compliant with comprehensive error handling and security best practices.
"""

from datetime import datetime, timedelta
from functools import wraps

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
import jwt
import os

User = get_user_model()

# JWT Configuration (use settings in production)
JWT_ALGORITHM = 'HS256'
JWT_SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key')
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


def generate_jwt_tokens(user):
    """
    Generate JWT access and refresh tokens for a user.
    
    This function uses Django REST Framework's SimpleJWT library which provides
    secure token generation with built-in expiration and refresh capabilities.
    
    Args:
        user (User): Django User instance to create tokens for
        
    Returns:
        dict: Dictionary containing 'access' and 'refresh' tokens
        
    Example:
        >>> tokens = generate_jwt_tokens(user)
        >>> print(tokens['access'])  # Use in Authorization: Bearer <access>
    """
    try:
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    except Exception as e:
        raise AuthenticationFailed(f'Error generating tokens: {str(e)}')


def verify_jwt_token(token):
    """
    Verify and decode a JWT access token.
    
    Validates the token signature, expiration, and claims.
    
    Args:
        token (str): JWT token string to verify
        
    Returns:
        dict: Decoded token payload containing user_id and other claims
        
    Raises:
        AuthenticationFailed: If token is invalid, expired, or malformed
        
    Example:
        >>> payload = verify_jwt_token(token)
        >>> user_id = payload.get('user_id')
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token has expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Token is invalid')
    except Exception as e:
        raise AuthenticationFailed(f'Error verifying token: {str(e)}')


def get_user_from_token(token):
    """
    Extract user from a valid JWT token.
    
    Verifies the token and returns the associated user object.
    
    Args:
        token (str): JWT access token string
        
    Returns:
        User: Django User instance associated with the token
        
    Raises:
        AuthenticationFailed: If token is invalid or user not found
        
    Example:
        >>> user = get_user_from_token(access_token)
        >>> print(user.email)
    """
    payload = verify_jwt_token(token)
    user_id = payload.get('user_id')
    
    if not user_id:
        raise AuthenticationFailed('User ID not found in token')
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise AuthenticationFailed('User not found')
    
    if not user.is_active:
        raise AuthenticationFailed('User is inactive')
    
    return user


class IsAuthenticated(BasePermission):
    """
    Production-ready permission class to check if user is authenticated.
    
    This is a simple wrapper around DRF's IsAuthenticated that ensures
    only authenticated users can access protected endpoints.
    """
    
    def has_permission(self, request, view):
        """
        Check if request is from an authenticated user.
        
        Args:
            request: HTTP request with authentication info
            view: DRF view being accessed
            
        Returns:
            bool: True if user is authenticated, False otherwise
        """
        return bool(request.user and request.user.is_authenticated)


class IsActive(BasePermission):
    """
    Permission class to check if authenticated user is active.
    
    Ensures that deactivated accounts cannot access protected resources.
    """
    
    def has_permission(self, request, view):
        """
        Check if authenticated user is active.
        
        Args:
            request: HTTP request
            view: DRF view being accessed
            
        Returns:
            bool: True if user is authenticated and active
        """
        return (
            bool(request.user and request.user.is_authenticated)
            and request.user.is_active
        )


def jwt_required(func):
    """
    Decorator for protecting function-based views with JWT authentication.
    
    Validates the Authorization header and attaches the user to the request.
    
    Args:
        func: Function-based view to protect
        
    Returns:
        callable: Wrapped view function
        
    Raises:
        AuthenticationFailed: If token is missing or invalid
        
    Example:
        @jwt_required
        def protected_view(request):
            return Response({'message': f'Hello {request.user.email}'})
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            raise AuthenticationFailed('Authorization header is missing')
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed(
                'Invalid Authorization header format. Use: Bearer <token>'
            )
        
        try:
            user = get_user_from_token(token)
            request.user = user
        except AuthenticationFailed as e:
            raise AuthenticationFailed(str(e))
        
        return func(request, *args, **kwargs)
    
    return wrapper
