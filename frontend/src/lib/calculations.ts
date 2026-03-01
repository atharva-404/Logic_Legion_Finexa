// Pure financial calculation functions

export function calculateHealthScore(params: {
    incomeStability: number;  // 0-10
    expenseRatio: number;     // expenses/income (0-1)  
    savingsRatio: number;     // savings/income (0-1)
    debtToIncome: number;     // debt payments / income (0-1)
    emergencyMonths: number;  // months of coverage
}): number {
    const { incomeStability, expenseRatio, savingsRatio, debtToIncome, emergencyMonths } = params;

    // Income stability (0-20 pts)
    const incomePts = incomeStability * 2;

    // Expense ratio (0-25 pts): lower is better
    const expensePts = expenseRatio <= 0.5 ? 25 : expenseRatio <= 0.7 ? 20 : expenseRatio <= 0.85 ? 12 : 5;

    // Savings ratio (0-25 pts): higher is better
    const savingsPts = savingsRatio >= 0.3 ? 25 : savingsRatio >= 0.2 ? 20 : savingsRatio >= 0.1 ? 13 : 5;

    // Debt-to-income (0-15 pts): lower is better
    const debtPts = debtToIncome <= 0.1 ? 15 : debtToIncome <= 0.2 ? 12 : debtToIncome <= 0.36 ? 8 : 3;

    // Emergency months (0-15 pts)
    const emergencyPts = emergencyMonths >= 6 ? 15 : emergencyMonths >= 3 ? 10 : emergencyMonths >= 1 ? 6 : 2;

    return Math.round(incomePts + expensePts + savingsPts + debtPts + emergencyPts);
}

export function calculateStressScore(params: {
    debtBurden: number;       // 0-10
    incomeInstability: number; // 0-10
    savingsInconsistency: number; // 0-10
    expenseGrowth: number;    // % monthly expense increase
}): number {
    const { debtBurden, incomeInstability, savingsInconsistency, expenseGrowth } = params;
    const raw = (debtBurden + incomeInstability + savingsInconsistency) / 3 * 10 + Math.min(expenseGrowth * 2, 10);
    return Math.min(100, Math.round(raw));
}

export function getStressLevel(score: number): { label: string; color: string; bg: string } {
    if (score <= 35) return { label: 'Low Stress', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    if (score <= 65) return { label: 'Moderate Stress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'High Stress', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

export function getHealthLabel(score: number): { label: string; color: string; ring: string } {
    if (score >= 76) return { label: 'Excellent', color: '#22c55e', ring: '#22c55e' };
    if (score >= 56) return { label: 'Good', color: '#eab308', ring: '#eab308' };
    if (score >= 36) return { label: 'Fair', color: '#f97316', ring: '#f97316' };
    return { label: 'Poor', color: '#ef4444', ring: '#ef4444' };
}

export function calculateEmergencyBuffer(monthlyExpenses: number, currentSavings: number) {
    const monthsCovered = currentSavings / monthlyExpenses;
    const idealBuffer3m = monthlyExpenses * 3;
    const idealBuffer6m = monthlyExpenses * 6;
    const gapTo3m = Math.max(0, idealBuffer3m - currentSavings);
    const gapTo6m = Math.max(0, idealBuffer6m - currentSavings);

    return {
        monthsCovered: +monthsCovered.toFixed(1),
        idealBuffer3m,
        idealBuffer6m,
        gapTo3m,
        gapTo6m,
        isSafe: monthsCovered >= 3,
        isIdeal: monthsCovered >= 6,
        suggestedMonthlyAdd: Math.ceil(gapTo3m / 6),
    };
}

export function calculateGoalFeasibility(
    targetAmount: number,
    currentAmount: number,
    monthlyContribution: number,
    deadlineStr: string
) {
    const remaining = targetAmount - currentAmount;
    const monthsLeft = Math.max(1, Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    const requiredMonthly = remaining / monthsLeft;
    const feasibility = Math.min(100, Math.round((monthlyContribution / requiredMonthly) * 100));
    const progressPct = Math.round((currentAmount / targetAmount) * 100);
    const monthsToComplete = Math.ceil(remaining / monthlyContribution);
    const delayMonths = Math.max(0, monthsToComplete - monthsLeft);

    return {
        feasibility,
        progressPct,
        requiredMonthly: Math.round(requiredMonthly),
        monthsLeft,
        monthsToComplete,
        delayMonths,
        onTrack: feasibility >= 80,
    };
}

export function simulateIncomeDropScenario(
    currentIncome: number,
    monthlyExpenses: number,
    savings: number,
    dropPercent: number
) {
    const newIncome = currentIncome * (1 - dropPercent / 100);
    const monthlyShortfall = Math.max(0, monthlyExpenses - newIncome);
    const survivalMonths = monthlyShortfall > 0 ? +(savings / monthlyShortfall).toFixed(1) : Infinity;
    const requiredCuts = monthlyShortfall > 0 ? Math.ceil(monthlyShortfall) : 0;
    const essentialExpenses = monthlyExpenses * 0.6; // 60% essential
    const cuttableExpenses = monthlyExpenses * 0.4;
    const newSavingsRate = newIncome > monthlyExpenses ? ((newIncome - monthlyExpenses) / newIncome) * 100 : 0;

    return {
        newIncome: Math.round(newIncome),
        monthlyShortfall,
        survivalMonths: isFinite(survivalMonths) ? survivalMonths : 99,
        requiredCuts,
        essentialExpenses: Math.round(essentialExpenses),
        cuttableExpenses: Math.round(cuttableExpenses),
        newSavingsRate: +newSavingsRate.toFixed(1),
        isCritical: survivalMonths < 3,
    };
}

export function detectSpendingPersonality(expenses: { name: string; amount: number; budget: number }[]): {
    type: string;
    description: string;
    color: string;
    icon: string;
} {
    const overBudgetCount = expenses.filter(e => e.amount > e.budget).length;
    const totalBudget = expenses.reduce((s, e) => s + e.budget, 0);
    const totalActual = expenses.reduce((s, e) => s + e.amount, 0);
    const overspendRatio = totalActual / totalBudget;

    if (overBudgetCount >= 3 && overspendRatio > 1.2) {
        return { type: 'Impulse Spender', description: 'You often exceed budgets on non-essentials. Small wins: pause before purchases.', color: '#ef4444', icon: '⚡' };
    }
    if (overspendRatio <= 0.85) {
        return { type: 'Conservative Saver', description: 'You consistently spend well under budget. Keep building that savings buffer!', color: '#10b981', icon: '🛡️' };
    }
    if (overBudgetCount <= 1 && overspendRatio <= 1.05) {
        return { type: 'Balanced Planner', description: 'You have great spending discipline with minor deviations. Almost perfect!', color: '#a855f7', icon: '⚖️' };
    }
    return { type: 'Lifestyle Spender', description: 'You prioritize experiences and comfort. Focus on needs vs. wants distinction.', color: '#f59e0b', icon: '✨' };
}

export function formatCurrency(amount: number, currency = '₹'): string {
    if (amount >= 100000) return `${currency}${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${currency}${(amount / 1000).toFixed(1)}k`;
    return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function formatFullCurrency(amount: number, currency = '₹'): string {
    return `${currency}${amount.toLocaleString('en-IN')}`;
}
