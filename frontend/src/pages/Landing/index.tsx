import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Shield, Zap, Brain, Wallet, Target,
    ArrowRight, Check, Star, BarChart3, Lock, Sparkles,
    ChevronRight, Bot, Wifi, CreditCard, Activity,
    FileText, PieChart
} from 'lucide-react';
import Navbar from '../../components/Navbar';

/* ── Animated number counter ───────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
    const ref = useRef(null);
    const inV = useInView(ref, { once: true });
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!inV) return;
        let cur = 0; const step = end / 60;
        const t = setInterval(() => { cur = Math.min(cur + step, end); setN(Math.floor(cur)); if (cur >= end) clearInterval(t); }, 22);
        return () => clearInterval(t);
    }, [inV, end]);
    return <span ref={ref}>{n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 0)}k` : n}{suffix}</span>;
}

/* ── Floating orb ──────────────────────────── */
function Orb({ size, x, y, color, blur, delay }: { size: number; x: string; y: string; color: string; blur: number; delay: number }) {
    return (
        <motion.div className="absolute rounded-full pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
            style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${blur}px)` }} />
    );
}

/* ── Shooting stars ────────────────────────── */
function ShootingStars() {
    const stars = Array.from({ length: 6 }, (_, i) => ({
        top: `${5 + i * 15}%`, delay: i * 1.8, duration: 2.5 + i * 0.5
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((s, i) => (
                <motion.div key={i} className="absolute h-px rounded-full"
                    style={{ top: s.top, background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), rgba(255,255,255,0.6), transparent)', width: 120 }}
                    initial={{ left: '-10%', opacity: 0 }}
                    animate={{ left: '110%', opacity: [0, 1, 1, 0] }}
                    transition={{ duration: s.duration, repeat: Infinity, delay: s.delay + i, ease: 'linear', repeatDelay: 4 + i * 2 }} />
            ))}
        </div>
    );
}

/* ── 3D Interactive Credit Card ──────────────────────── */
function HeroCard3D() {
    const rotX = useMotionValue(0);
    const rotY = useMotionValue(0);
    const sRotX = useSpring(rotX, { stiffness: 180, damping: 20 });
    const sRotY = useSpring(rotY, { stiffness: 180, damping: 20 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMouse = (e: React.MouseEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        rotX.set(((e.clientY - cy) / rect.height) * -18);
        rotY.set(((e.clientX - cx) / rect.width) * 22);
    };

    return (
        <div ref={ref} onMouseMove={handleMouse}
            onMouseLeave={() => { rotX.set(0); rotY.set(0); }}
            style={{ perspective: 900, display: 'flex', justifyContent: 'center' }}>
            <motion.div style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' }}
                className="w-full max-w-xs animate-float">
                <div className="credit-card w-full relative" style={{ animationDuration: '6s' }}>
                    {/* Circles */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
                        <circle cx="310" cy="-25" r="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                        <circle cx="310" cy="-25" r="190" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                        <circle cx="-15" cy="200" r="110" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                    </svg>
                    {/* Top sheen */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 50%)' }} />
                    {/* Holographic overlay */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(59,130,246,0.2) 50%, rgba(236,72,153,0.2) 100%)', animation: 'gradientShift 4s ease infinite', backgroundSize: '300% 300%' }} />
                    {/* Animated scan line */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div className="absolute left-0 right-0 h-0.5"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.9), rgba(255,255,255,0.6), rgba(192,132,252,0.9), transparent)' }}
                            animate={{ y: ['0%', '280%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }} />
                    </div>
                    <div className="relative z-10 p-6 flex flex-col h-full">
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Wifi size={12} className="text-white/50 -rotate-90" />
                                <span className="text-white/40 text-[9px] font-mono tracking-[0.3em]">NFC</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgba(168,85,247,0.9)' }} />
                                <span className="text-white/60 text-[10px] font-bold tracking-widest">VISA</span>
                            </div>
                        </div>
                        {/* Chip */}
                        <div className="mb-5">
                            <div className="w-9 h-7 rounded-md mb-5" style={{
                                background: 'linear-gradient(135deg, #d4a843 0%, #f5d17a 30%, #c49232 60%, #e8c06a 100%)',
                                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)',
                            }}>
                                <div className="w-full h-full rounded-md" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)' }} />
                            </div>
                            <p className="text-white/25 text-[8px] mb-1 font-mono tracking-[0.25em]">CARD NUMBER</p>
                            <p className="text-white font-mono text-base tracking-[0.22em] drop-shadow-sm">4532 8821 •••• 4231</p>
                        </div>
                        {/* Bottom */}
                        <div className="flex items-end justify-between mt-auto">
                            <div>
                                <p className="text-white/25 text-[7px] tracking-[0.25em] mb-0.5">CARD HOLDER</p>
                                <p className="text-white text-xs font-semibold tracking-wider">YOUR NAME</p>
                            </div>
                            <div>
                                <p className="text-white/25 text-[7px] tracking-[0.25em] mb-0.5">EXPIRES</p>
                                <p className="text-white text-xs font-semibold">08 / 28</p>
                            </div>
                            <div className="flex -space-x-2.5">
                                <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(220,38,38,0.75)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                                <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(234,179,8,0.75)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating chips around the card */}
                <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -top-6 -right-8 card-glow px-3.5 py-2.5 hidden lg:block">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={12} style={{ color: '#10b981' }} />
                        <div>
                            <p className="text-[9px] text-3">Savings Rate</p>
                            <p className="text-sm font-bold" style={{ color: '#10b981' }}>+21.4%</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -bottom-5 -left-10 card-glow px-3.5 py-2.5 hidden lg:block">
                    <div className="flex items-center gap-2">
                        <Sparkles size={12} style={{ color: 'var(--purple)' }} />
                        <div>
                            <p className="text-[9px] text-3">AI Credits</p>
                            <p className="text-sm font-bold text-gradient">97.1k</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-1/2 -right-14 card-glow px-3 py-2 hidden lg:block">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-semibold text-1">Score 74</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

/* ── Feature cards data ─────────────────────── */
const FEATURES = [
    { icon: Brain, title: 'AI Document Analysis', desc: 'Upload any bank statement — instant expense summary and saving tips.' },
    { icon: TrendingUp, title: 'Health Score 0–100', desc: 'Your financial fitness scored across savings, debt, and spending habits.' },
    { icon: Zap, title: '100k Free AI Credits', desc: 'Power chat, document analysis, simulations, and insights from day one.' },
    { icon: Target, title: 'Smart Goals Tracker', desc: 'AI-calculated feasibility and milestone alerts for every goal.' },
    { icon: Shield, title: 'Risk Simulator', desc: 'Stress-test income drops, job loss, or loan scenarios in real time.' },
    { icon: Wallet, title: 'Digital Wallet', desc: 'Virtual cards, balance management, and full transaction history.' },
];

const TESTIMONIALS = [
    { name: 'Priya M.', role: 'Software Engineer', text: 'Found Rs 18k/month in wasted subscriptions. The AI coach alone changed how I manage money.', r: 5 },
    { name: 'Rohit K.', role: 'Freelancer', text: 'The income drop simulator changed how I plan for slow months. Nothing comes close.', r: 5 },
    { name: 'Ananya S.', role: 'Marketing Manager', text: 'ELI-15 mode explains every financial concept so clearly. Finally understand my money.', r: 5 },
];

/* ─── MAIN PAGE ─── */
export default function Landing() {
    return (
        <div style={{ background: 'var(--bg)' }}>

            {/* ═══ NAVBAR ═══ */}
            <Navbar />

            {/* ═══ HERO ═══ */}
            <section className="relative min-h-screen flex items-center overflow-hidden grid-bg-dense pt-16">
                {/* Orbs */}
                <Orb size={600} x="30%" y="-10%" color="radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)" blur={80} delay={0} />
                <Orb size={400} x="65%" y="20%" color="radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)" blur={60} delay={2} />
                <Orb size={300} x="10%" y="60%" color="radial-gradient(circle, rgba(76,29,149,0.2), transparent 70%)" blur={50} delay={1.5} />
                <Orb size={200} x="80%" y="70%" color="radial-gradient(circle, rgba(192,132,252,0.1), transparent 70%)" blur={40} delay={3} />

                {/* Shooting stars */}
                <ShootingStars />

                {/* Decorative sparkles */}
                {[[-5, 22], [85, 10], [8, 72], [91, 55], [50, 6], [72, 80], [20, 90]].map(([x, y], i) => (
                    <motion.div key={i} className="absolute pointer-events-none select-none"
                        style={{ left: `${x}%`, top: `${y}%`, color: 'rgba(168,85,247,0.25)', fontSize: i % 2 === 0 ? 14 : 10 }}
                        animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}>✦</motion.div>
                ))}

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                        {/* LEFT — text */}
                        <div>
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                                className="badge inline-flex mb-6 gap-2 text-[11px]">
                                <Sparkles size={11} /> AI-Powered Financial Intelligence
                            </motion.div>

                            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
                                className="font-display font-black leading-[1.05] mb-6"
                                style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)' }}>
                                <span className="text-gradient-hero">Your Financial</span>
                                <br />
                                <span style={{ color: '#ffffff' }}>Future,</span>
                                <br />
                                <span className="text-gradient">Simplified.</span>
                            </motion.h1>

                            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-base md:text-lg leading-relaxed mb-8 max-w-xl"
                                style={{ color: 'rgba(200,190,255,0.65)' }}>
                                A privacy-first AI coaching platform — with real-time health scoring, smart budgeting, risk simulations,
                                a digital wallet, and 100,000 free AI credits from day one.
                            </motion.p>

                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-3 mb-10">
                                <Link to="/signup" className="btn text-base px-7 py-3.5">
                                    Start Free — 100k Credits <ArrowRight size={17} />
                                </Link>
                                <a href="#features" className="btn-outline text-base px-7 py-3.5">
                                    Explore Features <ChevronRight size={17} />
                                </a>
                            </motion.div>

                            {/* Trust row */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-5">
                                {[{ i: Lock, t: 'Bank-grade privacy' }, { i: Shield, t: 'Zero data selling' }, { i: Zap, t: 'No credit card' }].map(b => (
                                    <div key={b.t} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(168,85,247,0.7)' }}>
                                        <b.i size={12} style={{ color: 'var(--purple)' }} /> {b.t}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* RIGHT — 3D credit card */}
                        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.9, type: 'spring' }}
                            className="relative px-8 lg:px-4">
                            {/* Glow behind card */}
                            <div className="absolute inset-0 -z-10"
                                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.35), transparent)', filter: 'blur(40px)' }} />
                            <HeroCard3D />
                        </motion.div>

                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                    style={{ background: 'linear-gradient(0deg, var(--bg), transparent)' }} />
            </section>

            {/* ═══ STATS BAR ═══ */}
            <div className="relative py-12 overflow-hidden" style={{ background: 'rgba(10,8,25,0.98)', borderTop: '1px solid rgba(168,85,247,0.15)', borderBottom: '1px solid rgba(168,85,247,0.15)' }}>
                <div className="absolute inset-0 dots-bg opacity-20 pointer-events-none" />
                <div className="relative max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { e: 50, s: 'k+', l: 'Active Users' },
                        { e: 100, s: 'k', l: 'Free AI Credits' },
                        { e: 18, s: 'k+', l: 'Avg Monthly Savings' },
                        { e: 99, s: '%', l: 'Privacy Uptime' },
                    ].map(s => (
                        <div key={s.l}>
                            <div className="font-display font-black text-3xl md:text-4xl text-gradient mb-1.5">
                                <Counter end={s.e} suffix={s.s} />
                            </div>
                            <p className="text-xs" style={{ color: 'rgba(160,148,210,0.5)' }}>{s.l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ FEATURES GRID ═══ */}
            <section id="features" className="py-24 relative overflow-hidden section-purple">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, var(--bg), transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(0deg, var(--bg), transparent)' }} />
                <Orb size={500} x="50%" y="30%" color="radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)" blur={80} delay={0} />

                <div className="relative max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <div className="badge inline-flex mb-5">Why Choose Finexa</div>
                        <h2 className="font-display font-black text-1 leading-tight mb-4"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                            Powerful Features.<br /><span className="text-gradient">Total Financial Control.</span>
                        </h2>
                        <p style={{ color: 'rgba(200,190,255,0.6)' }} className="text-base max-w-xl mx-auto">
                            Everything you need to understand, improve, and master your financial life in one beautiful platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f, i) => (
                            <motion.div key={f.title}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                className="card hover-lift p-5 flex gap-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)' }}>
                                    <f.icon size={19} style={{ color: 'var(--purple)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-1 mb-1.5">{f.title}</h3>
                                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(160,148,210,0.55)' }}>{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ AI COACH SHOWCASE ═══ */}
            <section className="py-24 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <div className="badge inline-flex mb-5"><Bot size={11} /> AI Coach</div>
                        <h2 className="font-display font-black text-1 leading-tight mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                            Your Personal<br /><span className="text-gradient">AI Financial Coach</span>
                        </h2>
                        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(200,190,255,0.6)' }}>
                            Ask anything. Get clear, personalised answers about budgeting, savings, emergency funds, and more —
                            powered by 100,000 free AI credits. Each message costs just 100 credits.
                        </p>
                        <ul className="space-y-3 mb-7">
                            {['Context-aware answers from your real financial data', 'ELI-15 mode for plain language explanations', 'Streaming word-by-word responses with copy support'].map(p => (
                                <li key={p} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(200,190,255,0.7)' }}>
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                                        <Check size={11} style={{ color: 'var(--purple)' }} />
                                    </div>{p}
                                </li>
                            ))}
                        </ul>
                        <Link to="/signup" className="btn w-fit">Try AI Coach Free <ArrowRight size={15} /></Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <div className="card-glow p-5 space-y-3">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(168,85,247,0.12)' }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><Bot size={15} className="text-white" /></div>
                                <div><p className="text-sm font-semibold text-1">Finexa AI Coach</p><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><p className="text-[10px] text-3">Online · 97,100 credits</p></div></div>
                            </div>
                            {[
                                { r: 'user', t: 'What is my financial health score?' },
                                { r: 'bot', t: 'Your score is 74/100 — Good. Your 21.4% savings rate is excellent! Main improvement area: emergency fund (2.4 months — aim for 6).' },
                                { r: 'user', t: 'How can I improve it fast?' },
                                { r: 'bot', t: 'Two moves: redirect your Rs 2,400 monthly entertainment overspend to emergency savings, and cancel your unused gym (-Rs 800/mo).' },
                            ].map((m, i) => (
                                <div key={i} className={`flex gap-2 ${m.r === 'user' ? 'justify-end' : ''}`}>
                                    {m.r === 'bot' && <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><Bot size={10} className="text-white" /></div>}
                                    <div className="max-w-[78%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed"
                                        style={m.r === 'user'
                                            ? { background: 'linear-gradient(135deg, #6d28d9, #a855f7)', color: '#fff', borderRadius: '14px 14px 4px 14px' }
                                            : { background: 'rgba(168,85,247,0.07)', color: 'rgba(200,190,255,0.8)', border: '1px solid rgba(168,85,247,0.14)', borderRadius: '14px 14px 14px 4px' }}>
                                        {m.t}
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><Bot size={10} className="text-white" /></div>
                                <div className="px-3 py-2 rounded-2xl flex items-center gap-1" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.14)' }}>
                                    {[0, 1, 2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)' }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.13 }} />)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ PERFORMANCE — full purple section ═══ */}
            <section id="how" className="py-24 relative overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #0a0618 0%, #150a40 50%, #0a0618 100%)' }}>
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                <Orb size={700} x="50%" y="50%" color="radial-gradient(circle, rgba(124,58,237,0.28), transparent 65%)" blur={100} delay={0} />

                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <div className="badge inline-flex mb-5">How It Works</div>
                    <h2 className="font-display font-black text-1 mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Start in <span className="text-gradient">3 Simple Steps</span>
                    </h2>
                    <p className="text-base max-w-xl mx-auto mb-14" style={{ color: 'rgba(200,190,255,0.55)' }}>
                        From sign-up to full financial clarity in minutes — no complexity, no jargon.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {[
                            { n: '01', icon: FileText, title: 'Upload Statement', desc: 'Drop any bank statement PDF — AI extracts and structures your entire financial history instantly.' },
                            { n: '02', icon: Brain, title: 'Get AI Insights', desc: 'Receive a health score, spending personality, anomalies, and personalised recommendations.' },
                            { n: '03', icon: TrendingUp, title: 'Build Better Habits', desc: 'Follow habit challenges, chat with your AI coach, and hit every savings goal you set.' },
                        ].map((s, i) => (
                            <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.13 }}
                                className="card hover-lift p-7 text-center">
                                <div className="relative inline-flex mb-6">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.27)' }}>
                                        <s.icon size={22} style={{ color: 'var(--purple)' }} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>{parseInt(s.n)}</span>
                                </div>
                                <h3 className="font-bold text-1 mb-2">{s.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgba(160,148,210,0.55)' }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: BarChart3, title: 'Real-time Score', c: '#a855f7' },
                            { icon: Zap, title: 'Instant Analysis', c: '#7c3aed' },
                            { icon: Shield, title: 'Risk Simulation', c: '#8b5cf6' },
                            { icon: PieChart, title: 'Anomaly Detection', c: '#c084fc' },
                        ].map((f, i) => (
                            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="card-white hover-lift p-5 text-center">
                                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: `${f.c}1a`, border: `1px solid ${f.c}30` }}>
                                    <f.icon size={18} style={{ color: f.c }} />
                                </div>
                                <p className="text-xs font-semibold text-1">{f.title}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section id="reviews" className="py-24 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <div className="badge inline-flex mb-5">Testimonials</div>
                    <h2 className="font-display font-black text-1" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
                        Real People. <span className="text-gradient">Real Results.</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="card hover-lift p-6">
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: t.r }).map((_, j) => <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(200,190,255,0.7)' }}>"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>{t.name.charAt(0)}</div>
                                <div><p className="font-semibold text-sm text-1">{t.name}</p><p className="text-xs text-3">{t.role}</p></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-24 px-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(180deg, var(--bg) 0%, #110830 50%, var(--bg) 100%)' }}>
                <Orb size={700} x="50%" y="50%" color="radial-gradient(circle, rgba(124,58,237,0.38), transparent 65%)" blur={100} delay={0} />
                <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />

                <div className="relative max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="badge inline-flex mb-6"><Sparkles size={11} /> 100,000 free AI credits</div>
                        <h2 className="font-display font-black text-1 leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>
                            Start Your Journey.<br /><span className="text-gradient">Free. Today.</span>
                        </h2>
                        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(200,190,255,0.6)' }}>
                            No credit card. No investment advice. Just powerful AI coaching for your financial future.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center mb-10">
                            <Link to="/signup" className="btn text-base px-10 py-4">Create Free Account <ArrowRight size={17} /></Link>
                            <Link to="/login" className="btn-outline text-base px-10 py-4">Sign In</Link>
                        </div>
                        <div className="flex flex-wrap gap-5 justify-center">
                            {['No credit card', 'Privacy-first', 'Cancel anytime', '100k credits'].map(f => (
                                <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(168,85,247,0.7)' }}>
                                    <Check size={11} style={{ color: 'var(--purple)' }} /> {f}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{ borderTop: '1px solid rgba(168,85,247,0.12)', background: 'rgba(4,4,12,0.98)' }}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><TrendingUp size={12} className="text-white" /></div>
                                <span className="font-display font-bold text-lg text-gradient">finexa</span>
                            </div>
                            <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(160,148,210,0.45)' }}>AI-powered financial coaching. Privacy-first. Educational only. Not investment advice.</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-1 mb-3">Product</p>
                            <div className="space-y-2">
                                {['Features', 'How It Works', 'AI Coach', 'Wallet'].map(l => (
                                    <a key={l} href="#features" className="block text-xs transition-colors" style={{ color: 'rgba(160,148,210,0.45)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(200,190,255,0.7)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,148,210,0.45)'}>{l}</a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-1 mb-3">Account</p>
                            <div className="space-y-2">
                                {[{ l: 'Sign In', to: '/login' }, { l: 'Create Account', to: '/signup' }, { l: 'Dashboard', to: '/dashboard' }].map(l => (
                                    <Link key={l.l} to={l.to} className="block text-xs transition-colors" style={{ color: 'rgba(160,148,210,0.45)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(200,190,255,0.7)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,148,210,0.45)'}>{l.l}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
                        <p className="text-[11px]" style={{ color: 'rgba(160,148,210,0.35)' }}>Not investment advice. Educational purposes only.</p>
                        <p className="text-[11px]" style={{ color: 'rgba(160,148,210,0.35)' }}>&copy; 2026 Finexa.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
