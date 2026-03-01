from django.db import models
from django.conf import settings
from django.utils import timezone
from core.encryption import EncryptedDecimalField
import math


class SavingsGoal(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="savings_goals")
    title = models.CharField(max_length=200, default="Untitled Goal")
    target_amount = EncryptedDecimalField(max_digits=12, decimal_places=2)
    current_amount = EncryptedDecimalField(max_digits=12, decimal_places=2, default='0.00')
    deadline = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    monthly_contribution = EncryptedDecimalField(max_digits=10, decimal_places=2, default='0.00')
    icon = models.CharField(max_length=10, default='🎯')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return round(float(self.current_amount / self.target_amount) * 100, 2)

    @property
    def status(self):
        if self.current_amount >= self.target_amount:
            return "completed"
        return "in_progress"

    @property
    def remaining_amount(self):
        return max(0, float(self.target_amount - self.current_amount))

    @property
    def months_left(self):
        if not self.deadline:
            return 0
        delta = self.deadline - timezone.now().date()
        return max(1, math.ceil(delta.days / 30))

    @property
    def required_monthly(self):
        ml = self.months_left
        if ml <= 0:
            return float(self.remaining_amount)
        return round(self.remaining_amount / ml, 2)

    @property
    def delay_months(self):
        mc = float(self.monthly_contribution)
        if mc <= 0:
            return 0
        months_needed = math.ceil(self.remaining_amount / mc)
        return max(0, months_needed - self.months_left)


class GoalPlanAnalysis(models.Model):
    """Caches AI-generated goal planning analysis."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    analysis_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]

    def __str__(self):
        return f"GoalPlan({self.user.email}, {self.created_at.date()})"
