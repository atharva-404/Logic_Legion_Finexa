import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowUpRight, Loader2, Activity, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getHealthLabel, getStressLevel, calculateEmergencyBuffer, formatCurrency } from '../../lib/calculations';
import { Link } from 'react-router-dom';
import { HealthAPI, TransactionsAPI, AIAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface MonthlyData {
    month: string;
    healthScore: number;
    income: number;
    expenses: number;
    savings: number;
    stressScore: number;
}

// Clamp a number between min and max
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
    const { color } = getHealthLabel(score);
    const r = size * 0.4;
    const circ = 2 * Math.PI * r;
    const dash = circ * 0.75;
    const offset = dash - (score / 100) * dash;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth={size * 0.07} strokeLinecap="round" />
            <motion.path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinecap="round"
                strokeDasharray={dash} initial={{ strokeDashoffset: dash }}
                animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
            <text x={cx} y={cy - 10} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="white">{score}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.08} fill={color} fontWeight="600">{getHealthLabel(score).label.toUpperCase()}</text>
        </svg>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs">
            <p className="text-slate-400 mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-300 capitalize">{p.name}:</span>
                    <span className="text-white font-medium">{formatCurrency(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function Overview() {
    const { user } = useAuth();
    const aiCredits = user?.ai_credits ?? 0;
    // ─── State for all sections ──────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [healthScore, setHealthScore] = useState(0);
    const [healthGrade, setHealthGrade] = useState('');
    const [scoreTrend, setScoreTrend] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [emergencySavings, setEmergencySavings] = useState(0);
    const [scoreHistory, setScoreHistory] = useState<MonthlyData[]>([]);
    const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
    const [stressScore, setStressScore] = useState(50);
    const [aiAnalysis, setAiAnalysis] = useState<{ patterns: string[]; anomalies: string[]; recommendations: { title: string; description: string; potential_savings: string }[] } | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    function loadAIAnalysis(refresh = false) {
        setAiLoading(true);
        AIAPI.getSpendingAnalysis(refresh)
            .then(data => { if (data && !data.error) setAiAnalysis(data); })
            .catch(err => console.error('AI analysis failed:', err))
            .finally(() => setAiLoading(false));
    }

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // ── 1. Financial Health Score ──
                const scoreData: any = await HealthAPI.getScore().catch(() => null);
                if (scoreData) {
                    const rawScore = clamp(scoreData.score || 0, 0, 100);
                    setHealthScore(rawScore);
                    setHealthGrade(scoreData.category || scoreData.grade || '');
                    // Compute stress from score: higher score = lower stress
                    setStressScore(clamp(100 - rawScore, 0, 100));
                }

                // ── 2. Score History (for chart) ──
                // We merge backend health scores with transaction data for charts
                const historyData: any = await HealthAPI.getHistory('month').catch(() => null);
                const parseHistory = (histArr: any[]) => {
                    if (histArr.length === 0) return;
                    setScoreHistory(histArr.map((h: any) => {
                        return {
                            month: h.month ? new Date(h.month).toLocaleDateString('en-US', { month: 'short' }) : '',
                            healthScore: clamp(h.score || 0, 0, 100),
                            income: 0,
                            expenses: 0,
                            savings: 0,
                            stressScore: clamp(100 - (h.score || 50), 0, 100),
                        };
                    }));
                    if (histArr.length >= 2) {
                        const latest = clamp(histArr[histArr.length - 1].score, 0, 100);
                        const previous = clamp(histArr[histArr.length - 2].score, 0, 100);
                        setScoreTrend(latest - previous);
                    }
                };
                if (historyData && Array.isArray(historyData) && historyData.length > 0) {
                    parseHistory(historyData);
                } else if (historyData && historyData.history && historyData.history.length > 0) {
                    parseHistory(historyData.history);
                    if (historyData.change !== undefined) setScoreTrend(historyData.change);
                }

                // ── 3. Transactions Summary → Income/Expenses + Spending by Category ──
                const summary = await TransactionsAPI.summary().catch(() => null);
                if (summary) {
                    // Use profile income (from onboarding) or transaction income, whichever is higher
                    const income = summary.total_income || user?.income || 0;
                    if (income > 0) setMonthlyIncome(income);
                    if (summary.total_expense > 0) setMonthlyExpenses(summary.total_expense);

                    const COLORS: Record<string, string> = {
                        'rent': '#a855f7', 'housing': '#a855f7',
                        'food': '#3b82f6', 'Food & Dining': '#3b82f6', 'Food': '#3b82f6',
                        'transport': '#06b6d4', 'Transport': '#06b6d4',
                        'entertainment': '#f59e0b', 'Entertainment': '#f59e0b',
                        'shopping': '#ec4899', 'Shopping': '#ec4899',
                        'healthcare': '#10b981', 'Health': '#10b981',
                        'utilities': '#8b5cf6', 'Utilities': '#8b5cf6',
                        'education': '#f97316', 'Education': '#f97316',
                        'insurance': '#14b8a6', 'Insurance': '#14b8a6',
                        'Subscriptions': '#ef4444',
                    };

                    const mapped = summary.categories.map((c: any) => ({
                        name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
                        amount: c.amount,
                        budget: Math.round(c.amount * 1.15),
                        color: COLORS[c.name] || COLORS[c.name.toLowerCase()] || '#a855f7',
                        icon: c.name.toLowerCase().split(' ')[0],
                    }));
                    if (mapped.length > 0) setSpendingByCategory(mapped);
                } else if (user?.income) {
                    // Fallback: at least show the profile income
                    setMonthlyIncome(user.income);
                }

                // Also fetch transactions for chart data (income vs expenses by month)
                const txnData = await TransactionsAPI.list(1).catch(() => null);
                if (txnData && txnData.results && txnData.results.length > 0) {
                    const monthMap: Record<string, { income: number; expenses: number }> = {};
                    txnData.results.forEach((t: any) => {
                        const d = new Date(t.date ?? t.created_at);
                        const key = d.toLocaleDateString('en-US', { month: 'short' });
                        if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
                        const amt = +t.amount;
                        if (t.type === 'income') monthMap[key].income += amt;
                        else monthMap[key].expenses += amt;
                    });

                    setScoreHistory(prev => {
                        if (prev.length > 0) {
                            return prev.map(h => {
                                const m = monthMap[h.month];
                                return { ...h, income: m?.income || 0, expenses: m?.expenses || 0 };
                            });
                        }
                        return Object.entries(monthMap).map(([month, data]) => ({
                            month, healthScore: 0, income: data.income, expenses: data.expenses, savings: data.income - data.expenses, stressScore: 0,
                        }));
                    });
                }

                // ── 5. Score Breakdown → can compute stress from factors ──
                const breakdown = await HealthAPI.getBreakdown().catch(() => null);
                if (breakdown && breakdown.overall_score) {
                    setHealthScore(clamp(breakdown.overall_score, 0, 100));
                    const factors = breakdown.factors || [];
                    if (factors.length > 0) {
                        const avgFactor = factors.reduce((s: number, f: any) => s + (f.percentage || 0), 0) / factors.length;
                        setStressScore(clamp(Math.round(100 - avgFactor), 0, 100));
                    }
                }
                // ── 6. AI Spending Analysis ──
                loadAIAnalysis();

            } catch (err) {
                console.error('Overview fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((savings / monthlyIncome) * 100).toFixed(1) : '0.0';
    const { label: stressLabel, color: stressColor } = getStressLevel(stressScore);
    const emergency = calculateEmergencyBuffer(monthlyExpenses, emergencySavings);
    const overBudget = spendingByCategory.filter(e => e.amount > e.budget);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={32} className="text-purple-400" />
                </motion.div>
                <span className="ml-3 text-slate-400">Loading your financial data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl text-white">Financial Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Your financial snapshot
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}
                        className="text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-2"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        AI Balance: {aiCredits.toLocaleString()}
                    </motion.div>
                    {scoreTrend !== 0 && (
                        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}
                            className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{
                                background: scoreTrend > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                border: `1px solid ${scoreTrend > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                color: scoreTrend > 0 ? '#10b981' : '#ef4444',
                            }}>
                            {scoreTrend > 0 ? '↑' : '↓'} Score {scoreTrend > 0 ? 'improved' : 'dropped'} {scoreTrend > 0 ? '+' : ''}{scoreTrend} this month
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Top row: Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Health Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="glass-card p-5 sm:col-span-2 lg:col-span-1 flex flex-col items-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Health Score</p>
                    <ScoreGauge score={healthScore} size={140} />
                    <div className="mt-2 text-center">
                        {scoreTrend !== 0 ? (
                            <p className={`text-xs font-medium ${scoreTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {scoreTrend > 0 ? '↑' : '↓'} {scoreTrend > 0 ? '+' : ''}{scoreTrend} from last month
                            </p>
                        ) : (
                            <p className="text-slate-500 text-xs">{healthGrade || getHealthLabel(healthScore).label}</p>
                        )}
                    </div>
                </motion.div>

                {/* Stress Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <p className="text-slate-400 text-xs uppercase tracking-widest">Stress Level</p>
                        <AlertTriangle size={16} style={{ color: stressColor }} />
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white my-2">{stressScore}</div>
                        <div className="text-sm font-semibold mb-2" style={{ color: stressColor }}>{stressLabel}</div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                animate={{ width: `${stressScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                                style={{ background: stressColor }} />
                        </div>
                    </div>
                </motion.div>

                {/* Monthly Savings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <p className="text-slate-400 text-xs uppercase tracking-widest">Monthly Savings</p>
                        <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white my-2">{formatCurrency(savings)}</div>
                        <div className="text-green-400 text-sm font-semibold">{savingsRate}% of income</div>
                        <p className="text-slate-500 text-xs mt-1">
                            {+savingsRate >= 20 ? 'Excellent! Target is 20%' : `Target: 20% (need ${formatCurrency(monthlyIncome * 0.2 - savings)} more)`}
                        </p>
                    </div>
                </motion.div>

                {/* Emergency Buffer */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <p className="text-slate-400 text-xs uppercase tracking-widest">Emergency Buffer</p>
                        <DollarSign size={16} className="text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white my-2">{emergency.monthsCovered}mo</div>
                        <div className="text-yellow-400 text-sm font-semibold">
                            {emergency.isSafe ? 'On Track' : 'Below Target'}
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                            Target: 3–6 months of expenses
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Monthly Income', value: formatCurrency(monthlyIncome), icon: TrendingUp, color: '#10b981' },
                    { label: 'Monthly Expenses', value: formatCurrency(monthlyExpenses), icon: TrendingDown, color: '#ef4444' },
                    { label: 'Net Savings', value: formatCurrency(monthlyIncome - monthlyExpenses), icon: DollarSign, color: '#a855f7' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}
                        className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={14} style={{ color: stat.color }} />
                            <span className="text-slate-500 text-xs">{stat.label}</span>
                        </div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Score trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Health Score Trend</h3>
                        <span className="text-xs text-slate-500">Monthly trend</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={scoreHistory}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="healthScore" stroke="#a855f7" fill="url(#scoreGrad)" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Income vs Expenses (from real transactions) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Income vs Expenses</h3>
                        <span className="text-xs text-slate-500">By month</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={scoreHistory}>
                            <defs>
                                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Overspend alerts — from real transaction data */}
            {overBudget.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-400" /> Budget Alerts
                        </h3>
                        <Link to="/dashboard/spending" className="text-purple-400 text-xs hover:text-purple-300 flex items-center gap-1">
                            View All <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {overBudget.slice(0, 3).map(cat => (
                            <div key={cat.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{cat.icon}</span>
                                    <div>
                                        <p className="text-sm text-white font-medium">{cat.name}</p>
                                        <p className="text-xs text-red-400">₹{(cat.amount - cat.budget).toLocaleString()} over budget</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white">{formatCurrency(cat.amount)}</p>
                                    <p className="text-xs text-slate-500">Budget: {formatCurrency(cat.budget)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AI Spending Insights */}
            <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">AI Spending Insights</h2>
                <button onClick={() => loadAIAnalysis(true)} disabled={aiLoading}
                    className="btn-aqua text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Analyzing...' : 'Refresh'}
                </button>
            </div>

            {aiLoading && !aiAnalysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center">
                    <Loader2 size={22} className="animate-spin text-purple-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">AI is analyzing your spending patterns...</p>
                </motion.div>
            )}

            {aiAnalysis && (
                <>
                    {/* AI Patterns */}
                    {aiAnalysis.patterns?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className="glass-card p-5">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Activity size={16} className="text-purple-400" /> AI-Detected Patterns
                            </h3>
                            <div className="space-y-2">
                                {aiAnalysis.patterns.map((p, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                        <BarChart3 size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-300">{p}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Anomalies */}
                    {aiAnalysis.anomalies?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                            className="glass-card p-5">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-yellow-400" /> Spending Anomalies
                            </h3>
                            <div className="space-y-2">
                                {aiAnalysis.anomalies.map((a, i) => (
                                    <div key={i} className="p-3 rounded-xl flex items-start gap-3"
                                        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                        <TrendingUp size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-300">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Recommendations */}
                    {aiAnalysis.recommendations?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                            className="glass-card p-5">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Lightbulb size={16} className="text-green-400" /> AI Recommendations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {aiAnalysis.recommendations.map((r, i) => (
                                    <div key={i} className="p-4 rounded-xl"
                                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                        <p className="text-sm text-white font-medium mb-1">{r.title}</p>
                                        <p className="text-xs text-slate-400 mb-2">{r.description}</p>
                                        {r.potential_savings && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                                                Potential savings: {r.potential_savings}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
