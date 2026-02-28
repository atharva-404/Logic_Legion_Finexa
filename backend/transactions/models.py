from django.db import models
from django.conf import settings

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    SOURCE_TYPES = (
        ('manual', 'Manual'),
        ('pdf', 'PDF Upload'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default="")
    date = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=10, choices=SOURCE_TYPES, default='manual')
    source_document = models.CharField(max_length=512, blank=True, default="")

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} - {self.type} - {self.category} - {self.amount}"
