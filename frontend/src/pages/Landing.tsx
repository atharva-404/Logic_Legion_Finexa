import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import {
    Shield, Zap, Brain, Wallet, Target, TrendingUp,
    ArrowRight, Check, BarChart3, Lock, Sparkles,
    ChevronRight, Bot, Wifi, CreditCard, Activity,
    FileText, PieChart
} from 'lucide-react';

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
    const sRotX = useSpring(rotX, { stiffness: 150, damping: 22 });
    const sRotY = useSpring(rotY, { stiffness: 150, damping: 22 });
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        rotX.set(((e.clientY - r.top - r.height / 2) / r.height) * -10);
        rotY.set(((e.clientX - r.left - r.width / 2) / r.width) * 12);
    };
    const onLeave = () => { rotX.set(0); rotY.set(0); };

    const W = 375, H = 236;

    return (
        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
            className="relative select-none"
            style={{ perspective: 1000, width: W, maxWidth: '100%' }}>

            {/* Deep wide glow */}
            <div className="absolute pointer-events-none"
                style={{ inset: -60, background: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(124,58,237,0.55), rgba(168,85,247,0.18) 55%, transparent 75%)', filter: 'blur(38px)' }} />
            {/* Close inner glow */}
            <div className="absolute pointer-events-none"
                style={{ inset: -12, background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(192,132,252,0.18), transparent)', filter: 'blur(12px)' }} />

            {/* Neon border ring */}
            <div className="absolute pointer-events-none" style={{
                inset: -2, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(192,132,252,0.7) 0%, rgba(124,58,237,0.4) 50%, rgba(236,72,153,0.5) 100%)',
                padding: 1.5, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor', maskComposite: 'exclude',
            }} />

            {/* Card */}
            <motion.div style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' }}
                animate={{ y: [-6, 6, -6] }}
                transition={{ y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>

                <div style={{
                    width: '100%', aspectRatio: `${W} / ${H}`,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #1c0b3c 0%, #2f1268 40%, #1a0a38 100%)',
                    boxShadow: '0 32px 90px rgba(124,58,237,0.6), 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(168,85,247,0.2)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
                        <circle cx={W * 0.95} cy={H * -0.1} r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                        <circle cx={W * 0.95} cy={H * -0.1} r="175" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                        <circle cx={W * -0.05} cy={H * 1.05} r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                        <circle cx={W * 0.5} cy={H * 0.5} r="80" stroke="rgba(168,85,247,0.08)" strokeWidth="1" fill="none" />
                    </svg>
                    {/* Sheen */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)' }} />
                    {/* Holographic */}
                    <div className="absolute inset-0 opacity-[0.22]" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(59,130,246,0.35) 50%, rgba(236,72,153,0.3))', animation: 'gradientShift 5s ease infinite', backgroundSize: '300% 300%' }} />
                    {/* Scan line */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div className="absolute left-0 right-0 h-[1.5px]"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.95), rgba(255,255,255,0.6), rgba(192,132,252,0.95), transparent)' }}
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.8 }} />
                    </div>
                    {/* Bottom band */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc, #ec4899, #c084fc, #a855f7, #7c3aed)' }} />
                    <div className="relative z-10 flex flex-col h-full" style={{ padding: '20px 24px 18px' }}>
                        <div className="flex items-center justify-between mb-auto">
                            <div className="flex items-center gap-1.5">
                                <Wifi size={14} className="text-white/40 -rotate-90" />
                                <span className="text-white/35 text-[9px] font-mono tracking-[0.35em]">NFC</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(168,85,247,0.95)', boxShadow: '0 0 10px rgba(168,85,247,0.9)' }} />
                                <span className="text-white/80 text-[11px] font-black tracking-[0.3em]">FINEXA</span>
                            </div>
                        </div>
                        <div className="mt-3 mb-4">
                            <div style={{ width: 42, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #c8943a 0%, #f0c868 30%, #b87c28 60%, #deb454 100%)', boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.35), 0 2px 8px rgba(200,148,58,0.4)' }}>
                                <div className="w-full h-full rounded-md" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)', borderRadius: 6 }} />
                            </div>
                        </div>
                        <div className="mb-5">
                            <p className="text-white/20 text-[7px] mb-1 font-mono tracking-[0.3em]">CARD NUMBER</p>
                            <p className="text-white font-mono tracking-[0.2em] drop-shadow-sm" style={{ fontSize: 15, textShadow: '0 0 20px rgba(168,85,247,0.4)' }}>4532 8821 •••• 4231</p>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-white/20 text-[7px] tracking-[0.3em] mb-0.5">CARD HOLDER</p>
                                <p className="text-white text-xs font-semibold tracking-widest">SUKHADA JOSHI</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white/20 text-[7px] tracking-[0.3em] mb-0.5">EXPIRES</p>
                                <p className="text-white text-xs font-semibold">08 / 28</p>
                            </div>
                            <div className="flex -space-x-3">
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(220,38,38,0.75)', boxShadow: '0 2px 8px rgba(220,38,38,0.4)' }} />
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(234,179,8,0.75)', boxShadow: '0 2px 8px rgba(234,179,8,0.3)' }} />
                            </div>
                        </div>
                    </div>
                </div>
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



/* -- Finexa Score Pill (navbar) ---------------------- */
function FinexaScorePill() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const score = user?.financial_health_score ?? 0;
    const credits = user?.ai_credits;
    return (
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-medium">
            {/* Fin Score */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300"
                style={{
                    background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.04)',
                    border: isDark ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(34,197,94,0.2)',
                    color: isDark ? '#4ade80' : '#15803d'
                }}>
                <div className="w-1 h-1 rounded-full bg-green-500" style={{ boxShadow: isDark ? '0 0 6px #22c55e' : 'none' }} />
                <span className="opacity-80">Fin Score</span>
                <span className="font-bold">{score}</span>
            </div>
            {/* AI Credits */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300"
                style={{
                    background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.04)',
                    border: isDark ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(245,158,11,0.2)',
                    color: isDark ? 'rgba(245,158,11,0.85)' : '#b45309'
                }}>
                <Zap size={9} style={{ color: '#f59e0b' }} />
                <span className="opacity-80">AI</span>
                <span className="font-bold">
                    {credits != null
                        ? credits >= 1000
                            ? `${(credits / 1000).toFixed(0)}k`
                            : credits
                        : '100k'}
                </span>
            </div>
        </div>
    );
}

/* -- AI Advisor Card with 3D tilt -------------------- */
function AIAdvisorCard() {
    const rotX = useMotionValue(0);
    const rotY = useMotionValue(0);
    const sRotX = useSpring(rotX, { stiffness: 200, damping: 24 });
    const sRotY = useSpring(rotY, { stiffness: 200, damping: 24 });
    const ref = useRef<HTMLDivElement>(null);

    const onMove = (e: React.MouseEvent) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        rotX.set(((e.clientY - r.top - r.height / 2) / r.height) * -14);
        rotY.set(((e.clientX - r.left - r.width / 2) / r.width) * 18);
    };
    const onLeave = () => { rotX.set(0); rotY.set(0); };

    return (
        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
            className="relative select-none hidden lg:block" style={{ perspective: 1000, width: 240 }}>

            {/* Ambient glow */}
            <div className="absolute pointer-events-none"
                style={{ inset: -28, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(124,58,237,0.3), transparent)', filter: 'blur(22px)' }} />

            {/* Floating chips */}
            <motion.div animate={{ y: [-4, 4, -4], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(168,85,247,0.25)', backdropFilter: 'blur(8px)' }}>
                <Sparkles size={8} style={{ color: '#a855f7' }} />
                <span className="text-[8px] font-semibold" style={{ color: 'rgba(192,132,252,0.9)' }}>Analyzing spending…</span>
            </motion.div>
            <motion.div animate={{ y: [3, -3, 3], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, delay: 0.8 }}
                className="absolute -bottom-6 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full pointer-events-none"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(8px)' }}>
                <div className="w-1 h-1 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                <span className="text-[8px] font-semibold" style={{ color: '#4ade80' }}>End-to-end encrypted</span>
            </motion.div>
            <motion.div animate={{ x: [-2, 2, -2], opacity: [0.65, 1, 0.65] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1.4 }}
                className="absolute top-1/2 -right-[88px] -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full pointer-events-none"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(8px)' }}>
                <Activity size={8} style={{ color: '#60a5fa' }} />
                <span className="text-[8px] font-semibold" style={{ color: 'rgba(147,197,253,0.9)' }}>Real-time tips</span>
            </motion.div>

            {/* 3D panel */}
            <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="flex flex-col overflow-hidden"
                style={{
                    rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d',
                    borderRadius: 18,
                    background: 'linear-gradient(160deg, rgba(14,8,32,0.97) 0%, rgba(18,8,38,0.97) 100%)',
                    boxShadow: '0 0 0 1px rgba(168,85,247,0.3), 0 20px 60px rgba(124,58,237,0.3), 0 4px 16px rgba(0,0,0,0.8)',
                }}>
                <div style={{ height: 2, background: 'linear-gradient(90deg,#7c3aed,#a855f7,#c084fc,#a855f7,#7c3aed)' }} />
                <div className="flex items-center gap-2.5 px-3.5 py-2.5"
                    style={{ borderBottom: '1px solid rgba(168,85,247,0.1)', background: 'rgba(124,58,237,0.05)' }}>
                    <div className="relative flex-shrink-0">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 14px rgba(168,85,247,0.7)' }}>
                            <Bot size={13} className="text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
                            style={{ background: '#22c55e', borderColor: 'rgba(14,8,32,1)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white leading-none">Finexa AI</p>
                        <p className="text-[8px] mt-0.5 truncate" style={{ color: 'rgba(160,148,210,0.5)' }}>Always analyzing · Always on</p>
                    </div>
                    <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div className="w-1 h-1 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                        <span className="text-[7px] font-bold" style={{ color: '#4ade80' }}>Live</span>
                    </motion.div>
                </div>
                <div className="px-3 pt-2.5 pb-2 space-y-2">
                    <div className="flex justify-end">
                        <div className="px-2.5 py-1.5 text-[9px] leading-relaxed rounded-2xl rounded-tr-sm"
                            style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', maxWidth: '75%', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
                            How do I improve my score? 🎯
                        </div>
                    </div>
                    <div className="flex gap-1.5 items-end">
                        <div className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center mb-0.5"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                            <Bot size={7} className="text-white" />
                        </div>
                        <div className="px-2.5 py-1.5 text-[9px] leading-relaxed rounded-2xl rounded-bl-sm"
                            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.18)', color: 'rgba(215,205,255,0.9)', maxWidth: '84%' }}>
                            Cut dining by <span style={{ color: '#c084fc', fontWeight: 700 }}>₹2,400/mo</span> — score +<span style={{ color: '#4ade80', fontWeight: 700 }}>12 pts</span> 🚀
                        </div>
                    </div>
                    <div className="flex gap-1.5 items-center pb-0.5">
                        <div className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                            <Bot size={7} className="text-white" />
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl rounded-bl-sm"
                            style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(168,85,247,0.12)' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: '#a855f7', boxShadow: '0 0 4px rgba(168,85,247,0.5)' }}
                                    animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 pb-3">
                    <div className="flex-1 flex items-center px-2.5 py-2 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.14)' }}>
                        <span className="text-[8px] flex-1" style={{ color: 'rgba(160,148,210,0.3)' }}>Ask your AI advisor…</span>
                        <Sparkles size={8} style={{ color: 'rgba(168,85,247,0.3)' }} />
                    </div>
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 12px rgba(168,85,247,0.5)' }}>
                        <ArrowRight size={11} className="text-white" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}


/* ════════════ MAIN PAGE ════════════ */
export default function Landing() {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const f = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', f, { passive: true });
        return () => window.removeEventListener('scroll', f);
    }, []);

    return (
        <div style={{ background: 'var(--bg)' }}>

            {/* ═══ NAVBAR ═══ */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12"
                animate={{ backdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)' }}
                style={{
                    background: scrolled
                        ? (isDark ? 'rgba(5,5,15,0.9)' : 'rgba(255,255,255,0.97)')
                        : (isDark ? 'rgba(5,5,15,0.5)' : 'rgba(255,255,255,0.75)'),
                    borderBottom: scrolled
                        ? (isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.1)')
                        : '1px solid transparent',
                    boxShadow: scrolled
                        ? (isDark
                            ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.08)'
                            : '0 4px 20px rgba(0,0,0,0.08)')
                        : 'none',
                    transition: 'all 0.4s ease',
                }}>
                {/* Logo LEFT */}
                <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                    <div className="relative">
                        {isDark && <div className="absolute -inset-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.55), transparent 70%)', filter: 'blur(6px)', animation: 'glowPulse 3s ease-in-out infinite' }} />}
                        <img src="/logo.png" alt="Finexa" className="relative w-9 h-9 object-contain"
                            style={{ filter: isDark ? 'drop-shadow(0 0 10px rgba(168,85,247,0.9))' : 'none' }} />
                    </div>
                    <span className="font-display font-extrabold text-xl"
                        style={isDark
                            ? { background: 'linear-gradient(120deg,#fff 0%,#e8d5ff 50%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em' }
                            : { color: '#0a0a0a', letterSpacing: '-0.01em' }}>Finexa</span>
                </Link>

                {/* Nav RIGHT */}
                <div className="flex items-center gap-5 md:gap-7 ml-auto">
                    <div className="hidden md:flex items-center gap-1">
                        {[['How It Works', '/how-it-works', false], ['Subscription', '/subscription', false], ['FAQ', '/faq', false]].map(([label, href, isHash]) => (
                            isHash
                                ? <a key={String(label)} href={String(href)}
                                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                                    style={{ color: isDark ? 'rgba(220,210,255,0.75)' : 'rgba(31,41,55,0.7)', background: 'transparent' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = isDark ? '#fff' : '#000'; el.style.background = isDark ? 'rgba(168,85,247,0.22)' : 'rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = isDark ? 'rgba(220,210,255,0.75)' : 'rgba(31,41,55,0.7)'; el.style.background = 'transparent'; }}>{label}</a>
                                : <Link key={String(label)} to={String(href)}
                                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                                    style={{ color: isDark ? 'rgba(220,210,255,0.75)' : 'rgba(31,41,55,0.7)', background: 'transparent' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = isDark ? '#fff' : '#000'; el.style.background = isDark ? 'rgba(168,85,247,0.22)' : 'rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = isDark ? 'rgba(220,210,255,0.75)' : 'rgba(31,41,55,0.7)'; el.style.background = 'transparent'; }}>{label}</Link>
                        ))}
                    </div>
                    {/* Theme toggle + Action buttons */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {user ? (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/dashboard" className="btn text-xs px-3.5 py-1.5">
                                    Dashboard <ArrowRight size={12} />
                                </Link>
                            </motion.div>
                        ) : (
                            <Link to="/signup" className="btn text-xs px-3.5 py-1.5">
                                Get Started <ArrowRight size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* ═══ HERO ═══ — fits exactly one viewport */}
            <section className="relative h-screen flex items-center overflow-hidden grid-bg-dense" style={{ paddingTop: 64 }}>
                <Orb size={700} x="50%" y="-5%" color="radial-gradient(circle, rgba(124,58,237,0.22), transparent 70%)" blur={100} delay={0} />
                <Orb size={380} x="10%" y="55%" color="radial-gradient(circle, rgba(168,85,247,0.13), transparent 70%)" blur={60} delay={2} />
                <Orb size={320} x="80%" y="50%" color="radial-gradient(circle, rgba(76,29,149,0.16), transparent 70%)" blur={55} delay={1.5} />
                <ShootingStars />

                {/* Pulsing spark glyphs — sides only */}
                {[[-5, 22], [8, 72], [91, 55]].map(([x, y], i) => (
                    <motion.div key={i} className="absolute pointer-events-none select-none"
                        style={{ left: `${x}%`, top: `${y}%`, color: 'rgba(168,85,247,0.2)', fontSize: i % 2 === 0 ? 12 : 8 }}
                        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.35, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 5 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}>✦</motion.div>
                ))}

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                        {/* LEFT — text */}
                        <div>
                            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold"
                                style={isDark
                                    ? { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'var(--purple)' }
                                    : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.15)', color: '#0a0a0a' }}>
                                <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={isDark ? { background: '#a855f7', boxShadow: '0 0 6px #a855f7' } : { background: '#0a0a0a' }} />
                                <Sparkles size={10} /> AI-Powered Financial Intelligence
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mb-5">
                                <h1 className="font-display font-black leading-[1.05]"
                                    style={{ fontSize: 'clamp(2.6rem,5.5vw,4.2rem)', textShadow: isDark ? '0 0 80px rgba(168,85,247,0.2)' : 'none' }}>
                                    <span className="text-gradient-hero">Your Financial</span><br />
                                    <span style={{ color: 'var(--text)' }}>Future, </span>
                                    <span className="text-gradient relative inline-block">
                                        Simplified.
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
                                className="text-base leading-relaxed mb-7 max-w-lg"
                                style={{ color: 'var(--text-2)' }}>
                                Privacy-first AI coaching — health scoring, smart budgeting, risk simulations,
                                digital wallet & <span style={{ color: isDark ? 'var(--purple)' : '#0a0a0a', fontWeight: 600 }}>100k free AI credits</span>.
                            </motion.p>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                                className="flex flex-wrap gap-3 mb-7">
                                <Link to="/signup" className="btn text-sm px-7 py-3">Start Free — 100k Credits <ArrowRight size={15} /></Link>
                                <a href="#features" className="btn-outline text-sm px-7 py-3">Explore <ChevronRight size={15} /></a>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
                                className="flex flex-wrap gap-4">
                                {[{ i: Lock, t: 'Bank-grade privacy' }, { i: Shield, t: 'No data selling' }, { i: Zap, t: 'No credit card' }].map(b => (
                                    <div key={b.t} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
                                        <b.i size={11} style={{ color: 'var(--purple)' }} />{b.t}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* RIGHT — card + AI advisor */}
                        <motion.div initial={{ opacity: 0, x: 50, scale: 0.93 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 0.35, duration: 0.9, type: 'spring', stiffness: 75 }}
                            className="flex flex-col items-center gap-4">

                            {/* 3D Card */}
                            <HeroCard3D />

                            {/* AI Advisor */}
                            <AIAdvisorCard />
                        </motion.div>

                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <motion.div animate={{ y: [0, 8, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex flex-col items-center gap-1">
                        <div className="w-px h-7" style={{ background: isDark ? 'linear-gradient(180deg,transparent,rgba(168,85,247,0.6),transparent)' : 'linear-gradient(180deg,transparent,rgba(0,0,0,0.3),transparent)' }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isDark ? 'rgba(168,85,247,0.7)' : 'rgba(0,0,0,0.4)' }} />
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: 'linear-gradient(0deg,var(--bg),transparent)' }} />
            </section>


            {/* ═══ STATS BAR ═══ */}
            <div className="relative py-12 overflow-hidden" style={{
                background: isDark ? 'rgba(10,8,25,0.98)' : '#f9fafb',
                borderTop: isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.08)',
                borderBottom: isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.08)',
            }}>
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
                            <p className="text-xs" style={{ color: isDark ? 'rgba(160,148,210,0.5)' : '#6b7280' }}>{s.l}</p>
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
                        <p style={{ color: isDark ? 'rgba(200,190,255,0.6)' : '#6b7280' }} className="text-base max-w-xl mx-auto">
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
                                    style={isDark
                                        ? { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)' }
                                        : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <f.icon size={19} style={{ color: isDark ? 'var(--purple)' : '#0a0a0a' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-1 mb-1.5">{f.title}</h3>
                                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(160,148,210,0.55)' : '#6b7280' }}>{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CAPABILITIES STRIP ═══ */}
            <section className="relative py-16 overflow-hidden"
                style={{ background: isDark ? 'linear-gradient(180deg,rgba(6,3,16,1) 0%,rgba(14,8,35,1) 50%,rgba(6,3,16,1) 100%)' : '#f9fafb' }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: isDark ? 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.08), transparent)' : 'none' }} />

                <motion.div className="text-center mb-10 px-6"
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: isDark ? 'rgba(168,85,247,0.5)' : '#9ca3af' }}>All Inside Finexa</p>
                    <h2 className="font-display font-black" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: isDark ? '#fff' : '#0a0a0a' }}>
                        Powerful features. <span className="text-gradient">Total control.</span>
                    </h2>
                </motion.div>

                <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                    style={{ background: isDark ? 'linear-gradient(90deg,rgba(6,3,16,1),transparent)' : 'linear-gradient(90deg,#f9fafb,transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                    style={{ background: isDark ? 'linear-gradient(270deg,rgba(6,3,16,1),transparent)' : 'linear-gradient(270deg,#f9fafb,transparent)' }} />

                {/* Row 1 — left */}
                <div className="relative mb-4 overflow-hidden">
                    <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="flex gap-4 w-max pl-4">
                        {[
                            { icon: Brain, label: 'AI Document Analysis', color: '#a855f7' },
                            { icon: TrendingUp, label: 'Health Score 0–100', color: '#10b981' },
                            { icon: Target, label: 'Smart Goals Tracker', color: '#7c3aed' },
                            { icon: Shield, label: 'Risk Simulator', color: '#8b5cf6' },
                            { icon: BarChart3, label: 'Real-time Score', color: '#c084fc' },
                            { icon: Zap, label: 'Instant Analysis', color: '#f59e0b' },
                            // duplicate for seamless loop
                            { icon: Brain, label: 'AI Document Analysis_', color: '#a855f7' },
                            { icon: TrendingUp, label: 'Health Score 0–1002', color: '#10b981' },
                            { icon: Target, label: 'Smart Goals Tracker_', color: '#7c3aed' },
                            { icon: Shield, label: 'Risk Simulator_', color: '#8b5cf6' },
                            { icon: BarChart3, label: 'Real-time Score_', color: '#c084fc' },
                            { icon: Zap, label: 'Instant Analysis_', color: '#f59e0b' },
                        ].map(f => (
                            <div key={f.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-shrink-0"
                                style={isDark
                                    ? { background: `linear-gradient(135deg,${f.color}12,${f.color}06)`, border: `1px solid ${f.color}30`, boxShadow: `0 4px 24px ${f.color}12` }
                                    : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={isDark
                                        ? { background: `${f.color}18`, border: `1px solid ${f.color}35` }
                                        : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <f.icon size={15} style={{ color: isDark ? f.color : '#374151' }} />
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap" style={{ color: isDark ? 'rgba(220,210,255,0.8)' : '#1f2937' }}>{f.label.replace(/_/g, '').replace(/2$/, '')}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Row 2 — right */}
                <div className="relative overflow-hidden">
                    <motion.div animate={{ x: ['-50%', '0%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                        className="flex gap-4 w-max pl-4">
                        {[
                            { icon: Wallet, label: 'Digital Wallet', color: '#c084fc' },
                            { icon: Zap, label: '100k Free AI Credits', color: '#f59e0b' },
                            { icon: Bot, label: 'AI Financial Coach', color: '#a855f7' },
                            { icon: BarChart3, label: 'Spending Insights', color: '#10b981' },
                            { icon: Shield, label: 'Risk Simulation', color: '#8b5cf6' },
                            { icon: PieChart, label: 'Anomaly Detection', color: '#7c3aed' },
                            // duplicate for seamless loop
                            { icon: Wallet, label: 'Digital Wallet_', color: '#c084fc' },
                            { icon: Zap, label: '100k Free AI Credits_', color: '#f59e0b' },
                            { icon: Bot, label: 'AI Financial Coach_', color: '#a855f7' },
                            { icon: BarChart3, label: 'Spending Insights_', color: '#10b981' },
                            { icon: Shield, label: 'Risk Simulation_', color: '#8b5cf6' },
                            { icon: PieChart, label: 'Anomaly Detection_', color: '#7c3aed' },
                        ].map(f => (
                            <div key={f.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-shrink-0"
                                style={isDark
                                    ? { background: `linear-gradient(135deg,${f.color}12,${f.color}06)`, border: `1px solid ${f.color}30`, boxShadow: `0 4px 24px ${f.color}12` }
                                    : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={isDark
                                        ? { background: `${f.color}18`, border: `1px solid ${f.color}35` }
                                        : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <f.icon size={15} style={{ color: isDark ? f.color : '#374151' }} />
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap" style={{ color: isDark ? 'rgba(220,210,255,0.8)' : '#1f2937' }}>{f.label.replace(/_/g, '')}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS — 3 STEPS ═══ */}
            <section className="py-24 relative overflow-hidden"
                style={{ background: isDark ? 'linear-gradient(180deg, #0a0618 0%, #130940 50%, #0a0618 100%)' : '#ffffff' }}>
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                {isDark && <Orb size={600} x="50%" y="50%" color="radial-gradient(circle, rgba(124,58,237,0.22), transparent 65%)" blur={100} delay={0} />}

                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="badge inline-flex mb-5">How It Works</div>
                        <h2 className="font-display font-black text-1 mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
                            Start in <span className="text-gradient">3 Simple Steps</span>
                        </h2>
                        <p className="text-base max-w-xl mx-auto mb-14" style={{ color: isDark ? 'rgba(200,190,255,0.55)' : '#6b7280' }}>
                            From sign-up to full financial clarity in minutes — no complexity, no jargon.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        style={isDark
                                            ? { background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.27)' }
                                            : { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)' }}>
                                        <s.icon size={22} style={{ color: isDark ? 'var(--purple)' : '#0a0a0a' }} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                        style={{ background: isDark ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#0a0a0a' }}>{parseInt(s.n)}</span>
                                </div>
                                <h3 className="font-bold text-1 mb-2">{s.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(160,148,210,0.55)' : '#6b7280' }}>{s.desc}</p>
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
                        <p className="text-base leading-relaxed mb-6" style={{ color: isDark ? 'rgba(200,190,255,0.6)' : '#6b7280' }}>
                            Ask anything. Get clear, personalised answers about budgeting, savings, emergency funds, and more —
                            powered by 100,000 free AI credits. Each message costs just 100 credits.
                        </p>
                        <ul className="space-y-3 mb-7">
                            {['Context-aware answers from your real financial data', 'ELI-15 mode for plain language explanations', 'Streaming word-by-word responses with copy support'].map(p => (
                                <li key={p} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? 'rgba(200,190,255,0.7)' : '#374151' }}>
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={isDark
                                            ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }
                                            : { background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.12)' }}>
                                        <Check size={11} style={{ color: isDark ? 'var(--purple)' : '#0a0a0a' }} />
                                    </div>{p}
                                </li>
                            ))}
                        </ul>
                        <Link to={user ? "/dashboard/coach" : "/signup"} className="btn w-fit">Try AI Coach Free <ArrowRight size={15} /></Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <div className="card-glow p-5 space-y-3">
                            <div className="flex items-center gap-3 pb-4"
                                style={{ borderBottom: isDark ? '1px solid rgba(168,85,247,0.12)' : '1px solid rgba(0,0,0,0.08)' }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: isDark ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#0a0a0a' }}>
                                    <Bot size={15} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-1">Finexa AI Coach</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                        <p className="text-[10px] text-3">Online · 97,100 credits</p>
                                    </div>
                                </div>
                            </div>
                            {[
                                { r: 'user', t: 'What is my financial health score?' },
                                { r: 'bot', t: 'Your score is 74/100 — Good. Your 21.4% savings rate is excellent! Main improvement area: emergency fund (2.4 months — aim for 6).' },
                                { r: 'user', t: 'How can I improve it fast?' },
                                { r: 'bot', t: 'Two moves: redirect your Rs 2,400 monthly entertainment overspend to emergency savings, and cancel your unused gym (-Rs 800/mo).' },
                            ].map((m, i) => (
                                <div key={i} className={`flex gap-2 ${m.r === 'user' ? 'justify-end' : ''}`}>
                                    {m.r === 'bot' && <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ background: isDark ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#0a0a0a' }}>
                                        <Bot size={10} className="text-white" />
                                    </div>}
                                    <div className="max-w-[78%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed"
                                        style={m.r === 'user'
                                            ? { background: isDark ? 'linear-gradient(135deg, #6d28d9, #a855f7)' : '#0a0a0a', color: '#fff', borderRadius: '14px 14px 4px 14px' }
                                            : { background: isDark ? 'rgba(168,85,247,0.07)' : 'rgba(0,0,0,0.04)', color: isDark ? 'rgba(200,190,255,0.8)' : '#374151', border: isDark ? '1px solid rgba(168,85,247,0.14)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '14px 14px 14px 4px' }}>
                                        {m.t}
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                                    style={{ background: isDark ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#0a0a0a' }}>
                                    <Bot size={10} className="text-white" />
                                </div>
                                <div className="px-3 py-2 rounded-2xl flex items-center gap-1"
                                    style={{ background: isDark ? 'rgba(168,85,247,0.07)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(168,85,247,0.14)' : '1px solid rgba(0,0,0,0.08)' }}>
                                    {[0, 1, 2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: isDark ? 'var(--purple)' : '#374151' }}
                                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.13 }} />)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>



            {/* ═══ CREDITS PRICING ═══ */}
            <section id="subscribe" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                <Orb size={700} x="50%" y="50%" color="radial-gradient(circle, rgba(124,58,237,0.2), transparent 65%)" blur={100} delay={0} />

                <div className="relative max-w-6xl mx-auto">
                    <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="badge inline-flex mb-5"><Sparkles size={11} /> AI Credits</div>
                        <h2 className="font-display font-black text-1 leading-tight mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>
                            Power Up Your <span className="text-gradient">AI Coach.</span>
                        </h2>
                        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(200,190,255,0.55)' }}>
                            Every account starts with 100,000 free credits. Need more? Top up anytime — no subscription needed.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { label: 'Starter', credits: '50,000', price: '₹199', per: '≈ 500 AI messages', color: '#7c3aed', features: ['AI Coach chats', 'Document analysis', 'Goal tracking', 'Priority support'], popular: false },
                            { label: 'Pro', credits: '200,000', price: '₹599', per: '≈ 2,000 AI messages', color: '#a855f7', features: ['Everything in Starter', 'Income simulations', 'Risk scenarios', 'Advanced insights', 'Habit AI suggestions'], popular: true },
                            { label: 'Elite', credits: '500,000', price: '₹1,299', per: '≈ 5,000 AI messages', color: '#c084fc', features: ['Everything in Pro', 'Unlimited document uploads', 'Priority AI queue', 'Custom financial reports', 'Early feature access'], popular: false },
                        ].map((plan, i) => (
                            <motion.div key={plan.label}
                                initial={{ opacity: 0, y: 30, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                                className="relative flex flex-col rounded-2xl overflow-hidden"
                                style={isDark
                                    ? {
                                        background: plan.popular ? 'linear-gradient(145deg,#1a0845,#2d1060,#1a0845)' : 'rgba(12,8,30,0.95)',
                                        border: `1px solid ${plan.popular ? 'rgba(168,85,247,0.45)' : 'rgba(168,85,247,0.15)'}`,
                                        boxShadow: plan.popular ? '0 24px 60px rgba(124,58,237,0.3)' : '0 8px 30px rgba(0,0,0,0.4)',
                                    }
                                    : {
                                        background: plan.popular ? '#0a0a0a' : '#ffffff',
                                        border: `1px solid ${plan.popular ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)'}`,
                                        boxShadow: plan.popular ? '0 16px 48px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
                                    }}>

                                {/* Top accent */}
                                <div style={{ height: 2, background: isDark ? `linear-gradient(90deg,transparent,${plan.color},transparent)` : plan.popular ? 'linear-gradient(90deg,transparent,#fff,transparent)' : 'linear-gradient(90deg,transparent,rgba(0,0,0,0.2),transparent)' }} />

                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                            style={isDark
                                                ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', letterSpacing: '0.05em' }
                                                : { background: '#ffffff', color: '#0a0a0a', letterSpacing: '0.05em' }}>
                                            MOST POPULAR
                                        </motion.span>
                                    </div>
                                )}

                                <div className="p-7 flex flex-col flex-1">
                                    <p className="text-xs font-semibold tracking-widest mb-3"
                                        style={{ color: isDark ? plan.color : plan.popular ? '#ffffff' : '#374151' }}>{plan.label.toUpperCase()}</p>
                                    <div className="mb-1">
                                        <span className="font-display font-black text-4xl"
                                            style={{ color: isDark ? '#ffffff' : plan.popular ? '#ffffff' : '#0a0a0a' }}>{plan.price}</span>
                                        <span className="text-sm ml-1"
                                            style={{ color: isDark ? 'rgba(180,165,230,0.45)' : plan.popular ? 'rgba(255,255,255,0.55)' : '#9ca3af' }}>one-time</span>
                                    </div>
                                    <p className="text-sm font-semibold mb-1"
                                        style={{ color: isDark ? plan.color : plan.popular ? 'rgba(255,255,255,0.8)' : '#374151' }}>{plan.credits} credits</p>
                                    <p className="text-xs mb-6"
                                        style={{ color: isDark ? 'rgba(160,148,210,0.45)' : plan.popular ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>{plan.per}</p>

                                    <ul className="space-y-2.5 mb-8 flex-1">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-2.5 text-sm"
                                                style={{ color: isDark ? 'rgba(200,190,255,0.7)' : plan.popular ? 'rgba(255,255,255,0.85)' : '#374151' }}>
                                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={isDark
                                                        ? { background: `${plan.color}20`, border: `1px solid ${plan.color}40` }
                                                        : { background: plan.popular ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)', border: plan.popular ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.12)' }}>
                                                    <Check size={9} style={{ color: isDark ? plan.color : plan.popular ? '#ffffff' : '#0a0a0a' }} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                        className="w-full py-3 rounded-xl text-sm font-semibold relative overflow-hidden group"
                                        style={isDark
                                            ? (plan.popular
                                                ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }
                                                : { background: 'rgba(168,85,247,0.08)', color: 'rgba(192,132,252,0.9)', border: '1px solid rgba(168,85,247,0.25)' })
                                            : (plan.popular
                                                ? { background: '#ffffff', color: '#0a0a0a', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                                                : { background: '#0a0a0a', color: '#ffffff', border: '1px solid rgba(0,0,0,0.8)' })}>
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                                            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)' }} />
                                        Buy {plan.credits} Credits
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p className="text-center text-xs mt-8" style={{ color: 'rgba(160,148,210,0.35)' }}
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                        Credits never expire • Instant top-up • Secure payment via Razorpay
                    </motion.p>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-24 px-6 relative overflow-hidden"
                style={{ background: isDark ? 'linear-gradient(180deg, var(--bg) 0%, #110830 50%, var(--bg) 100%)' : '#f9fafb' }}>
                {isDark && <Orb size={700} x="50%" y="50%" color="radial-gradient(circle, rgba(124,58,237,0.38), transparent 65%)" blur={100} delay={0} />}
                <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />

                <div className="relative max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="badge inline-flex mb-6"><Sparkles size={11} /> 100,000 free AI credits</div>
                        <h2 className="font-display font-black text-1 leading-tight mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>
                            Start Your Journey.<br /><span className="text-gradient">Free. Today.</span>
                        </h2>
                        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: isDark ? 'rgba(200,190,255,0.6)' : '#6b7280' }}>
                            No credit card. No investment advice. Just powerful AI coaching for your financial future.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center mb-10">
                            <Link to="/signup" className="btn text-base px-10 py-4">Create Free Account <ArrowRight size={17} /></Link>
                            <Link to="/login" className="btn-outline text-base px-10 py-4">Sign In</Link>
                        </div>
                        <div className="flex flex-wrap gap-5 justify-center">
                            {['No credit card', 'Privacy-first', 'Cancel anytime', '100k credits'].map(f => (
                                <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(168,85,247,0.7)' : '#6b7280' }}>
                                    <Check size={11} style={{ color: isDark ? 'var(--purple)' : '#0a0a0a' }} /> {f}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                borderTop: isDark ? '1px solid rgba(168,85,247,0.12)' : '1px solid rgba(0,0,0,0.08)',
                background: isDark ? 'rgba(4,4,12,0.98)' : '#f9fafb',
            }}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="relative">
                                    {isDark && <div className="absolute -inset-1 rounded-full opacity-50" style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.5),transparent 70%)', filter: 'blur(4px)' }} />}
                                    <img src="/logo.png" alt="Finexa" className="relative w-6 h-6 object-contain"
                                        style={{ filter: isDark ? 'drop-shadow(0 0 7px rgba(168,85,247,0.8))' : 'none' }} />
                                </div>
                                <span className="font-display font-extrabold text-lg"
                                    style={isDark
                                        ? { background: 'linear-gradient(120deg,#fff 0%,#e8d5ff 50%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                                        : { color: '#0a0a0a' }}>Finexa</span>
                            </div>
                            <p className="text-xs leading-relaxed max-w-xs" style={{ color: isDark ? 'rgba(160,148,210,0.45)' : '#9ca3af' }}>AI-powered financial coaching. Privacy-first. Educational only. Not investment advice.</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-1 mb-3">Product</p>
                            <div className="space-y-2">
                                {['Features', 'How It Works', 'AI Coach', 'Wallet'].map(l => (
                                    <a key={l} href="#features" className="block text-xs transition-colors"
                                        style={{ color: isDark ? 'rgba(160,148,210,0.45)' : '#9ca3af' }}
                                        onMouseEnter={e => e.currentTarget.style.color = isDark ? 'rgba(200,190,255,0.7)' : '#0a0a0a'}
                                        onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(160,148,210,0.45)' : '#9ca3af'}>{l}</a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-1 mb-3">Account</p>
                            <div className="space-y-2">
                                {[{ l: 'Sign In', to: '/login' }, { l: 'Create Account', to: '/signup' }, { l: 'Dashboard', to: '/dashboard' }].map(l => (
                                    <Link key={l.l} to={l.to} className="block text-xs transition-colors"
                                        style={{ color: isDark ? 'rgba(160,148,210,0.45)' : '#9ca3af' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(200,190,255,0.7)' : '#0a0a0a' }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(160,148,210,0.45)' : '#9ca3af' }}>{l.l}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-5"
                        style={{ borderTop: isDark ? '1px solid rgba(168,85,247,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
                        <p className="text-[11px]" style={{ color: isDark ? 'rgba(160,148,210,0.35)' : '#9ca3af' }}>Not investment advice. Educational purposes only.</p>
                        <p className="text-[11px]" style={{ color: isDark ? 'rgba(160,148,210,0.35)' : '#9ca3af' }}>&copy; 2026 Finexa.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
