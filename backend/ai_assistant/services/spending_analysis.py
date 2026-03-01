from google import genai
from django.conf import settings
from google.api_core.exceptions import ResourceExhausted
import json
from datetime import timedelta
from django.utils import timezone
from transactions.models import Transaction
from ai_assistant.models import WalletTransaction, SpendingPattern

# Configure Gemini
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_user_spending(user):
    """
    Analyzes user's transaction history (Wallet + Manual Transactions)
    using Gemini to identify patterns and generate recommendations.
    
    Returns:
        dict: The structured analysis result.
    """
    
    # 1. Gather Data (Last 30 Days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Fetch Manual Transactions (Income/Expense)
    manual_txns = list(Transaction.objects.filter(
        user=user, 
        date__gte=thirty_days_ago
    ))
    
    # Fetch Wallet Transactions
    wallet_txns = list(WalletTransaction.objects.filter(
        wallet__user=user,
        timestamp__gte=thirty_days_ago
    ))
    
    # Format for LLM
    txn_summary = "Recent Transactions (Last 30 Days):\n"
    
    if not manual_txns and not wallet_txns:
        return {
            "patterns": ["No recent activity detected."],
            "anomalies": [],
            "recommendations": ["Start tracking your expenses to get personalized insights."]
        }

    for t in manual_txns:
        txn_summary += f"- {t.date.strftime('%Y-%m-%d')}: {t.type.upper()} ({t.category}) ₹{t.amount}\n"
        
    for t in wallet_txns:
        t_type = t.transaction_type
        desc = t.description or "Wallet txn"
        txn_summary += f"- {t.timestamp.strftime('%Y-%m-%d')}: WALLET {t_type} - {desc} ₹{t.amount}\n"
        
    # 2. Prompt Gemini
    system_prompt = """
    You are an expert financial analyst. Analyze the following user transaction history.
    Identify spending patterns, unusual anomalies, and providing actionable saving recommendations.
    
    Output MUST be valid JSON with this schema:
    {
        "patterns": ["string", "string"],
        "anomalies": ["string"],
        "recommendations": [
            { "title": "string", "description": "string", "potential_savings": "string" }
        ]
    }
    
    Keep insights concise, friendly, and non-judgmental. Focus on high-impact advice.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"{system_prompt}\n\n{txn_summary}"
        )
        
        raw_output = response.text.strip()
        
        # Clean markdown code blocks
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
            
        analysis_result = json.loads(raw_output.strip())
        
        # 3. Save to DB (Cache)
        SpendingPattern.objects.create(
            user=user,
            analysis_data=analysis_result
        )
        
        return analysis_result

    except ResourceExhausted:
        return {"error": "AI service is currently busy. Please try again later."}
    except Exception as e:
        print(f"Spending analysis failed: {e}")
        return {"error": "Failed to analyze spending patterns."}
