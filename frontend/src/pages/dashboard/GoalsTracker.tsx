import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Target, Trash2, TrendingUp, TrendingDown, X, Loader2,
    RefreshCw, Lightbulb, AlertTriangle, Activity, Zap, PiggyBank,
    BarChart3, Shield, ChevronDown, ChevronUp, Sparkles, DollarSign,
    Pencil, CreditCard, Check, Wallet,
} from 'lucide-react';
import { formatFullCurrency } from '../../lib/calculations';
import { GoalsAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── Types ──────────────────────────────────────────── */
interface Goal {
    id: number;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
    monthly_contribution: number;
    icon: string;
    progress_percentage: number;
    status: string;
    remaining_amount: number;
    months_left: number;
    required_monthly: number;
    delay_months: number;
}

interface GoalAI {
    goal_id: number;
    goal_title: string;
    feasibility_pct: number;
    feasibility_status: string;
    achievement_probability_pct: number;
    risk_adjusted_probability_pct: number;
    probability_explanation: string;
    savings_gap: number;
    delay_months: number;
    adjusted_completion_date: string;
    increase_needed_to_stay_on_track: number;
    budget_suggestions: string[];
    timeline_category: string;
}

interface AIAnalysis {
    goals_analysis: GoalAI[];
    prioritization: {
        ranked_goals: { goal_id: number; rank: number; recommended_monthly_allocation: number; reason: string }[];
        strategy_summary: string;
        over_allocated: boolean;
        total_recommended_monthly: number;
    };
    investment_suggestions: {
        goal_id: number;
        goal_title: string;
        suggestions: { type: string; why_it_fits: string; risk_level: string; expected_return_range: string; liquidity: string; timeline_fit: string }[];
    }[];
    income_simulation: {
        drop_10_pct: { new_disposable: number; goals_impacted: string[]; delay_added_months: number; adjustment_needed: string };
        drop_20_pct: { new_disposable: number; goals_impacted: string[]; delay_added_months: number; adjustment_needed: string };
        increase_10_pct: { new_disposable: number; time_saved_months: number; benefit: string };
    };
    coaching: { messages: string[]; weekly_challenge: string; automatic_transfer_suggestion: string; habit_tip: string };
    overall_summary: string;
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
};

/* ─── Gauge Component ────────────────────────────────── */
function MiniGauge({ value, size = 60, color = '#a855f7', label, isDark = true }: { value: number; size?: number; color?: string; label?: string; isDark?: boolean }) {
    const r = size * 0.38;
    const circ = 2 * Math.PI * r;
    const dash = circ * 0.75;
    const offset = dash - (Math.min(value, 100) / 100) * dash;
    const cx = size / 2, cy = size / 2;
    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`}>
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                    fill="none" stroke="rgba(100,100,120,0.15)" strokeWidth={size * 0.08} strokeLinecap="round" />
                <motion.path d={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
                    fill="none" stroke={color} strokeWidth={size * 0.08} strokeLinecap="round"
                    strokeDasharray={dash} initial={{ strokeDashoffset: dash }}
                    animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill={isDark ? 'white' : '#1e293b'}>{value}%</text>
            </svg>
            {label && <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>}
        </div>
    );
}

/* ─── Goal Card ──────────────────────────────────────── */
function GoalCard({ goal, ai, onDelete, onUpdate, isDark }: { goal: Goal; ai?: GoalAI; onDelete: () => void; onUpdate: (id: number, data: Record<string, any>) => Promise<void>; isDark: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [showAddSavings, setShowAddSavings] = useState(false);
    const [savingsAmount, setSavingsAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        target_amount: String(goal.target_amount),
        monthly_contribution: String(goal.monthly_contribution),
        deadline: goal.deadline,
        priority: goal.priority,
    });
    const [editing, setEditing] = useState(false);

    const pStyle = PRIORITY_STYLES[goal.priority] || PRIORITY_STYLES.medium;
    const progressPct = goal.progress_percentage;
    const feasColor = ai ? (ai.feasibility_pct >= 70 ? '#10b981' : ai.feasibility_pct >= 40 ? '#f59e0b' : '#ef4444') : '#a855f7';

    async function handleAddSavings() {
        const amt = +savingsAmount;
        if (!amt || amt <= 0) return;
        setSaving(true);
        try {
            await onUpdate(goal.id, { current_amount: goal.current_amount + amt });
            setSavingsAmount('');
            setShowAddSavings(false);
        } catch { /* ignore */ }
        finally { setSaving(false); }
    }

    async function handleEditSave() {
        setEditing(true);
        try {
            await onUpdate(goal.id, {
                target_amount: +editForm.target_amount,
                monthly_contribution: +editForm.monthly_contribution,
                deadline: editForm.deadline,
                priority: editForm.priority,
            });
            setShowEdit(false);
        } catch { /* ignore */ }
        finally { setEditing(false); }
    }

    return (
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl text-xl flex items-center justify-center"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        {goal.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                            {goal.priority.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => { setShowEdit(e => !e); setShowAddSavings(false); }} className="text-slate-600 hover:text-blue-400 p-1" title="Edit Goal">
                        <Pencil size={13} />
                    </button>
                    <button onClick={() => setExpanded(e => !e)} className="text-slate-600 hover:text-purple-400 p-1">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={onDelete} className="text-slate-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span>{formatFullCurrency(goal.current_amount)}</span>
                    <span>{formatFullCurrency(goal.target_amount)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, #a855f780, #a855f7)` }} />
                </div>
                <div className="flex justify-between items-center mt-1">
                    <button onClick={() => { setShowAddSavings(s => !s); setShowEdit(false); }}
                        className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md transition-all bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                        <Wallet size={10} /> Add Savings
                    </button>
                    <span className="text-xs font-medium text-purple-400">{progressPct}% complete</span>
                </div>
            </div>

            {/* Add Savings inline form */}
            <AnimatePresence>
                {showAddSavings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <p className="text-[10px] text-green-400 mb-2 font-medium uppercase tracking-wide">Add money to this goal</p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                    <input type="number" placeholder="Amount" className="input-field text-sm pl-6 w-full" min="0"
                                        value={savingsAmount} onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setSavingsAmount(v); }}
                                        onKeyDown={e => e.key === 'Enter' && handleAddSavings()} />
                                </div>
                                <button onClick={handleAddSavings} disabled={saving || !savingsAmount}
                                    className="btn-primary text-xs px-3 py-2 flex items-center gap-1">
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                                </button>
                            </div>
                            {/* Quick amounts */}
                            <div className="flex gap-1.5 mt-2">
                                {[1000, 5000, 10000, 25000].map(amt => (
                                    <button key={amt} onClick={() => setSavingsAmount(String(amt))}
                                        className={`text-[10px] px-2 py-1 rounded-md border transition-all ${+savingsAmount === amt ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                                        +₹{amt.toLocaleString('en-IN')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Goal inline form */}
            <AnimatePresence>
                {showEdit && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <p className="text-[10px] text-blue-400 mb-2 font-medium uppercase tracking-wide">Edit Goal Details</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-0.5 block">Target (₹)</label>
                                    <input type="number" className="input-field text-xs w-full" min="0" value={editForm.target_amount}
                                        onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setEditForm(f => ({ ...f, target_amount: v })); }} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-0.5 block">Monthly (₹)</label>
                                    <input type="number" className="input-field text-xs w-full" min="0" value={editForm.monthly_contribution}
                                        onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setEditForm(f => ({ ...f, monthly_contribution: v })); }} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-0.5 block">Deadline</label>
                                    <input type="date" className="input-field text-xs w-full" value={editForm.deadline}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-0.5 block">Priority</label>
                                    <select className="input-field text-xs w-full" value={editForm.priority}
                                        onChange={e => setEditForm(f => ({ ...f, priority: e.target.value as 'high' | 'medium' | 'low' }))}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleEditSave} disabled={editing}
                                className="btn-aqua text-xs px-3 py-1.5 mt-2 flex items-center gap-1">
                                {editing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Update Goal
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Required/mo</div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{formatFullCurrency(goal.required_monthly)}</div>
                </div>
                <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Contributing/mo</div>
                    <div className="font-bold text-sm" style={{ color: goal.monthly_contribution >= goal.required_monthly ? '#10b981' : '#f59e0b' }}>
                        {formatFullCurrency(goal.monthly_contribution)}
                    </div>
                </div>
                <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(168,85,247,0.06)' }}>
                    <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{goal.delay_months > 0 ? 'Delay' : 'On Track'}</div>
                    <div className={`font-bold text-sm ${goal.delay_months > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {goal.delay_months > 0 ? `+${goal.delay_months} mo` : `${goal.months_left} mo left`}
                    </div>
                </div>
            </div>

            {/* AI insights (if available) */}
            {ai && (
                <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <MiniGauge value={ai.feasibility_pct} size={52} color={feasColor} label="Feasibility" isDark={isDark} />
                    <MiniGauge value={ai.achievement_probability_pct} size={52} color="#3b82f6" label="Probability" isDark={isDark} />
                    <div className="flex-1 ml-1">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mb-1 ${ai.feasibility_status === 'Highly Feasible' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ai.feasibility_status === 'Moderately Feasible' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {ai.feasibility_status}
                        </span>
                        {ai.savings_gap > 0 && (
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Gap: {formatFullCurrency(ai.savings_gap)}/mo</p>
                        )}
                    </div>
                </div>
            )}

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && ai && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ai.probability_explanation}</p>
                            {ai.budget_suggestions?.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>💡 Budget Tips</p>
                                    {ai.budget_suggestions.map((s, i) => (
                                        <p key={i} className="text-xs ml-3" style={{ color: 'var(--text-secondary, var(--text-primary))' }}>• {s}</p>
                                    ))}
                                </div>
                            )}
                            {ai.adjusted_completion_date && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Expected completion: <span style={{ color: 'var(--text-primary)' }}>{ai.adjusted_completion_date}</span></p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function GoalsTracker() {
    const { isDark } = useTheme();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [aiPlan, setAiPlan] = useState<AIAnalysis | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [simResult, setSimResult] = useState<any>(null);
    const [simPct, setSimPct] = useState('');
    const [simLoading, setSimLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'simulate' | 'coach'>('overview');
    const [showExplain, setShowExplain] = useState(false);
    const [form, setForm] = useState({
        name: '', targetAmount: '', currentAmount: '', monthlyContribution: '',
        deadline: '', priority: 'medium', icon: '🎯',
    });

    /* Load goals from backend */
    const loadGoals = useCallback(async () => {
        setError(null);
        try {
            const data = await GoalsAPI.list();
            const raw = data.results || (Array.isArray(data) ? data : []);
            setGoals(raw.map((g: any) => ({
                id: g.id,
                title: g.title,
                target_amount: +g.target_amount,
                current_amount: +g.current_amount,
                deadline: g.deadline || '',
                priority: g.priority || 'medium',
                monthly_contribution: +g.monthly_contribution || 0,
                icon: g.icon || '🎯',
                progress_percentage: g.progress_percentage || 0,
                status: g.status || 'in_progress',
                remaining_amount: +g.remaining_amount || 0,
                months_left: g.months_left || 0,
                required_monthly: +g.required_monthly || 0,
                delay_months: g.delay_months || 0,
            })));
        } catch (err: any) {
            console.error('Goals load failed:', err);
            setError(err?.message || 'Failed to load goals. Please check your connection and try again.');
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadGoals(); }, [loadGoals]);

    /* Load AI plan */
    function loadAIPlan(refresh = false) {
        setAiLoading(true);
        GoalsAPI.getAIPlan(refresh)
            .then(d => { if (d && !d.error) setAiPlan(d); })
            .catch(e => console.error('AI plan failed:', e))
            .finally(() => setAiLoading(false));
    }

    useEffect(() => {
        if (!loading && goals.length > 0) loadAIPlan();
    }, [loading, goals.length]);

    /* Add goal */
    async function handleAdd() {
        if (!form.name || !form.targetAmount || !form.deadline) return;
        try {
            await GoalsAPI.create({
                title: form.name,
                target_amount: +form.targetAmount,
                current_amount: +form.currentAmount || 0,
                deadline: form.deadline,
                priority: form.priority,
                monthly_contribution: +form.monthlyContribution || 0,
                icon: form.icon,
            });
            await loadGoals();
        } catch { /* ignore */ }
        setShowModal(false);
        setForm({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', deadline: '', priority: 'medium', icon: '🎯' });
    }

    async function handleDelete(id: number) {
        try { await GoalsAPI.delete(id); await loadGoals(); } catch { setGoals(p => p.filter(g => g.id !== id)); }
    }

    /* Update goal (add savings, edit details) */
    async function handleUpdate(id: number, data: Record<string, any>) {
        await GoalsAPI.update(id, data);
        await loadGoals();
    }

    /* Income simulation */
    async function runSimulation() {
        if (!simPct) return;
        setSimLoading(true);
        try {
            const r = await GoalsAPI.simulateIncome(+simPct);
            setSimResult(r);
        } catch (e) { console.error(e); }
        finally { setSimLoading(false); }
    }

    const totalGoal = goals.reduce((s, g) => s + g.target_amount, 0);
    const totalAchieved = goals.reduce((s, g) => s + g.current_amount, 0);
    const totalContribution = goals.reduce((s, g) => s + g.monthly_contribution, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-purple-400" />
                <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Loading goals...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <Target size={18} className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Financial Goals</p>
                        <h1 className="font-display font-bold text-2xl text-gradient">Goal-Based Planner</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => loadAIPlan(true)} disabled={aiLoading}
                        className="btn-aqua text-xs px-3 py-2 flex items-center gap-1.5">
                        <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} />
                        {aiLoading ? 'Analyzing...' : 'AI Analyze'}
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
                        <Plus size={14} /> Add Goal
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Target', value: formatFullCurrency(totalGoal), icon: Target, color: '#a855f7' },
                    { label: 'Total Saved', value: formatFullCurrency(totalAchieved), icon: PiggyBank, color: '#10b981' },
                    { label: 'Overall Progress', value: totalGoal > 0 ? `${Math.round((totalAchieved / totalGoal) * 100)}%` : '0%', icon: BarChart3, color: '#3b82f6' },
                    { label: 'Monthly Committed', value: formatFullCurrency(totalContribution), icon: DollarSign, color: '#f59e0b' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="card-glow p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon size={14} style={{ color: s.color }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        </div>
                        <div className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* AI Overall Summary */}
            {aiPlan?.overall_summary && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="card-glow p-4 flex items-start gap-3"
                    style={{ background: isDark ? 'rgba(168,85,247,0.04)' : 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <Sparkles size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary, var(--text-primary))' }}>{aiPlan.overall_summary}</p>
                        <button onClick={() => setShowExplain(e => !e)} className="text-[10px] text-purple-400 mt-1 hover:underline">
                            {showExplain ? 'Hide Details' : '📖 Explain in Simple Language'}
                        </button>
                        {showExplain && aiPlan.prioritization?.strategy_summary && (
                            <p className="text-xs mt-2 p-2 rounded-lg" style={{ color: 'var(--text-muted)', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>{aiPlan.prioritization.strategy_summary}</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Error State */}
            {error && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="card-glow p-6 text-center"
                    style={{ background: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
                    <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Failed to load goals</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    <button onClick={() => { setLoading(true); loadGoals(); }}
                        className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1.5">
                        <RefreshCw size={14} /> Retry
                    </button>
                </motion.div>
            )}

            {/* Empty State */}
            {!error && goals.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="card-glow p-10 text-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        🎯
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No goals yet</h3>
                    <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Start by creating your first financial goal. Set targets for emergency funds,
                        vacations, investments, or anything you're saving for.
                    </p>
                    <button onClick={() => setShowModal(true)}
                        className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                        <Plus size={16} /> Create Your First Goal
                    </button>
                </motion.div>
            )}

            {/* Goals Grid */}
            {goals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {goals.map(goal => {
                            const ai = aiPlan?.goals_analysis?.find(a => a.goal_id === goal.id);
                            return <GoalCard key={goal.id} goal={goal} ai={ai} onDelete={() => handleDelete(goal.id)} onUpdate={handleUpdate} isDark={isDark} />;
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Tab navigation for AI sections */}
            {(aiPlan || goals.length > 0) && (
                <div className="flex gap-1 p-1 card-glow w-fit" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    {[
                        { key: 'overview', label: 'Prioritization', icon: Target },
                        { key: 'invest', label: 'Investments', icon: TrendingUp },
                        { key: 'simulate', label: 'Simulator', icon: Zap },
                        { key: 'coach', label: 'Coaching', icon: Sparkles },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                            className={`text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${activeTab === t.key ? 'bg-purple-500/20 text-purple-400' : 'hover:text-slate-300'}`}
                            style={activeTab !== t.key ? { color: 'var(--text-muted)' } : {}}>
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            )}

            {/* AI Loading */}
            {aiLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow p-6 text-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <Loader2 size={24} className="animate-spin text-purple-400 mx-auto mb-2" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI is analyzing your goals and building a personalized plan...</p>
                </motion.div>
            )}

            {/* ─── TAB: Prioritization ──────────── */}
            {activeTab === 'overview' && aiPlan?.prioritization && !aiLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Activity size={16} className="text-purple-400" /> Multi-Goal Prioritization
                    </h3>
                    {aiPlan.prioritization.over_allocated && (
                        <div className="mb-3 p-3 rounded-xl flex items-start gap-2"
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-300">You're over-allocating! Total commitments exceed your disposable income. Consider adjusting contributions.</p>
                        </div>
                    )}
                    <div className="space-y-3">
                        {aiPlan.prioritization.ranked_goals?.map((rg) => {
                            const g = goals.find(gl => gl.id === rg.goal_id);
                            return (
                                <div key={rg.goal_id} className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}>
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm">
                                        #{rg.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g?.title || `Goal #${rg.goal_id}`}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{rg.reason}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-purple-400">{formatFullCurrency(rg.recommended_monthly_allocation)}</p>
                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/month recommended</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {aiPlan.prioritization.total_recommended_monthly > 0 && (
                        <div className="mt-3 pt-3 flex justify-between text-sm" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total recommended allocation</span>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatFullCurrency(aiPlan.prioritization.total_recommended_monthly)}/mo</span>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── TAB: Investment Suggestions ──────────── */}
            {activeTab === 'invest' && aiPlan?.investment_suggestions && !aiLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {aiPlan.investment_suggestions.map((ig) => (
                        <div key={ig.goal_id} className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <TrendingUp size={16} className="text-green-400" /> {ig.goal_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ig.suggestions?.map((s, i) => (
                                    <div key={i} className="p-4 rounded-xl"
                                        style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.type}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.risk_level === 'Low' ? 'bg-green-500/10 text-green-400 border-green-500/20' : s.risk_level === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                {s.risk_level} Risk
                                            </span>
                                        </div>
                                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{s.why_it_fits}</p>
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Expected Return:</span>
                                                <p className="text-green-400 font-medium">{s.expected_return_range}</p>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Liquidity:</span>
                                                <p style={{ color: 'var(--text-primary)' }}>{s.liquidity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] mt-3 italic" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                                ⚠️ These are general suggestions for educational purposes only. They are not buy/sell recommendations. Past returns don't guarantee future results.
                            </p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* ─── TAB: Income Simulator ──────────── */}
            {activeTab === 'simulate' && !aiLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Simulation input */}
                    <div className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Zap size={16} className="text-yellow-400" /> Income Change Simulator
                        </h3>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Income Change (%)</label>
                                <input type="number" className="input-field text-sm" placeholder="e.g. -20 or +10"
                                    value={simPct} onChange={e => setSimPct(e.target.value)} />
                            </div>
                            <button onClick={runSimulation} disabled={simLoading}
                                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-1.5">
                                {simLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Simulate
                            </button>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {[-20, -10, 10, 20].map(v => (
                                <button key={v} onClick={() => { setSimPct(String(v)); }}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${+simPct === v ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'hover:text-slate-300'}`}
                                    style={+simPct !== v ? { borderColor: isDark ? 'rgba(100,116,139,0.3)' : 'rgba(0,0,0,0.1)', color: 'var(--text-muted)' } : {}}>
                                    {v > 0 ? '+' : ''}{v}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simulation result */}
                    {simResult && (
                        <div className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Simulation Result ({simResult.change_pct > 0 ? '+' : ''}{simResult.change_pct}% income change)</h4>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)' }}>
                                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Original Disposable</p>
                                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatFullCurrency(simResult.original_disposable)}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: simResult.change_pct < 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)' }}>
                                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>New Disposable</p>
                                    <p className={`font-bold ${simResult.change_pct < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {formatFullCurrency(simResult.new_disposable)}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {simResult.goals_impact?.map((gi: any) => (
                                    <div key={gi.goal_id} className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: gi.needs_adjustment ? 'rgba(239,68,68,0.06)' : 'rgba(168,85,247,0.04)', border: `1px solid ${gi.needs_adjustment ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.08)'}` }}>
                                        <div>
                                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{gi.title}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {formatFullCurrency(gi.original_contribution)} → {formatFullCurrency(gi.adjusted_contribution)}/mo
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {gi.delay_months > 0 ? (
                                                <span className="text-xs text-yellow-400 font-medium">+{gi.delay_months} mo delay</span>
                                            ) : (
                                                <span className="text-xs text-green-400 font-medium">On track</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pre-built AI simulations */}
                    {aiPlan?.income_simulation && (
                        <div className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <BarChart3 size={14} className="text-purple-400" /> AI Pre-Computed Scenarios
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { label: 'Income -10%', data: aiPlan.income_simulation.drop_10_pct, color: '#f59e0b', icon: TrendingDown },
                                    { label: 'Income -20%', data: aiPlan.income_simulation.drop_20_pct, color: '#ef4444', icon: TrendingDown },
                                    { label: 'Income +10%', data: aiPlan.income_simulation.increase_10_pct, color: '#10b981', icon: TrendingUp },
                                ].map((sc) => (
                                    <div key={sc.label} className="p-4 rounded-xl"
                                        style={{ background: `${sc.color}08`, border: `1px solid ${sc.color}20` }}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <sc.icon size={13} style={{ color: sc.color }} />
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{sc.label}</span>
                                        </div>
                                        <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                                            New disposable: <span style={{ color: 'var(--text-primary)' }}>{formatFullCurrency(sc.data?.new_disposable || 0)}</span>
                                        </p>
                                        {'delay_added_months' in (sc.data || {}) && (
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                Delay: <span className="font-medium" style={{ color: sc.color }}>+{(sc.data as any).delay_added_months} months</span>
                                            </p>
                                        )}
                                        {'time_saved_months' in (sc.data || {}) && (
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                Time saved: <span className="text-green-400 font-medium">{(sc.data as any).time_saved_months} months</span>
                                            </p>
                                        )}
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                            {(sc.data as any)?.adjustment_needed || (sc.data as any)?.benefit || ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── TAB: Behavioral Coaching ──────────── */}
            {activeTab === 'coach' && aiPlan?.coaching && !aiLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Sparkles size={16} className="text-purple-400" /> AI Behavioral Coach
                        </h3>
                        <div className="space-y-3">
                            {aiPlan.coaching.messages?.map((msg, i) => (
                                <div key={i} className="p-3 rounded-xl flex items-start gap-3"
                                    style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}>
                                    <Lightbulb size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm" style={{ color: 'var(--text-secondary, var(--text-primary))' }}>{msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiPlan.coaching.weekly_challenge && (
                            <div className="card-glow p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={14} className="text-yellow-400" />
                                    <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Weekly Challenge</span>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{aiPlan.coaching.weekly_challenge}</p>
                            </div>
                        )}
                        {aiPlan.coaching.automatic_transfer_suggestion && (
                            <div className="card-glow p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={14} className="text-green-400" />
                                    <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Auto-Transfer</span>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{aiPlan.coaching.automatic_transfer_suggestion}</p>
                            </div>
                        )}
                        {aiPlan.coaching.habit_tip && (
                            <div className="card-glow p-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={14} className="text-blue-400" />
                                    <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Habit Tip</span>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{aiPlan.coaching.habit_tip}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ─── Add Goal Modal ──────────── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100]">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                            <div className="card-glow p-6 w-full max-w-md pointer-events-auto"
                                style={{ background: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)' }}
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Target size={18} className="text-purple-400" /> New Financial Goal
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="hover:text-white" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-400 mb-1.5 block">Goal Name</label>
                                            <input className="input-field text-sm" placeholder="e.g. Buy Car, Emergency Fund"
                                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1.5 block">Icon</label>
                                            <input className="input-field text-sm text-center" placeholder="🎯"
                                                value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1.5 block">Target Amount (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="500000" min="0"
                                                value={form.targetAmount} onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm(f => ({ ...f, targetAmount: v })); }} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1.5 block">Current Savings (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="0" min="0"
                                                value={form.currentAmount} onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm(f => ({ ...f, currentAmount: v })); }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1.5 block">Monthly Contribution (₹)</label>
                                            <input type="number" className="input-field text-sm" placeholder="5000" min="0"
                                                value={form.monthlyContribution} onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm(f => ({ ...f, monthlyContribution: v })); }} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1.5 block">Target Date</label>
                                            <input type="date" className="input-field text-sm"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 mb-1.5 block">Priority Level</label>
                                        <select className="input-field text-sm" value={form.priority}
                                            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                            <option value="high">🔴 High — Must achieve</option>
                                            <option value="medium">🟡 Medium — Important</option>
                                            <option value="low">🟢 Low — Nice to have</option>
                                        </select>
                                    </div>
                                    <button onClick={handleAdd} className="btn-primary w-full mt-2">Create Goal</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
