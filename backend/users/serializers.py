"""
User serializers for authentication and profile endpoints.
Handles validation and serialization of user data including registration,
login, and user profile information.
PEP 8 compliant with comprehensive docstrings and error handling.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Production-ready serializer for user registration.
    
    Features:
    - Email uniqueness validation
    - Password strength validation using Django's validators
    - Password confirmation matching
    - Secure password hashing using Django's set_password method
    
    Raises:
        ValidationError: If email already exists, passwords don't match,
                        or password doesn't meet strength requirements
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
            queryset=User.objects.all(),
            message='A user with this email address already exists.'
        )]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        help_text='Password must be at least 8 characters with uppercase, lowercase, and numbers.'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'username': {
                'required': True,
                'help_text': 'Username must be unique and contain 150 characters or fewer.'
            }
        }

    def validate(self, attrs):
        """
        Validate that passwords match before creating the user.
        
        Args:
            attrs (dict): Dictionary containing password and password_confirm
            
        Returns:
            dict: Validated attributes with password_confirm removed
            
        Raises:
            ValidationError: If passwords don't match
        """
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password': 'Password fields didn\'t match.'}
            )
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance with securely hashed password.
        
        Args:
            validated_data (dict): Validated user data
            
        Returns:
            User: Newly created user instance
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Production-ready serializer for user login.
    
    Validates credentials against the database and returns the user object
    if authentication is successful.
    
    Features:
    - Email-based authentication
    - Secure password comparison using Django's check_password
    - User active status validation
    - Clear error messages (generic to prevent user enumeration)
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validate credentials and attach user object to validated data.
        
        Args:
            attrs (dict): Dictionary containing email and password
            
        Returns:
            dict: Validated attributes with user object attached
            
        Raises:
            ValidationError: If credentials are invalid or user is inactive
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError(
                'Both email and password are required.'
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Generic error message to prevent user enumeration
            raise serializers.ValidationError(
                {'email': 'Invalid email or password.'}
            )

        # Verify password using Django's built-in check_password
        if not user.check_password(password):
            raise serializers.ValidationError(
                {'password': 'Invalid email or password.'}
            )

        # Ensure user account is active
        if not user.is_active:
            raise serializers.ValidationError(
                {'detail': 'This user account is inactive.'}
            )

        # Attach user object for use in view
        attrs['user'] = user
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.
    
    Features:
    - Update first_name, last_name, and income
    - Email and username are read-only
    - Comprehensive validation
    """
    income = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'income')
    
    def update(self, instance, validated_data):
        """Update user profile fields"""
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.income = validated_data.get('income', instance.income)
        instance.save()
        return instance


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for initiating password reset process.
    
    Features:
    - Email-based password reset
    - Generates reset token
    - Sends email with reset link
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that user with this email exists"""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No user found with this email address."
            )
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password with token.
    
    Features:
    - Validates reset token
    - Checks token expiration
    - Updates password with strength validation
    """
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate token and password matching"""
        token = attrs.get('token')
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        # Check passwords match
        if password != password_confirm:
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        
        # Validate token
        try:
            user = User.objects.get(password_reset_token=token)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {'token': 'Invalid reset token.'}
            )
        
        # Check token expiration
        if not user.is_password_reset_token_valid():
            raise serializers.ValidationError(
                {'token': 'Reset token has expired. Please request a new one.'}
            )
        
        attrs['user'] = user
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for verifying email with token.
    
    Features:
    - Validates email verification token
    - Marks email as verified
    """
    token = serializers.CharField(required=True)
    
    def validate_token(self, value):
        """Validate that token exists and belongs to a user"""
        try:
            User.objects.get(email_verification_token=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid verification token."
            )
        return value


class SendVerificationEmailSerializer(serializers.Serializer):
    """
    Serializer for sending verification email.
    
    Features:
    - Sends email verification link
    - Generates new token if needed
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that user exists"""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No user found with this email address."
            )
        return value
class TokenSerializer(serializers.Serializer):
    """
    Serializer for JWT token response.
    
    Returns access and refresh tokens along with basic user information
    after successful authentication.
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        """
        Extract and return basic user information.
        
        Args:
            obj (dict): Dictionary containing user object
            
        Returns:
            dict: Basic user details for client-side storage
        """
        user = obj.get('user')
        if user:
            return {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_active': user.is_active,
            }
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Production-ready serializer for user profile information.
    
    Used in protected endpoints to return authenticated user details.
    All sensitive fields are read-only to prevent unauthorized modification.
    """
    income = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'is_active', 'date_joined', 'credits', 'income', 'onboarding_completed')
        read_only_fields = ('id', 'date_joined', 'email', 'username', 'is_active', 'credits')


from .models import Notification, Card, UserSettings

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for user notifications.
    """
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'link')
        read_only_fields = ('id', 'created_at')


class CardSerializer(serializers.ModelSerializer):
    """Serializer for saved payment cards."""
    class Meta:
        model = Card
        fields = ('id', 'last4', 'card_holder', 'expiry', 'card_type', 'gradient_index', 'created_at')
        read_only_fields = ('id', 'created_at')


class CardCreateSerializer(serializers.Serializer):
    """Accept card number (extract last4), holder, expiry, type, gradient."""
    card_number = serializers.CharField(max_length=19)
    card_holder = serializers.CharField(max_length=100)
    expiry = serializers.CharField(max_length=5)
    card_type = serializers.ChoiceField(choices=['Visa', 'Mastercard'], default='Visa')
    gradient_index = serializers.IntegerField(default=0, min_value=0, max_value=4)


class OnboardingSerializer(serializers.Serializer):
    """
    Serializer for new user onboarding.
    Captures salary and initial spending information.
    """
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    # Initial spending entries
    spending = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text='List of {category, amount, description} dicts'
    )

    def validate_monthly_income(self, value):
        if value <= 0:
            raise serializers.ValidationError('Income must be positive.')
        return value

    def validate_spending(self, value):
        for item in value:
            if 'category' not in item or 'amount' not in item:
                raise serializers.ValidationError('Each spending entry must have category and amount.')
            if float(item['amount']) <= 0:
                raise serializers.ValidationError('Spending amounts must be positive.')
        return value


# Note: UserLoginSerializer is defined earlier in this file (around line 97).
# Additional serializers below.


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for user preferences (notifications, privacy, appearance)."""
    class Meta:
        model = UserSettings
        fields = (
            'currency', 'language', 'dark_mode',
            'budget_alerts', 'goal_reminders', 'weekly_report', 'ai_insights', 'market_updates',
            'show_balance', 'analytics_sharing', 'crash_reports',
            'updated_at',
        )
        read_only_fields = ('updated_at',)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for authenticated password change."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})
        return attrs


class UserProfileFullSerializer(serializers.ModelSerializer):
    """
    Full user profile with summary stats for the settings page.
    """
    settings = UserSettingsSerializer(read_only=True)
    income = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'income', 'credits', 'is_active', 'date_joined',
            'onboarding_completed', 'email_verified', 'settings',
        )
        read_only_fields = fields
