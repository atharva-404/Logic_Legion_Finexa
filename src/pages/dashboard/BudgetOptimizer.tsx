import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, TrendingDown, Zap, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { currentExpenses } from '../../lib/mockData';
import { formatFullCurrency } from '../../lib/calculations';
import { useFinancialStore } from '../../store/financialStore';

const RULE = [
    { name: 'Needs', pct: 50, color: '#a855f7', desc: 'Rent, Food, Utilities, Transport' },
    { name: 'Wants', pct: 30, color: '#3b82f6', desc: 'Entertainment, Shopping, Dining Out' },
    { name: 'Savings', pct: 20, color: '#10b981', desc: 'Emergency Fund, Goals, DTI Paydown' },
];

const aiTips = [
    { icon: '🍽️', category: 'Food & Dining', tip: 'You\'re ₹2,400 over in dining. Cooking at home 3x/week saves ~₹15k/year.', savings: 1200 },
    { icon: '🎬', category: 'Entertainment', tip: 'Entertainment is ₹1,800 over budget. Consider a family streaming plan instead of individual subscriptions.', savings: 600 },
    { icon: '🛍️', category: 'Shopping', tip: 'Try the 24-hour rule before impulse purchases. This could save ₹2,500+/month.', savings: 2500 },
    { icon: '📱', category: 'Subscriptions', tip: 'Cancel unused subscriptions (Gym, Magazine). Saves ₹950/month or ₹11,400/year.', savings: 950 },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs">
            <p className="text-white font-medium">{payload[0]?.payload?.name}</p>
            <p className="text-purple-400">₹{payload[0]?.value?.toLocaleString()}</p>
        </div>
    );
};

export default function BudgetOptimizer() {
    const { monthlyIncome } = useFinancialStore();
    const [simCategory, setSimCategory] = useState('Food & Dining');
    const [reduceAmount, setReduceAmount] = useState(2000);

    const yearlySaving = reduceAmount * 12;

    const needsTotal = currentExpenses.filter(e => ['Housing', 'Food & Dining', 'Transport', 'Utilities', 'Health'].includes(e.name)).reduce((s, e) => s + e.amount, 0);
    const wantsTotal = currentExpenses.filter(e => ['Entertainment', 'Shopping'].includes(e.name)).reduce((s, e) => s + e.amount, 0);
    const actualSavings = monthlyIncome - currentExpenses.reduce((s, e) => s + e.amount, 0);
    const totalExpenses = currentExpenses.reduce((s, e) => s + e.amount, 0);

    const efficiency = Math.round(Math.min(100, ((monthlyIncome - totalExpenses) / (monthlyIncome * 0.2)) * 100));

    const actual = [
        { name: 'Needs', value: needsTotal, color: '#a855f7' },
        { name: 'Wants', value: wantsTotal, color: '#3b82f6' },
        { name: 'Savings', value: actualSavings, color: '#10b981' },
    ];
    const ideal = RULE.map(r => ({ name: r.name, value: Math.round(monthlyIncome * r.pct / 100), color: r.color }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Budget Optimizer</h1>
                <p className="text-slate-500 text-sm mt-1">AI-powered budget analysis and what-if simulations</p>
            </div>

            {/* Efficiency score */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" stroke="rgba(168,85,247,0.15)" strokeWidth="8" fill="none" />
                        <motion.circle cx="40" cy="40" r="32" stroke="#a855f7" strokeWidth="8" fill="none"
                            strokeLinecap="round" strokeDasharray={2 * Math.PI * 32}
                            initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - efficiency / 100) }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            transform="rotate(-90 40 40)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-bold text-white text-lg">{efficiency}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Budget Efficiency Score</p>
                    <p className="text-white font-semibold text-xl">
                        {efficiency >= 80 ? 'Excellent Budgeter' : efficiency >= 60 ? 'Good Progress' : 'Needs Improvement'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">You're saving {formatFullCurrency(actualSavings)}/mo · {Math.round((actualSavings / monthlyIncome) * 100)}% of income</p>
                </div>
            </motion.div>

            {/* 50/30/20 Comparison */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4">50/30/20 Rule Analysis</h3>
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {RULE.map((r, i) => {
                        const actualVal = actual[i].value;
                        const idealVal = ideal[i].value;
                        const diff = actualVal - idealVal;
                        return (
                            <div key={r.name} className="text-center p-3 rounded-xl"
                                style={{ background: `${r.color}10`, border: `1px solid ${r.color}20` }}>
                                <div className="text-xs text-slate-500 mb-1">{r.name} ({r.pct}%)</div>
                                <div className="font-bold text-white text-base">{formatFullCurrency(actualVal)}</div>
                                <div className="text-xs mt-1" style={{ color: diff > 0 && r.name !== 'Savings' ? '#ef4444' : diff < 0 && r.name === 'Savings' ? '#ef4444' : '#10b981' }}>
                                    {diff > 0 ? '+' : ''}{formatFullCurrency(Math.abs(diff))} {diff > 0 && r.name !== 'Savings' ? 'over' : 'under'} ideal
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={[...actual.map((a, i) => ({ ...a, ideal: ideal[i].value }))]} barCategoryGap={30}>
                        <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="ideal" name="Ideal" fill="rgba(168,85,247,0.2)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="value" name="Actual" radius={[4, 4, 0, 0]}>
                            {actual.map(a => <Cell key={a.name} fill={a.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* What-If Simulator */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Sliders size={18} className="text-purple-400" />
                    <h3 className="text-white font-semibold">What-If Budget Simulator</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-slate-400 text-sm mb-3 block">Choose a category to reduce:</label>
                        <div className="grid grid-cols-2 gap-2">
                            {currentExpenses.filter(e => e.amount > e.budget).map(e => (
                                <button key={e.name} onClick={() => setSimCategory(e.name)}
                                    className={`p-2.5 rounded-xl text-sm transition-all ${simCategory === e.name ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:border-purple-500/30'}`}>
                                    {e.icon} {e.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5">
                            <label className="text-slate-400 text-sm mb-2 block">Reduce monthly spend by: <span className="text-white font-semibold">₹{reduceAmount.toLocaleString()}</span></label>
                            <input type="range" min={500} max={5000} step={500} value={reduceAmount} onChange={e => setReduceAmount(+e.target.value)}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{ background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((reduceAmount - 500) / 4500) * 100}%, rgba(168,85,247,0.2) ${((reduceAmount - 500) / 4500) * 100}%, rgba(168,85,247,0.2) 100%)` }} />
                            <div className="flex justify-between text-xs text-slate-600 mt-1">
                                <span>₹500</span><span>₹5,000</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-slate-400 text-sm">Projected annual impact:</p>
                        <motion.div key={yearlySaving} initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            className="p-4 rounded-xl text-center"
                            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <TrendingDown size={24} className="text-green-400 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-green-400 mb-1">+{formatFullCurrency(yearlySaving)}</div>
                            <div className="text-slate-400 text-sm">Saved per year</div>
                        </motion.div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                <div className="text-purple-400 font-semibold">{formatFullCurrency(reduceAmount)}</div>
                                <div className="text-slate-500 text-xs">Less/month</div>
                            </div>
                            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                <div className="text-purple-400 font-semibold">{formatFullCurrency(actualSavings + reduceAmount)}</div>
                                <div className="text-slate-500 text-xs">New savings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AI Tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold">AI Savings Recommendations</h3>
                </div>
                <div className="space-y-3">
                    {aiTips.map(tip => (
                        <div key={tip.category} className="p-4 rounded-xl flex items-start gap-3"
                            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                            <span className="text-xl flex-shrink-0">{tip.icon}</span>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium mb-0.5">{tip.category}</p>
                                <p className="text-slate-400 text-xs leading-relaxed">{tip.tip}</p>
                            </div>
                            <div className="text-green-400 text-sm font-semibold flex-shrink-0 flex items-center gap-1">
                                <CheckCircle size={13} /> +{formatFullCurrency(tip.savings)}/mo
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
