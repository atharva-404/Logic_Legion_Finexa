import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Loader2, RefreshCw, Lightbulb, Activity, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { detectSpendingPersonality, formatFullCurrency } from '../../lib/calculations';
import { TransactionsAPI, AIAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpenseCategory {
    name: string;
    amount: number;
    budget: number;
    color: string;
    icon: string;
}

interface AIAnalysis {
    patterns: string[];
    anomalies: string[];
    recommendations: { title: string; description: string; potential_savings: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card-glow p-3 text-xs" style={{ background: 'rgba(15,15,30,0.95)', backdropFilter: 'blur(12px)' }}>
            <p className="font-medium" style={{ color: '#fff' }}>{payload[0]?.name || payload[0]?.payload?.name}</p>
            <p className="text-purple-400">₹{payload[0]?.value?.toLocaleString()}</p>
        </div>
    );
};

const CATEGORY_COLORS: Record<string, string> = {
    'Housing': '#a855f7', 'Food & Dining': '#3b82f6', 'Food': '#3b82f6',
    'Transport': '#06b6d4', 'Transportation': '#06b6d4', 'Entertainment': '#f59e0b',
    'Shopping': '#ec4899', 'Health': '#10b981', 'Subscriptions': '#ef4444',
    'Utilities': '#8b5cf6', 'Household': '#8b5cf6', 'Personal Care': '#14b8a6',
    'Bills': '#f97316', 'Education': '#6366f1', 'Income': '#22c55e',
};
const FALLBACK_COLORS = ['#a855f7', '#3b82f6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function SpendingInsights() {
    const { isDark } = useTheme();
    const [currentExpenses, setCurrentExpenses] = useState<ExpenseCategory[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [loading, setLoading] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [txCount, setTxCount] = useState(0);

    // Fetch ALL transactions across all pages
    useEffect(() => {
        setLoading(true);
        async function fetchAll() {
            try {
                let allTx: any[] = [];
                let page = 1;
                let hasMore = true;
                while (hasMore) {
                    const d = await TransactionsAPI.list(page);
                    const results = d.results || (Array.isArray(d) ? d : []);
                    allTx = [...allTx, ...results];
                    hasMore = !!d.next;
                    page++;
                }
                setTxCount(allTx.length);

                const expenses = allTx.filter((t: any) => t.type === 'expense');
                const income = allTx.filter((t: any) => t.type === 'income');
                const txIncome = income.reduce((s: number, t: any) => s + parseFloat(t.amount), 0);

                // If no income transactions, fetch from API summary
                if (txIncome > 0) {
                    setTotalIncome(txIncome);
                } else {
                    try {
                        const summary = await TransactionsAPI.summary();
                        setTotalIncome(summary.total_income || 0);
                    } catch { setTotalIncome(0); }
                }

                if (expenses.length === 0) {
                    setLoading(false);
                    return;
                }

                // Build category totals
                const catMap: Record<string, number> = {};
                expenses.forEach((t: any) => {
                    const cat = t.category || 'Other';
                    catMap[cat] = (catMap[cat] || 0) + parseFloat(t.amount);
                });

                // Use income as total budget, distribute proportionally; fallback to 1.2x spending
                const totalExpense = Object.values(catMap).reduce((a, b) => a + b, 0);
                let totalBudgetPool: number;
                if (txIncome > 0) {
                    totalBudgetPool = txIncome;
                } else {
                    try {
                        const summary = await TransactionsAPI.summary();
                        totalBudgetPool = summary.total_income > 0 ? summary.total_income : totalExpense * 1.2;
                    } catch {
                        totalBudgetPool = totalExpense * 1.2;
                    }
                }

                let colorIdx = 0;
                const mapped: ExpenseCategory[] = Object.entries(catMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, amount]) => ({
                        name,
                        amount: Math.round(amount),
                        budget: Math.round((amount / totalExpense) * totalBudgetPool),
                        color: CATEGORY_COLORS[name] || FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length],
                        icon: name.toLowerCase(),
                    }));
                setCurrentExpenses(mapped);
            } catch (err) {
                console.error('Failed to load transactions for spending:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    // Fetch AI spending analysis
    function loadAIAnalysis(refresh = false) {
        setAiLoading(true);
        AIAPI.getSpendingAnalysis(refresh)
            .then(data => {
                if (data && !data.error) {
                    setAiAnalysis(data);
                }
            })
            .catch(err => console.error('AI analysis failed:', err))
            .finally(() => setAiLoading(false));
    }

    useEffect(() => {
        if (!loading && currentExpenses.length > 0) {
            loadAIAnalysis();
        }
    }, [loading, currentExpenses.length]);

    const personality = detectSpendingPersonality(currentExpenses);
    const totalSpent = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const totalBudget = currentExpenses.reduce((s, e) => s + e.budget, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--aqua)' }} />
                <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Loading spending data...</span>
            </div>
        );
    }

    if (currentExpenses.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Spending Insights</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No spending data available yet</p>
                </div>
                <div className="text-center py-12">
                    <AlertTriangle size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No transactions found</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload PDFs or add transactions to see your spending insights</p>
                </div>
            </div>
        );
    }

    const now = new Date();
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                            <Activity size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--aqua)' }}>Analytics</p>
                            <h1 className="font-display font-bold text-2xl text-gradient">Spending Insights</h1>
                        </div>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{monthLabel} · {txCount} transactions analyzed</p>
                </div>
                <button onClick={() => loadAIAnalysis(true)} disabled={aiLoading}
                    className="btn-aqua text-xs px-3 py-2 flex items-center gap-1.5">
                    <RefreshCw size={13} className={aiLoading ? 'animate-spin' : ''} />
                    {aiLoading ? 'Analyzing...' : 'Refresh AI Analysis'}
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Spent', value: totalSpent, color: '#ef4444' },
                    { label: 'Total Income', value: totalIncome, color: '#10b981' },
                    { label: 'Net Savings', value: totalIncome - totalSpent, color: totalIncome > totalSpent ? '#10b981' : '#ef4444' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="card-glow p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                                <TrendingUp size={12} style={{ color: s.color }} />
                            </div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                        <p className="font-bold text-xl" style={{ color: s.color }}>
                            {formatFullCurrency(Math.abs(s.value))}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Spending Personality */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-glow p-5 flex items-center gap-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${personality.color}20`, border: `1px solid ${personality.color}30` }}>
                    {personality.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Your Spending Personality</p>
                    </div>
                    <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{personality.type}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{personality.description}</p>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                    <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget used</p>
                </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Spending by Category</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={currentExpenses} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                                {currentExpenses.map(e => <Cell key={e.name} fill={e.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {currentExpenses.map(e => (
                            <div key={e.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                                <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{e.name}</span>
                                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{formatFullCurrency(e.amount)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bar chart: actual vs budget */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Actual vs Budget</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={currentExpenses} layout="vertical" margin={{ left: -10 }}>
                            <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} width={70} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="budget" fill="rgba(168,85,247,0.15)" radius={[0, 4, 4, 0]} name="Budget" />
                            <Bar dataKey="amount" radius={[0, 4, 4, 0]} name="Actual">
                                {currentExpenses.map(e => <Cell key={e.name} fill={e.amount > e.budget ? '#ef4444' : '#a855f7'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Category breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category Breakdown</h3>
                <div className="space-y-3">
                    {currentExpenses.map(cat => {
                        const pct = cat.budget > 0 ? (cat.amount / cat.budget) * 100 : 100;
                        const over = cat.amount > cat.budget;
                        return (
                            <div key={cat.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                                        {over && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">Over Budget</span>}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatFullCurrency(cat.amount)}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}> / {formatFullCurrency(cat.budget)}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                                        style={{ background: over ? '#ef4444' : cat.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* AI Analysis Section */}
            {aiLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow p-6 text-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--aqua)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI is analyzing your spending patterns...</p>
                </motion.div>
            )}

            {aiAnalysis && !aiLoading && (
                <>
                    {/* AI Patterns */}
                    {aiAnalysis.patterns && aiAnalysis.patterns.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Activity size={16} className="text-purple-400" /> AI-Detected Patterns
                            </h3>
                            <div className="space-y-2">
                                {aiAnalysis.patterns.map((p, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                                        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                        <BarChart3 size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm" style={{ color: isDark ? 'rgba(203,213,225,0.9)' : '#374151' }}>{p}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Anomalies */}
                    {aiAnalysis.anomalies && aiAnalysis.anomalies.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <AlertTriangle size={16} className="text-yellow-400" /> Spending Anomalies
                            </h3>
                            <div className="space-y-2">
                                {aiAnalysis.anomalies.map((a, i) => (
                                    <div key={i} className="p-3 rounded-xl flex items-start gap-3"
                                        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                        <TrendingUp size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm" style={{ color: isDark ? 'rgba(203,213,225,0.9)' : '#374151' }}>{a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Recommendations */}
                    {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Lightbulb size={16} className="text-green-400" /> AI Recommendations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {aiAnalysis.recommendations.map((r, i) => (
                                    <div key={i} className="p-4 rounded-xl"
                                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{r.description}</p>
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
