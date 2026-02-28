import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, TrendingDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { simulateIncomeDropScenario, formatFullCurrency } from '../../lib/calculations';
import { TransactionsAPI, WalletAPI } from '../../lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs">
            <p className="text-slate-400 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="text-white">{p.name}: {formatFullCurrency(p.value)}</p>
            ))}
        </div>
    );
};

export default function IncomeSimulator() {
    const [loading, setLoading] = useState(true);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [emergencySavings, setEmergencySavings] = useState(0);
    const [dropPct, setDropPct] = useState(20);
    const [jobLoss, setJobLoss] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch transactions for income/expense data
                const txData = await TransactionsAPI.list(1).catch(() => null);
                if (txData?.results?.length) {
                    let income = 0, expenses = 0;
                    txData.results.forEach((t: any) => {
                        if (t.type === 'income') income += +t.amount;
                        else expenses += +t.amount;
                    });
                    setMonthlyIncome(income);
                    setMonthlyExpenses(expenses);
                }

                // Fetch wallet balance as emergency savings
                const wallet = await WalletAPI.getWallet().catch(() => null);
                if (wallet) setEmergencySavings(+wallet.balance || 0);
            } catch (err) {
                console.error('IncomeSimulator fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const effectiveDrop = jobLoss ? 100 : dropPct;
    const result = simulateIncomeDropScenario(monthlyIncome, monthlyExpenses, emergencySavings, effectiveDrop);

    const chartData = [
        { name: 'Current Income', current: monthlyIncome, reduced: 0 },
        { name: 'Expenses', current: monthlyExpenses, reduced: 0 },
        { name: 'NET Monthly', current: monthlyIncome - monthlyExpenses, reduced: result.newIncome - monthlyExpenses },
    ];

    const scenarioData = [
        { label: 'New Monthly Income', value: jobLoss ? 0 : result.newIncome, color: jobLoss ? '#ef4444' : '#a855f7' },
        { label: 'Monthly Shortfall', value: result.monthlyShortfall, color: '#ef4444' },
        { label: 'Months You Can Survive', value: result.survivalMonths === 99 ? '∞' : result.survivalMonths, color: result.isCritical ? '#ef4444' : '#10b981', isMonths: true },
        { label: 'New Savings Rate', value: `${result.newSavingsRate}%`, color: result.newSavingsRate > 0 ? '#10b981' : '#ef4444', isString: true },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Income Drop Simulator</h1>
                <p className="text-slate-500 text-sm mt-1">Simulate income scenarios and see the real impact on your finances</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-purple-400" />
                    <span className="ml-3 text-slate-400">Loading financial data...</span>
                </div>
            ) : monthlyIncome === 0 && monthlyExpenses === 0 ? (
                <div className="text-center py-12">
                    <AlertTriangle size={48} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400 font-medium">No financial data available</p>
                    <p className="text-slate-500 text-sm mt-1">Add income and expense transactions first to use the simulator</p>
                </div>
            ) : (
            <>
            {/* Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Zap size={18} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Scenario Builder</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {/* Job loss toggle */}
                        <div className="flex items-center justify-between mb-5 p-3 rounded-xl"
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <div>
                                <p className="text-white text-sm font-medium">Simulate Total Job Loss</p>
                                <p className="text-slate-500 text-xs">Income drops to ₹0</p>
                            </div>
                            <button onClick={() => setJobLoss(!jobLoss)}
                                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${jobLoss ? 'bg-red-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${jobLoss ? 'left-6' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Drop percent slider */}
                        {!jobLoss && (
                            <>
                                <label className="text-slate-400 text-sm mb-2 block">
                                    Income reduction: <span className="text-white font-semibold text-lg">{dropPct}%</span>
                                    <span className="text-slate-500 text-xs ml-2">(−{formatFullCurrency(monthlyIncome * dropPct / 100)}/mo)</span>
                                </label>
                                <input type="range" min={5} max={60} step={5} value={dropPct} onChange={e => setDropPct(+e.target.value)}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(dropPct / 60) * 100}%, rgba(239,68,68,0.2) ${(dropPct / 60) * 100}%, rgba(239,68,68,0.2) 100%)` }} />
                                <div className="flex justify-between text-xs text-slate-600 mt-1">
                                    <span>5%</span><span>30%</span><span>60%</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {[10, 20, 30, 50].map(p => (
                                        <button key={p} onClick={() => setDropPct(p)}
                                            className={`py-1.5 rounded-lg text-xs font-medium transition-all ${dropPct === p ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-slate-800/60 border border-slate-700/30 text-slate-500 hover:border-red-500/30'}`}>
                                            -{p}%
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Result metrics */}
                    <div className="grid grid-cols-2 gap-3">
                        {scenarioData.map(s => (
                            <motion.div key={s.label} layout
                                className="p-3.5 rounded-xl"
                                style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                                <div className="font-bold text-lg" style={{ color: s.color }}>
                                    {s.isString ? s.value : s.isMonths ? (s.value === 99 || s.value === '∞' ? '∞' : `${s.value}mo`) : formatFullCurrency(s.value as number)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {result.isCritical && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-xl flex items-center gap-3"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">
                            🚨 Critical: Less than 3 months survival runway. Immediate action required: build emergency fund and review expenses.
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4">Financial Impact Visualization</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                        { name: 'Current Income', value: monthlyIncome, color: '#10b981' },
                        { name: jobLoss ? 'No Income' : `Income −${dropPct}%`, value: result.newIncome, color: '#ef4444' },
                        { name: 'Monthly Expenses', value: monthlyExpenses, color: '#a855f7' },
                        { name: 'Monthly Deficit', value: result.monthlyShortfall, color: '#f59e0b' },
                    ]}>
                        <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#475569" />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {[{ color: '#10b981' }, { color: '#ef4444' }, { color: '#a855f7' }, { color: '#f59e0b' }].map((item, i) => (
                                <Cell key={i} fill={item.color} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Budget reallocation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingDown size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Recommended Expense Cuts</h3>
                </div>
                <div className="space-y-2">
                    {result.monthlyShortfall > 0 ? [
                        { category: 'Entertainment', cut: Math.min(4800, Math.round(result.monthlyShortfall * 0.2)), icon: '🎬' },
                        { category: 'Shopping', cut: Math.min(6900, Math.round(result.monthlyShortfall * 0.3)), icon: '🛍️' },
                        { category: 'Subscriptions', cut: Math.min(2400, Math.round(result.monthlyShortfall * 0.15)), icon: '📱' },
                        { category: 'Dining Out', cut: Math.min(4000, Math.round(result.monthlyShortfall * 0.2)), icon: '🍽️' },
                    ].map(item => (
                        <div key={item.category} className="flex items-center justify-between p-3 rounded-lg"
                            style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                            <div className="flex items-center gap-2">
                                <span>{item.icon}</span>
                                <span className="text-sm text-white">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-400 text-sm font-medium">Reduce by {formatFullCurrency(item.cut)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-6 text-green-400">
                            <p>✅ Your income covers all expenses even with the current reduction!</p>
                            <p className="text-slate-500 text-sm mt-1">Consider increasing savings to improve resilience further.</p>
                        </div>
                    )}
                </div>
            </motion.div>
            </>
            )}
        </div>
    );
}
