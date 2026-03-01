# ai_assistant/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from core.encryption import (
    EncryptedDecimalField, EncryptedTextField, EncryptedJSONField
)


class Document(models.Model):
    """Represents an uploaded document and its extracted text."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    file_name = models.CharField(max_length=512)
    content = EncryptedTextField(blank=True)  # extracted text (encrypted)
    mongo_doc_id = models.CharField(max_length=128, blank=True, default='')  # links to MongoDB expense doc
    summary = EncryptedTextField(blank=True, default='')  # AI-generated summary (encrypted)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document({self.id}, {self.file_name})"



class ChatSession(models.Model):
    """
    A chat session tied to a user and optionally to a Mongo expense document.
    Multiple clients (tabs/devices) can connect to the same session via WebSocket room.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mongo_id = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatSession({self.id}, user={self.user_id}, mongo={self.mongo_id})"


class ChatMessage(models.Model):
    """
    A single chat message stored in the session history.
    """
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=[("user", "user"), ("ai", "ai")])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"ChatMessage({self.id}, session={self.session_id}, sender={self.sender})"


class Wallet(models.Model):
    """
    Digital wallet for each user to manage virtual money.
    One wallet per user.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = EncryptedDecimalField(
        max_digits=12,
        decimal_places=2,
        default='0.00',
        help_text="Current wallet balance (encrypted)"
    )
    currency = models.CharField(
        max_length=3,
        default='INR',
        help_text="Currency code (e.g., USD, EUR, INR)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the wallet is active"
    )

    class Meta:
        db_table = 'wallets'
        ordering = ['-created_at']
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'

    def __str__(self):
        return f"Wallet({self.user.username}, balance={self.balance} {self.currency})"

    def can_withdraw(self, amount):
        """Check if wallet has sufficient balance for withdrawal"""
        return self.balance >= amount


class WalletTransaction(models.Model):
    """
    Records all wallet transactions (add money, withdraw, transfers, etc.)
    """
    TRANSACTION_TYPES = [
        ('ADD', 'Add Money'),
        ('WITHDRAW', 'Withdraw Money'),
        ('TRANSFER', 'Transfer'),
        ('REFUND', 'Refund'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        help_text="Type of transaction"
    )
    amount = EncryptedDecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Transaction amount (encrypted)"
    )
    description = EncryptedTextField(
        blank=True,
        null=True,
        help_text="Transaction description or notes (encrypted)"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='COMPLETED'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    reference_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique reference ID for this transaction"
    )
    metadata = EncryptedJSONField(
        default=dict,
        blank=True,
        help_text="Additional transaction metadata (encrypted)"
    )

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-timestamp']
        verbose_name = 'Wallet Transaction'
        verbose_name_plural = 'Wallet Transactions'
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['wallet', '-timestamp']),
            models.Index(fields=['transaction_type']),
        ]

    def __str__(self):
        return f"Transaction({self.transaction_type}, {self.amount}, {self.status})"

    def save(self, *args, **kwargs):
        """Generate reference ID if not provided"""
        if not self.reference_id:
            import uuid
            self.reference_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)


class FinancialHealthScore(models.Model):
    """
    Stores the user's financial health score (0-100) and factor breakdowns.
    Score is calculated from 5 equally-weighted factors.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='health_scores'
    )
    score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall financial health score (0-100)"
    )
    
    # Factor scores (0-20 each)
    spending_discipline_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    savings_ratio_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    credit_utilization_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    loan_burden_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    risk_exposure_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    
    # Metadata
    calculation_date = models.DateTimeField(auto_now_add=True)
    month = models.DateField(help_text="Month this score represents")
    explanation = models.TextField(
        blank=True,
        help_text="AI-generated explanation of score and changes"
    )
    recommendations = EncryptedJSONField(
        default=list,
        blank=True,
        help_text="Actionable recommendations for improvement (encrypted)"
    )
    
    class Meta:
        db_table = 'financial_health_scores'
        ordering = ['-calculation_date']
        unique_together = ['user', 'month']
        verbose_name = 'Financial Health Score'
        verbose_name_plural = 'Financial Health Scores'
        indexes = [
            models.Index(fields=['user', '-month']),
            models.Index(fields=['-calculation_date']),
        ]
    
    def __str__(self):
        return f"FinScore({self.user.username}, {self.score}/100, {self.month})"
    
    def get_score_category(self):
        """Return score category based on expense-driven health score"""
        if self.score <= 35:
            return 'Poor'
        elif self.score <= 55:
            return 'Fair'
        elif self.score <= 75:
            return 'Good'
        else:
            return 'Excellent'
    
    def get_score_color(self):
        """Return color code for score category"""
        category = self.get_score_category()
        colors = {
            'Poor': '#ef4444',
            'Fair': '#f97316',
            'Good': '#eab308',
            'Excellent': '#22c55e'
        }
        return colors.get(category, '#6b7280')


class ScoreFactorDetail(models.Model):
    """
    Detailed breakdown of each factor contributing to the financial health score.
    """
    health_score = models.ForeignKey(
        FinancialHealthScore,
        on_delete=models.CASCADE,
        related_name='factor_details'
    )
    factor_name = models.CharField(
        max_length=50,
        choices=[
            ('spending_discipline', 'Spending Discipline'),
            ('savings_ratio', 'Savings Ratio'),
            ('credit_utilization', 'Credit Utilization'),
            ('loan_burden', 'Loan Burden'),
            ('risk_exposure', 'Risk Exposure'),
        ]
    )
    score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    weight = models.FloatField(
        default=0.2,
        help_text="Weight of this factor (default: 0.2 = 20%)"
    )
    metrics = EncryptedJSONField(
        default=dict,
        help_text="Raw metrics used to calculate this factor score (encrypted)"
    )
    explanation = models.TextField(
        help_text="Explanation of how this factor score was calculated"
    )
    
    class Meta:
        db_table = 'score_factor_details'
        verbose_name = 'Score Factor Detail'
        verbose_name_plural = 'Score Factor Details'
    

    def __str__(self):
        return f"{self.factor_name}: {self.score}/20"


class Loan(models.Model):
    """
    Represents a specific loan account for a user.
    Used for credit health analysis.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loans")
    name = models.CharField(max_length=255, help_text="e.g. HDFC Home Loan")
    loan_type = models.CharField(max_length=100, default="Personal Loan")
    principal_amount = EncryptedDecimalField(max_digits=12, decimal_places=2)
    monthly_emi = EncryptedDecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.FloatField(null=True, blank=True)
    tenure_months = models.IntegerField()
    emis_paid = models.IntegerField(default=0)
    missed_emis = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='ACTIVE', choices=[('ACTIVE', 'Active'), ('CLOSED', 'Closed')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.principal_amount})"


class SpendingPattern(models.Model):
    """
    Stores AI-generated analysis of user's spending patterns.
    Cached to avoid re-running expensive LLM calls too frequently.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="spending_patterns")
    analysis_date = models.DateTimeField(auto_now_add=True)
    
    # Store the result as structured JSON
    analysis_data = EncryptedJSONField(
        default=dict,
        help_text="Full JSON output from AI analysis (patterns, anomalies, recommendations) (encrypted)"
    )
    
    class Meta:
        ordering = ['-analysis_date']
        indexes = [
            models.Index(fields=['user', '-analysis_date']),
        ]

    def __str__(self):
        return f"Pattern Analysis ({self.user.username} - {self.analysis_date.date()})"
