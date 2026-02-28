import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinancialStore } from '../../store/financialStore';
import { calculateEmergencyBuffer, formatFullCurrency, getStressLevel, calculateStressScore } from '../../lib/calculations';

export default function EmergencyRisk() {
    const { monthlyExpenses, emergencySavings, monthlyIncome } = useFinancialStore();
    const buf = calculateEmergencyBuffer(monthlyExpenses, emergencySavings);

    const stressScore = calculateStressScore({
        debtBurden: 2,
        incomeInstability: 1,
        savingsInconsistency: 3,
        expenseGrowth: 5,
    });
    const stressInfo = getStressLevel(stressScore);

    const coveragePct = Math.min(100, (buf.monthsCovered / 6) * 100);

    const radialData = [{ name: 'Coverage', value: coveragePct, fill: buf.isIdeal ? '#10b981' : buf.isSafe ? '#f59e0b' : '#ef4444' }];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Emergency & Risk Intelligence</h1>
                <p className="text-slate-500 text-sm mt-1">Your financial safety net analysis</p>
            </div>

            {/* Emergency Fund Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={18} className="text-purple-400" />
                        <h3 className="text-white font-semibold">Emergency Fund Status</h3>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-36 h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                                    <RadialBar background={{ fill: 'rgba(168,85,247,0.1)' }} dataKey="value" cornerRadius={8} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">{buf.monthsCovered}</span>
                                <span className="text-xs text-slate-400">months</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${buf.isSafe ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                {buf.isSafe ? <AlertTriangle size={14} className="text-yellow-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                                <span className={`text-sm font-semibold ${buf.isSafe ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {buf.isIdeal ? '✅ Fully Protected' : buf.isSafe ? '⚠️ Getting There' : '🚨 Unsafe'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Current Buffer</span>
                                    <span className="text-white font-medium">{formatFullCurrency(emergencySavings)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">3-Month Target</span>
                                    <span className="text-white font-medium">{formatFullCurrency(buf.idealBuffer3m)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Gap to Safety</span>
                                    <span className="text-red-400 font-medium">{formatFullCurrency(buf.gapTo3m)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!buf.isIdeal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="mt-5 p-4 rounded-xl"
                            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <p className="text-purple-300 text-sm font-medium mb-1">💡 Recommended Action</p>
                            <p className="text-slate-400 text-sm">
                                Add <strong className="text-white">{formatFullCurrency(buf.suggestedMonthlyAdd)}/month</strong> to your emergency fund to reach 3-month safety in ~6 months.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Stress Score */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} className="text-purple-400" />
                        <h3 className="text-white font-semibold">Financial Stress Score</h3>
                    </div>

                    <div className="text-center mb-5">
                        <motion.div className="text-7xl font-bold mb-2"
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
                            style={{ color: stressInfo.color }}>
                            {stressScore}
                        </motion.div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                            style={{ background: stressInfo.bg, border: `1px solid ${stressInfo.color}30`, color: stressInfo.color }}>
                            {stressInfo.label}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Debt Burden', score: 2, max: 10 },
                            { label: 'Income Instability', score: 1, max: 10 },
                            { label: 'Savings Inconsistency', score: 3, max: 10 },
                            { label: 'Expense Growth Rate', score: 5, max: 10 },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{item.label}</span>
                                    <span className="text-white">{item.score}/{item.max}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                        animate={{ width: `${(item.score / item.max) * 100}%` }} transition={{ duration: 0.8 }}
                                        style={{ background: item.score <= 3 ? '#10b981' : item.score <= 6 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Behavioral Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-purple-400" /> Improvement Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { icon: '💰', title: 'Boost Emergency Fund', desc: `Add ₹${buf.suggestedMonthlyAdd.toLocaleString()}/month to reach your 3-month safety target.`, priority: 'High' },
                        { icon: '🍽️', title: 'Reduce Dining Overspend', desc: 'Your dining budget is exceeded by ₹2,400. Try meal prep 3x per week.', priority: 'Medium' },
                        { icon: '📱', title: 'Cancel Unused Subscriptions', desc: 'Detected 2 subscription leaks. Cancelling saves ₹950/month.', priority: 'High' },
                        { icon: '📊', title: 'Track Expenses Weekly', desc: 'Set a 15-min weekly budget review. Users who do this save 18% more.', priority: 'Low' },
                    ].map(item => (
                        <div key={item.title} className="p-4 rounded-xl flex items-start gap-3"
                            style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)' }}>
                            <span className="text-2xl flex-shrink-0">{item.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white text-sm font-medium">{item.title}</p>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${item.priority === 'High' ? 'bg-red-500/15 text-red-400' : item.priority === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'}`}>
                                        {item.priority}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                            <CheckCircle size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Survival Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4">Financial Survival Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Months Covered', value: `${buf.monthsCovered}`, sub: 'without income', color: buf.isSafe ? '#10b981' : '#ef4444' },
                        { label: 'Monthly Expenses', value: formatFullCurrency(monthlyExpenses), sub: 'needs covered', color: '#a855f7' },
                        { label: 'Gap to 6-Month Ideal', value: formatFullCurrency(buf.gapTo6m), sub: 'remaining', color: '#f59e0b' },
                        { label: 'Savings Rate', value: `${Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)}%`, sub: 'of income', color: '#10b981' },
                    ].map(m => (
                        <div key={m.label} className="p-4 roun-xl rounded-xl text-center"
                            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                            <div className="text-xl font-bold mb-0.5" style={{ color: m.color }}>{m.value}</div>
                            <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                            <div className="text-[10px] text-slate-600">{m.sub}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
