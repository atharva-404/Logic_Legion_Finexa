import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import AuthBg from '../../components/AuthBg';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } };
const list = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } };

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!email.includes('@')) return setError('Please enter a valid email address.');
        setLoading(true);
        try {
            const res = await fetch(
                `${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/auth/forgot-password/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                },
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.detail || data.error || 'Something went wrong. Try again.');
                return;
            }
            setSent(true);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: '#07050f' }}>

            <AuthBg />

            {/* Card — same width & style as SignIn/SignUp */}
            <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full mx-5"
                style={{ maxWidth: 440 }}>

                <div className="absolute -inset-px rounded-xl pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(168,85,247,0.08), rgba(192,132,252,0.22))', filter: 'blur(1px)' }} />

                <div className="relative overflow-hidden" style={{
                    borderRadius: 12,
                    background: 'rgba(10, 7, 24, 0.97)',
                    border: '1px solid rgba(168,85,247,0.2)',
                    boxShadow: '0 24px 70px rgba(0,0,0,0.65), 0 0 50px rgba(124,58,237,0.12)',
                }}>
                    {/* Top accent strip */}
                    <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #7c3aed 30%, #a855f7 50%, #c084fc 70%, transparent 100%)' }} />
                    <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.06), transparent)' }} />

                    <div className="px-8 pt-7 pb-8">

                        <AnimatePresence mode="wait">
                            {!sent ? (
                                /* ── Request form ── */
                                <motion.div key="form" variants={list} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}>

                                    {/* Logo */}
                                    <motion.div variants={item} className="mb-7">
                                        <Link to="/" className="flex items-center gap-2.5 w-fit group">
                                            <div className="relative">
                                                <div className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.4),transparent 70%)', filter: 'blur(7px)' }} />
                                                <img src="/logo.png" alt="Finexa" className="relative w-8 h-8 object-contain"
                                                    style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.85))' }} />
                                            </div>
                                            <span className="text-[17px] font-semibold tracking-tight"
                                                style={{ background: 'linear-gradient(110deg,#fff 10%,#dcc6ff 55%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                                Finexa
                                            </span>
                                        </Link>
                                    </motion.div>

                                    {/* Heading */}
                                    <motion.div variants={item} className="mb-7">
                                        <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">Reset password</h1>
                                        <p className="text-sm font-normal" style={{ color: 'rgba(180,165,230,0.42)' }}>
                                            Enter your email and we'll send you a reset link
                                        </p>
                                    </motion.div>

                                    {/* Icon */}
                                    <motion.div variants={item} className="flex justify-center mb-7">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                            <Mail size={26} style={{ color: '#a855f7' }} />
                                        </div>
                                    </motion.div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-3.5">
                                        <motion.div variants={item}>
                                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(200,185,240,0.38)' }}>Email address</label>
                                            <input type="email" className="field" placeholder="you@example.com"
                                                value={email} onChange={e => setEmail(e.target.value)} required />
                                        </motion.div>

                                        {error && (
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-xs px-3 py-2.5 rounded-lg"
                                                style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                {error}
                                            </motion.p>
                                        )}

                                        <motion.div variants={item}>
                                            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                                className="btn w-full py-3 text-sm font-medium relative overflow-hidden group rounded-xl"
                                                disabled={loading}>
                                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                                                    style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)' }} />
                                                {loading
                                                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 rounded-full"
                                                        style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                                                    : 'Send Reset Link'}
                                            </motion.button>
                                        </motion.div>
                                    </form>

                                    <motion.div variants={item} className="flex justify-center mt-6">
                                        <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                                            style={{ color: 'rgba(160,140,210,0.45)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,140,210,0.45)'}>
                                            <ArrowLeft size={14} /> Back to Sign In
                                        </Link>
                                    </motion.div>

                                </motion.div>
                            ) : (
                                /* ── Success state ── */
                                <motion.div key="success"
                                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="py-6 text-center">

                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                                        className="flex justify-center mb-6">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                            <CheckCircle size={28} style={{ color: '#10b981' }} />
                                        </div>
                                    </motion.div>

                                    <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="text-xl font-semibold text-white mb-2">Email sent</motion.h2>
                                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                                        className="text-sm mb-2" style={{ color: 'rgba(180,165,230,0.45)' }}>
                                        We sent a reset link to
                                    </motion.p>
                                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                                        className="text-sm font-medium mb-8" style={{ color: '#c084fc' }}>
                                        {email}
                                    </motion.p>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
                                        className="text-xs mb-6" style={{ color: 'rgba(160,140,210,0.38)' }}>
                                        Check your spam folder if you don't see it within a few minutes.
                                    </motion.p>

                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
                                        <Link to="/login"
                                            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                                            style={{ color: 'rgba(160,140,210,0.45)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,140,210,0.45)'}>
                                            <ArrowLeft size={14} /> Back to Sign In
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
