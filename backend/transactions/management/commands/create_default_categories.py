from django.core.management.base import BaseCommand
from transactions.models import Category

DEFAULT_CATEGORIES = [
    "Food", "Travel", "Bills", "Shopping", "Entertainment",
    "Education", "Groceries", "Fuel", "Healthcare", "Rent",
]

class Command(BaseCommand):
    help = "Creates default system categories"

    def handle(self, *args, **kwargs):
        for name in DEFAULT_CATEGORIES:
            Category.objects.get_or_create(name=name, is_default=True)
        self.stdout.write(self.style.SUCCESS("Default categories created successfully"))
