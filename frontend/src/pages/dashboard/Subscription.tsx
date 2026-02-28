import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PLANS = [
    {
        id: 'free',
        name: 'Starter',
        icon: Star,
        price: 0,
        period: 'Forever',
        credits: 100000,
        color: '#48CAE4',
        features: [
            '100,000 AI credits',
            'Financial Health Score',
            'Budget tracking',
            'Savings goals (up to 3)',
            'Basic AI coach (text only)',
            'Wallet — basic',
            'Gamification & badges',
        ],
        unavailable: ['Document upload & AI analysis', 'Advanced simulations', 'Priority support', 'Unlimited goals'],
    },
    {
        id: 'pro',
        name: 'Pro',
        icon: Zap,
        price: 499,
        period: '/month',
        credits: 1000000,
        color: '#00D4FF',
        popular: true,
        features: [
            '1,000,000 AI credits / month',
            'Everything in Starter',
            'Document upload & AI analysis',
            'Unlimited savings goals',
            'Advanced income simulations',
            'AI coach with document chat',
            'Spending personality insights',
            'Priority support',
        ],
        unavailable: ['Dedicated account manager', 'Custom integrations'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Crown,
        price: 1999,
        period: '/month',
        credits: 10000000,
        color: '#0096C7',
        features: [
            '10,000,000 AI credits / month',
            'Everything in Pro',
            'Dedicated account manager',
            'Custom integrations',
            'Team dashboards',
            'Advanced analytics & exports',
            'White-label option',
            'SLA guarantee',
        ],
        unavailable: [],
    },
];

const CREDIT_USAGE = [
    { action: 'AI Chat message', cost: 100, icon: Sparkles },
    { action: 'Document analysis', cost: 5000, icon: Sparkles },
    { action: 'Expense summary', cost: 2000, icon: Sparkles },
    { action: 'Financial score', cost: 500, icon: Sparkles },
    { action: 'Saving suggestions', cost: 1000, icon: Sparkles },
];

export default function Subscription() {
    const { user } = useAuth();
    const [currentPlan, setCurrentPlan] = useState('free');
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const aiCredits = user?.ai_credits ?? 100000;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Subscription Plans</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Upgrade your AI capabilities — credits power every AI feature</p>
            </div>

            {/* AI Credits status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center glow-aqua"
                        style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)' }}>
                        <Sparkles size={22} style={{ color: 'var(--aqua)' }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Credits Remaining</p>
                            <p className="text-2xl font-bold font-mono" style={{ color: 'var(--aqua)' }}>
                                {(aiCredits / 1000).toFixed(0)}k
                            </p>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,255,0.12)' }}>
                            <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                                animate={{ width: `${(aiCredits / 100000) * 100}%` }} transition={{ duration: 1.2 }}
                                style={{ background: 'linear-gradient(90deg, #0096C7, #00D4FF)' }} />
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                            {aiCredits.toLocaleString()} / 100,000 credits · Resets on plan renewal
                        </p>
                    </div>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                    {(['monthly', 'yearly'] as const).map(b => (
                        <button key={b} onClick={() => setBilling(b)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                            style={billing === b
                                ? { background: 'rgba(0,212,255,0.2)', color: 'var(--aqua)', border: '1px solid rgba(0,212,255,0.3)' }
                                : { color: 'var(--text-muted)' }}>
                            {b}{b === 'yearly' ? ' (-20%)' : ''}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PLANS.map((plan, i) => {
                    const price = billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
                    const isActive = currentPlan === plan.id;
                    return (
                        <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className={`glass relative flex flex-col ${plan.popular ? 'ring-1' : ''}`}
                            style={plan.popular ? { ringColor: plan.color } : {}}>

                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold text-black"
                                        style={{ background: 'linear-gradient(90deg, #0096C7, #00D4FF)' }}>
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="p-6 flex-1">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}>
                                        <plan.icon size={18} style={{ color: plan.color }} />
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {(plan.credits / 1000).toFixed(0)}k credits
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-5">
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                                            {price === 0 ? 'Free' : `₹${price}`}
                                        </span>
                                        {price > 0 && <span className="text-sm pb-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>}
                                    </div>
                                    {billing === 'yearly' && price > 0 && (
                                        <p className="text-xs text-green-400 mt-0.5">Save ₹{(plan.price - price) * 12}/year</p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-2.5 mb-5">
                                    {plan.features.map(f => (
                                        <div key={f} className="flex items-start gap-2.5">
                                            <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
                                        </div>
                                    ))}
                                    {plan.unavailable.map(f => (
                                        <div key={f} className="flex items-start gap-2.5 opacity-35">
                                            <div className="w-3 h-0.5 mt-2 flex-shrink-0 rounded" style={{ background: 'var(--text-muted)' }} />
                                            <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="px-6 pb-6">
                                <button
                                    onClick={() => setCurrentPlan(plan.id)}
                                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? 'cursor-default'
                                        : plan.popular ? 'btn-aqua' : 'btn-outline'}`}
                                    style={isActive ? {
                                        background: `${plan.color}18`,
                                        border: `1px solid ${plan.color}40`,
                                        color: plan.color,
                                    } : {}}>
                                    {isActive ? 'Current Plan' : plan.price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Credit usage table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI Credit Cost Guide</h3>
                <div className="space-y-2.5">
                    {CREDIT_USAGE.map(u => (
                        <div key={u.action} className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-3">
                                <Sparkles size={14} style={{ color: 'var(--aqua)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.action}</span>
                            </div>
                            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--aqua)' }}>
                                {u.cost.toLocaleString()} credits
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                    Credits are consumed per API call. Unused credits do not roll over between billing cycles.
                </p>
            </motion.div>
        </div>
    );
}
