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

export interface VideoLesson {
    id: string; title: string; duration: string; thumbnail: string; youtubeId: string; category: string;
}

export interface EduQnA {
    id: string; question: string; answer: string;
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
    { id: 'e1', question: 'Strategic Asset Allocation', answer: "An investment strategy that aims to balance risk and reward by apportioning a portfolio's assets according to an individual's goals, risk tolerance, and investment horizon. It focuses on the long-term target weights for various asset classes like equities, fixed income, and alternatives.", category: 'Asset Management', difficulty: 'Intermediate' },
    { id: 'e2', question: 'Tax-Loss Harvesting Strategy', answer: "The practice of selling securities at a loss to offset a capital gains tax liability. This strategy is typically used to limit the recognition of short-term capital gains, which are generally taxed at a higher marginal rate than long-term capital gains.", category: 'Tax Strategy', difficulty: 'Advanced' },
    { id: 'e3', question: 'Emergency Liquidity Buffer', answer: "Establishing a high-liquidity reserve equivalent to 6-12 months of operational expenses. This buffer acts as a primary risk mitigation tool against systemic shocks or personal income disruption, ensuring solvency without liquidating long-term positions.", category: 'Risk Mitigation', difficulty: 'Beginner' },
    { id: 'e4', question: 'Modern Portfolio Theory (MPT)', answer: "A mathematical framework for assembling a portfolio of assets such that the expected return is maximized for a given level of risk. Its key tenet is that an asset's risk and return should not be assessed in isolation, but by how it contributes to the overall portfolio's risk and return.", category: 'Portfolio Theory', difficulty: 'Advanced' },
    { id: 'e5', question: 'The 50/30/20 Budgeting Framework', answer: "A streamlined methodology for capital allocation: 50% to essential obligations (needs), 30% to discretionary lifestyle (wants), and 20% to debt reduction and wealth accumulation (savings/investments).", category: 'Capital Allocation', difficulty: 'Beginner' },
    { id: 'e6', question: 'Net Worth Velocity', answer: "A metric tracking the rate at which an individual's total net worth increases over a specific period. It is influenced by the combination of active income retention, portfolio yield, and debt amortization rates.", category: 'Wealth Metrics', difficulty: 'Intermediate' },
    { id: 'e7', question: 'Mitigating Lifestyle Inflation', answer: "The strategic practice of capping discretionary spending increases as gross income rises. Advisors recommend a 50% capture rule: redirecting at least half of any income increase directly into high-yield assets or debt principal reduction.", category: 'Behavioral Finance', difficulty: 'Intermediate' },
    { id: 'e8', question: 'The Power of Capital Compounding', answer: "The mathematical process where the value of an investment increases because the earnings on an investment, both capital gains and interest, earn interest as time passes. It is the fundamental driver of long-term intergenerational wealth creation.", category: 'Foundations', difficulty: 'Beginner' },
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
    { name: 'Gym Membership', amount: 800, lastUsed: '32 days ago', status: 'leak' },
    { name: 'Magazine App', amount: 150, lastUsed: '45 days ago', status: 'leak' },
];

export const videoLessons: VideoLesson[] = [
    { id: 'v1', title: 'Institutional Macro Surveillance', duration: '5:24', thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80&fit=crop', youtubeId: 'zqUopiayC98', category: 'Executive' },
    { id: 'v2', title: 'Capital Structure & Yield Optimization', duration: '8:15', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop', youtubeId: '3XzU78P3p1M', category: 'Strategy' },
    { id: 'v3', title: 'Systemic Risk & Tail Hedging Models', duration: '6:42', thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80&fit=crop', youtubeId: '8p_O4GisWpI', category: 'Risk' },
    { id: 'v4', title: 'Alternative Alpha: Private Equity & Credit', duration: '12:05', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop', youtubeId: 'S_shX2K-Sks', category: 'Wealth' },
];

export const eduQnA: EduQnA[] = [
    { id: 'q1', question: "Optimizing Portfolio for Capital Preservation?", answer: "Strategic allocation during volatile regimes focuses on high-quality debt instruments and hedged equity positions. We recommend a core-satellite approach to maintain liquidity while capturing tactical alpha." },
    { id: 'q2', question: "Mitigating Short-Term Capital Gains Exposure?", answer: "Leveraging tax-loss harvesting and charitable trusts can significantly reduce effective tax rates. Advisors prioritize holding assets for >12 months to benefit from preferential long-term rates where applicable." },
    { id: 'q3', question: "Integrating ESG into Alpha Generation?", answer: "Environmental, Social, and Governance (ESG) factors are increasingly predictive of long-term solvency. Integrating these metrics into risk-on positions helps mitigate tail risks associated with regulatory shifts." },
];

export const advisoryQuiz = [
    {
        id: 'q1',
        question: 'Which strategy is most effective for mitigating tail risk during a liquidity crunch?',
        options: ['Long-only Equities', 'Credit Default Swaps (CDS)', 'High-Yield Bonds', 'Cryptocurrency'],
        answer: 1,
        rationale: 'Credit Default Swaps provide a hedge against credit events and default risk, making them effective for tail risk mitigation in liquidity-strained environments.'
    },
    {
        id: 'q2',
        question: 'What is the primary objective of Tactical Asset Allocation (TAA)?',
        options: ['Long-term Wealth Growth', 'Minimizing Tax Liability', 'Capitalizing on Short-term Market Inefficiencies', 'Maintaining Fixed Asset Weights'],
        answer: 2,
        rationale: 'TAA is an active management strategy that shifts asset percentages to take advantage of short-term market pricing anomalies or strong sector trends.'
    },
    {
        id: 'q3',
        question: 'In a rising interest rate environment, which fixed-income metric becomes most critical?',
        options: ['Current Yield', 'Duration', 'Credit Rating', 'Coupon Frequency'],
        answer: 1,
        rationale: 'Duration measures a bond sensitivity to interest rate changes. In a rising rate environment, lower duration is generally preferred to minimize price depreciation.'
    }
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
