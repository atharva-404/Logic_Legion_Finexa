from rest_framework import serializers
from .models import SavingsGoal

class GoalSerializer(serializers.ModelSerializer):
    # Explicitly declare Decimal fields (model uses EncryptedDecimalField → CharField internally)
    target_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    monthly_contribution = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    progress_percentage = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    months_left = serializers.ReadOnlyField()
    required_monthly = serializers.ReadOnlyField()
    delay_months = serializers.ReadOnlyField()

    class Meta:
        model = SavingsGoal
        fields = (
            "id", "title", "target_amount", "current_amount", "deadline",
            "priority", "monthly_contribution", "icon",
            "progress_percentage", "status", "remaining_amount",
            "months_left", "required_monthly", "delay_months",
            "created_at",
        )
        read_only_fields = ("user", "created_at")
