import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Shield, Zap, Brain, Wallet, Target, ArrowRight,
    Check, Star, ChevronRight, BarChart3, Lock, FileText, Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

function Counter({ end, suffix, dur = 2000 }: { end: number; suffix: string; dur?: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const step = end / (dur / 16);
        let cur = 0;
        const t = setInterval(() => {
            cur = Math.min(cur + step, end);
            setN(Math.floor(cur));
            if (cur >= end) clearInterval(t);
        }, 16);
        return () => clearInterval(t);
    }, [inView, end, dur]);
    return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

// Particle dot component
function Particles() {
    const pts = Array.from({ length: 30 }, (_, i) => ({
        x: Math.random() * 100, y: Math.random() * 100, s: 1 + Math.random() * 2,
        d: 4 + Math.random() * 6
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {pts.map((p, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: 'rgba(168,85,247,0.4)' }}
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: p.d, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
            ))}
        </div>
    );
}

const FEATURES = [
    { icon: Brain, title: 'AI Document Analysis', desc: 'Upload any bank statement PDF — instant expense summary, anomaly detection, and personalized saving suggestions.', span: 'md:col-span-2' },
    { icon: Wallet, title: 'Digital Wallet', desc: 'Manage balance, virtual cards, and complete transaction history.', span: '' },
    { icon: TrendingUp, title: 'Health Score', desc: 'Financial health scored 0–100 across savings, debt, emergency buffer and more.', span: '' },
    { icon: Zap, title: '100k Free Credits', desc: '100,000 AI credits to start — use for chat, analysis, simulations. Buy more anytime.', span: '' },
    { icon: Target, title: 'Smart Goals', desc: 'AI-calculated feasibility, progress tracking and milestone alerts for every goal.', span: '' },
    { icon: Shield, title: 'Risk Simulator', desc: 'Simulate income drops, job loss, or loan scenarios in real time.', span: 'md:col-span-2' },
];

const STEPS = [
    { n: '01', icon: FileText, title: 'Upload Statement', desc: 'Drop any bank statement PDF or image — AI extracts and structures the data instantly.' },
    { n: '02', icon: Brain, title: 'Get AI Insights', desc: 'Receive a score, spending personality report, anomalies, and personalized recommendations.' },
    { n: '03', icon: TrendingUp, title: 'Build Better Habits', desc: 'Follow habit challenges, chat with your AI coach, and track progress toward all goals.' },
];

const TESTIMONIALS = [
    { name: 'Priya M.', role: 'Software Engineer', text: 'Found ₹18k/month in wasted subscriptions in minutes. The wallet feature alone is worth it.', r: 5 },
    { name: 'Rohit K.', role: 'Freelancer', text: 'The income drop simulator changed how I plan for slow months. Brilliant tool.', r: 5 },
    { name: 'Ananya S.', role: 'Marketing Manager', text: 'Finally understand my finances. The AI coach explains everything clearly.', r: 5 },
];

export default function Landing() {
    const { isDark, toggle } = useTheme();
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div style={{ background: 'var(--bg)' }}>
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-14"
                style={{ backdropFilter: 'blur(20px)', background: 'rgba(8,8,20,0.8)', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <TrendingUp size={15} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-lg text-gradient">Finexa</span>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    {['Features', 'Pricing', 'Security'].map(n => (
                        <a key={n} href="#" className="text-sm transition-all text-3 hover:text-2">{n}</a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button onClick={toggle} className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid var(--border)' }}>
                        <span className="text-xs">{isDark ? '☀️' : '🌓'}</span>
                    </button>
                    <Link to="/login" className="text-sm text-2 hover:text-1 transition-colors">Sign In</Link>
                    <Link to="/signup" className="btn text-sm px-4 py-2">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center pt-16 grid-bg overflow-hidden">
                <Particles />
                {/* Background glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22), transparent)', filter: 'blur(80px)', animation: 'glowPulse 4s ease-in-out infinite' }} />
                <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full pointer-events-none animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent)', filter: 'blur(50px)' }} />
                <div className="absolute bottom-1/3 left-1/5 w-36 h-36 rounded-full pointer-events-none animate-float-reverse"
                    style={{ background: 'radial-gradient(circle, rgba(76,29,149,0.2), transparent)', filter: 'blur(40px)' }} />

                {/* Plus signs decorations (like reference) */}
                {[[-10, 25], [80, 15], [10, 65], [90, 55]].map(([x, y], i) => (
                    <motion.div key={i} className="absolute text-xl font-thin select-none pointer-events-none"
                        style={{ left: `${x}%`, top: `${y}%`, color: 'rgba(168,85,247,0.25)' }}
                        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}>
                        ✦
                    </motion.div>
                ))}

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                        className="badge inline-flex mb-6 gap-2">
                        <Sparkles size={12} /> AI-Powered Financial Intelligence
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="font-display font-bold leading-[1.08] mb-6"
                        style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)' }}>
                        <span className="text-1">Secure Wallet.</span>
                        <br />
                        <span className="text-gradient">Limitless Possibilities.</span>
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-2">
                        A non-custodial financial coaching platform that puts you in full control — with AI-powered insights, smart budgeting, and real-time simulations.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 mb-14">
                        <Link to="/signup" className="btn text-base px-8 py-3.5">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn-outline text-base px-8 py-3.5">
                            Sign In <ChevronRight size={18} />
                        </Link>
                    </motion.div>

                    {/* Trust row */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                        className="flex flex-wrap justify-center gap-6 mb-16">
                        {[{ i: Lock, t: 'Bank-grade encryption' }, { i: Shield, t: 'Zero data selling' }, { i: Zap, t: '100k free credits' }].map(b => (
                            <div key={b.t} className="flex items-center gap-2 text-sm text-3">
                                <b.i size={13} style={{ color: 'var(--purple)' }} /> {b.t}
                            </div>
                        ))}
                    </motion.div>

                    {/* Hero dashboard mockup */}
                    <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, type: 'spring' }}
                        className="relative inline-block max-w-[360px] mx-auto">
                        {/* Main card */}
                        <div className="card p-6 text-left w-full animate-float" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-3">Financial Health</p>
                                    <p className="font-bold text-1">Overview · Feb 2026</p>
                                </div>
                                <span className="badge text-xs animate-bounce-subtle">Live</span>
                            </div>

                            {/* Score ring */}
                            <div className="flex items-center gap-5 mb-4">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="28" strokeWidth="5" stroke="rgba(168,85,247,0.12)" fill="none" />
                                        <motion.circle cx="40" cy="40" r="28" strokeWidth="5" fill="none"
                                            stroke="url(#grad)" strokeLinecap="round" strokeDasharray={175.9}
                                            initial={{ strokeDashoffset: 176 }} animate={{ strokeDashoffset: 44 }}
                                            transition={{ duration: 2.2, delay: 0.7, ease: 'easeOut' }} />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#7c3aed" />
                                                <stop offset="100%" stopColor="#c084fc" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-1">74</span>
                                        <span className="text-[9px] text-3">GOOD</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[{ l: 'Savings rate', v: '21.4%', c: '#10b981' }, { l: 'Expense ratio', v: '64%', c: '#f59e0b' }, { l: 'Emergency', v: '2.4 mo', c: '#ef4444' }].map(s => (
                                        <div key={s.l} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} /><span className="text-xs text-3">{s.l}</span></div>
                                            <span className="text-xs font-semibold" style={{ color: s.c }}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mini bars */}
                            <div className="flex items-end gap-1 h-10">
                                {[40, 55, 50, 62, 58, 68, 65, 74].map((h, i) => (
                                    <motion.div key={i} className="flex-1 rounded-sm"
                                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.5, delay: 0.9 + i * 0.07, origin: 'bottom' }}
                                        style={{ height: `${h}%`, background: i === 7 ? 'var(--purple)' : 'rgba(168,85,247,0.2)', transformOrigin: 'bottom' }} />
                                ))}
                            </div>
                        </div>

                        {/* Floating chips */}
                        <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -right-20 top-6 card p-3 hidden md:block card-sm" style={{ minWidth: 130 }}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Sparkles size={11} style={{ color: 'var(--purple)' }} />
                                <span className="text-xs text-1 font-medium">AI Credits</span>
                            </div>
                            <p className="text-xl font-bold text-gradient">97.1k</p>
                            <p className="text-[10px] text-3">remaining</p>
                        </motion.div>

                        <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 4.5, repeat: Infinity }}
                            className="absolute -left-20 bottom-12 card p-3 hidden md:block card-sm" style={{ minWidth: 130 }}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <BarChart3 size={11} className="text-green-400" />
                                <span className="text-xs text-1 font-medium">Savings Rate</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#10b981' }}>21.4%</p>
                            <p className="text-[10px] text-green-400">Target hit ✓</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats bar */}
            <div className="py-14" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="max-w-3xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[{ n: 50000, s: '+', l: 'Active Users' }, { n: 100000, s: '', l: 'Free AI Credits' }, { n: 18, s: 'k+', l: 'Avg Monthly Savings (₹)' }, { n: 99, s: '%', l: 'Security Uptime' }].map(s => (
                        <div key={s.l}>
                            <div className="text-3xl md:text-4xl font-bold font-display text-gradient mb-1">
                                <Counter end={s.n} suffix={s.s} />
                            </div>
                            <p className="text-sm text-3">{s.l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <div className="badge inline-flex mb-4">Features</div>
                    <h2 className="font-display font-bold text-1" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                        Powerful Features.<br /><span className="text-gradient">Ultimate Freedom.</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FEATURES.map((f, i) => (
                        <motion.div key={f.title}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)}
                            className={`card p-5 cursor-default transition-all duration-300 ${f.span}`}
                            style={hovered === i ? { borderColor: 'rgba(168,85,247,0.4)', boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 30px rgba(168,85,247,0.15)' } : {}}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                    style={{ background: hovered === i ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.08)', border: `1px solid ${hovered === i ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.15)'}` }}>
                                    <f.icon size={18} style={{ color: 'var(--purple)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-1 mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-3 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="badge inline-flex mb-4">How It Works</div>
                        <h2 className="font-display font-bold text-1" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                            Finance with AI. <span className="text-gradient">Real Success.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {STEPS.map((s, i) => (
                            <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                                className="card p-6 text-center">
                                <div className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--purple)' }}>{s.n}</div>
                                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
                                    <s.icon size={20} style={{ color: 'var(--purple)' }} />
                                </div>
                                <h3 className="font-semibold text-1 mb-2">{s.title}</h3>
                                <p className="text-sm text-3 leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-display font-bold text-1" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                        Loved by <span className="text-gradient">50,000+ users</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="card p-5">
                            <div className="flex gap-0.5 mb-3">{Array.from({ length: t.r }).map((_, j) => <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />)}</div>
                            <p className="text-sm text-2 leading-relaxed mb-4">"{t.text}"</p>
                            <div><p className="font-semibold text-1 text-sm">{t.name}</p><p className="text-xs text-3">{t.role}</p></div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="card p-10 md:p-14 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.1), transparent)' }} />
                        <div className="absolute inset-0 grid-bg opacity-50" />
                        <div className="relative z-10">
                            <div className="badge inline-flex mb-5"><Sparkles size={11} /> 100,000 free AI credits</div>
                            <h2 className="font-display font-bold text-3xl md:text-4xl text-1 mb-4">
                                Your Future,<br /><span className="text-gradient">Simplified.</span>
                            </h2>
                            <p className="text-sm text-3 mb-8 max-w-sm mx-auto">No credit card. No investment advice. Just clear, powerful AI coaching for your financial future.</p>
                            <div className="flex flex-wrap gap-4 justify-center mb-6">
                                <Link to="/signup" className="btn text-base px-8 py-3.5">Create Free Account <ArrowRight size={18} /></Link>
                                <Link to="/login" className="btn-outline text-base px-8 py-3.5">Sign In</Link>
                            </div>
                            <div className="flex flex-wrap gap-5 justify-center">
                                {['No credit card', 'Privacy first', 'Cancel anytime'].map(f => (
                                    <div key={f} className="flex items-center gap-1.5 text-xs text-3">
                                        <Check size={11} style={{ color: 'var(--purple)' }} /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <TrendingUp size={11} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-sm text-gradient">Finexa</span>
                </div>
                <p className="text-xs text-3">Not investment advice. Educational purposes only. &copy; 2026 Finexa. All rights reserved.</p>
            </footer>
        </div>
    );
}
