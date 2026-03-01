import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthBg from '../../components/AuthBg';

function StrengthBar({ pwd, isDark }: { pwd: string; isDark: boolean }) {
    const s = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pwd)).length;
    const c = isDark
        ? ['transparent', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981'][s]
        : ['transparent', '#ef4444', '#f59e0b', '#374151', '#16a34a'][s];
    if (!pwd) return null;
    return (
        <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map(i => (
                <motion.div key={i} className="h-0.5 flex-1 rounded-full"
                    animate={{ background: i <= s ? c : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
                    transition={{ duration: 0.25 }} />
            ))}
        </div>
    );
}

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } };
const list = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } };

export default function SignUp() {
    const { signup } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        setLoading(true);
        const r = await signup(form.username, form.email, form.password);
        setLoading(false);
        if (r.success) navigate('/dashboard');
        else setError(r.error || 'Sign up failed. Please try again.');
    }

    const cardBg = isDark ? 'rgba(10, 7, 24, 0.97)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(0,0,0,0.1)';
    const cardShadow = isDark
        ? '0 24px 70px rgba(0,0,0,0.65), 0 0 50px rgba(124,58,237,0.12)'
        : '0 8px 40px rgba(0,0,0,0.1), 0 1px 0 rgba(0,0,0,0.04)';
    const topStrip = isDark
        ? 'linear-gradient(90deg, transparent 0%, #7c3aed 30%, #a855f7 50%, #c084fc 70%, transparent 100%)'
        : 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 70%, transparent 100%)';

    const labelColor = isDark ? 'rgba(200,185,240,0.38)' : '#6b7280';
    const subTextColor = isDark ? 'rgba(180,165,230,0.42)' : '#9ca3af';
    const signupLinkDefault = isDark ? '#a855f7' : '#0a0a0a';
    const signupLinkHover = isDark ? '#c084fc' : '#374151';
    const pwdIconDefault = isDark ? 'rgba(160,140,210,0.32)' : '#9ca3af';
    const pwdIconHover = isDark ? '#a855f7' : '#0a0a0a';

    const logoText = isDark
        ? { background: 'linear-gradient(110deg,#fff 10%,#dcc6ff 55%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
        : { color: '#0a0a0a' };

    return (
        <div className="min-h-screen flex items-center justify-center py-10 relative overflow-hidden"
            style={{ background: isDark ? '#07050f' : '#ffffff' }}>

            <AuthBg />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full mx-5"
                style={{ maxWidth: 440 }}>

                {isDark && (
                    <div className="absolute -inset-px rounded-xl pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(168,85,247,0.08), rgba(192,132,252,0.22))', filter: 'blur(1px)' }} />
                )}

                <div className="relative overflow-hidden" style={{
                    borderRadius: 12,
                    background: cardBg,
                    border: cardBorder,
                    boxShadow: cardShadow,
                }}>
                    <div style={{ height: 2, background: topStrip }} />
                    {isDark && (
                        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                            style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.06), transparent)' }} />
                    )}

                    <motion.div className="px-8 pt-7 pb-8" variants={list} initial="hidden" animate="show">

                        {/* Logo */}
                        <motion.div variants={item} className="mb-7">
                            <Link to="/" className="flex items-center gap-2.5 w-fit group">
                                <div className="relative">
                                    {isDark && (
                                        <div className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.4),transparent 70%)', filter: 'blur(7px)' }} />
                                    )}
                                    <img src="/logo.png" alt="Finexa" className="relative w-8 h-8 object-contain"
                                        style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(168,85,247,0.85))' : 'none' }} />
                                </div>
                                <span className="text-[17px] font-semibold tracking-tight" style={logoText}>
                                    Finexa
                                </span>
                            </Link>
                        </motion.div>

                        {/* Heading */}
                        <motion.div variants={item} className="mb-7">
                            <h1 className="text-[22px] font-semibold tracking-tight mb-1"
                                style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}>Create account</h1>
                            <p className="text-sm font-normal" style={{ color: subTextColor }}>Start free — 100,000 AI credits included</p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <motion.div variants={item}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Username</label>
                                <input type="text" className="field" placeholder="arjun_sharma"
                                    value={form.username} onChange={set('username')} required />
                            </motion.div>

                            <motion.div variants={item}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Email</label>
                                <input type="email" className="field" placeholder="you@example.com"
                                    value={form.email} onChange={set('email')} required />
                            </motion.div>

                            <motion.div variants={item}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Password</label>
                                <div className="relative">
                                    <input type={showPwd ? 'text' : 'password'} className="field pr-10" placeholder="Min. 8 characters"
                                        value={form.password} onChange={set('password')} required />
                                    <button type="button" onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: pwdIconDefault }}
                                        onMouseEnter={e => e.currentTarget.style.color = pwdIconHover}
                                        onMouseLeave={e => e.currentTarget.style.color = pwdIconDefault}>
                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <StrengthBar pwd={form.password} isDark={isDark} />
                            </motion.div>

                            <motion.div variants={item}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Confirm password</label>
                                <input type="password" className="field" placeholder="••••••••"
                                    value={form.confirm} onChange={set('confirm')} required />
                            </motion.div>

                            {error && (
                                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className="text-xs px-3 py-2.5 rounded-lg"
                                    style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                                    {error}
                                </motion.p>
                            )}

                            <motion.div variants={item}>
                                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    className="btn w-full py-3 text-sm font-medium mt-1 relative overflow-hidden group rounded-xl"
                                    disabled={loading}>
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)' }} />
                                    {loading
                                        ? <div className="flex justify-center items-center">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 rounded-full"
                                                style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                                          </div>
                                        : <div className="flex items-center justify-center gap-2"><span>Create Account</span><ArrowRight size={15} /></div>}
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.p variants={item} className="text-center text-sm mt-6 font-normal"
                            style={{ color: subTextColor }}>
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium transition-colors"
                                style={{ color: signupLinkDefault }}
                                onMouseEnter={e => e.currentTarget.style.color = signupLinkHover}
                                onMouseLeave={e => e.currentTarget.style.color = signupLinkDefault}>
                                Sign in
                            </Link>
                        </motion.p>

                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
