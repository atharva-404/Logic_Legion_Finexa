# Finexa API Testing Guide - Postman

## Quick Start

### 1. Import Collection
Import the file: **`Finexa_API_Collection.postman_collection.json`** into Postman

### 2. Set Base URL
- Variable: `baseUrl`
- Value: `http://localhost:8000`

### 3. Test Flow

#### Step 1: Register a User
```
POST {{baseUrl}}/auth/register/

Body:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123",
  "password2": "testpass123"
}
```

#### Step 2: Login
```
POST {{baseUrl}}/auth/login/

Body:
{
  "email": "test@example.com",
  "password": "testpass123"
}
```
✅ This automatically saves the `accessToken` to collection variables

#### Step 3: Test Gemini AI Features

**Upload Document for AI Processing:**
```
POST {{baseUrl}}/api/ai/document/process/
Authorization: Bearer {{accessToken}}

Form Data:
- file: [Upload PDF/Image]
```

**Get AI Summary (Gemini):**
```
GET {{baseUrl}}/api/ai/expense-document/<mongo_id>/summary/
Authorization: Bearer {{accessToken}}
```

**Get AI Suggestions (Gemini):**
```
GET {{baseUrl}}/api/ai/expense-document/<mongo_id>/suggestions/
Authorization: Bearer {{accessToken}}
```

---

## All Available Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | Login & get JWT token |
| GET | `/auth/me/` | Get current user profile |
| PUT | `/auth/profile/update/` | Update profile |
| POST | `/auth/verify-email/` | Verify email with token |
| POST | `/auth/forgot-password/` | Request password reset |
| POST | `/auth/reset-password/` | Reset password |

### 🤖 AI Assistant (Gemini Powered)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/document/process/` | Upload & extract expenses with Gemini |
| GET | `/api/ai/documents/` | List all documents |
| GET | `/api/ai/documents/<id>/content/` | Get document content |
| GET | `/api/ai/expense-document/<id>/summary/` | AI expense summary |
| GET | `/api/ai/expense-document/<id>/suggestions/` | AI saving suggestions |
| GET | `/api/ai/chat-sessions/` | List chat sessions |
| GET | `/api/ai/chat-sessions/<id>/messages/` | Get chat messages |

### 💰 Wallet Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/wallet/` | Get wallet balance |
| POST | `/api/ai/wallet/add-money/` | Add money to wallet |
| POST | `/api/ai/wallet/withdraw/` | Withdraw from wallet |
| GET | `/api/ai/wallet/transactions/` | Get wallet transactions |
| GET | `/api/ai/wallet/timeline/` | Get wallet timeline |

### 📊 Financial Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/financial-health/score/` | Current health score |
| GET | `/api/ai/financial-health/history/` | Score history |
| GET | `/api/ai/financial-health/breakdown/` | Detailed breakdown |
| POST | `/api/ai/financial-health/recalculate/` | Recalculate score |
| GET | `/api/ai/financial-health/recommendations/` | Get recommendations |

### 💸 Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/` | List transactions |
| POST | `/api/transactions/` | Create transaction |
| GET | `/api/transactions/<id>/` | Get transaction details |
| PUT | `/api/transactions/<id>/` | Update transaction |
| DELETE | `/api/transactions/<id>/` | Delete transaction |

### 🎯 Savings Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals/` | List savings goals |
| POST | `/api/goals/` | Create goal |
| GET | `/api/goals/<id>/` | Get goal details |
| PUT | `/api/goals/<id>/` | Update goal |
| DELETE | `/api/goals/<id>/` | Delete goal |

### 🏆 Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gamification/` | Get badges & points |

---

## Testing Gemini AI Decision-Making

### Scenario: "Can I spend ₹2,000 on headphones?"

1. **Add Money to Wallet**
```json
POST /api/ai/wallet/add-money/
{
  "amount": 10000,
  "description": "Monthly Salary"
}
```

2. **Create Some Expenses**
```json
POST /api/transactions/
{
  "amount": 3000,
  "category": "Rent",
  "type": "expense",
  "description": "Monthly rent"
}
```

3. **Upload Bank Statement** (for AI analysis)
```
POST /api/ai/document/process/
[Upload PDF/Image of bank statement]
```

4. **Get AI Suggestions**
```
GET /api/ai/expense-document/<mongo_id>/suggestions/
```

Expected Response Format:
```json
{
  "decision": "NO",
  "confidence": "High",
  "explanation": "This purchase exceeds your discretionary budget and may affect upcoming expenses. Similar purchases previously reduced savings stability.",
  "remaining_balance": 7000,
  "risk_level": "Medium"
}
```

---

## WebSocket Testing

For real-time AI chat, use a WebSocket client:

```
ws://localhost:8000/ws/ai/chat/

Message Format:
{
  "question": "How much did I spend on food this month?",
  "document_id": 123
}
```

---

## Environment Variables

Set these in Postman:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:8000` | Server base URL |
| `accessToken` | Auto-set on login | JWT access token |

---

## Common Issues

### 401 Unauthorized
- Ensure you've logged in and token is set
- Check Authorization header: `Bearer {{accessToken}}`

### 500 Internal Server Error
- Check server logs for Gemini API errors
- Verify `GEMINI_API_KEY` is set in `.env`

### File Upload Errors
- Max file size: 10MB
- Supported formats: PDF, JPG, PNG

---

## Testing Checklist

- [ ] User registration & login
- [ ] Upload document and get AI extraction
- [ ] Get AI expense summary (Gemini)
- [ ] Get AI saving suggestions (Gemini)
- [ ] Add money to wallet
- [ ] Create transactions
- [ ] Get financial health score
- [ ] Create savings goal
- [ ] Test WebSocket chat

---

**Server Status:** ✅ Running at http://127.0.0.1:8000/  
**AI Engine:** Google Gemini (gemini-1.5-flash)  
**Database:** SQLite + MongoDB
