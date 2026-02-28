from .db_conn import get_db

try:
    db = get_db()
    print("Collections:", db.list_collection_names())
    print("Connected successfully!")
except Exception as e:
    print("Error:", e)
