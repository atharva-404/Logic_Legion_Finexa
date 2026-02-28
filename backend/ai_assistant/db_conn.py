# ai_assistant/mongo_client.py
from pymongo import MongoClient

# ⛔ TEMP: hard-code Atlas URI here
MONGO_URI = "mongodb+srv://atharva:atharva@cluster0.i441yof.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

print("DEBUG MONGO_URI =", MONGO_URI)  # <--- very important

_client = None

def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000)
    return _client

def get_db(name=None):
    client = get_client()
    dbname = name or "om"
    return client[dbname]
