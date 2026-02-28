import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, TrendingDown, Sparkles, Loader2, AlertTriangle, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TransactionsAPI, AIAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const NEEDS_CATS = new Set(['Food', 'Groceries', 'Rent', 'Utilities', 'Bills', 'Transportation', 'Health', 'Household', 'Gas', 'Insurance', 'Education']);

interface CategoryData { name: string; amount: number; icon: string }
interface AiTip { tip: string; category: string; save_per_month: number }

const catIcon = (name: string) =>
    name === 'Food' || name === 'Groceries' ? '🍽️' :
    name === 'Entertainment' ? '🎬' :
    name === 'Shopping' || name === 'Online Shopping' ? '🛍️' :
    name === 'Subscriptions' ? '📱' :
    name === 'Housing' || name === 'Rent' || name === 'Household' ? '🏠' :
    name === 'Transportation' || name === 'Gas' ? '🚗' :
    name === 'Utilities' || name === 'Bills' ? '💡' :
    name === 'Health' || name === 'Gym' ? '💊' :
    name === 'Restaurant' || name === 'Coffee' ? '☕' :
    name === 'Personal Care' ? '💇' : '💸';

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs">
            <p className="text-white font-medium">{payload[0]?.payload?.name}</p>
            <p className="text-purple-400">{fmt(payload[0]?.value || 0)}</p>
        </div>
    );
};

export default function BudgetOptimizer() {
    const { user } = useAuth();
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [aiTips, setAiTips] = useState<AiTip[]>([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [simCategory, setSimCategory] = useState('');
    const [reduceAmount, setReduceAmount] = useState(500);

    useEffect(() => {
        setLoading(true);
        TransactionsAPI.summary()
            .then(summary => {
                const income = summary.total_income || (user?.income ? +user.income : 0);
                setMonthlyIncome(income);
                setTotalExpense(summary.total_expense || 0);

                const cats: CategoryData[] = (summary.categories || []).map((c: any) => ({
                    name: c.name,
                    amount: c.amount,
                    icon: catIcon(c.name),
                }));
                setCategories(cats);
                if (cats.length > 0) setSimCategory(cats[0].name);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const loadAiTips = () => {
        setAiLoading(true);
        AIAPI.getBudgetAdvice()
            .then(data => {
                if (data?.tips) setAiTips(data.tips);
            })
            .catch(() => {})
            .finally(() => setAiLoading(false));
    };

    const savings = monthlyIncome - totalExpense;
    const needsTotal = categories.filter(c => NEEDS_CATS.has(c.name)).reduce((s, c) => s + c.amount, 0);
    const wantsTotal = categories.filter(c => !NEEDS_CATS.has(c.name)).reduce((s, c) => s + c.amount, 0);

    const actual = [
        { name: 'Needs', value: needsTotal, color: '#a855f7' },
        { name: 'Wants', value: wantsTotal, color: '#3b82f6' },
        { name: 'Savings', value: Math.max(0, savings), color: '#10b981' },
    ];
    const ideal = [
        { name: 'Needs', value: Math.round(monthlyIncome * 0.5), color: '#a855f7' },
        { name: 'Wants', value: Math.round(monthlyIncome * 0.3), color: '#3b82f6' },
        { name: 'Savings', value: Math.round(monthlyIncome * 0.2), color: '#10b981' },
    ];

    // Slider max = largest category amount (capped at 10000)
    const selectedCat = categories.find(c => c.name === simCategory);
    const sliderMax = Math.min(Math.max(selectedCat?.amount || 2000, 500), 10000);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-purple-400" />
                <span className="ml-3 text-slate-400">Loading budget data...</span>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="font-display font-bold text-2xl text-white">Budget Optimizer</h1>
                    <p className="text-slate-500 text-sm mt-1">No spending data to optimize</p>
                </div>
                <div className="text-center py-12">
                    <AlertTriangle size={48} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400 font-medium">No expenses found</p>
                    <p className="text-slate-500 text-sm mt-1">Add transactions to start optimizing your budget.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Budget Optimizer</h1>
                <p className="text-slate-500 text-sm mt-1">See where your money goes and find ways to save</p>
            </div>

            {/* 50/30/20 Rule Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5">
                <h3 className="text-white font-semibold mb-1">50/30/20 Rule</h3>
                <p className="text-slate-500 text-xs mb-4">How your spending compares to the ideal split</p>
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                        { label: 'Needs (50%)', actual: needsTotal, ideal: monthlyIncome * 0.5, color: '#a855f7' },
                        { label: 'Wants (30%)', actual: wantsTotal, ideal: monthlyIncome * 0.3, color: '#3b82f6' },
                        { label: 'Savings (20%)', actual: Math.max(0, savings), ideal: monthlyIncome * 0.2, color: '#10b981' },
                    ].map(r => {
                        const diff = r.actual - r.ideal;
                        const isSavings = r.label.startsWith('Savings');
                        const isGood = isSavings ? diff >= 0 : diff <= 0;
                        return (
                            <div key={r.label} className="text-center p-3 rounded-xl"
                                style={{ background: `${r.color}10`, border: `1px solid ${r.color}20` }}>
                                <div className="text-xs text-slate-500 mb-1">{r.label}</div>
                                <div className="font-bold text-white text-base">{fmt(r.actual)}</div>
                                <div className="text-xs mt-1" style={{ color: isGood ? '#10b981' : '#ef4444' }}>
                                    {Math.abs(diff) < 50 ? '✅ On target' :
                                        `${isGood ? '✅' : '⚠️'} ${fmt(Math.abs(diff))} ${isSavings ? (diff > 0 ? 'extra' : 'short') : (diff > 0 ? 'over' : 'under')}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={actual.map((a, i) => ({ ...a, ideal: ideal[i].value }))} barCategoryGap={30}>
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

            {/* What-If Budget Simulator */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Sliders size={18} className="text-purple-400" />
                    <h3 className="text-white font-semibold">What-If Budget Simulator</h3>
                </div>
                <p className="text-slate-500 text-xs mb-5">Pick a category, reduce spending, see how much you save each month</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-slate-400 text-sm mb-3 block">Choose a category to reduce:</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(e => (
                                <button key={e.name} onClick={() => { setSimCategory(e.name); setReduceAmount(Math.min(reduceAmount, Math.round(e.amount))); }}
                                    className={`px-3 py-2 rounded-xl text-sm transition-all ${simCategory === e.name ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:border-purple-500/30'}`}>
                                    {e.icon} {e.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5">
                            <label className="text-slate-400 text-sm mb-2 block">
                                Reduce by: <span className="text-white font-semibold">{fmt(reduceAmount)}/mo</span>
                                {selectedCat && <span className="text-slate-600 ml-1">(current: {fmt(selectedCat.amount)})</span>}
                            </label>
                            <input type="range" min={100} max={sliderMax} step={100} value={Math.min(reduceAmount, sliderMax)}
                                onChange={e => setReduceAmount(+e.target.value)}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{ background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((Math.min(reduceAmount, sliderMax) - 100) / (sliderMax - 100)) * 100}%, rgba(168,85,247,0.2) ${((Math.min(reduceAmount, sliderMax) - 100) / (sliderMax - 100)) * 100}%, rgba(168,85,247,0.2) 100%)` }} />
                            <div className="flex justify-between text-xs text-slate-600 mt-1">
                                <span>₹100</span><span>{fmt(sliderMax)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-slate-400 text-sm">What you'd save:</p>
                        <motion.div key={reduceAmount} initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            className="p-5 rounded-xl text-center"
                            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <TrendingDown size={24} className="text-green-400 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-green-400 mb-1">{fmt(reduceAmount)}</div>
                            <div className="text-slate-400 text-sm">saved per month</div>
                            <div className="text-slate-500 text-xs mt-1">= {fmt(reduceAmount * 12)} per year</div>
                        </motion.div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                <div className="text-purple-400 font-semibold">{fmt(Math.max(0, savings))}</div>
                                <div className="text-slate-500 text-xs">Current savings</div>
                            </div>
                            <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <div className="text-green-400 font-semibold">{fmt(Math.max(0, savings) + reduceAmount)}</div>
                                <div className="text-slate-500 text-xs">New monthly savings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AI Budget Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        <h3 className="text-white font-semibold">AI Budget Recommendations</h3>
                    </div>
                    {aiTips.length === 0 && (
                        <button onClick={loadAiTips} disabled={aiLoading}
                            className="px-4 py-1.5 rounded-lg text-sm bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50">
                            {aiLoading ? (
                                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Analyzing...</span>
                            ) : 'Get AI Advice'}
                        </button>
                    )}
                </div>

                {aiTips.length > 0 ? (
                    <div className="space-y-3">
                        {aiTips.map((tip, idx) => (
                            <div key={idx} className="p-4 rounded-xl flex items-start gap-3"
                                style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                                <span className="text-xl flex-shrink-0">💡</span>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium mb-0.5">{tip.tip}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {tip.category && tip.category !== 'System' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">{tip.category}</span>
                                        )}
                                        {tip.save_per_month > 0 && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 flex items-center gap-1">
                                                <IndianRupee size={9} />{tip.save_per_month.toLocaleString('en-IN')}/mo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={loadAiTips} disabled={aiLoading}
                            className="w-full mt-2 px-4 py-2 rounded-lg text-sm bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:border-purple-500/30 transition-all disabled:opacity-50">
                            {aiLoading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Refreshing...</span> : '🔄 Refresh Advice'}
                        </button>
                    </div>
                ) : !aiLoading ? (
                    <p className="text-slate-500 text-sm text-center py-6">
                        Click "Get AI Advice" to get personalized budget tips based on your spending
                    </p>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-purple-400" />
                        <span className="ml-2 text-slate-400 text-sm">AI is analyzing your spending...</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
