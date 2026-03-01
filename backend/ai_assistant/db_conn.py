# ai_assistant/mongo_client.py
from pymongo import MongoClient
from django.conf import settings
import os

# Use environment variable or Django settings — NEVER hard-code credentials
MONGO_URI = os.getenv("MONGO_URI") or getattr(settings, "MONGODB_URI", None)

if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is not set. Add it to your .env file.")

_client = None

def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000)
    return _client

def get_db(name=None):
    client = get_client()
    dbname = name or getattr(settings, "MONGODB_DB_NAME", "om")
    return client[dbname]
