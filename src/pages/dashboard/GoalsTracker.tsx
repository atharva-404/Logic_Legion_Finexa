import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, TrendingUp, Clock, X } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { calculateGoalFeasibility, formatFullCurrency } from '../../lib/calculations';
import { Goal } from '../../lib/mockData';

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
    const feas = calculateGoalFeasibility(goal.targetAmount, goal.currentAmount, goal.monthlyTarget, goal.deadline);
    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
                        style={{ background: `${goal.color}20`, border: `1px solid ${goal.color}30` }}>
                        {goal.icon}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{goal.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${goal.priority === 'high' ? 'bg-red-500/10 text-red-400' : goal.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                            {goal.priority.toUpperCase()} PRIORITY
                        </span>
                    </div>
                </div>
                <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{formatFullCurrency(goal.currentAmount)}</span>
                    <span>{formatFullCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                        animate={{ width: `${feas.progressPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, ${goal.color}80, ${goal.color})` }} />
                </div>
                <div className="text-right text-xs mt-1 font-medium" style={{ color: goal.color }}>{feas.progressPct}% complete</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={11} className="text-purple-400" />
                        <span className="text-xs text-slate-500">Achievement Probability</span>
                    </div>
                    <div className="font-bold text-white">{feas.feasibility}%</div>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={11} className="text-purple-400" />
                        <span className="text-xs text-slate-500">
                            {feas.delayMonths > 0 ? 'Delay Estimate' : 'Months Left'}
                        </span>
                    </div>
                    <div className={`font-bold ${feas.delayMonths > 0 ? 'text-yellow-400' : 'text-white'}`}>
                        {feas.delayMonths > 0 ? `+${feas.delayMonths} mo delay` : `${feas.monthsLeft} months`}
                    </div>
                </div>
            </div>

            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                <span>Monthly target: <span className="text-purple-400 font-medium">{formatFullCurrency(goal.monthlyTarget)}</span></span>
                <span>Needed: <span className="text-slate-300 font-medium">{formatFullCurrency(feas.requiredMonthly)}/mo</span></span>
            </div>
        </motion.div>
    );
}

export default function GoalsTracker() {
    const { goals, addGoal, removeGoal } = useFinancialStore();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', monthlyTarget: '', deadline: '', priority: 'medium', icon: '🎯' });

    function handleAdd() {
        if (!form.name || !form.targetAmount || !form.deadline) return;
        const newGoal: Goal = {
            id: `g_${Date.now()}`,
            name: form.name,
            targetAmount: +form.targetAmount,
            currentAmount: +form.currentAmount || 0,
            monthlyTarget: +form.monthlyTarget || 5000,
            deadline: form.deadline,
            priority: form.priority as Goal['priority'],
            color: '#a855f7',
            icon: form.icon,
        };
        addGoal(newGoal);
        setShowModal(false);
        setForm({ name: '', targetAmount: '', currentAmount: '', monthlyTarget: '', deadline: '', priority: 'medium', icon: '🎯' });
    }

    const totalGoalAmount = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalAchieved = goals.reduce((s, g) => s + g.currentAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl text-white">Goals Tracker</h1>
                    <p className="text-slate-500 text-sm mt-1">{goals.length} active goals · Track your milestones</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary text-sm px-4 py-2">
                    <Plus size={16} /> Add Goal
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Goal Amount', value: formatFullCurrency(totalGoalAmount), color: '#a855f7' },
                    { label: 'Total Achieved', value: formatFullCurrency(totalAchieved), color: '#10b981' },
                    { label: 'Overall Progress', value: `${Math.round((totalAchieved / totalGoalAmount) * 100)}%`, color: '#3b82f6' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-4 text-center">
                        <div className="font-bold text-xl mb-1" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-slate-500 text-xs">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Goals grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onDelete={() => removeGoal(goal.id)} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)} className="fixed inset-0 z-40 bg-black/70" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="glass-card p-6 w-full max-w-md">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-white font-semibold text-lg flex items-center gap-2"><Target size={18} className="text-purple-400" /> New Goal</h3>
                                    <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Goal Name</label>
                                            <input className="input-field text-sm" placeholder="e.g. New Car" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Icon</label>
                                            <input className="input-field text-sm" placeholder="🏠" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Target Amount (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="100000" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Current Saved (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="0" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Monthly Contribution (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="5000" value={form.monthlyTarget} onChange={e => setForm(f => ({ ...f, monthlyTarget: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Target Date</label>
                                            <input type="date" className="input-field text-sm" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1 block">Priority</label>
                                        <select className="input-field text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                    <button onClick={handleAdd} className="btn-primary w-full mt-2">Add Goal</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
