import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, DollarSign, ShoppingCart, Plus, Trash2, ArrowRight,
    TrendingUp, CheckCircle, Loader2, Sparkles, Home, Car,
    Utensils, Wifi, Heart, BookOpen, Shirt, Film, Zap,
} from 'lucide-react';
import { OnboardingAPI, OnboardingData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SPENDING_CATEGORIES = [
    { value: 'rent', label: 'Rent / Housing', icon: Home, color: '#a855f7' },
    { value: 'food', label: 'Food & Groceries', icon: Utensils, color: '#10b981' },
    { value: 'transport', label: 'Transport / Fuel', icon: Car, color: '#3b82f6' },
    { value: 'utilities', label: 'Utilities / Bills', icon: Wifi, color: '#f59e0b' },
    { value: 'healthcare', label: 'Healthcare', icon: Heart, color: '#ef4444' },
    { value: 'education', label: 'Education', icon: BookOpen, color: '#8b5cf6' },
    { value: 'shopping', label: 'Shopping', icon: Shirt, color: '#ec4899' },
    { value: 'entertainment', label: 'Entertainment', icon: Film, color: '#06b6d4' },
    { value: 'insurance', label: 'Insurance / EMI', icon: Zap, color: '#f97316' },
    { value: 'other', label: 'Other', icon: ShoppingCart, color: '#64748b' },
];

interface SpendingEntry {
    category: string;
    amount: string;
    description: string;
}

export default function Onboarding() {
    const { refreshUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [income, setIncome] = useState('');
    const [spending, setSpending] = useState<SpendingEntry[]>([
        { category: 'rent', amount: '', description: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function addSpending() {
        setSpending(s => [...s, { category: 'food', amount: '', description: '' }]);
    }

    function removeSpending(index: number) {
        setSpending(s => s.filter((_, i) => i !== index));
    }

    function updateSpending(index: number, field: keyof SpendingEntry, value: string) {
        setSpending(s => s.map((e, i) => i === index ? { ...e, [field]: value } : e));
    }

    async function handleSubmit() {
        if (!firstName.trim() || !income || +income <= 0) {
            setError('Please fill in your name and income.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data: OnboardingData = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                monthly_income: +income,
                spending: spending
                    .filter(s => s.amount && +s.amount > 0)
                    .map(s => ({
                        category: s.category,
                        amount: +s.amount,
                        description: s.description || `${s.category} expense`,
                    })),
            };

            await OnboardingAPI.submit(data);
            await refreshUser();
            navigate('/dashboard', { replace: true });
        } catch (e: any) {
            setError(e.message || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    }

    const totalSpending = spending.reduce((s, e) => s + (+e.amount || 0), 0);
    const savings = (+income || 0) - totalSpending;

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: isDark ? '#0a0a1a' : '#f1f5f9' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6 justify-center">
                    <img src="/logo.png" alt="Finexa" className="w-10 h-10 rounded-xl object-contain" />
                    <span className="font-bold text-2xl" style={{ color: isDark ? '#fff' : '#0f172a' }}>Finexa</span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'rgba(168,85,247,0.12)' }}>
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: step >= s ? '100%' : '0%' }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                            />
                        </div>
                    ))}
                </div>

                <div className="card-glow p-6" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)' }}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <motion.div key="step1"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                        <User size={18} style={{ color: '#a855f7' }} />
                                    </div>
                                    <div>
                                        <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome! Let's get started</h2>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tell us a bit about yourself</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`text-xs mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>First Name *</label>
                                        <input className="input-field text-sm w-full" placeholder="Your first name"
                                            value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={`text-xs mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Name</label>
                                        <input className="input-field text-sm w-full" placeholder="Your last name (optional)"
                                            value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={`text-xs mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Income (₹) *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input type="number" className="input-field text-sm w-full pl-7" placeholder="e.g. 50000" min="0"
                                                value={income} onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setIncome(v); }} />
                                        </div>
                                        <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Your total monthly salary/income before deductions</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!firstName.trim() || !income || +income <= 0) {
                                            setError('Please enter your name and income.');
                                            return;
                                        }
                                        setError('');
                                        setStep(2);
                                    }}
                                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Monthly Spending */}
                        {step === 2 && (
                            <motion.div key="step2"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <ShoppingCart size={18} style={{ color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Monthly Spending</h2>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add your regular monthly expenses (approximate)</p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                                    {spending.map((entry, idx) => {
                                        const cat = SPENDING_CATEGORIES.find(c => c.value === entry.category);
                                        const CatIcon = cat?.icon || ShoppingCart;
                                        return (
                                            <motion.div key={idx} layout
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="p-3 rounded-xl"
                                                style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CatIcon size={14} style={{ color: cat?.color || '#a855f7' }} />
                                                    <select className="input-field text-xs flex-1" value={entry.category}
                                                        onChange={e => updateSpending(idx, 'category', e.target.value)}>
                                                        {SPENDING_CATEGORIES.map(c => (
                                                            <option key={c.value} value={c.value}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                    {spending.length > 1 && (
                                                        <button onClick={() => removeSpending(idx)}
                                                            className={`hover:text-red-400 p-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="relative">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                                        <input type="number" className="input-field text-xs w-full pl-6"
                                                            placeholder="Amount" min="0" value={entry.amount}
                                                            onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) updateSpending(idx, 'amount', v); }} />
                                                    </div>
                                                    <input className="input-field text-xs w-full"
                                                        placeholder="Note (optional)" value={entry.description}
                                                        onChange={e => updateSpending(idx, 'description', e.target.value)} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <button onClick={addSpending}
                                    className={`w-full mt-3 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-dashed transition-all hover:text-purple-400 hover:border-purple-500/30 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                                    style={{ borderColor: isDark ? 'rgba(100,116,139,0.3)' : 'rgba(100,116,139,0.25)' }}>
                                    <Plus size={12} /> Add Another Expense
                                </button>

                                <div className="flex gap-2 mt-5">
                                    <button onClick={() => setStep(1)}
                                        className="btn-ghost px-4 py-2 text-sm flex-1">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Review <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review & Submit */}
                        {step === 3 && (
                            <motion.div key="step3"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <CheckCircle size={18} style={{ color: '#3b82f6' }} />
                                    </div>
                                    <div>
                                        <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Review Your Profile</h2>
                                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Make sure everything looks good</p>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}>
                                        <p className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</p>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{firstName} {lastName}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl text-center" style={{ background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)'}` }}>
                                            <p className={`text-[10px] mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Income</p>
                                            <p className={`font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>₹{(+income || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl text-center" style={{ background: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.2)'}` }}>
                                            <p className={`text-[10px] mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Expenses</p>
                                            <p className={`font-bold text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>₹{totalSpending.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="p-3 rounded-xl text-center" style={{ background: savings >= 0 ? (isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)') : (isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)'), border: `1px solid ${savings >= 0 ? (isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.2)') : (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.2)')}` }}>
                                            <p className={`text-[10px] mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Savings</p>
                                            <p className={`font-bold text-sm ${savings >= 0 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                                ₹{savings.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    {spending.filter(s => +s.amount > 0).length > 0 && (
                                        <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)' }}>
                                            <p className={`text-[10px] uppercase tracking-wide mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Expense Breakdown</p>
                                            <div className="space-y-1.5">
                                                {spending.filter(s => +s.amount > 0).map((s, i) => {
                                                    const cat = SPENDING_CATEGORIES.find(c => c.value === s.category);
                                                    const CatIcon = cat?.icon || ShoppingCart;
                                                    return (
                                                        <div key={i} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CatIcon size={12} style={{ color: cat?.color }} />
                                                                <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{cat?.label || s.category}</span>
                                                            </div>
                                                            <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{(+s.amount).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <p className="text-xs text-red-400 mt-3 p-2 rounded-lg bg-red-500/10">{error}</p>
                                )}

                                <div className="flex gap-2 mt-5">
                                    <button onClick={() => setStep(2)} disabled={loading}
                                        className="btn-ghost px-4 py-2 text-sm flex-1">
                                        Back
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <><Loader2 size={14} className="animate-spin" /> Setting up...</>
                                        ) : (
                                            <><Sparkles size={14} /> Complete Setup</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className={`text-center text-[10px] mt-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    You can always update this information later in Settings
                </p>
            </motion.div>
        </div>
    );
}
