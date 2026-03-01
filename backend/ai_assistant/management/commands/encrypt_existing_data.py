"""
Management command to encrypt existing plaintext data in both SQLite and MongoDB.

Usage:
    python manage.py encrypt_existing_data          # Dry run (shows what would change)
    python manage.py encrypt_existing_data --apply  # Actually encrypt data

This is a ONE-TIME migration command. Run it after deploying the encryption changes
to convert all existing plaintext financial data to encrypted format.
"""

import json
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import connection

from core.encryption import encrypt_value, decrypt_value, encrypt_json


def _is_encrypted(value):
    """Check if a string value is already Fernet-encrypted."""
    if not isinstance(value, str):
        return False
    return value.startswith("gAAAAA")


class Command(BaseCommand):
    help = "Encrypt existing plaintext financial data in SQLite and MongoDB"

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Actually apply encryption (default is dry-run)",
        )

    def handle(self, *args, **options):
        apply = options["apply"]
        mode = "APPLYING" if apply else "DRY RUN"
        self.stdout.write(self.style.WARNING(f"\n{'='*60}"))
        self.stdout.write(self.style.WARNING(f"  Encrypt Existing Data — {mode}"))
        self.stdout.write(self.style.WARNING(f"{'='*60}\n"))

        total = 0

        # ── 1. Users: income ──
        total += self._encrypt_column("users_user", "income", "decimal", apply)

        # ── 2. Transactions: amount, description ──
        total += self._encrypt_column("transactions_transaction", "amount", "decimal", apply)
        total += self._encrypt_column("transactions_transaction", "description", "text", apply)

        # ── 3. Wallets: balance ──
        total += self._encrypt_column("wallets", "balance", "decimal", apply)

        # ── 4. Wallet Transactions: amount, description, metadata ──
        total += self._encrypt_column("wallet_transactions", "amount", "decimal", apply)
        total += self._encrypt_column("wallet_transactions", "description", "text", apply)
        total += self._encrypt_column("wallet_transactions", "metadata", "json", apply)

        # ── 5. Loans: principal_amount, monthly_emi ──
        total += self._encrypt_column("ai_assistant_loan", "principal_amount", "decimal", apply)
        total += self._encrypt_column("ai_assistant_loan", "monthly_emi", "decimal", apply)

        # ── 6. Financial Health Scores: recommendations ──
        total += self._encrypt_column("financial_health_scores", "recommendations", "json", apply)

        # ── 7. Score Factor Details: metrics ──
        total += self._encrypt_column("score_factor_details", "metrics", "json", apply)

        # ── 8. Documents: content, summary ──
        total += self._encrypt_column("ai_assistant_document", "content", "text", apply)
        total += self._encrypt_column("ai_assistant_document", "summary", "text", apply)

        # ── 9. Spending Patterns: analysis_data ──
        total += self._encrypt_column("ai_assistant_spendingpattern", "analysis_data", "json", apply)

        # ── 10. Savings Goals: target_amount, current_amount, monthly_contribution ──
        total += self._encrypt_column("savings_goals_savingsgoal", "target_amount", "decimal", apply)
        total += self._encrypt_column("savings_goals_savingsgoal", "current_amount", "decimal", apply)
        total += self._encrypt_column("savings_goals_savingsgoal", "monthly_contribution", "decimal", apply)

        # ── 11. MongoDB ──
        total += self._encrypt_mongo(apply)

        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS(f"  Total values {'encrypted' if apply else 'to encrypt'}: {total}"))
        if not apply:
            self.stdout.write(self.style.WARNING("  Run with --apply to actually encrypt data."))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}\n"))

    def _encrypt_column(self, table, column, data_type, apply):
        """Encrypt a single column in a SQLite table."""
        count = 0
        cursor = connection.cursor()

        try:
            cursor.execute(f"SELECT id, {column} FROM {table}")
            rows = cursor.fetchall()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  ✗ {table}.{column}: table/column not found ({e})"))
            return 0

        for row_id, value in rows:
            if value is None or value == "":
                continue
            str_val = str(value)
            if _is_encrypted(str_val):
                continue  # already encrypted

            if data_type == "decimal":
                encrypted = encrypt_value(str(Decimal(str_val)))
            elif data_type == "json":
                # JSON might be stored as a string or as actual JSON
                if isinstance(value, str):
                    try:
                        parsed = json.loads(value)
                        encrypted = encrypt_json(parsed)
                    except json.JSONDecodeError:
                        encrypted = encrypt_value(value)
                else:
                    encrypted = encrypt_json(value)
            else:  # text
                encrypted = encrypt_value(str_val)

            if apply:
                cursor.execute(
                    f"UPDATE {table} SET {column} = %s WHERE id = %s",
                    [encrypted, row_id],
                )
            count += 1

        status = "encrypted" if apply else "to encrypt"
        icon = "✓" if apply else "→"
        self.stdout.write(f"  {icon} {table}.{column}: {count} rows {status}")
        return count

    def _encrypt_mongo(self, apply):
        """Encrypt raw_text and extracted_data in MongoDB expense documents."""
        count = 0
        try:
            from ai_assistant.services.expense_extraction import get_mongo_collection
            from core.encryption import encrypt_text

            collection = get_mongo_collection()
            # Find documents that are NOT yet encrypted
            docs = collection.find({"is_encrypted": {"$ne": True}})

            for doc in docs:
                raw_text = doc.get("raw_text")
                extracted_data = doc.get("extracted_data")

                updates = {}
                if raw_text and isinstance(raw_text, str) and not _is_encrypted(raw_text):
                    updates["raw_text"] = encrypt_text(raw_text)
                if extracted_data and not isinstance(extracted_data, str):
                    updates["extracted_data"] = encrypt_json(extracted_data)
                elif isinstance(extracted_data, str) and not _is_encrypted(extracted_data):
                    updates["extracted_data"] = encrypt_value(extracted_data)

                if updates:
                    updates["is_encrypted"] = True
                    if apply:
                        collection.update_one({"_id": doc["_id"]}, {"$set": updates})
                    count += 1

            status = "encrypted" if apply else "to encrypt"
            icon = "✓" if apply else "→"
            self.stdout.write(f"  {icon} MongoDB expenses: {count} documents {status}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  ✗ MongoDB: {e}"))

        return count
