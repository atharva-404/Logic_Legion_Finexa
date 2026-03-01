// Mock Financial Data Layer — emoji-free, icon names only

export interface User {
    id: string; name: string; email: string; avatar?: string;
    createdAt: string; monthlyIncome: number; currency: string;
}

export interface ExpenseCategory {
    name: string; amount: number; budget: number; color: string; icon: string;
}

export interface MonthlyData {
    month: string; income: number; expenses: number;
    savings: number; healthScore: number; stressScore: number;
}

export interface Goal {
    id: string; name: string; targetAmount: number; currentAmount: number;
    deadline: string; monthlyTarget: number; priority: 'high' | 'medium' | 'low';
    color: string; icon: string;
}

export interface HabitChallenge {
    id: string; title: string; description: string;
    points: number; completed: boolean; streak: number;
    category: string; icon: string;
}

export interface ChatMessage {
    id: string; role: 'user' | 'assistant'; content: string; timestamp: string;
}

export const DEMO_USER: User = {
    id: 'usr_01', name: 'Arjun Sharma', email: 'arjun@example.com',
    createdAt: '2024-01-15', monthlyIncome: 85000, currency: 'INR',
};

export const monthlyHistory: MonthlyData[] = [
    { month: 'Sep', income: 82000, expenses: 61000, savings: 21000, healthScore: 58, stressScore: 62 },
    { month: 'Oct', income: 82000, expenses: 58000, savings: 24000, healthScore: 62, stressScore: 58 },
    { month: 'Nov', income: 82000, expenses: 63000, savings: 19000, healthScore: 55, stressScore: 68 },
    { month: 'Dec', income: 85000, expenses: 71000, savings: 14000, healthScore: 48, stressScore: 74 },
    { month: 'Jan', income: 85000, expenses: 59000, savings: 26000, healthScore: 66, stressScore: 52 },
    { month: 'Feb', income: 85000, expenses: 54500, savings: 30500, healthScore: 74, stressScore: 42 },
];

export const currentExpenses: ExpenseCategory[] = [
    { name: 'Housing', amount: 18000, budget: 20000, color: '#a855f7', icon: 'home' },
    { name: 'Food & Dining', amount: 12400, budget: 10000, color: '#3b82f6', icon: 'utensils' },
    { name: 'Transport', amount: 5200, budget: 6000, color: '#06b6d4', icon: 'car' },
    { name: 'Entertainment', amount: 4800, budget: 3000, color: '#f59e0b', icon: 'film' },
    { name: 'Shopping', amount: 6900, budget: 5000, color: '#ec4899', icon: 'shopping-bag' },
    { name: 'Health', amount: 3100, budget: 4000, color: '#10b981', icon: 'heart' },
    { name: 'Subscriptions', amount: 2400, budget: 1500, color: '#ef4444', icon: 'smartphone' },
    { name: 'Utilities', amount: 1700, budget: 2000, color: '#8b5cf6', icon: 'zap' },
];

export const defaultGoals: Goal[] = [
    { id: 'g1', name: 'Emergency Fund', targetAmount: 255000, currentAmount: 120000, deadline: '2025-12-31', monthlyTarget: 15000, priority: 'high', color: '#10b981', icon: 'shield' },
    { id: 'g2', name: 'New Laptop', targetAmount: 90000, currentAmount: 45000, deadline: '2025-06-30', monthlyTarget: 9000, priority: 'medium', color: '#3b82f6', icon: 'laptop' },
    { id: 'g3', name: 'Vacation Fund', targetAmount: 60000, currentAmount: 18000, deadline: '2025-10-01', monthlyTarget: 5000, priority: 'low', color: '#f59e0b', icon: 'plane' },
];

export const defaultHabits: HabitChallenge[] = [
    { id: 'h1', title: 'Track Every Expense', description: 'Log all spending for 7 consecutive days', points: 100, completed: true, streak: 5, category: 'Tracking', icon: 'bar-chart' },
    { id: 'h2', title: 'No-Spend Sunday', description: 'Avoid all discretionary spending today', points: 50, completed: false, streak: 2, category: 'Savings', icon: 'target' },
    { id: 'h3', title: 'Save Extra This Week', description: 'Transfer extra to savings this week', points: 75, completed: false, streak: 0, category: 'Savings', icon: 'piggy-bank' },
    { id: 'h4', title: 'Cancel One Subscription', description: 'Review and cancel an unused subscription', points: 150, completed: false, streak: 0, category: 'Optimization', icon: 'scissors' },
    { id: 'h5', title: 'Cook 5 Meals at Home', description: 'Eat home-cooked meals 5 times this week', points: 80, completed: true, streak: 3, category: 'Savings', icon: 'chef-hat' },
    { id: 'h6', title: 'Weekly Budget Review', description: 'Spend 15 min reviewing your budget', points: 60, completed: false, streak: 1, category: 'Planning', icon: 'clipboard' },
];

export const educationCards = [
    { id: 'e1', question: 'What is an Emergency Fund?', answer: "An emergency fund is 3–6 months of living expenses set aside in a liquid account. It's your financial safety net for unexpected events like job loss or medical emergencies. Think of it as your personal insurance policy.", category: 'Foundations', difficulty: 'Beginner' },
    { id: 'e2', question: 'What is Debt-to-Income Ratio?', answer: "DTI ratio = (Total Monthly Debt Payments / Gross Monthly Income) x 100. A DTI below 36% is generally considered healthy. If yours is above 43%, focus on paying down debt before taking on new obligations.", category: 'Debt', difficulty: 'Intermediate' },
    { id: 'e3', question: 'How to Control Impulse Spending?', answer: "Use the 24-hour rule: wait a full day before any unplanned purchase over Rs 500. Also try the 'cost per use' method — if an item costs Rs 3,000 and you'll use it 3 times, it costs Rs 1,000 per use. Often that realization kills the urge.", category: 'Behavior', difficulty: 'Beginner' },
    { id: 'e4', question: 'Why Does Budgeting Matter?', answer: 'Budgeting is telling your money where to go instead of wondering where it went. People with a written budget save on average 18% more per month than those without one. Even a rough budget beats no budget.', category: 'Planning', difficulty: 'Beginner' },
    { id: 'e5', question: 'What is the 50/30/20 Rule?', answer: '50% of take-home pay goes to Needs (rent, food, utilities). 30% goes to Wants (dining, entertainment). 20% goes to Savings and Debt. This rule gives you a simple framework to start budgeting without complex spreadsheets.', category: 'Planning', difficulty: 'Beginner' },
    { id: 'e6', question: 'What is a Savings Rate?', answer: 'Savings rate = (Amount Saved / Gross Income) x 100. Saving 20% is considered excellent; 10-15% is good; under 5% is concerning. Even saving 1% more each month compounds into significant wealth over time.', category: 'Savings', difficulty: 'Beginner' },
    { id: 'e7', question: 'What is Lifestyle Creep?', answer: 'Lifestyle creep is when your spending rises as your income rises — you earn more but save the same amount. To avoid it, commit to saving 50% of every raise before adjusting your lifestyle.', category: 'Behavior', difficulty: 'Intermediate' },
    { id: 'e8', question: 'How Does Compounding Work?', answer: 'Compounding means earning returns on your returns. Rs 10,000 saved at 8% per year becomes Rs 21,589 in 10 years, Rs 46,610 in 20 years, and Rs 1,00,627 in 30 years — without adding a single rupee. Time is the most powerful ingredient.', category: 'Foundations', difficulty: 'Intermediate' },
];

export const aiResponses: Record<string, string> = {
    default: "I'm your Finexa AI Coach. I can help you with your financial health score, budgeting strategies, savings goals, and general financial education. What would you like to explore today?",
    budget: "Based on your income of Rs 85,000, the 50/30/20 rule suggests: Rs 42,500 for needs, Rs 25,500 for wants, and Rs 17,000 for savings. You're currently saving Rs 30,500 — that's 35.9% of income, which is excellent! Your main overspend areas are Food & Dining and Entertainment.",
    score: "Your Financial Health Score of 74/100 is in the 'Good' range. It's calculated from: Income Stability (9/10), Expense Ratio (7/10), Savings Rate (8/10), Debt-to-Income (8/10), and Emergency Buffer (5/10). Your emergency fund is the key area to improve.",
    emergency: "You have approximately 2.2 months of emergency coverage. Financial experts recommend 3–6 months. To reach the 3-month target of Rs 163,500, you need Rs 43,500 more. At your current savings rate, that's about 1.5 months away — very close!",
    stress: "Your financial stress score of 42 indicates Low Stress — great news! The main contributors are your strong savings rate and stable income. The minor stressors are your slight Food and Entertainment overspending. Simple meal planning could save you Rs 2,400–3,000 monthly.",
    habit: "Building financial habits is all about small, consistent actions. Your current streak of 5 days tracking expenses is fantastic! Research shows it takes 21 days to form a habit. Keep going — you're almost halfway to making this automatic.",
    eli15: "Imagine your money is like a pizza. The 50/30/20 rule says: use half (50%) only for important stuff like where you live and food. Use 30% for fun things like games and movies. And save 20% — put it in a savings account for emergencies or future dreams. Simple!",
    invest: "I'm not able to give investment advice — that requires a licensed financial advisor. What I can help with is understanding your spending patterns, building an emergency fund, and reaching your savings goals.",
    savings: "The fastest way to increase savings is to automate them. Set up an auto-transfer on your salary day before you can spend it. Even Rs 5,000/month growing at 7% for 10 years becomes Rs 8.7 lakh. Start small if needed — consistency beats amount.",
};

export const subscriptions = [
    { name: 'Netflix', amount: 649, lastUsed: '2 days ago', status: 'active' },
    { name: 'Spotify', amount: 119, lastUsed: '1 day ago', status: 'active' },
    { name: 'Amazon Prime', amount: 299, lastUsed: '5 days ago', status: 'active' },
    { name: 'Hotstar', amount: 499, lastUsed: '18 days ago', status: 'warning' },
];

export interface Transaction {
    id: string;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    status: 'completed' | 'pending';
}

export const mockTransactions: Transaction[] = [
    { id: 't1', merchant: 'Zepto Grocery', amount: -642, category: 'Food', date: '2026-02-28', status: 'completed' },
    { id: 't2', merchant: 'Monthly Salary', amount: 85000, category: 'Salary', date: '2026-02-28', status: 'completed' },
    { id: 't3', merchant: 'Airtel Postpaid', amount: -999, category: 'Utilities', date: '2026-02-27', status: 'completed' },
    { id: 't4', merchant: 'Uber India', amount: -342, category: 'Transport', date: '2026-02-26', status: 'completed' },
    { id: 't5', merchant: 'Netflix India', amount: -649, category: 'Entertainment', date: '2026-02-25', status: 'completed' },
    { id: 't6', merchant: 'HDFC Home Rent', amount: -18000, category: 'Rent', date: '2026-02-05', status: 'completed' },
    { id: 't7', merchant: 'Starbucks Coffee', amount: -450, category: 'Food', date: '2026-02-24', status: 'completed' },
    { id: 't8', merchant: 'Amazon Shopping', amount: -2499, category: 'Shopping', date: '2026-02-22', status: 'completed' },
    { id: 't9', merchant: 'Zomato Limited', amount: -820, category: 'Food', date: '2026-02-20', status: 'completed' },
    { id: 't10', merchant: 'Petrol Pump', amount: -2500, category: 'Transport', date: '2026-02-18', status: 'completed' },
];

export const secondarySubscriptions = [
    { name: 'Gym Membership', amount: 800, lastUsed: '32 days ago', status: 'leak' },
    { name: 'Magazine App', amount: 150, lastUsed: '45 days ago', status: 'leak' },
];

export const spendingAnomalies = [
    { category: 'Food & Dining', message: 'Rs 2,400 above monthly average', severity: 'high', amount: 2400 },
    { category: 'Entertainment', message: 'Rs 1,800 above budget limit', severity: 'medium', amount: 1800 },
    { category: 'Shopping', message: 'Rs 1,900 unusual spike this week', severity: 'medium', amount: 1900 },
];

export const badges = [
    { id: 'b1', name: 'First Budget', description: 'Created your first budget', earned: true, icon: 'target', rarity: 'common' },
    { id: 'b2', name: 'Saver Starter', description: 'Saved for 7 consecutive days', earned: true, icon: 'trending-up', rarity: 'common' },
    { id: 'b3', name: 'Streak Master', description: '30-day tracking streak', earned: false, icon: 'flame', rarity: 'rare' },
    { id: 'b4', name: 'Debt Slayer', description: 'Reduced DTI below 20%', earned: false, icon: 'shield', rarity: 'epic' },
    { id: 'b5', name: 'Emergency Ready', description: 'Fully funded emergency buffer', earned: false, icon: 'lock', rarity: 'rare' },
    { id: 'b6', name: 'Budget Ninja', description: 'Stayed under budget for 3 months', earned: true, icon: 'star', rarity: 'uncommon' },
];

export const videoLessons = [
    { id: 'v1', title: 'Building a Bullet-Proof Emergency Fund', category: 'Risk', duration: '12:34', thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80', youtubeId: 'gyMwXuJrbJQ' },
    { id: 'v2', title: 'Tax-Loss Harvesting: Advanced Strategies', category: 'Tax', duration: '18:07', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', youtubeId: 'p7HKvqRI_Bo' },
    { id: 'v3', title: 'Portfolio Rebalancing for Maximum Alpha', category: 'Portfolio', duration: '22:15', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', youtubeId: 'PHe0bXAIuk0' },
    { id: 'v4', title: 'Understanding Market Cycles & Regime Shifts', category: 'Markets', duration: '15:42', thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&q=80', youtubeId: 'Xn7KWR9EOGQ' },
    { id: 'v5', title: 'Debt Structuring for High Net Worth', category: 'Debt', duration: '20:10', thumbnail: 'https://images.unsplash.com/photo-1518458028785-8f86f55966c8?w=400&q=80', youtubeId: 'WEDIj9JBTC8' },
];

export const advisoryQuiz = [
    {
        question: 'What is the primary purpose of asset allocation in wealth management?',
        options: ['Maximising short-term returns', 'Reducing systemic risk through diversification', 'Eliminating all portfolio volatility', 'Timing the market effectively'],
        answer: 1,
        rationale: 'Asset allocation distributes investments across asset classes to manage risk-return trade-offs, not to eliminate volatility or time the market.',
    },
    {
        question: 'A client with a DTI ratio of 48% should prioritise which action?',
        options: ['Increasing equity exposure', 'Accelerating high-interest debt repayment', 'Opening new credit lines', 'Investing in illiquid alternatives'],
        answer: 1,
        rationale: 'A DTI above 43% is considered stressed. Reducing debt load improves financial health before adding investment risk.',
    },
    {
        question: 'Which metric best measures portfolio efficiency on a risk-adjusted basis?',
        options: ['Absolute return (CAGR)', 'Sharpe Ratio', 'Maximum drawdown', 'Dividend yield'],
        answer: 1,
        rationale: 'The Sharpe Ratio measures excess return per unit of risk (standard deviation), making it the gold standard for risk-adjusted performance.',
    },
    {
        question: 'In Modern Portfolio Theory, the Efficient Frontier represents:',
        options: ['The set of portfolios with minimum risk only', 'Optimal portfolios offering maximum return for each risk level', 'Only equity-heavy allocations', 'Government bond yield curves'],
        answer: 1,
        rationale: 'The Efficient Frontier plots portfolios that deliver the highest expected return for a given level of risk — a cornerstone of MPT.',
    },
    {
        question: 'What is the recommended emergency buffer for a high-income professional?',
        options: ['1 month of expenses', '3–6 months of expenses', '12+ months of expenses', 'No buffer if insured'],
        answer: 1,
        rationale: 'Financial advisors recommend 3–6 months of living expenses in liquid instruments. Higher earners may trend toward 6 months due to longer job-search cycles.',
    },
];
