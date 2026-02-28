#!/usr/bin/env python
"""
Test script for new authentication endpoints:
- Profile Update
- Forgot Password
- Reset Password
- Verify Email
- Send Verification Email
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"
TIMESTAMP = int(time.time())

def print_response(title: str, response: requests.Response, success_code: int = 200) -> None:
    """Pretty print API response"""
    status = "✅" if response.status_code == success_code else "❌"
    print(f"\n{'='*70}")
    print(f"{status} {title}")
    print(f"{'='*70}")
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def register_user() -> Dict[str, Any]:
    """Register a test user"""
    payload = {
        "username": f"testuser_{TIMESTAMP}",
        "email": f"atharva.sonar.9106@gmail.com",
        "password": "TestPass123",
        "password_confirm": "TestPass123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/register/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("1. Register User (POST /auth/register/)", response, 201)
    return response.json() if response.ok else None

def login_user(email: str, password: str) -> Dict[str, Any]:
    """Login and get tokens"""
    payload = {
        "email": email,
        "password": password
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("2. Login User (POST /auth/login/)", response, 200)
    return response.json() if response.ok else None

def update_profile(access_token: str) -> None:
    """Update user profile"""
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "income": "50000.00"
    }
    
    response = requests.put(
        f"{BASE_URL}/auth/profile/update/",
        json=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )
    
    print_response("3. Update Profile (PUT /auth/profile/update/)", response, 200)

def send_verification_email(email: str) -> None:
    """Send verification email"""
    payload = {"email": email}
    
    response = requests.post(
        f"{BASE_URL}/auth/send-verification-email/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("4. Send Verification Email (POST /auth/send-verification-email/)", response, 200)

def verify_email_with_invalid_token() -> None:
    """Try to verify email with invalid token"""
    payload = {"token": "invalid-token-12345"}
    
    response = requests.post(
        f"{BASE_URL}/auth/verify-email/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("5. Verify Email with Invalid Token (POST /auth/verify-email/)", response, 400)

def forgot_password(email: str) -> None:
    """Initiate password reset"""
    payload = {"email": email}
    
    response = requests.post(
        f"{BASE_URL}/auth/forgot-password/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("6. Forgot Password (POST /auth/forgot-password/)", response, 200)

def reset_password_with_invalid_token() -> None:
    """Try to reset password with invalid token"""
    payload = {
        "token": "invalid-token-12345",
        "password": "NewPass123",
        "password_confirm": "NewPass123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/reset-password/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("7. Reset Password with Invalid Token (POST /auth/reset-password/)", response, 400)

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("🚀 FINRIGHT AI - NEW AUTHENTICATION ENDPOINTS TEST")
    print("="*70)
    
    # Register user
    print("\n" + "="*70)
    print("STEP 1: USER REGISTRATION & LOGIN")
    print("="*70)
    
    register_response = register_user()
    if not register_response:
        print("❌ Registration failed, stopping tests")
        return
    
    email = register_response.get('user', {}).get('email')
    if not email:
        print("❌ Email not found in registration response")
        return
    
    # Login
    login_response = login_user(email, "TestPass123")
    if not login_response:
        print("❌ Login failed, stopping tests")
        return
    
    access_token = login_response.get('access')
    if not access_token:
        print("❌ Access token not found in login response")
        return
    
    # Update profile
    print("\n" + "="*70)
    print("STEP 2: PROFILE MANAGEMENT")
    print("="*70)
    
    update_profile(access_token)
    
    # Email verification
    print("\n" + "="*70)
    print("STEP 3: EMAIL VERIFICATION")
    print("="*70)
    
    send_verification_email(email)
    verify_email_with_invalid_token()
    
    # Password reset
    print("\n" + "="*70)
    print("STEP 4: PASSWORD RESET")
    print("="*70)
    
    forgot_password(email)
    reset_password_with_invalid_token()
    
    # Summary
    print("\n" + "="*70)
    print("✅ ALL TESTS COMPLETED")
    print("="*70)
    print("\n📝 NOTES:")
    print("- Check your email inbox for verification and password reset emails")
    print("- Emails are sent to the provided email address")
    print("- Verification link format: http://frontend.com/verify-email?token=<token>")
    print("- Password reset link format: http://frontend.com/reset-password?token=<token>")
    print("- Verification tokens expire in 24 hours")
    print("- Password reset tokens expire in 1 hour")
    print("\n🔧 EMAIL CONFIGURATION:")
    print("- Update settings.py with your SMTP server details")
    print("- For Gmail: Use App Password (not regular password)")
    print("- Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in environment")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server at http://127.0.0.1:8000")
        print("Make sure Django server is running:")
        print("  python manage.py runserver 127.0.0.1:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
