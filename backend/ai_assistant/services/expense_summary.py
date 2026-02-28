# ai_assistant/services/expense_summary.py

from google import genai
from django.conf import settings
from google.api_core.exceptions import ResourceExhausted, NotFound
import json

# Configure Gemini with new client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def summarize_expenses_from_data(data: dict) -> dict:
    """
    Given structured expense JSON from Mongo,
    generate a financial summary via LLM call.
    """

    system_prompt = """
    You are Finexa AI, an expert financial analysis model.

    Given the structured expenses and metadata JSON,
    produce insights in the following JSON format only:

    {
      "total_amount": number,
      "record_count": number,
      "biggest_category": "string",
      "currency": "INR",
      "top_merchants": ["string"],
      "suggestions": ["string"]
    }
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"{system_prompt}\n\nExpense data:\n{json.dumps(data)}"
        )

        raw = response.text.strip()
        
        # Remove markdown code blocks if present
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]

        return json.loads(raw.strip())
    
    except ResourceExhausted:
        return {"error": "Gemini API quota exceeded"}
    
    except NotFound as e:
        return {"error": "Invalid Gemini model"}
    
    except json.JSONDecodeError:
        return {"error": "Invalid output from LLM", "raw_response": raw}
    
    except Exception as e:
        return {"error": f"Failed to summarize: {str(e)}"}
