import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Zap, Sparkles, ArrowRight, ShieldCheck, Clock, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { CreditsAPI } from '../lib/api';
import Navbar from '../components/Navbar';

const PLANS = [
    {
        id: 'starter',
        label: 'Starter',
        credits: 50000,
        price: 199,
        per: '≈ 500 AI messages',
        color: '#7c3aed',
        glow: 'rgba(124,58,237,0.25)',
        popular: false,
        badge: null,
        tagline: 'Perfect for getting started',
        features: ['AI Coach chats', 'Document analysis', 'Goal tracking', 'Email support'],
    },
    {
        id: 'pro',
        label: 'Pro',
        credits: 200000,
        price: 599,
        per: '≈ 2,000 AI messages',
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.35)',
        popular: true,
        badge: 'MOST POPULAR',
        tagline: 'Best value for regular users',
        features: ['Everything in Starter', 'Income simulations', 'Risk scenarios', 'Advanced spending insights', 'Habit AI suggestions'],
    },
    {
        id: 'elite',
        label: 'Elite',
        credits: 500000,
        price: 1299,
        per: '≈ 5,000 AI messages',
        color: '#c084fc',
        glow: 'rgba(192,132,252,0.2)',
        popular: false,
        badge: 'BEST VALUE / CREDIT',
        tagline: 'For power users & heavy usage',
        features: ['Everything in Pro', 'Unlimited document uploads', 'Priority AI queue', 'Custom financial reports', 'Early feature access'],
    },
];

const TRUST = [
    { icon: ShieldCheck, label: 'Secure checkout', sub: 'via Razorpay' },
    { icon: Clock, label: 'Instant delivery', sub: 'Credits in seconds' },
    { icon: Gift, label: 'Never expires', sub: 'Use credits anytime' },
];

const BackBtn = ({ label, onClick }: { label: string; onClick: () => void }) => {
    const { isDark } = useTheme();
    return (
        <button onClick={onClick}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
                background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)',
                border: '1px solid var(--border-hi)',
                color: 'var(--purple)'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)'; }}>
            <ArrowLeft size={15} />
            {label}
        </button>
    );
};

export default function Subscription() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const { isDark } = useTheme();
    const [selected, setSelected] = useState<string | null>(null);
    const [step, setStep] = useState<'plans' | 'confirm' | 'success'>('plans');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const plan = PLANS.find(p => p.id === selected);

    const handleBuy = async () => {
        if (!plan) return;
        setProcessing(true);
        setError('');
        try {
            await CreditsAPI.purchase(plan.id);
            await refreshUser();
            setStep('success');
        } catch (e: any) {
            setError(e.message || 'Purchase failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 0%, var(--purple-dim), transparent)' }} />

            <Navbar />

            {/* Secondary sub-bar: plan-change / credits — only shown when not on 'plans' step */}
            {step !== 'plans' && (
                <div className="sticky top-16 z-40 px-6 py-2.5 flex items-center justify-between"
                    style={{
                        background: 'var(--surface)',
                        backdropFilter: 'blur(16px)',
                        borderBottom: '1px solid var(--border)',
                    }}>
                    <BackBtn
                        label="Change plan"
                        onClick={() => setStep('plans')} />
                    {user && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                                background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.04)',
                                border: '1px solid rgba(245,158,11,0.2)',
                                color: isDark ? 'rgba(245,158,11,0.85)' : '#d97706'
                            }}>
                            <Zap size={10} style={{ color: '#f59e0b' }} />
                            {(user.ai_credits ?? 400).toLocaleString()} credits
                        </div>
                    )}
                </div>
            )}

            <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-28">
                <AnimatePresence mode="wait">

                    {/* ── Step 1: Plans ── */}
                    {step === 'plans' && (
                        <motion.div key="plans" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

                            {/* Header */}
                            <div className="text-center mb-14">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest mb-5 badge">
                                    <Sparkles size={10} /> AI CREDITS
                                </div>
                                <h1 className="font-display font-black text-1 mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', lineHeight: 1.1 }}>
                                    Power Up Your <span className="text-gradient">AI</span>
                                </h1>
                                <p className="text-sm max-w-md mx-auto mb-2 text-3">
                                    One-time purchase. No subscriptions. Credits never expire.
                                </p>
                            </div>

                            {/* Plans grid — 3 highlighted cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                                {PLANS.map((p, i) => (
                                    <motion.div key={p.id}
                                        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                        onClick={() => { setSelected(p.id); setStep('confirm'); }}
                                        className="relative flex flex-col rounded-3xl overflow-hidden cursor-pointer group"
                                        style={{
                                            background: p.popular
                                                ? (isDark ? 'linear-gradient(160deg,#160840 0%,#2a0f6e 50%,#160840 100%)' : 'rgba(124,58,237,0.03)')
                                                : 'var(--surface)',
                                            border: `1px solid ${p.popular ? 'var(--purple)' : 'var(--border)'}`,
                                            boxShadow: p.popular
                                                ? (isDark ? `0 0 0 1px rgba(168,85,247,0.15), 0 24px 72px ${p.glow}` : `0 12px 40px rgba(124,58,237,0.12)`)
                                                : (isDark ? `0 8px 32px rgba(0,0,0,0.5)` : `0 4px 20px rgba(0,0,0,0.03)`),
                                        }}>

                                        {/* Top glow bar */}
                                        <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${p.color},transparent)` }} />

                                        {/* Badge */}
                                        {p.badge && (
                                            <div className="absolute top-5 right-5 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest"
                                                style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color})`, color: '#fff' }}>
                                                {p.badge}
                                            </div>
                                        )}

                                        <div className="p-7 flex flex-col flex-1">
                                            {/* Plan label */}
                                            <p className="text-[10px] font-black tracking-[0.2em] mb-4" style={{ color: p.color }}>{p.label.toUpperCase()}</p>

                                            {/* Price */}
                                            <div className="mb-1 flex items-end gap-1.5">
                                                <span className="font-display font-black text-1" style={{ fontSize: '2.6rem', lineHeight: 1 }}>₹{p.price}</span>
                                            </div>
                                            <p className="text-[11px] mb-0.5 text-3" style={{ opacity: 0.8 }}>one-time · no recurring fees</p>

                                            {/* Credits callout */}
                                            <div className="flex items-baseline gap-1.5 mt-4 mb-1">
                                                <span className="font-display font-black text-2xl" style={{ color: p.color }}>{(p.credits / 1000).toFixed(0)}k</span>
                                                <span className="text-sm font-semibold text-1">AI Credits</span>
                                            </div>
                                            <p className="text-xs mb-6 text-3" style={{ opacity: 0.7 }}>{p.per}</p>

                                            {/* Tagline */}
                                            <p className="text-xs italic mb-5 text-3" style={{ opacity: 0.6 }}>{p.tagline}</p>

                                            {/* Features */}
                                            <ul className="space-y-2.5 flex-1 mb-8">
                                                {p.features.map(f => (
                                                    <li key={f} className="flex items-start gap-2.5 text-xs leading-snug text-2">
                                                        <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            <div className="w-full py-3.5 rounded-2xl text-xs font-black text-center uppercase tracking-widest transition-all duration-200"
                                                style={p.popular
                                                    ? { background: `linear-gradient(135deg,#7c3aed,#a855f7)`, color: '#fff', boxShadow: '0 8px 28px rgba(124,58,237,0.45)' }
                                                    : { background: 'rgba(168,85,247,0.08)', color: 'rgba(192,132,252,0.8)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                                Get {p.label} →
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Trust row */}
                            <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
                                {TRUST.map(t => (
                                    <div key={t.label} className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{ background: 'var(--purple-dim)', border: '1px solid var(--border-hi)' }}>
                                            <t.icon size={13} className="text-purple" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-1 leading-none">{t.label}</p>
                                            <p className="text-[10px] text-3" style={{ opacity: 0.8 }}>{t.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-3" style={{ opacity: 0.5 }}>
                                Payments processed securely by Razorpay · Credits are non-refundable
                            </p>
                        </motion.div>
                    )}

                    {/* ── Step 2: Confirm ── */}
                    {step === 'confirm' && plan && (
                        <motion.div key="confirm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                            className="max-w-md mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="font-display font-black text-1 text-2xl mb-2">Confirm Purchase</h2>
                                <p className="text-sm text-3">Review your order before paying</p>
                            </div>

                            <div className="card p-6 mb-4" style={{ borderColor: `${plan.color}30` }}>
                                <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${plan.color},transparent)`, marginBottom: 20, borderRadius: 1 }} />
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-1 text-lg">{plan.label} Pack</p>
                                        <p className="text-sm font-semibold" style={{ color: plan.color }}>{(plan.credits / 1000).toFixed(0)}k AI Credits</p>
                                        <p className="text-xs mt-0.5 text-3" style={{ opacity: 0.7 }}>{plan.per}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-black text-1 text-2xl">₹{plan.price}</p>
                                        <p className="text-xs text-3" style={{ opacity: 0.7 }}>one-time</p>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                                    <div className="space-y-2">
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-xs text-2">
                                                <Check size={11} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6"
                                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <Zap size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                                <p className="text-xs" style={{ color: 'rgba(16,185,129,0.7)' }}>
                                    Credits are added to your account instantly and never expire.
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4"
                                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <p className="text-xs" style={{ color: 'rgba(239,68,68,0.8)' }}>{error}</p>
                                </div>
                            )}

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleBuy} disabled={processing}
                                className="w-full py-4 rounded-xl font-semibold text-sm overflow-hidden"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}>
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                                        Processing…
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Pay ₹{plan.price} <ArrowRight size={15} />
                                    </span>
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── Step 3: Success ── */}
                    {step === 'success' && plan && (
                        <motion.div key="success"
                            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                            className="max-w-md mx-auto pt-4">

                            {/* Main success card */}
                            <div className="relative rounded-3xl overflow-hidden"
                                style={{
                                    background: isDark ? 'linear-gradient(160deg,#120840 0%,#1e0d5a 45%,#120840 100%)' : 'var(--card)',
                                    border: '1px solid var(--border-hi)',
                                    boxShadow: isDark
                                        ? '0 0 0 1px rgba(168,85,247,0.1), 0 32px 80px rgba(124,58,237,0.35), 0 8px 32px rgba(0,0,0,0.5)'
                                        : '0 12px 48px rgba(124,58,237,0.12)',
                                }}>
                                {/* Top gradient bar */}
                                <div style={{ height: 3, background: 'linear-gradient(90deg,#7c3aed,#a855f7,#c084fc,#a855f7,#7c3aed)' }} />
                                {/* Ambient inner glow */}
                                <div className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(168,85,247,0.12), transparent)' }} />

                                <div className="relative p-8">
                                    {/* Animated check */}
                                    <motion.div className="flex justify-center mb-6"
                                        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}>
                                        <div className="relative">
                                            <div className="absolute -inset-3 rounded-full pointer-events-none"
                                                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)', filter: 'blur(12px)' }} />
                                            <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 40px rgba(168,85,247,0.6)' }}>
                                                <Check size={38} className="text-white" strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Title */}
                                    <motion.div className="text-center mb-7"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                        <h2 className="font-display font-black text-1 text-3xl mb-1">Credits Added!</h2>
                                        <p className="text-sm text-3" style={{ opacity: 0.8 }}>Your purchase was successful</p>
                                    </motion.div>

                                    {/* Breakdown panel */}
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                        className="rounded-2xl p-5 mb-4"
                                        style={{
                                            background: isDark ? 'rgba(8,4,20,0.7)' : 'rgba(124,58,237,0.03)',
                                            border: '1px solid var(--border)'
                                        }}>
                                        {/* Pack row */}
                                        <div className="flex items-center justify-between py-3"
                                            style={{ borderBottom: '1px solid rgba(168,85,247,0.09)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                                                    <Sparkles size={14} style={{ color: plan.color }} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-1">{plan.label} Pack</p>
                                                    <p className="text-[10px] text-3" style={{ opacity: 0.7 }}>{plan.per}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-display font-black text-lg" style={{ color: plan.color }}>{(plan.credits / 1000).toFixed(0)}k</p>
                                                <p className="text-[10px]" style={{ color: 'rgba(160,148,210,0.4)' }}>credits</p>
                                            </div>
                                        </div>
                                        {/* Amount row */}
                                        <div className="flex items-center justify-between py-3"
                                            style={{ borderBottom: '1px solid var(--border)' }}>
                                            <span className="text-xs text-3" style={{ opacity: 0.8 }}>Amount charged</span>
                                            <span className="text-sm font-semibold text-1">₹{plan.price}</span>
                                        </div>
                                        {/* Delivery row */}
                                        <div className="flex items-center justify-between py-3">
                                            <span className="text-xs text-3" style={{ opacity: 0.8 }}>Delivery</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Instant</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Total balance */}
                                    {user && (
                                        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}
                                            className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6"
                                            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                    <Zap size={14} style={{ color: '#f59e0b' }} />
                                                </div>
                                                <span className="text-sm font-semibold text-1">Total Balance</span>
                                            </div>
                                            <span className="font-display font-black text-xl" style={{ color: 'rgba(245,158,11,0.95)' }}>
                                                {(user.ai_credits ?? 0).toLocaleString()} credits
                                            </span>
                                        </motion.div>
                                    )}

                                    {/* Back button */}
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate(-1)}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                                        className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', boxShadow: '0 8px 28px rgba(124,58,237,0.4)' }}>
                                        Back to App <ArrowRight size={15} />
                                    </motion.button>
                                </div>
                            </div>

                            <motion.p className="text-center text-[10px] mt-4 text-3" style={{ opacity: 0.5 }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                                Credits never expire · Powered by Razorpay
                            </motion.p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
