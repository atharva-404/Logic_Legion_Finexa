# ai_assistant/serializers.py
from rest_framework import serializers
from .models import ChatMessage, ChatSession, Document


class DocumentFileUploadSerializer(serializers.Serializer):
    """
    Serializer for uploading financial documents.
    Supports: PDF, images, CSV, TXT
    """
    file = serializers.FileField(help_text="Upload a file (PDF, Image, CSV, or TXT)")

    def validate_file(self, file):
        # Max 10 MB
        max_size = 10 * 1024 * 1024
        if file.size > max_size:
            raise serializers.ValidationError(
                f"File size must not exceed 10MB. Got {file.size / (1024*1024):.2f}MB"
            )

        allowed_ext = {'.pdf', '.txt', '.csv', '.jpg', '.jpeg', '.png'}
        file_name = file.name.lower()

        if not any(file_name.endswith(ext) for ext in allowed_ext):
            raise serializers.ValidationError(
                f"Invalid file type. Allowed: {', '.join(allowed_ext)}"
            )
        return file


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "file_name", "content", "mongo_doc_id", "summary", "created_at"]


class DocumentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "file_name", "mongo_doc_id", "summary", "created_at"]


class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ["id", "mongo_id", "created_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "session", "sender", "text", "created_at"]


from .models import Loan

class LoanSerializer(serializers.ModelSerializer):
    # Explicitly declare Decimal fields (model uses EncryptedDecimalField)
    principal_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_emi = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Loan
        fields = [
            "id", "name", "loan_type", "principal_amount", "monthly_emi", 
            "interest_rate", "tenure_months", "emis_paid", "missed_emis", "status"
        ]
        read_only_fields = ["id", "status"]