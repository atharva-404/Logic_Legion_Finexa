"""
Quick test script to verify wallet endpoints are working
"""
import requests

BASE_URL = "http://localhost:8000"

# Get your access token (replace with your actual token)
# You can get this from localStorage in your browser
TOKEN = "your_token_here"  # Replace this!

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

print("Testing Wallet Endpoints...")
print("=" * 50)

# Test 1: Get Wallet
print("\n1. Testing GET /api/ai/wallet/")
try:
    response = requests.get(f"{BASE_URL}/api/ai/wallet/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Add Money
print("\n2. Testing POST /api/ai/wallet/add-money/")
try:
    data = {"amount": 1000, "description": "Test deposit"}
    response = requests.post(f"{BASE_URL}/api/ai/wallet/add-money/", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Get Transactions
print("\n3. Testing GET /api/ai/wallet/transactions/")
try:
    response = requests.get(f"{BASE_URL}/api/ai/wallet/transactions/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 50)
print("Test complete!")
