# ai_assistant/services/expense_extraction.py

import io
import json
from datetime import datetime
import mimetypes
import os

from django.conf import settings

from pymongo import MongoClient
from bson import ObjectId

from PyPDF2 import PdfReader
from PIL import Image
import pytesseract

from google import genai
from google.api_core.exceptions import ResourceExhausted, NotFound

# Encryption utilities
from core.encryption import encrypt_text, decrypt_text, encrypt_json, decrypt_json

# Initialize Gemini client with new package
client = genai.Client(api_key=settings.GEMINI_API_KEY)


# ---------- Mongo client ----------

def get_mongo_collection():
    mongo_client = MongoClient(settings.MONGODB_URI)
    mongo_db =mongo_client[settings.MONGODB_DB_NAME]
    mongo_collection = mongo_db[settings.MONGODB_COLLECTION_NAME]
    return mongo_collection
        



# ---------- File -> text extraction ----------

def _extract_text_from_pdf(django_file):
    django_file.seek(0)
    reader = PdfReader(django_file)
    text_parts = []
    for page in reader.pages:
        try:
            text_parts.append(page.extract_text() or "")
        except Exception:
            pass
    return "\n".join(text_parts)


def _extract_text_from_image(django_file):
    """
    Using Tesseract OCR. Requires Tesseract installed on the system.
    """
    django_file.seek(0)
    image = Image.open(django_file)
    text = pytesseract.image_to_string(image)
    return text


def extract_text_from_uploaded_file(uploaded_file):
    """
    Extract text from uploaded image or PDF.
    """
    file_extension = uploaded_file.name.lower().split('.')[-1]

    if file_extension in ['jpg', 'jpeg', 'png']:
        # OCR for images
        image = Image.open(uploaded_file)
        text = pytesseract.image_to_string(image)
        return text

    elif file_extension == 'pdf':
        # PyPDF2 for PDFs
        pdf_reader = PdfReader(io.BytesIO(uploaded_file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text

    else:
        raise ValueError(f"Unsupported file type: {file_extension}")


def call_llm_for_expense_extraction(raw_text: str):
    """
    Use Gemini to extract structured expense data from raw text.
    Returns a dict with 'expenses' array and metadata.
    """
    prompt = f"""You are an AI assistant that extracts expense data from bill/receipt text.
Given the following text, extract all expense items in JSON format.

Text:
{raw_text}

Return ONLY valid JSON with this structure:
{{
  "expenses": [
    {{
      "item": "item name",
      "amount": 100.00,
      "category": "Food"
    }}
  ],
  "total": 100.00,
  "currency": "INR",
  "merchant": "Store name if available",
  "date": "YYYY-MM-DD if available"
}}

JSON:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        print("LLM raw response:", response)    
        # Extract the message content from the response
        json_str = response.text
        print("LLM output:", json_str)
        
        # Remove markdown code blocks if present
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.startswith("```"):
            json_str = json_str[3:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
        
        data = json.loads(json_str.strip())
        return data
    
    except ResourceExhausted:
        raise RuntimeError("Gemini API quota exceeded. Please try again later.")
    
    except NotFound as e:
        raise RuntimeError("Invalid Gemini model. gemini-2.0-flash not found.") from e
    
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        # Return raw response if JSON parsing fails
        return {"raw": json_str, "error": "Failed to parse JSON"}
    
    except Exception as e:
        raise RuntimeError(f"LLM extraction failed: {str(e)}")


# ---------- Save document in MongoDB ----------

def save_expense_document_to_mongo(user_id, uploaded_file, raw_text, structured_data):
    document = {
        "user_id": user_id,
        "file_name": uploaded_file.name,
        "content_type": getattr(uploaded_file, "content_type", None),
        "size": uploaded_file.size,
        "raw_text": encrypt_text(raw_text),  # 🔒 Encrypted
        "extracted_data": encrypt_json(structured_data),  # 🔒 Encrypted
        "is_encrypted": True,  # Flag for migration awareness
        "created_at": datetime.utcnow(),
    }
    result = get_mongo_collection().insert_one(document)
    return str(result.inserted_id)


def get_expense_document_by_id(doc_id: str):
    """Retrieve a stored expense document from MongoDB by its ObjectId string.

    Returns the document dict (with decrypted fields) or None if not found / invalid id.
    """
    if not doc_id:
        return None
    try:
        oid = ObjectId(doc_id)
    except Exception:
        # if it's not a valid ObjectId, try to find by string _id
        try:
            doc = get_mongo_collection().find_one({"_id": doc_id})
            return _decrypt_mongo_document(doc) if doc else None
        except Exception:
            return None

    doc = get_mongo_collection().find_one({"_id": oid})
    return _decrypt_mongo_document(doc) if doc else None


def _decrypt_mongo_document(doc):
    """Decrypt encrypted fields in a MongoDB expense document."""
    if doc is None:
        return None
    
    # Check if document is encrypted (new format)
    if doc.get("is_encrypted"):
        if isinstance(doc.get("raw_text"), str):
            doc["raw_text"] = decrypt_text(doc["raw_text"])
        if isinstance(doc.get("extracted_data"), str):
            doc["extracted_data"] = decrypt_json(doc["extracted_data"])
    
    return doc


def extracted_data_to_csv_bytes(extracted_data: dict) -> bytes:
    """Convert extracted_data (dict) to CSV bytes.

    The CSV will contain one row per expense with columns:
    date, amount, currency, category, merchant, description, account, reference
    """
    import csv

    expenses = []
    if not extracted_data:
        expenses = []
    else:
        expenses = extracted_data.get("expenses") or []

    headers = [
        "date",
        "amount",
        "currency",
        "category",
        "merchant",
        "description",
        "account",
        "reference",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()

    for e in expenses:
        row = {k: e.get(k) if isinstance(e, dict) else None for k in headers}
        writer.writerow(row)

    # Optionally append summary as commented lines
    summary = extracted_data.get("summary") if isinstance(extracted_data, dict) else None
    if summary:
        output.write("\n# Summary\n")
        for k, v in summary.items():
            output.write(f"# {k}: {v}\n")

    return output.getvalue().encode("utf-8")
