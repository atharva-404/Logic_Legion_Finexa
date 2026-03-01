# Finexa - AI-Powered Personal Finance Management Platform

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-informational?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Node.js-18+-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/React-18.3.1-61dafb?style=flat-square" />
  <img src="https://img.shields.io/badge/Django-5.2.5-green?style=flat-square" />
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Project Architecture](#project-architecture)
- [Features in Detail](#features-in-detail)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Finexa** is an AI-powered personal finance management platform designed to help users take control of their financial health. The platform leverages advanced machine learning, real-time data processing, and intuitive user interfaces to provide comprehensive financial insights, automated expense tracking, and intelligent financial recommendations.

### Mission
Empower individuals to achieve financial wellness through AI-driven insights, habit building, and personalized financial guidance.

---

## 🎯 Key Features

### Core Financial Management
- **📊 Dashboard Overview** - Real-time financial health score, income/expense tracking, savings visualization
- **💰 Wallet Management** - Multi-currency support, balance tracking, transaction history
- **📄 Document Upload & Processing** - PDF/image-based expense extraction using AI, automatic transaction categorization
- **💳 Transaction Tracking** - Detailed transaction logs, category-wise breakdown, spending patterns analysis

### AI-Powered Intelligence
- **🤖 AI Coach** - Intelligent chatbot providing personalized financial advice using LLM (Google Gemini/OpenAI)
- **💡 Spending Analysis** - Automatic identification of spending patterns, anomalies, and optimization opportunities
- **🎯 Financial Recommendations** - AI-generated suggestions for budget optimization and expense reduction
- **📈 Spending Insights** - Category analysis, trend detection, comparative financial metrics

### Goal & Savings Management
- **🎯 Goals Tracker** - Create, track, and manage savings goals with progress visualization
- **💾 Savings Automation** - Automatic savings tracking and goal-based fund allocation
- **📋 Expense Budget** - Set category-wise budgets and monitor spending against limits

### Gamification & Engagement
- **🏆 Habit Challenges** - Engagement-driven financial habits with streak tracking, points, and rewards
- **🎖️ Achievement Badges** - Earn badges for financial milestones and consistent behavior
- **📚 Financial Education** - Interactive learning modules covering financial concepts and best practices

### Advanced Analytics
- **⚠️ Emergency Risk Assessment** - Calculate emergency fund coverage and financial safety ratings
- **💹 Income Simulator** - Model different income scenarios and financial projections
- **📊 Financial Health Score** - Comprehensive scoring based on income stability, savings rate, expense ratio, and more

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 5.4.10 | Build tool |
| **Tailwind CSS** | 3.4.14 | Styling |
| **Framer Motion** | 11.11.0 | Animations |
| **Recharts** | 2.13.3 | Data visualization |
| **React Router** | 6.28.0 | Navigation |
| **Zustand** | 5.0.2 | State management |
| **Lucide React** | 0.462.0 | Icons |
| **Axios** | 1.13.6 | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Django** | 5.2.5 | Web framework |
| **Django REST Framework** | 3.16.1 | API framework |
| **Python** | 3.10+ | Runtime |
| **PostgreSQL/SQLite** | - | Primary database |
| **MongoDB** | 5.0+ | Document storage |
| **Channels** | 4.3.2 | WebSocket support |
| **Celery** | - | Async task queue |
| **Redis** | - | Caching & broker |
| **LangChain** | 0.3.27 | LLM framework |
| **Google Gemini API** | - | AI language model |
| **OpenAI GPT-4** | - | Expense extraction |

### Infrastructure & DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Gunicorn** - WSGI server
- **JWT Authentication** - Secure API access
- **CORS Headers** - Cross-origin resource sharing

---

## 📁 Project Structure

```
Logic_Legion_Finexa/
├── backend/
│   ├── ai_assistant/                    # AI & document processing module
│   │   ├── migrations/                  # Database migrations
│   │   ├── services/
│   │   │   ├── agent.py                 # LLM agent for conversation
│   │   │   ├── expense_extraction.py    # Document-to-expense extraction
│   │   │   ├── financial_health.py      # Health score calculation
│   │   │   ├── spending_analysis.py     # Pattern analysis
│   │   │   └── goal_planning.py         # Goal optimization
│   │   ├── views.py                     # API endpoints
│   │   ├── serializers.py               # Data serialization
│   │   ├── models.py                    # Database models
│   │   └── urls.py                      # Routing
│   ├── core/
│   │   ├── settings.py                  # Django configuration
│   │   ├── urls.py                      # Main URL routing
│   │   ├── asgi.py                      # ASGI config
│   │   └── wsgi.py                      # WSGI config
│   ├── users/                           # User authentication & management
│   │   ├── models.py                    # User model
│   │   ├── views.py                     # Auth endpoints
│   │   └── serializers.py               # User serializers
│   ├── transactions/                    # Transaction management
│   ├── sockets/                         # WebSocket support
│   ├── gamification/                    # Badges & challenges
│   ├── savings_goals/                   # Goals tracking
│   ├── manage.py                        # Django CLI
│   ├── requirements.txt                 # Python dependencies
│   ├── Dockerfile                       # Docker image config
│   ├── .env.example                     # Environment template
│   └── README.md                        # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/                  # Reusable React components
│   │   │   ├── ProtectedRoute.tsx       # Route protection
│   │   │   └── CursorFX.tsx             # UI effects
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx          # Authentication state
│   │   │   └── ThemeContext.tsx         # Theme configuration
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── SignIn.tsx           # Login page
│   │   │   │   └── SignUp.tsx           # Registration page
│   │   │   ├── dashboard/
│   │   │   │   ├── Overview.tsx         # Main dashboard
│   │   │   │   ├── Wallet.tsx           # Wallet management
│   │   │   │   ├── Transactions.tsx     # Transaction list
│   │   │   │   ├── Documents.tsx        # File upload
│   │   │   │   ├── SpendingInsights.tsx # Analytics
│   │   │   │   ├── GoalsTracker.tsx     # Goals management
│   │   │   │   ├── AICoach.tsx          # AI chatbot
│   │   │   │   ├── HabitChallenges.tsx  # Gamification
│   │   │   │   ├── FinancialEducation.tsx # Learning
│   │   │   │   ├── BudgetOptimizer.tsx  # Budget planning
│   │   │   │   ├── IncomeSimulator.tsx  # Scenario modeling
│   │   │   │   ├── EmergencyRisk.tsx    # Risk assessment
│   │   │   │   ├── Cards.tsx            # Card management
│   │   │   │   ├── Subscription.tsx     # Subscription management
│   │   │   │   └── Settings.tsx         # User settings
│   │   │   ├── Landing/
│   │   │   │   └── index.tsx            # Landing page
│   │   │   └── Onboarding.tsx           # Onboarding flow
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx      # Main layout
│   │   ├── lib/
│   │   │   ├── api.ts                   # API client
│   │   │   ├── calculations.ts          # Financial calculations
│   │   │   └── mockData.ts              # Mock data for testing
│   │   ├── App.tsx                      # Main app component
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global styles
│   ├── public/                          # Static assets
│   ├── package.json                     # Node dependencies
│   ├── tsconfig.json                    # TypeScript config
│   ├── vite.config.ts                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind CSS config
│   └── postcss.config.js                # PostCSS config
│
├── docker-compose.yml                   # Multi-container orchestration
├── .gitignore                           # Git ignore rules
└── README.md                            # This file
```

---

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **Python** 3.10 or higher
- **npm** 9.0 or higher (comes with Node.js)
- **pip** 21.0 or higher (comes with Python)
- **Docker** & **Docker Compose** (optional, for containerized setup)
- **PostgreSQL** or **SQLite** (database)
- **MongoDB** 5.0+ (for document storage)
- **Redis** (optional, for caching and task queuing)
- API Keys:
  - Google Gemini API key OR OpenAI API key
  - MongoDB Atlas connection string

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Logic_Legion_Finexa.git
cd Logic_Legion_Finexa
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### Run Migrations
```bash
python manage.py migrate
```

#### Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration (.env)

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=finexa_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finexa

# AI/LLM Configuration
OPENAI_API_KEY=sk-proj-your-key-here
GOOGLE_GEMINI_API_KEY=your-gemini-key-here

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Allowed Origins (CORS)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# AWS S3 (Optional, for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

### Frontend Configuration

Environment variables are handled in the API client (`src/lib/api.ts`):

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

---

## ▶️ Running the Project

### Option 1: Manual Setup (Development)

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver 8000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

### Option 2: Docker Compose (Production-Ready)

```bash
# Build and start all services
docker-compose up -d

# To stop services
docker-compose down

# View logs
docker-compose logs -f
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

---

## 📚 API Documentation

### Base URL
```
https://api.finexa.com/api/v1
```

### Authentication
All API endpoints require JWT token in headers:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - Login and get JWT token
- `POST /auth/refresh/` - Refresh JWT token
- `POST /auth/logout/` - Logout user

#### Financial Data
- `GET /finance/overview/` - Get dashboard overview with health score
- `GET /finance/transactions/` - List all transactions
- `POST /finance/transactions/` - Create new transaction
- `GET /finance/health-score/` - Get detailed health score

#### Documents
- `POST /documents/upload/` - Upload and process financial document
- `GET /documents/` - List uploaded documents
- `GET /documents/{id}/summary/` - Get document summary

#### AI Services
- `POST /ai/chat/` - Chat with AI coach
- `POST /ai/analyze/spending/` - Get spending analysis
- `GET /ai/recommendations/` - Get recommendations
- `POST /ai/extract-expenses/` - Extract expenses from document

#### Goals & Savings
- `GET /goals/` - List all goals
- `POST /goals/` - Create new goal
- `PUT /goals/{id}/progress/` - Update goal progress
- `DELETE /goals/{id}/` - Delete goal

#### Wallet
- `GET /wallet/` - Get wallet balance
- `GET /wallet/transactions/` - Get wallet transactions
- `POST /wallet/transfer/` - Transfer funds

#### User Profile
- `GET /user/profile/` - Get user profile
- `PUT /user/profile/` - Update profile
- `POST /user/settings/` - Update settings

For complete API documentation, see [API_DOCS.txt](./backend/API_DOCS.txt)

---

## 🗄️ Database Setup

### PostgreSQL
```bash
# Create database
createdb finexa_db

# Create user
createuser finexa_user -P

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE finexa_db TO finexa_user;"
```

### MongoDB
The MongoDB collections are created automatically. Key collections:

- **users** - User profiles
- **transactions** - Transaction records
- **documents** - Uploaded documents and summaries
- **expense_patterns** - Spending analysis data
- **financial_health** - Health score history
- **ai_conversations** - Chat history with AI

### Running Migrations

```bash
# Show pending migrations
python manage.py showmigrations

# Run all migrations
python manage.py migrate

# Create migration for changes
python manage.py makemigrations

# Reverse migration
python manage.py migrate <app-name> <migration-name>
```

---

## 🏗️ Project Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + TypeScript)             │
│                    Vite | Tailwind | Framer Motion             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/WebSocket (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & MIDDLEWARE                      │
│              JWT Auth | CORS | Request Validation               │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   REST API       │ │  WebSocket       │ │  Admin Panel     │
│   (Django REST)  │ │  (Channels)      │ │  (Django Admin)  │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│  PostgreSQL    │   │   MongoDB      │   │   Redis        │
│  (Relational)  │   │  (NoSQL/Docs)  │   │  (Cache/Queue) │
└────────────────┘   └────────────────┘   └────────────────┘

External Services:
├── Google Gemini API (AI/LLM)
├── OpenAI GPT-4 (Expense Extraction)
├── Celery (Async Tasks)
└── Email Service (Notifications)
```

### Data Flow

```
User Upload Document
        │
        ▼
Document Processing Service
        │
        ├─ Validate file format & size
        └─ Extract text using OCR
                  │
                  ▼
         Entity Recognition & Extraction
                  │
                  ├─ Date extraction
                  ├─ Amount extraction
                  ├─ Category classification
                  └─ Merchant identification
                  │
                  ▼
         Validation & Enrichment
                  │
                  ├─ Format validation
                  └─ Duplicate detection
                  │
                  ▼
         Store in Database
                  │
                  ├─ Save to MongoDB (documents)
                  ├─ Save to PostgreSQL (transactions)
                  └─ Update financial metrics
                  │
                  ▼
         Return Structured Response
                  │
                  └─ JSON with extracted expenses
```

---

## 💡 Features in Detail

### 1. Financial Health Score
**Calculation Formula:**
```
Health Score = (Income Stability × 20%) + (Expense Ratio × 25%) + 
               (Savings Rate × 25%) + (Debt-to-Income × 20%) + 
               (Emergency Buffer × 10%)
```

**Score Ranges:**
- 80-100: Excellent
- 60-79: Good
- 40-59: Fair
- 20-39: Poor
- 0-19: Critical

### 2. Expense Extraction
Powered by LLM (Google Gemini or OpenAI GPT-4), the system can:
- Extract expenses from bank statements (PDF/Image)
- Automatically categorize transactions
- Identify merchants and amounts
- Handle multiple date formats
- Detect and prevent duplicate entries

### 3. AI Coach
Conversational AI assistant that:
- Answers financial questions
- Provides personalized advice
- Suggests budget optimizations
- Explains financial concepts
- Tracks conversation history

### 4. Spending Analysis
Analyzes financial data to provide:
- Category-wise spending breakdown
- Trend detection (increases/decreases)
- Anomaly identification
- Benchmarking against user's own history
- Pattern-based recommendations

### 5. Goal Tracking
Users can:
- Create savings goals with targets
- Set monthly contribution amounts
- Track progress with visualizations
- Get achievement notifications
- Adjust goals dynamically

### 6. Gamification
- **Habit Challenges**: Daily/weekly financial tasks
- **Achievement Badges**: Earned for milestones
- **Streak Tracking**: Maintain positive financial behaviors
- **Points System**: Reward financial actions

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write tests for new functionality
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python
- Use TypeScript for frontend code
- Write meaningful commit messages
- Add documentation for new features

### Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm run test

# End-to-end tests (if applicable)
npm run test:e2e
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

- **Documentation**: [Backend README](./backend/README.md)
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/Logic_Legion_Finexa/issues)
- **Email**: contact@finexa.com

---

## 🙏 Acknowledgments

- Built with Django, React, and modern web technologies
- Powered by Google Gemini and OpenAI APIs
- Community contributions and feedback

---

## 📊 Project Status

- ✅ Core financial tracking functionality
- ✅ AI-powered expense extraction
- ✅ Health score calculation
- ✅ Goal tracking system
- ✅ Gamification features
- 🔄 Mobile app (In Progress)
- 🔄 Advanced analytics dashboard (In Progress)
- 🔄 Integration with banking APIs (Planned)
- 🔄 Multi-currency support enhancement (Planned)

---

<div align="center">
  <p><strong>Made with ❤️ by the Finexa Team</strong></p>
  <p>© 2026 Finexa. All rights reserved.</p>
</div>
