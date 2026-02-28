#!/usr/bin/env python
"""
Quick test script to verify the authentication API is working correctly.
Run this after starting: python manage.py runserver
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"
TIMESTAMP = int(time.time())  # Unique identifier for each test run

def print_response(title: str, response: requests.Response) -> None:
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"✓ {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_register() -> Dict[str, Any]:
    """Test user registration"""
    payload = {
        "username": f"testuser_{TIMESTAMP}",
        "email": f"testuser_{TIMESTAMP}@example.com",
        "password": "TestPass123",
        "password_confirm": "TestPass123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/register/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("User Registration (POST /auth/register/)", response)
    return response.json() if response.ok else None

def test_login() -> Dict[str, Any]:
    """Test user login"""
    payload = {
        "email": f"testuser_{TIMESTAMP}@example.com",
        "password": "TestPass123"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("User Login (POST /auth/login/)", response)
    return response.json() if response.ok else None

def test_get_profile(access_token: str) -> None:
    """Test get user profile (protected endpoint)"""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/auth/me/",
        headers=headers
    )
    
    print_response("Get User Profile (GET /auth/me/)", response)

def test_refresh_token(refresh_token: str) -> Dict[str, Any]:
    """Test token refresh"""
    payload = {
        "refresh": refresh_token
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/refresh/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print_response("Refresh Access Token (POST /auth/refresh/)", response)
    return response.json() if response.ok else None

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 FINRIGHT AI - AUTHENTICATION API TEST")
    print("="*60)
    
    # Test 1: Register
    print("\n[1/4] Testing User Registration...")
    register_response = test_register()
    if not register_response:
        print("❌ Registration failed, skipping remaining tests")
        return
    
    # Test 2: Login
    print("\n[2/4] Testing User Login...")
    login_response = test_login()
    if not login_response:
        print("❌ Login failed, skipping remaining tests")
        return
    
    access_token = login_response.get('access')
    refresh_token = login_response.get('refresh')
    
    if not access_token:
        print("❌ No access token received")
        return
    
    # Test 3: Get Profile (protected)
    print("\n[3/4] Testing Protected Profile Endpoint...")
    test_get_profile(access_token)
    
    # Test 4: Refresh Token
    print("\n[4/4] Testing Token Refresh...")
    if refresh_token:
        test_refresh_token(refresh_token)
    else:
        print("⚠️  No refresh token available")
    
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server at http://127.0.0.1:8000")
        print("Make sure Django server is running:")
        print("  python manage.py runserver 127.0.0.1:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
