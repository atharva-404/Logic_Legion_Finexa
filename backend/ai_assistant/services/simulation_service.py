# ai_assistant/services/simulation_service.py

from google import genai
from django.conf import settings
from google.api_core.exceptions import ResourceExhausted, NotFound
import json

# Initialize Gemini client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def simulate_financial_impact(scenario_type: str, amount: float, current_score: int = 750, scenario_details: dict = None) -> dict:
    """
    Simulate the impact of a financial decision using Gemini.
    """
    if scenario_details is None:
        scenario_details = {}

    # Mock User Data (In real app, fetch from DB)
    mock_active_loans = """
    1. Personal Loan: ₹2,00,000 | EMI: ₹5,500 | Tenure: 24m | Paid: 12 | Remaining: 12 | Status: PAID
    2. Credit Card: ₹50,000 Limit | Utilized: ₹15,000 | Status: PAID
    """
    
    mock_payment_history = "Last 6 months: ALL PAID ON TIME"

    details_str = "\n".join([f"    {k.replace('_', ' ').title()}: {v}" for k, v in scenario_details.items() if v])

    system_prompt = """
    You are Finexa AI, an autonomous credit intelligence and financial risk analysis agent.
    Your role is to act like a senior credit analyst. You must analyze the user’s data + PROPOSED SCENARIO to predict credit score movement.

    User Credit Profile:
    Current Finexa Score: {current_score}

    Active Loans:
    {mock_active_loans}

    Payment History:
    {mock_payment_history}

    ==================================================
    PROPOSED USER SCENARIO (What they want to do):
    Type: {scenario_type}
    Amount: ₹{amount}
    {details_str}
    ==================================================

    Your tasks:
    1. Evaluate the user’s credit health (Current + Proposed Scenario).
    2. Identify risks (e.g., adding a new loan when they already have one).
    3. Predict the specific score impact of this proposed action.
    4. Provide realistic observations and actions.

    Return your response in STRICT JSON format ONLY (No markdown):

    {{
      "impact_points": integer,           // Estimated change (e.g., -15 or +5)
      "new_score": integer,               // current_score + impact_points
      "risk_level": "LOW | MEDIUM | HIGH", 
      "score_trend": "IMPROVING | STABLE | DECLINING",
      "analysis": "A clear 3-5 sentence explanation of the impact.",
      "key_observations": [
        "Concise factual observation about the scenario",
        "Another observation"
      ],
      "recommendations": [
        "Specific action the user should take",
        "Another concrete recommendation"
      ],
      "critical_warnings": [
        "Explicit warning if applicable (e.g. 'High spending might lower your savings rate'), otherwise empty"
      ]
    }}

    Be conservative and realistic. Prioritize financial safety.
    """

    prompt = system_prompt.format(
        current_score=current_score,
        mock_active_loans=mock_active_loans,
        mock_payment_history=mock_payment_history,
        scenario_type=scenario_type,
        amount=amount,
        details_str=details_str
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )

        raw = response.text.strip()
        
        # Clean up markdown
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]

        return json.loads(raw.strip())

    except ResourceExhausted:
        return {
            "impact_points": 0,
            "new_score": current_score,
            "risk_level": "UNKNOWN",
            "score_trend": "STABLE",
            "analysis": "AI service is currently busy. Please try again.",
            "key_observations": [],
            "recommendations": [],
            "critical_warnings": []
        }
    except Exception as e:
        print(f"Simulation error: {e}")
        return {
            "impact_points": 0,
            "new_score": current_score,
            "risk_level": "UNKNOWN",
            "score_trend": "STABLE",
            "analysis": "Could not calculate impact at this time.",
            "key_observations": [],
            "recommendations": [],
            "critical_warnings": ["System error occurred during analysis"]
        }


def analyze_credit_health(loans: list, current_score: int) -> dict:
    """
    Analyze the user's full credit profile and loan portfolio.
    """
    loans_str = ""
    if not loans:
        loans_str = "No active loans reported."
    else:
        for idx, loan in enumerate(loans, 1):
            loans_str += f"{idx}. {loan.get('type', 'Unknown')}: Principal ₹{loan.get('principal', 0)} | EMI: ₹{loan.get('emi', 0)} | Tenure: {loan.get('tenure', 0)}m | Status: {loan.get('missed_emis', '0')} missed\n"

    system_prompt = """
    You are Finexa AI, a Senior Credit Analyst.
    Analyze the user's REAL loan portfolio to determine credit health and future score trend.

    User Profile:
    Current Score: {current_score}

    Active Loans provided by user:
    {loans_str}

    Your tasks:
    1. Determine overall Risk Level (LOW, MEDIUM, HIGH).
    2. Predict Score Trend (IMPROVING, STABLE, DECLINING).
    3. Predict a specific Score Range for next 3 months (e.g. "760-780").
    4. Provide specific Observations, Actions, and Critical Warnings.

    Return STRICT JSON:
    {{
      "risk_level": "LOW | MEDIUM | HIGH",
      "score_trend": "IMPROVING | STABLE | DECLINING",
      "predicted_score_range": "string",
      "analysis": "string",
      "key_observations": ["string"],
      "recommended_actions": ["string"],
      "critical_warnings": ["string"] 
    }}
    """

    prompt = system_prompt.format(
        current_score=current_score,
        loans_str=loans_str
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        # Parse JSON similar to simulate function
        raw = response.text.strip()
        if raw.startswith("```json"): raw = raw[7:]
        if raw.startswith("```"): raw = raw[3:]
        if raw.endswith("```"): raw = raw[:-3]
        return json.loads(raw.strip())
    
    except Exception as e:
        print(f"Analysis error: {e}")
        return {
            "risk_level": "UNKNOWN",
            "score_trend": "STABLE",
            "predicted_score_range": f"{current_score}-{current_score}",
            "analysis": "Could not analyze at this time.",
            "key_observations": [],
            "recommended_actions": [],
            "critical_warnings": ["System error"]
        }
