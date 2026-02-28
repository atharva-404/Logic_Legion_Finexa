import os
import sys
import django

# Add the project directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.conf import settings

print("-" * 20)
print(f"GEMINI_API_KEY Set? : {'YES' if settings.GEMINI_API_KEY else 'NO'}")
if settings.GEMINI_API_KEY:
    print(f"GEMINI_API_KEY Length: {len(settings.GEMINI_API_KEY)}")

print(f"MONGODB_URI Set?    : {'YES' if settings.MONGODB_URI else 'NO'}")
if settings.MONGODB_URI:
    print(f"MONGODB_URI Prefix: {settings.MONGODB_URI[:15]}...")
print("-" * 20)
