"""
Production-ready authentication views using Django REST Framework.
Includes registration, login, user profile, and token refresh endpoints.
PEP 8 compliant with comprehensive error handling and security best practices.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    TokenSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    EmailVerificationSerializer,
    SendVerificationEmailSerializer,
    NotificationSerializer,
    OnboardingSerializer,
    CardSerializer,
    CardCreateSerializer,
)
from .models import Notification, Card
from .auth import generate_jwt_tokens

User = get_user_model()


class RegisterAPIView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    
    POST /auth/register
    
    Creates a new user account with email and password validation.
    
    Request body:
        {
            "username": "string",
            "email": "user@example.com",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
    
    Response (201 Created):
        {
            "id": 1,
            "username": "string",
            "email": "user@example.com"
        }
    
    Raises:
        400 Bad Request: If email already exists or passwords don't match
        400 Bad Request: If password doesn't meet strength requirements
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Override create to return proper response format."""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            return Response(
                {
                    'message': 'User registered successfully',
                    'user': response.data
                },
                status=status.HTTP_201_CREATED
            )
        return response


class LoginAPIView(generics.GenericAPIView):
    """
    API endpoint for user login.
    
    POST /auth/login
    
    Validates credentials and returns JWT access/refresh tokens.
    
    Request body:
        {
            "email": "user@example.com",
            "password": "SecurePassword123!"
        }
    
    Response (200 OK):
        {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "username": "string",
                "is_active": true
            }
        }
    
    Raises:
        400 Bad Request: If email or password is missing
        401 Unauthorized: If credentials are invalid
        401 Unauthorized: If user account is inactive
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Handle login request and generate JWT tokens.
        
        Args:
            request: HTTP request with email and password
            
        Returns:
            Response: JWT tokens and user information on success
            Response: Error message on failure
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # The validate() method in the serializer authenticates the user
        # We need to call the validation logic again to get the user
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        if not email or not password:
            return Response(
                {'detail': 'Email and password required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                return Response(
                    {'detail': 'Invalid email or password.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            if not user.is_active:
                return Response(
                    {'detail': 'User account is inactive.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        tokens = generate_jwt_tokens(user)
        
        # Serialize response including user details
        response_data = {
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_active': user.is_active,
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class UserProfileAPIView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving authenticated user profile.
    
    GET /users/me
    
    Returns the currently authenticated user's profile information.
    Requires valid JWT access token in Authorization header.
    
    Headers:
        Authorization: Bearer <access_token>
    
    Response (200 OK):
        {
            "id": 1,
            "email": "user@example.com",
            "username": "string",
            "is_active": true,
            "date_joined": "2025-11-27T10:00:00Z"
        }
    
    Raises:
        401 Unauthorized: If no valid token is provided
        401 Unauthorized: If token is expired or invalid
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Return the current authenticated user."""
        return self.request.user


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    API endpoint for refreshing JWT access token.
    
    POST /auth/refresh
    
    Generates a new access token using a valid refresh token.
    
    Request body:
        {
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
        }
    
    Response (200 OK):
        {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
        }
    
    Raises:
        400 Bad Request: If refresh token is missing
        401 Unauthorized: If refresh token is invalid or expired
    """
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.exceptions import TokenError
    
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'detail': 'Refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response(
            {'access': str(refresh.access_token)},
            status=status.HTTP_200_OK
        )
    except TokenError as e:
        return Response(
            {'detail': f'Invalid refresh token: {str(e)}'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'detail': f'Error refreshing token: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileUpdateAPIView(generics.UpdateAPIView):
    """
    API endpoint for updating user profile.
    
    PUT /auth/profile/update
    
    Updates first_name, last_name, and income for authenticated user.
    Requires valid JWT access token.
    
    Request body:
        {
            "first_name": "John",
            "last_name": "Doe",
            "income": "50000.00"
        }
    
    Response (200 OK):
        {
            "first_name": "John",
            "last_name": "Doe",
            "income": "50000.00"
        }
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return the authenticated user"""
        return self.request.user


class ForgotPasswordAPIView(generics.GenericAPIView):
    """
    API endpoint for initiating password reset.
    
    POST /auth/forgot-password/
    
    Generates password reset token and sends email with reset link.
    
    Request body:
        {
            "email": "user@example.com"
        }
    
    Response (200 OK):
        {
            "message": "Password reset email sent successfully",
            "email": "user@example.com"
        }
    
    Raises:
        404 Not Found: If user with email doesn't exist
    """
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Handle forgot password request.
        
        Args:
            request: HTTP request with email
            
        Returns:
            Response: Success message on email sent
            Response: Error message on failure
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # Generate reset token
            reset_token = user.generate_password_reset_token()
            
            # Send email
            from .email_service import send_password_reset_email
            send_password_reset_email(user, reset_token)
            
            return Response(
                {
                    'message': 'Password reset email sent successfully',
                    'email': email
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Return generic message to prevent user enumeration
            return Response(
                {'message': 'If an account exists with this email, a password reset link will be sent.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': f'Error sending email: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetPasswordAPIView(generics.GenericAPIView):
    """
    API endpoint for resetting password with token.
    
    POST /auth/reset-password/
    
    Validates reset token and updates user password.
    
    Request body:
        {
            "token": "reset-token-uuid",
            "password": "NewSecurePass123",
            "password_confirm": "NewSecurePass123"
        }
    
    Response (200 OK):
        {
            "message": "Password reset successfully"
        }
    
    Raises:
        400 Bad Request: If token is invalid, expired, or passwords don't match
    """
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Handle password reset request.
        
        Args:
            request: HTTP request with token and new password
            
        Returns:
            Response: Success message on password reset
            Response: Error message on failure
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['password']
        
        try:
            # Update password
            user.set_password(new_password)
            # Clear reset token
            user.password_reset_token = None
            user.password_reset_token_expires_at = None
            user.save()
            
            return Response(
                {'message': 'Password reset successfully. You can now login with your new password.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': f'Error resetting password: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyEmailAPIView(generics.GenericAPIView):
    """
    API endpoint for verifying email with token.
    
    POST /auth/verify-email/
    
    Validates email verification token and marks email as verified.
    
    Request body:
        {
            "token": "verification-token-uuid"
        }
    
    Response (200 OK):
        {
            "message": "Email verified successfully"
        }
    
    Raises:
        400 Bad Request: If token is invalid
    """
    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Handle email verification request.
        
        Args:
            request: HTTP request with verification token
            
        Returns:
            Response: Success message on verification
            Response: Error message on failure
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = serializer.validated_data['token']
        
        try:
            user = User.objects.get(email_verification_token=token)
            user.email_verified = True
            user.email_verification_token = None
            user.save()
            
            return Response(
                {'message': 'Email verified successfully'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid or expired verification token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Error verifying email: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SendVerificationEmailAPIView(generics.GenericAPIView):
    """
    API endpoint for resending verification email.
    
    POST /auth/send-verification-email/
    
    Generates new verification token and sends email to user.
    
    Request body:
        {
            "email": "user@example.com"
        }
    
    Response (200 OK):
        {
            "message": "Verification email sent successfully"
        }
    
    Raises:
        404 Not Found: If user with email doesn't exist
    """
    serializer_class = SendVerificationEmailSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Handle resend verification email request.
        
        Args:
            request: HTTP request with email
            
        Returns:
            Response: Success message on email sent
            Response: Error message on failure
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate new verification token
            verification_token = user.generate_email_verification_token()
            
            # Send verification email
            from .email_service import send_email_verification
            send_email_verification(user, verification_token)
            
            return Response(
                {
                    'message': 'Verification email sent successfully',
                    'email': email
                },
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Return generic message to prevent user enumeration
            return Response(
                {'message': 'If an account exists with this email, a verification link will be sent.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': f'Error sending email: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationListAPIView(generics.ListAPIView):
    """
    API endpoint to list user notifications.
    GET /users/notifications/
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadAPIView(generics.GenericAPIView):
    """
    API endpoint to mark a notification as read.
    POST /users/notifications/<id>/read/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNotificationsReadAPIView(generics.GenericAPIView):
    """
    API endpoint to mark all notifications as read.
    POST /users/notifications/mark-all-read/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success', 'marked': count}, status=status.HTTP_200_OK)


class DeleteNotificationAPIView(generics.GenericAPIView):
    """
    API endpoint to delete a notification.
    DELETE /users/notifications/<id>/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


class OnboardingAPIView(generics.GenericAPIView):
    """
    API endpoint for new user onboarding.
    POST /users/onboarding/

    Saves salary (income), name, and initial spending entries as transactions.
    """
    serializer_class = OnboardingSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        data = serializer.validated_data

        # Update user profile
        user.first_name = data['first_name']
        user.last_name = data.get('last_name', '')
        user.income = data['monthly_income']
        user.onboarding_completed = True
        user.save()

        # Create initial spending transactions
        from transactions.models import Transaction
        from django.utils import timezone
        spending_entries = data.get('spending', [])
        for entry in spending_entries:
            Transaction.objects.create(
                user=user,
                amount=entry['amount'],
                category=entry['category'],
                type='expense',
                description=entry.get('description', f'{entry["category"]} expense'),
                date=timezone.now().date(),
            )

        # Create welcome + onboarding notifications
        from .notifications import notify_welcome, notify_onboarding_complete
        notify_welcome(user)
        notify_onboarding_complete(user)

        return Response({
            'status': 'success',
            'message': 'Onboarding completed successfully',
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'income': str(user.income),
                'onboarding_completed': True,
            }
        }, status=status.HTTP_200_OK)


# ── Card Management ──────────────────────────────────────────────
class CardListCreateAPIView(generics.ListCreateAPIView):
    """
    GET  /auth/cards/  → list user's saved cards
    POST /auth/cards/  → add a new card (only last4 stored)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CardCreateSerializer
        return CardSerializer

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        ser = CardCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        card = Card.objects.create(
            user=request.user,
            last4=d['card_number'].replace(' ', '')[-4:],
            card_holder=d['card_holder'],
            expiry=d['expiry'],
            card_type=d['card_type'],
            gradient_index=d['gradient_index'],
        )
        return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)


class CardDeleteAPIView(generics.DestroyAPIView):
    """DELETE /auth/cards/<id>/ → remove a saved card"""
    permission_classes = [IsAuthenticated]
    serializer_class = CardSerializer

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)
