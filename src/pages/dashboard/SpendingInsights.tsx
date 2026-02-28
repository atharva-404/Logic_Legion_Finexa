import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { currentExpenses, subscriptions, spendingAnomalies } from '../../lib/mockData';
import { detectSpendingPersonality, formatCurrency, formatFullCurrency } from '../../lib/calculations';

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs">
            <p className="text-white font-medium">{payload[0]?.name || payload[0]?.payload?.name}</p>
            <p className="text-purple-400">₹{payload[0]?.value?.toLocaleString()}</p>
        </div>
    );
};

export default function SpendingInsights() {
    const personality = detectSpendingPersonality(currentExpenses);
    const totalSpent = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const totalBudget = currentExpenses.reduce((s, e) => s + e.budget, 0);
    const leakSubs = subscriptions.filter(s => s.status === 'leak');
    const leakTotal = leakSubs.reduce((s, sub) => s + sub.amount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Spending Insights</h1>
                <p className="text-slate-500 text-sm mt-1">February 2026 · Comprehensive spending analysis</p>
            </div>

            {/* Spending Personality */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${personality.color}20`, border: `1px solid ${personality.color}30` }}>
                    {personality.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Your Spending Personality</p>
                    </div>
                    <p className="text-white font-semibold text-lg">{personality.type}</p>
                    <p className="text-slate-400 text-sm">{personality.description}</p>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-white">{Math.round((totalSpent / totalBudget) * 100)}%</p>
                    <p className="text-slate-500 text-xs">Budget used</p>
                </div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pie Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Spending by Category</h3>
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
                                <span className="text-slate-400 text-xs truncate">{e.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bar chart: actual vs budget */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Actual vs Budget</h3>
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
                className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                    {currentExpenses.map(cat => {
                        const pct = (cat.amount / cat.budget) * 100;
                        const over = cat.amount > cat.budget;
                        return (
                            <div key={cat.name}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span>{cat.icon}</span>
                                        <span className="text-sm text-white font-medium">{cat.name}</span>
                                        {over && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">Over Budget</span>}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-white">{formatFullCurrency(cat.amount)}</span>
                                        <span className="text-slate-500 text-xs"> / {formatFullCurrency(cat.budget)}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                                        style={{ background: over ? '#ef4444' : cat.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* 2-col: Anomalies + Subscriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Anomalies */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-400" /> Spending Anomalies
                    </h3>
                    <div className="space-y-3">
                        {spendingAnomalies.map(a => (
                            <div key={a.category} className="p-3 rounded-xl flex items-center justify-between"
                                style={{ background: a.severity === 'high' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${a.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                <div>
                                    <p className="text-sm text-white font-medium">{a.category}</p>
                                    <p className="text-xs text-slate-400">{a.message}</p>
                                </div>
                                <TrendingUp size={16} className={a.severity === 'high' ? 'text-red-400' : 'text-yellow-400'} />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Subscriptions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Zap size={16} className="text-purple-400" /> Subscription Tracker
                        </h3>
                        {leakSubs.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                                {leakSubs.length} leaks · ₹{leakTotal}/mo
                            </span>
                        )}
                    </div>
                    <div className="space-y-2.5">
                        {subscriptions.map(sub => (
                            <div key={sub.name} className="flex items-center justify-between py-2 border-b border-purple-900/20 last:border-0">
                                <div>
                                    <p className="text-sm text-white font-medium">{sub.name}</p>
                                    <p className="text-xs text-slate-500">Last used: {sub.lastUsed}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-white">₹{sub.amount}/mo</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sub.status === 'active' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : sub.status === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                        {sub.status === 'leak' ? '🔴 Leak' : sub.status === 'warning' ? '⚠️ Unused' : '✅ Active'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
