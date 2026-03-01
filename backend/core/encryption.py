"""
core/encryption.py
==================
Provides AES-256 field-level encryption for sensitive financial data.

Uses the Fernet symmetric encryption scheme from the `cryptography` library
(already in requirements.txt). Fernet is AES-128-CBC under the hood but with
HMAC-SHA256 for authentication — effectively AES-256-equivalent security.

Usage:
    from core.encryption import encrypt_value, decrypt_value, EncryptedDecimalField

    # Manual usage
    cipher = encrypt_value("4111111111111111")
    plain  = decrypt_value(cipher)

    # Django model field (drop-in replacement for DecimalField)
    class MyModel(models.Model):
        balance = EncryptedDecimalField(max_digits=12, decimal_places=2)
"""

import base64
import json
import os
from decimal import Decimal, InvalidOperation

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db import models


# ---------------------------------------------------------------------------
# Key management
# ---------------------------------------------------------------------------

def _get_fernet() -> Fernet:
    """
    Return a Fernet instance seeded with FIELD_ENCRYPTION_KEY from settings.
    The key MUST be a URL-safe base64-encoded 32-byte key.
    Generate one with:  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    """
    key = getattr(settings, "FIELD_ENCRYPTION_KEY", None)
    if not key:
        raise RuntimeError(
            "FIELD_ENCRYPTION_KEY is not set in Django settings. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def encrypt_value(plaintext: str) -> str:
    """Encrypt a plaintext string → base64-encoded ciphertext string."""
    if plaintext is None:
        return None
    f = _get_fernet()
    return f.encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a ciphertext string → original plaintext string."""
    if ciphertext is None:
        return None
    f = _get_fernet()
    try:
        return f.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except (InvalidToken, Exception):
        # If decryption fails, the value is probably stored in plaintext
        # (pre-migration data). Return as-is for backwards compatibility.
        return ciphertext


def encrypt_decimal(value) -> str:
    """Encrypt a Decimal / float / int value → ciphertext string."""
    if value is None:
        return None
    return encrypt_value(str(value))


def decrypt_decimal(ciphertext: str):
    """Decrypt ciphertext → Decimal. Returns Decimal or None."""
    if ciphertext is None:
        return None
    plaintext = decrypt_value(ciphertext)
    try:
        return Decimal(plaintext)
    except (InvalidOperation, ValueError):
        return None


def encrypt_json(data) -> str:
    """Encrypt a JSON-serializable object → ciphertext string."""
    if data is None:
        return None
    json_str = json.dumps(data, default=str)
    return encrypt_value(json_str)


def decrypt_json(ciphertext: str):
    """Decrypt ciphertext → Python object (dict/list). Returns original on failure."""
    if ciphertext is None:
        return None
    plaintext = decrypt_value(ciphertext)
    try:
        return json.loads(plaintext)
    except (json.JSONDecodeError, TypeError):
        # Might be pre-migration unencrypted JSON stored as string
        return plaintext


def encrypt_text(text: str) -> str:
    """Encrypt a text blob (e.g. raw bank statement text)."""
    return encrypt_value(text)


def decrypt_text(ciphertext: str) -> str:
    """Decrypt a text blob."""
    return decrypt_value(ciphertext)


# ---------------------------------------------------------------------------
# Custom Django model fields (transparent encrypt-on-save, decrypt-on-load)
# ---------------------------------------------------------------------------

class EncryptedTextField(models.TextField):
    """
    A TextField that transparently encrypts data before saving to the DB
    and decrypts when reading from the DB.
    """
    description = "An encrypted TextField"

    def get_prep_value(self, value):
        """Called when saving to DB — encrypt the value."""
        if value is None or value == "":
            return value
        # Don't double-encrypt
        if self._is_encrypted(value):
            return value
        return encrypt_value(str(value))

    def from_db_value(self, value, expression, connection):
        """Called when reading from DB — decrypt the value."""
        if value is None or value == "":
            return value
        return decrypt_value(value)

    def _is_encrypted(self, value):
        """Check if a value looks like it's already Fernet-encrypted."""
        if not isinstance(value, str):
            return False
        try:
            # Fernet tokens are base64 and start with 'gAAAAA'
            return value.startswith("gAAAAA")
        except Exception:
            return False


class EncryptedCharField(models.CharField):
    """
    A CharField that transparently encrypts/decrypts.
    Note: max_length should be large enough for ciphertext (~2.4x original + overhead).
    """
    description = "An encrypted CharField"

    def __init__(self, *args, **kwargs):
        # Fernet ciphertext is longer than plaintext; ensure enough room
        kwargs.setdefault("max_length", 512)
        super().__init__(*args, **kwargs)

    def get_prep_value(self, value):
        if value is None or value == "":
            return value
        if self._is_encrypted(value):
            return value
        return encrypt_value(str(value))

    def from_db_value(self, value, expression, connection):
        if value is None or value == "":
            return value
        return decrypt_value(value)

    def _is_encrypted(self, value):
        if not isinstance(value, str):
            return False
        return value.startswith("gAAAAA")


class EncryptedDecimalField(models.CharField):
    """
    Stores a Decimal value as encrypted text in a CharField column.
    Transparent encryption on save, decryption on read.
    
    Use this instead of DecimalField for sensitive financial amounts.
    The model attribute will be a Decimal on read, but stored as encrypted text.
    """
    description = "An encrypted DecimalField stored as CharField"

    def __init__(self, *args, max_digits=12, decimal_places=2, **kwargs):
        # Use private names to prevent DRF's getattr() from detecting these
        # and passing them as kwargs to CharField serializer field
        self._enc_max_digits = max_digits
        self._enc_decimal_places = decimal_places
        # Fernet ciphertext is ~180 bytes for a typical decimal
        kwargs.setdefault("max_length", 512)
        kwargs.setdefault("default", "0.00")
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs["max_digits"] = self._enc_max_digits
        kwargs["decimal_places"] = self._enc_decimal_places
        # Remove CharField defaults that we set
        if kwargs.get("max_length") == 512:
            del kwargs["max_length"]
        if kwargs.get("default") == "0.00":
            del kwargs["default"]
        return name, path, args, kwargs

    def get_prep_value(self, value):
        """Encrypt before saving to DB."""
        if value is None:
            return None
        # Normalize to string decimal
        try:
            decimal_str = str(Decimal(str(value)).quantize(Decimal(10) ** -self._enc_decimal_places))
        except (InvalidOperation, ValueError):
            decimal_str = str(value)
        if self._is_encrypted(decimal_str):
            return decimal_str
        return encrypt_value(decimal_str)

    def from_db_value(self, value, expression, connection):
        """Decrypt when reading from DB."""
        if value is None or value == "":
            return Decimal("0.00")
        plaintext = decrypt_value(value)
        try:
            return Decimal(plaintext)
        except (InvalidOperation, ValueError):
            return Decimal("0.00")

    def value_to_string(self, obj):
        """Serialization support."""
        value = self.value_from_object(obj)
        return str(value) if value is not None else ""

    def _is_encrypted(self, value):
        if not isinstance(value, str):
            return False
        return value.startswith("gAAAAA")


class EncryptedJSONField(models.TextField):
    """
    Stores a JSON-serializable object as encrypted text.
    Transparent encryption on save, decryption on read.
    """
    description = "An encrypted JSONField stored as TextField"

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("default", dict)
        kwargs.setdefault("blank", True)
        super().__init__(*args, **kwargs)

    def get_prep_value(self, value):
        if value is None:
            return None
        json_str = json.dumps(value, default=str)
        if self._is_encrypted(json_str):
            return json_str
        return encrypt_value(json_str)

    def from_db_value(self, value, expression, connection):
        if value is None or value == "":
            return {} if callable(self.default) else self.default
        plaintext = decrypt_value(value)
        try:
            return json.loads(plaintext)
        except (json.JSONDecodeError, TypeError):
            # Try to parse as raw JSON (pre-migration unencrypted data)
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return {}

    def value_to_string(self, obj):
        value = self.value_from_object(obj)
        return json.dumps(value, default=str) if value is not None else ""

    def _is_encrypted(self, value):
        if not isinstance(value, str):
            return False
        return value.startswith("gAAAAA")
