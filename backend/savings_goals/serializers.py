from rest_framework import serializers
from .models import SavingsGoal

class GoalSerializer(serializers.ModelSerializer):
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
