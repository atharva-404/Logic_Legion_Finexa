from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    # Explicitly declare as DecimalField since model uses EncryptedDecimalField (CharField internally)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ("user",)
