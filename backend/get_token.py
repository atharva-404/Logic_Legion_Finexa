from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import os
import django
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

User = get_user_model()
try:
    user = User.objects.first()
    if user:
        refresh = RefreshToken.for_user(user)
        print(f"ACCESS_TOKEN:{str(refresh.access_token)}")
    else:
        # Create a test user if none exists
        user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
        refresh = RefreshToken.for_user(user)
        print(f"ACCESS_TOKEN:{str(refresh.access_token)}")
except Exception as e:
    print(f"ERROR:{e}")
