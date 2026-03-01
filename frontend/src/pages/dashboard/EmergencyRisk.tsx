import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, CheckCircle, TrendingUp, Loader2, Info } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { calculateEmergencyBuffer } from '../../lib/calculations';
import { HealthAPI, TransactionsAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

/* ── helpers ── */
const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function getHealthInfo(score: number) {
    if (score >= 70) return { label: 'Excellent', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    if (score >= 50) return { label: 'Good', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' };
    if (score >= 35) return { label: 'Average', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'Needs Work', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

function getBarColor(pct: number) {
    if (pct >= 75) return '#10b981';   // green — great
    if (pct >= 50) return '#22d3ee';   // cyan — good
    if (pct >= 35) return '#f59e0b';   // yellow — average
    return '#ef4444';                  // red — poor
}

function getBarLabel(pct: number) {
    if (pct >= 75) return 'Great';
    if (pct >= 50) return 'Good';
    if (pct >= 35) return 'Fair';
    return 'Low';
}

export default function EmergencyRisk() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [emergencySavings, setEmergencySavings] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [healthScore, setHealthScore] = useState(0);
    const [healthFactors, setHealthFactors] = useState<{ label: string; score: number; max: number }[]>([]);
    const [recommendations, setRecommendations] = useState<{ icon: string; title: string; desc: string; priority: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch transaction summary for accurate income/expenses
                const summary = await TransactionsAPI.summary().catch(() => null);
                if (summary) {
                    setMonthlyIncome(summary.total_income || 0);
                    setMonthlyExpenses(summary.total_expense || 0);
                    setEmergencySavings(Math.max(0, summary.all_time_savings || summary.savings || 0));
                }

                // Fetch health score
                const healthData = await HealthAPI.getScore().catch(() => null);
                if (healthData?.score != null) {
                    setHealthScore(Math.max(0, Math.min(100, healthData.score)));
                }

                // Fetch breakdown for detailed factors
                const breakdown = await HealthAPI.getBreakdown().catch(() => null);
                if (breakdown?.overall_score != null) {
                    setHealthScore(Math.max(0, Math.min(100, breakdown.overall_score)));
                }
                if (breakdown?.factors?.length) {
                    const factors = breakdown.factors.map((f: any) => ({
                        label: f.display_name || f.name || 'Factor',
                        score: Math.round(f.score || 0),
                        max: f.max_score || 20,
                    }));
                    setHealthFactors(factors);
                }

                // Fetch recommendations from backend
                const recData: any = await HealthAPI.getRecommendations().catch(() => null);
                if (recData?.recommendations?.length) {
                    const recs = recData.recommendations.slice(0, 4).map((r: string, i: number) => ({
                        icon: ['💰', '📊', '🛡️', '📈'][i] || '💡',
                        title: r.split('.')[0] || 'Recommendation',
                        desc: r,
                        priority: i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low',
                    }));
                    setRecommendations(recs);
                }
            } catch (err) {
                console.error('EmergencyRisk fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const buf = calculateEmergencyBuffer(monthlyExpenses, emergencySavings);
    const healthInfo = getHealthInfo(healthScore);
    const coveragePct = monthlyExpenses > 0 ? Math.min(100, (buf.monthsCovered / 6) * 100) : 0;
    const radialData = [{ name: 'Coverage', value: coveragePct, fill: buf.isIdeal ? '#10b981' : buf.isSafe ? '#f59e0b' : '#ef4444' }];
    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
    const monthsCoveredDisplay = monthlyExpenses > 0 ? buf.monthsCovered : 0;

    const defaultRecommendations = [
        { icon: '💰', title: 'Boost Emergency Fund', desc: `Save ${fmt(buf.suggestedMonthlyAdd)}/month to reach your 3-month safety target.`, priority: 'High' },
        { icon: '📊', title: 'Track Expenses Weekly', desc: 'Set a 15-min weekly budget review to identify savings opportunities.', priority: 'Medium' },
        { icon: '🛡️', title: 'Build Safety Net', desc: 'Keep building until you have 6 months of expenses covered.', priority: 'High' },
        { icon: '📈', title: 'Optimize Spending', desc: 'Review your top expense categories and look for potential savings.', priority: 'Low' },
    ];
    const displayRecs = recommendations.length > 0 ? recommendations : defaultRecommendations;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 size={32} className="animate-spin text-purple-400" />
                <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Analyzing your finances...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <Shield size={18} className="text-purple-400" />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Safety Analysis</p>
                    <h1 className="font-display font-bold text-2xl text-gradient">Risk & Safety</h1>
                </div>
            </div>

            {/* Top Row: Emergency Fund + Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Emergency Fund Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow p-6" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={18} className="text-purple-400" />
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Emergency Fund</h3>
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>How many months can you survive without income?</p>

                    <div className="flex items-center gap-6">
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                                    <RadialBar background={{ fill: 'rgba(168,85,247,0.1)' }} dataKey="value" cornerRadius={8} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{monthsCoveredDisplay}</span>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>months</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                buf.isIdeal ? 'bg-green-500/10 border border-green-500/20'
                                : buf.isSafe ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                            }`}>
                                <span className={`text-sm font-semibold ${
                                    buf.isIdeal ? 'text-green-400' : buf.isSafe ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {buf.isIdeal ? '✅ Fully Protected (6+ months)' : buf.isSafe ? '⚠️ Partially Safe (3+ months)' : '🚨 Not Safe Yet'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-muted)' }}>Your Savings</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(emergencySavings)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-muted)' }}>Monthly Expenses</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(monthlyExpenses)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-muted)' }}>3-Month Safety Target</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(buf.idealBuffer3m)}</span>
                                </div>
                                {buf.gapTo3m > 0 && (
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-muted)' }}>Amount Still Needed</span>
                                        <span className="text-red-400 font-medium">{fmt(buf.gapTo3m)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {!buf.isIdeal && monthlyExpenses > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="mt-5 p-4 rounded-xl"
                            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <p className="text-purple-300 text-sm font-medium mb-1">💡 What You Should Do</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Save <strong style={{ color: 'var(--text-primary)' }}>{fmt(buf.suggestedMonthlyAdd)}/month</strong> and you'll reach 3 months of safety in about 6 months.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Financial Health Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glow p-6" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Heart size={18} className="text-purple-400" />
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Financial Health Score</h3>
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Overall health based on your spending, saving, and debt habits</p>

                    <div className="text-center mb-5">
                        <motion.div className="text-6xl font-bold mb-2"
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
                            style={{ color: healthInfo.color }}>
                            {healthScore}<span className="text-2xl" style={{ color: 'var(--text-muted)' }}>/100</span>
                        </motion.div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                            style={{ background: healthInfo.bg, border: `1px solid ${healthInfo.color}30`, color: healthInfo.color }}>
                            {healthInfo.label}
                        </div>
                    </div>

                    {healthFactors.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                <Info size={10} /> Higher bar = Better score
                            </p>
                            {healthFactors.map(item => {
                                const pct = item.max > 0 ? (item.score / item.max) * 100 : 0;
                                return (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                            <span className="font-medium" style={{ color: getBarColor(pct) }}>
                                                {item.score}/{item.max} &middot; {getBarLabel(pct)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                                            <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                                style={{ background: getBarColor(pct) }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                            No breakdown data yet. Add more transactions to see details.
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Quick Summary Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Key Numbers at a Glance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                        <div className="text-xl font-bold mb-0.5" style={{ color: buf.isSafe ? '#10b981' : '#ef4444' }}>
                            {monthsCoveredDisplay} mo
                        </div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Survival Time</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>if income stops</div>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                        <div className="text-xl font-bold mb-0.5 text-purple-400">{fmt(monthlyExpenses)}</div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Monthly Spend</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>this month</div>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                        <div className="text-xl font-bold mb-0.5 text-cyan-400">{fmt(monthlyIncome)}</div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Monthly Income</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>this month</div>
                    </div>
                    <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                        <div className="text-xl font-bold mb-0.5" style={{ color: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444' }}>
                            {savingsRate}%
                        </div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Savings Rate</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{savingsRate >= 20 ? 'healthy' : savingsRate >= 10 ? 'okay' : 'low'}</div>
                    </div>
                </div>
            </motion.div>

            {/* Improvement Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp size={16} className="text-purple-400" /> What You Can Improve
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayRecs.map(item => (
                        <div key={item.title} className="p-4 rounded-xl flex items-start gap-3"
                            style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)' }}>
                            <span className="text-2xl flex-shrink-0">{item.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                        item.priority === 'High' ? 'bg-red-500/15 text-red-400'
                                        : item.priority === 'Medium' ? 'bg-yellow-500/15 text-yellow-400'
                                        : 'bg-green-500/15 text-green-400'
                                    }`}>
                                        {item.priority}
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                            <CheckCircle size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
