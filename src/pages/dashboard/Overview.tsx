import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { monthlyHistory, currentExpenses } from '../../lib/mockData';
import { getHealthLabel, getStressLevel, calculateEmergencyBuffer, formatCurrency } from '../../lib/calculations';
import { Link } from 'react-router-dom';
import { useFinancialStore } from '../../store/financialStore';

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
    const { monthlyIncome, monthlyExpenses, emergencySavings } = useFinancialStore();
    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = ((savings / monthlyIncome) * 100).toFixed(1);
    const healthScore = 74;
    const stressScore = 42;
    const { label: stressLabel, color: stressColor } = getStressLevel(stressScore);
    const emergency = calculateEmergencyBuffer(monthlyExpenses, emergencySavings);

    const overBudget = currentExpenses.filter(e => e.amount > e.budget);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl text-white">Financial Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">February 2026 · Your financial snapshot</p>
                </div>
                <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                    ↑ Score improved +8 this month
                </motion.div>
            </div>

            {/* Top row: Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Health Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="glass-card p-5 sm:col-span-2 lg:col-span-1 flex flex-col items-center">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Health Score</p>
                    <ScoreGauge score={healthScore} size={140} />
                    <div className="mt-2 text-center">
                        <p className="text-green-400 text-xs font-medium">↑ +8 from last month</p>
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
                        <p className="text-slate-500 text-xs mt-1">Excellent! Target is 20%</p>
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
                        <p className="text-slate-500 text-xs mt-1">Target: 3–6 months</p>
                    </div>
                </motion.div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Monthly Income', value: formatCurrency(monthlyIncome), icon: TrendingUp, color: '#10b981' },
                    { label: 'Monthly Expenses', value: formatCurrency(monthlyExpenses), icon: TrendingDown, color: '#ef4444' },
                    { label: 'Savings Rate', value: `${savingsRate}%`, icon: TrendingUp, color: '#a855f7' },
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
                        <span className="text-xs text-slate-500">Last 6 months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monthlyHistory}>
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

                {/* Income vs Expenses */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Income vs Expenses</h3>
                        <span className="text-xs text-slate-500">Last 6 months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={monthlyHistory}>
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

            {/* Overspend alerts */}
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
        </div>
    );
}
