import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowUpRight, Loader2, Activity, BarChart3, Lightbulb, RefreshCw, ShieldCheck, Zap, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getHealthLabel, getStressLevel, calculateEmergencyBuffer, formatCurrency } from '../../lib/calculations';
import { Link } from 'react-router-dom';
import { HealthAPI, TransactionsAPI, AIAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

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

function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
    const { color } = getHealthLabel(score);
    const { isDark } = useTheme();
    const r = size * 0.38;
    const circ = 2 * Math.PI * r;
    const dash = circ * 0.75;
    const offset = dash - (score / 100) * dash;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                fill="none" stroke={isDark ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.12)'} strokeWidth={size * 0.06} strokeLinecap="round" />
            <motion.path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                fill="none" stroke={color} strokeWidth={size * 0.06} strokeLinecap="round" filter="url(#glow)"
                strokeDasharray={dash} initial={{ strokeDashoffset: dash }}
                animate={{ strokeDashoffset: offset }} transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }} />
            <text x={cx} y={cy - 12} textAnchor="middle" fontSize={size * 0.24} fontWeight="800" fill={isDark ? 'white' : '#0f172a'} fontFamily="'Inter', sans-serif">{score}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.075} fill={color} fontWeight="700" letterSpacing="0.15em">{getHealthLabel(score).label.toUpperCase()}</text>
        </svg>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card-glow p-3 text-xs backdrop-blur-xl" style={{ background: 'rgba(10,10,26,0.9)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <p className="text-slate-400 mb-2 font-bold text-[10px] uppercase tracking-widest">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2 py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                    <span className="text-slate-400 capitalize text-[10px]">{p.name}:</span>
                    <span className="text-white font-bold text-[11px]">{formatCurrency(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function Overview() {
    const { user } = useAuth();
    const { isDark } = useTheme();
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
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={36} className="text-purple-400" />
                </motion.div>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analyzing your financial data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Institutional Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-8 transition-all duration-300 ${isDark ? 'border-purple-500/10' : 'border-black/5'}`}>
                <div className="space-y-2">
                    <div className={`flex items-center gap-2 mb-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Live Portfolio Analytics</span>
                    </div>
                    <h1 className={`font-display font-bold text-3xl lg:text-4xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Financial <span className="text-gradient">Overview</span>
                    </h1>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Real-time financial intelligence
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex items-center gap-3 flex-wrap">
                    <div className={`px-4 py-2 backdrop-blur-md border rounded-2xl flex items-center gap-2.5 transition-all duration-300 ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-black/[0.02] border-black/5'}`}>
                        <Zap size={14} className="text-purple-400" />
                        <span className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AI: {aiCredits.toLocaleString()}</span>
                    </div>
                    {scoreTrend !== 0 && (
                        <div className={`px-4 py-2 border rounded-2xl flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase transition-all duration-300`}
                            style={{
                                background: scoreTrend > 0 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                                border: `1px solid ${scoreTrend > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                                color: scoreTrend > 0 ? '#22c55e' : '#ef4444',
                            }}>
                            {scoreTrend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {scoreTrend > 0 ? '+' : ''}{scoreTrend} this month
                        </div>
                    )}
                </div>
            </div>

            {/* Top row: Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Health Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className={`card-glow p-6 sm:col-span-2 lg:col-span-1 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />
                    <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Health Score</p>
                    <ScoreGauge score={healthScore} size={160} />
                    <div className="mt-3 text-center">
                        {scoreTrend !== 0 ? (
                            <p className={`text-[11px] font-bold ${scoreTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {scoreTrend > 0 ? '↑' : '↓'} {scoreTrend > 0 ? '+' : ''}{scoreTrend} from last month
                            </p>
                        ) : (
                            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{healthGrade || getHealthLabel(healthScore).label}</p>
                        )}
                    </div>
                </motion.div>

                {/* Stress Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`card-glow p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-start justify-between">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Stress Level</p>
                        <div className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                            <AlertTriangle size={14} style={{ color: stressColor }} />
                        </div>
                    </div>
                    <div>
                        <div className={`text-4xl font-bold my-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stressScore}</div>
                        <div className="text-[11px] font-bold mb-3 uppercase tracking-widest" style={{ color: stressColor }}>{stressLabel}</div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                            <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                animate={{ width: `${stressScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                                style={{ background: stressColor, boxShadow: `0 0 10px ${stressColor}40` }} />
                        </div>
                    </div>
                </motion.div>

                {/* Monthly Savings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`card-glow p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-start justify-between">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Monthly Savings</p>
                        <div className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-500/5 border-green-500/10'}`}>
                            <TrendingUp size={14} className="text-green-400" />
                        </div>
                    </div>
                    <div>
                        <div className={`text-3xl font-bold my-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(savings)}</div>
                        <div className="text-green-400 text-[11px] font-bold uppercase tracking-widest">{savingsRate}% of income</div>
                        <p className={`text-[10px] mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {+savingsRate >= 20 ? 'Excellent — exceeds 20% target' : `Target: 20% (need ${formatCurrency(monthlyIncome * 0.2 - savings)} more)`}
                        </p>
                    </div>
                </motion.div>

                {/* Emergency Buffer */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={`card-glow p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-start justify-between">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Emergency Buffer</p>
                        <div className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-500/5 border-yellow-500/10'}`}>
                            <ShieldCheck size={14} className="text-yellow-400" />
                        </div>
                    </div>
                    <div>
                        <div className={`text-3xl font-bold my-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{emergency.monthsCovered}<span className="text-lg ml-1">mo</span></div>
                        <div className={`text-[11px] font-bold uppercase tracking-widest ${emergency.isSafe ? 'text-green-400' : 'text-yellow-400'}`}>
                            {emergency.isSafe ? 'On Track' : 'Below Target'}
                        </div>
                        <p className={`text-[10px] mt-2 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Target: 3–6 months of expenses
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Monthly Income', value: formatCurrency(monthlyIncome), icon: TrendingUp, color: '#22c55e', bg: isDark ? 'bg-green-500/5' : 'bg-green-500/[0.03]', border: isDark ? 'border-green-500/10' : 'border-green-500/10' },
                    { label: 'Monthly Expenses', value: formatCurrency(monthlyExpenses), icon: TrendingDown, color: '#ef4444', bg: isDark ? 'bg-red-500/5' : 'bg-red-500/[0.03]', border: isDark ? 'border-red-500/10' : 'border-red-500/10' },
                    { label: 'Net Savings', value: formatCurrency(monthlyIncome - monthlyExpenses), icon: Target, color: '#a855f7', bg: isDark ? 'bg-purple-500/5' : 'bg-purple-500/[0.03]', border: isDark ? 'border-purple-500/10' : 'border-purple-500/10' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}
                        className={`card-glow p-5 flex items-center gap-4 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                        <div className={`p-3 rounded-xl border ${stat.bg} ${stat.border}`}>
                            <stat.icon size={18} style={{ color: stat.color }} />
                        </div>
                        <div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</span>
                            <div className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/10'}`}>
                                <Activity size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                            </div>
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Health Score Trend</h3>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Monthly</span>
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
                    className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-500/5 border-blue-500/10'}`}>
                                <BarChart3 size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                            </div>
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Income vs Expenses</h3>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>By Month</span>
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
                    className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-500/5 border-yellow-500/10'}`}>
                                <AlertTriangle size={16} className="text-yellow-400" />
                            </div>
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Budget Alerts</h3>
                        </div>
                        <Link to="/dashboard/spending" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400' : 'bg-black/5 border-black/5 hover:bg-black/10 text-slate-600'}`}>
                            View All <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {overBudget.slice(0, 3).map(cat => (
                            <div key={cat.name} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isDark ? 'bg-red-500/[0.03] border-red-500/10 hover:bg-red-500/[0.06]' : 'bg-red-500/[0.02] border-red-500/5 hover:bg-red-500/[0.04]'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{cat.icon}</span>
                                    <div>
                                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</p>
                                        <p className="text-[11px] text-red-400 font-medium">₹{(cat.amount - cat.budget).toLocaleString()} over budget</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(cat.amount)}</p>
                                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Budget: {formatCurrency(cat.budget)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AI Spending Insights */}
            <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-purple-500/10' : 'border-black/5'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/10'}`}>
                        <Lightbulb size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <div>
                        <h2 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Spending Insights</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Powered by Finexa Intelligence</p>
                    </div>
                </div>
                <button onClick={() => loadAIAnalysis(true)} disabled={aiLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400' : 'bg-black/5 border-black/5 hover:bg-black/10 text-slate-600'}`}>
                    <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Analyzing...' : 'Refresh'}
                </button>
            </div>

            {aiLoading && !aiAnalysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`card-glow p-8 text-center ${isDark ? 'bg-[#0a0a1a]/80' : 'bg-white'}`}>
                    <Loader2 size={28} className="animate-spin text-purple-400 mx-auto mb-3" />
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI is analyzing your spending patterns...</p>
                </motion.div>
            )}

            {aiAnalysis && (
                <>
                    {/* AI Patterns */}
                    {aiAnalysis.patterns?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/10'}`}>
                                    <Activity size={14} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                                </div>
                                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>AI-Detected Patterns</h3>
                            </div>
                            <div className="space-y-2">
                                {aiAnalysis.patterns.map((p, i) => (
                                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${isDark ? 'bg-purple-500/[0.03] border-purple-500/10 hover:bg-purple-500/[0.06]' : 'bg-purple-500/[0.02] border-purple-500/5 hover:bg-purple-500/[0.04]'}`}>
                                        <BarChart3 size={14} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Anomalies */}
                    {aiAnalysis.anomalies?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                            className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-500/5 border-yellow-500/10'}`}>
                                    <AlertTriangle size={14} className="text-yellow-400" />
                                </div>
                                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Spending Anomalies</h3>
                            </div>
                            <div className="space-y-2">
                                {aiAnalysis.anomalies.map((a, i) => (
                                    <div key={i} className={`p-4 rounded-xl flex items-start gap-3 border transition-all duration-300 ${isDark ? 'bg-yellow-500/[0.03] border-yellow-500/10 hover:bg-yellow-500/[0.06]' : 'bg-yellow-500/[0.02] border-yellow-500/5 hover:bg-yellow-500/[0.04]'}`}>
                                        <TrendingUp size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Recommendations */}
                    {aiAnalysis.recommendations?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                            className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg border ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-500/5 border-green-500/10'}`}>
                                    <Lightbulb size={14} className="text-green-400" />
                                </div>
                                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Recommendations</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiAnalysis.recommendations.map((r, i) => (
                                    <div key={i} className={`p-5 rounded-xl border-l-2 border transition-all duration-300 ${isDark ? 'bg-green-500/[0.03] border-green-500/10 border-l-green-500 hover:bg-green-500/[0.06]' : 'bg-green-500/[0.02] border-green-500/5 border-l-green-600 hover:bg-green-500/[0.04]'}`}>
                                        <p className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.title}</p>
                                        <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.description}</p>
                                        {r.potential_savings && (
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${isDark ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-green-500/5 border border-green-500/10 text-green-600'}`}>
                                                Save: {r.potential_savings}
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
