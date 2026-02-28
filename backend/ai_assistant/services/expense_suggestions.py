# ai_assistant/services/expense_suggestions.py

from google import genai
from django.conf import settings
from google.api_core.exceptions import ResourceExhausted, NotFound
import json

# Configure Gemini with new client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_saving_suggestions(expense_data: dict) -> dict:
    """
    Generate saving insights based on structured expense JSON.
    """
    system_prompt = """
    You are Finexa AI, a financial planning assistant.
    Based on the user's expense history, provide smart and practical suggestions
    to help reduce expenses and increase savings.

    Return ONLY JSON with the schema:
    {
      "suggestions": [
        "string",
        "string",
        "string"
      ]
    }

    Suggestions should be:
    - Personalized to spending categories and merchants
    - Actionable and measurable
    - Not generic like 'save money', but specific
    - Consider user's financial safety and sustainability
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"{system_prompt}\n\nExpense data:\n{json.dumps(expense_data)}"
        )

        raw_output = response.text.strip()
        
        # Remove markdown code blocks if present
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        
        return json.loads(raw_output.strip())
    
    except ResourceExhausted:
        return {"suggestions": [], "error": "API quota exceeded"}
    
    except NotFound:
        return {"suggestions": [], "error": "Model not found"}
    
    except json.JSONDecodeError:
        return {"suggestions": [], "raw_output": raw_output}
    
    except Exception as e:
        return {"suggestions": [], "error": str(e)}
