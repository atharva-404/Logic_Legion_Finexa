import requests
import sys

try:
    content = open('token.txt', encoding='utf-16').read()
except:
    content = open('token.txt', encoding='utf-8').read()

import re
match = re.search(r"ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+", content)
if match:
    token = match.group(0)
    print(f"Found Token: {token[:10]}...")
else:
    print("No token found in token.txt")
    print(content)
    sys.exit(1)

url = "http://127.0.0.1:8000/api/ai/document/process/"
files = {'file': ('test.txt', open('test.txt', 'rb'))}
headers = {'Authorization': f'Bearer {token}'}

try:
    r = requests.post(url, files=files, headers=headers)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")
