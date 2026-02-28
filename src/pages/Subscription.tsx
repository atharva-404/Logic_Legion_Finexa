import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PLANS = [
    { id: 'starter', label: 'Starter', credits: 50000, price: 199, per: '≈ 500 AI messages', color: '#7c3aed', popular: false, features: ['AI Coach chats', 'Document analysis', 'Goal tracking', 'Email support'] },
    { id: 'pro', label: 'Pro', credits: 200000, price: 599, per: '≈ 2,000 AI messages', color: '#a855f7', popular: true, features: ['Everything in Starter', 'Income simulations', 'Risk scenarios', 'Advanced spending insights', 'Habit AI suggestions'] },
    { id: 'elite', label: 'Elite', credits: 500000, price: 1299, per: '≈ 5,000 AI messages', color: '#c084fc', popular: false, features: ['Everything in Pro', 'Unlimited document uploads', 'Priority AI queue', 'Custom financial reports', 'Early feature access'] },
];

const BackBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'rgba(192,132,252,0.9)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.18)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.1)'; }}>
        <ArrowLeft size={15} />
        {label}
    </button>
);

export default function Subscription() {
    const navigate = useNavigate();
    const { user, addCredits } = useAuth();
    const [selected, setSelected] = useState<string | null>(null);
    const [step, setStep] = useState<'plans' | 'confirm' | 'success'>('plans');
    const [processing, setProcessing] = useState(false);

    const plan = PLANS.find(p => p.id === selected);

    const handleBuy = async () => {
        if (!plan) return;
        setProcessing(true);
        await new Promise(r => setTimeout(r, 1600));
        addCredits(plan.credits);
        setProcessing(false);
        setStep('success');
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#07050f 0%,#0d0820 50%,#07050f 100%)' }}>
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.12), transparent)' }} />

            {/* Top bar */}
            <div className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
                style={{ background: 'rgba(7,5,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                <BackBtn
                    label={step === 'plans' ? 'Back' : 'Change plan'}
                    onClick={step === 'plans' ? () => navigate(-1) : () => setStep('plans')} />
                {user && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'rgba(245,158,11,0.85)' }}>
                        <Zap size={10} style={{ color: '#f59e0b' }} />
                        {(user.ai_credits ?? 400).toLocaleString()} credits
                    </div>
                )}
            </div>

            <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-24">
                <AnimatePresence mode="wait">

                    {/* Step 1 — Plans */}
                    {step === 'plans' && (
                        <motion.div key="plans" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold mb-5"
                                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'rgba(192,132,252,0.85)' }}>
                                    <Sparkles size={10} /> Top Up Credits
                                </div>
                                <h1 className="font-display font-black text-white mb-3" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
                                    Power Up Your <span className="text-gradient">AI</span>
                                </h1>
                                <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(200,190,255,0.5)' }}>
                                    One-time purchase. No subscriptions. Credits never expire.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {PLANS.map((p, i) => (
                                    <motion.div key={p.id}
                                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -4, transition: { duration: 0.18 } }}
                                        onClick={() => { setSelected(p.id); setStep('confirm'); }}
                                        className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
                                        style={{
                                            background: p.popular ? 'linear-gradient(145deg,#1a0845,#2d1060,#1a0845)' : 'rgba(12,8,28,0.95)',
                                            border: `1px solid ${p.popular ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.12)'}`,
                                            boxShadow: p.popular ? '0 20px 60px rgba(124,58,237,0.25)' : '0 4px 20px rgba(0,0,0,0.4)',
                                        }}>
                                        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${p.color},transparent)` }} />
                                        {p.popular && (
                                            <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                                                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>POPULAR</div>
                                        )}
                                        <div className="p-6 flex flex-col flex-1">
                                            <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: p.color }}>{p.label.toUpperCase()}</p>
                                            <div className="mb-1 flex items-end gap-1.5">
                                                <span className="font-display font-black text-3xl text-white">₹{p.price}</span>
                                                <span className="text-xs mb-1" style={{ color: 'rgba(180,165,230,0.4)' }}>one-time</span>
                                            </div>
                                            <p className="text-sm font-semibold mb-0.5" style={{ color: p.color }}>{(p.credits / 1000).toFixed(0)}k credits</p>
                                            <p className="text-xs mb-5" style={{ color: 'rgba(160,148,210,0.4)' }}>{p.per}</p>
                                            <ul className="space-y-2 mb-6 flex-1">
                                                {p.features.map(f => (
                                                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(200,190,255,0.65)' }}>
                                                        <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center uppercase tracking-wide"
                                                style={p.popular
                                                    ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }
                                                    : { background: 'rgba(168,85,247,0.08)', color: 'rgba(192,132,252,0.8)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                                Select {p.label} →
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-center text-xs mt-8" style={{ color: 'rgba(160,148,210,0.3)' }}>
                                Secure payment via Razorpay • Credits never expire • Instant delivery
                            </p>
                        </motion.div>
                    )}

                    {/* Step 2 — Confirm */}
                    {step === 'confirm' && plan && (
                        <motion.div key="confirm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                            className="max-w-md mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="font-display font-black text-white text-2xl mb-2">Confirm Purchase</h2>
                                <p className="text-sm" style={{ color: 'rgba(180,165,230,0.5)' }}>Review your order before paying</p>
                            </div>

                            <div className="rounded-2xl p-6 mb-4" style={{ background: 'rgba(12,8,28,0.95)', border: `1px solid ${plan.color}30` }}>
                                <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${plan.color},transparent)`, marginBottom: 20, borderRadius: 1 }} />
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-white text-lg">{plan.label} Pack</p>
                                        <p className="text-sm font-semibold" style={{ color: plan.color }}>{(plan.credits / 1000).toFixed(0)}k AI Credits</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'rgba(160,148,210,0.4)' }}>{plan.per}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-display font-black text-white text-2xl">₹{plan.price}</p>
                                        <p className="text-xs" style={{ color: 'rgba(160,148,210,0.4)' }}>one-time</p>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(168,85,247,0.1)', paddingTop: 14 }}>
                                    <div className="space-y-2">
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(200,190,255,0.6)' }}>
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

                    {/* Step 3 — Success */}
                    {step === 'success' && plan && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-sm mx-auto text-center pt-8">
                            <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 60px rgba(168,85,247,0.5)' }}
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                                <Check size={36} className="text-white" />
                            </motion.div>
                            <motion.h2 className="font-display font-black text-white text-2xl mb-2"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                Credits Added!
                            </motion.h2>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                <p className="text-sm mb-1" style={{ color: 'rgba(180,165,230,0.55)' }}>
                                    <span className="text-white font-bold">{(plan.credits / 1000).toFixed(0)}k credits</span> added to your account
                                </p>
                                <p className="text-xs mb-3" style={{ color: 'rgba(160,148,210,0.35)' }}>₹{plan.price} charged • Instant delivery</p>
                                {user && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8"
                                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <Zap size={12} style={{ color: '#f59e0b' }} />
                                        <span className="text-sm font-bold" style={{ color: 'rgba(245,158,11,0.9)' }}>
                                            {(user.ai_credits ?? 0).toLocaleString()} total credits
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate(-1)}
                                className="btn inline-flex px-8 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                Back to App <ArrowRight size={15} />
                            </motion.button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
