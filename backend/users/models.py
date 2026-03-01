from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from core.encryption import EncryptedDecimalField, EncryptedCharField

class User(AbstractUser):
    email = models.EmailField(unique=True)
    income = EncryptedDecimalField(max_digits=12, decimal_places=2, default='0.00')
    
    # Onboarding
    onboarding_completed = models.BooleanField(default=False)
    
    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Password reset fields
    password_reset_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    password_reset_token_expires_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
    
    def generate_email_verification_token(self):
        """Generate a unique email verification token"""
        self.email_verification_token = str(uuid.uuid4())
        self.email_verification_sent_at = timezone.now()
        self.save()
        return self.email_verification_token
    
    def generate_password_reset_token(self):
        """Generate a password reset token with 1-hour expiration"""
        self.password_reset_token = str(uuid.uuid4())
        self.password_reset_token_expires_at = timezone.now() + timedelta(hours=1)
        self.save()
        return self.password_reset_token
    
    def is_password_reset_token_valid(self):
        """Check if password reset token is valid and not expired"""
        if not self.password_reset_token or not self.password_reset_token_expires_at:
            return False
        return timezone.now() <= self.password_reset_token_expires_at

    # New Credits Field
    credits = models.IntegerField(default=100000, help_text="User AI usage credits")


CARD_TYPE_CHOICES = [
    ('Visa', 'Visa'),
    ('Mastercard', 'Mastercard'),
]

class Card(models.Model):
    """User's saved payment cards (last4 + metadata only, no full numbers stored)."""
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='cards')
    last4 = models.CharField(max_length=4)
    card_holder = models.CharField(max_length=100)
    expiry = models.CharField(max_length=5, help_text="MM/YY")
    card_type = models.CharField(max_length=12, choices=CARD_TYPE_CHOICES, default='Visa')
    gradient_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.card_type} ••••{self.last4} ({self.user.email})"


NOTIFICATION_TYPES = [
    ('info', 'Info'),
    ('success', 'Success'),
    ('warning', 'Warning'),
    ('goal', 'Goal'),
    ('transaction', 'Transaction'),
    ('wallet', 'Wallet'),
    ('system', 'System'),
]


class Notification(models.Model):
    """
    System notifications for the user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=500, blank=True, null=True, help_text="Optional link to redirect")

    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"


CURRENCY_CHOICES = [
    ('INR', 'Indian Rupee'),
    ('USD', 'US Dollar'),
    ('EUR', 'Euro'),
    ('GBP', 'British Pound'),
]

LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('hi', 'Hindi'),
    ('ta', 'Tamil'),
]


class UserSettings(models.Model):
    """
    Persisted user preferences (notifications, privacy, appearance).
    One-to-one with User; auto-created on first access.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')

    # Appearance
    currency = models.CharField(max_length=5, choices=CURRENCY_CHOICES, default='INR')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    dark_mode = models.BooleanField(default=True)

    # Notifications
    budget_alerts = models.BooleanField(default=True)
    goal_reminders = models.BooleanField(default=True)
    weekly_report = models.BooleanField(default=True)
    ai_insights = models.BooleanField(default=False)
    market_updates = models.BooleanField(default=False)

    # Privacy
    show_balance = models.BooleanField(default=True)
    analytics_sharing = models.BooleanField(default=False)
    crash_reports = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.email}"
