import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthBg from '../../components/AuthBg';



const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } };
const list = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } };

export default function SignIn() {
    const { login, isBackendAvailable } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const r = await login(email, password);
        setLoading(false);
        if (r.success) navigate('/dashboard');
        else setError(r.error || 'Invalid email or password.');
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-10 relative overflow-hidden"
            style={{ background: '#07050f' }}>

            <AuthBg />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full mx-5"
                style={{ maxWidth: 440 }}>

                {/* Outer glow */}
                <div className="absolute -inset-px rounded-xl pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.1), rgba(192,132,252,0.25))', filter: 'blur(1px)' }} />

                <div className="relative overflow-hidden" style={{
                    borderRadius: 12,
                    background: 'rgba(10, 7, 24, 0.97)',
                    border: '1px solid rgba(168,85,247,0.2)',
                    boxShadow: '0 24px 70px rgba(0,0,0,0.65), 0 0 50px rgba(124,58,237,0.12)',
                }}>
                    {/* Gradient top strip */}
                    <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #7c3aed 30%, #a855f7 50%, #c084fc 70%, transparent 100%)' }} />
                    {/* Top inner glow */}
                    <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                        style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.06), transparent)' }} />

                    <motion.div className="px-8 pt-7 pb-8" variants={list} initial="hidden" animate="show">

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
                            <h1 className="text-[22px] font-semibold text-white tracking-tight mb-1">Welcome back</h1>
                            <p className="text-sm font-normal" style={{ color: 'rgba(180,165,230,0.42)' }}>Sign in to continue to your dashboard</p>
                        </motion.div>

                        {!isBackendAvailable && (
                            <motion.div variants={item} className="mb-4 px-3 py-2.5 rounded-lg text-xs"
                                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', color: '#fbbf24' }}>
                                Backend offline — use the demo button below
                            </motion.div>
                        )}


                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <motion.div variants={item}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(200,185,240,0.38)' }}>Email</label>
                                <input type="email" className="field" placeholder="you@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </motion.div>

                            <motion.div variants={item}>
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-xs font-medium" style={{ color: 'rgba(200,185,240,0.38)' }}>Password</label>
                                    <Link to="/forgot-password" className="text-xs transition-colors"
                                        style={{ color: 'rgba(168,85,247,0.6)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(168,85,247,0.6)'}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input type={showPwd ? 'text' : 'password'} className="field pr-10" placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)} required />
                                    <button type="button" onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: 'rgba(160,140,210,0.32)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,140,210,0.32)'}>
                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </motion.div>

                            {error && (
                                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className="text-xs px-3 py-2.5 rounded-lg"
                                    style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
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
                                        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                            className="w-4 h-4 border-2 rounded-full"
                                            style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                                        : <><span>Sign In</span><ArrowRight size={15} /></>}
                                </motion.button>

                                <button type="button"
                                    onClick={() => { setEmail('demo@finexa.ai'); setPassword('demo1234'); }}
                                    className="w-full py-2 text-xs mt-2.5 rounded-xl transition-all duration-200"
                                    style={{ color: 'rgba(168,85,247,0.45)', border: '1px solid rgba(168,85,247,0.1)' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#a855f7'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.28)'; e.currentTarget.style.background = 'rgba(168,85,247,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(168,85,247,0.45)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.1)'; e.currentTarget.style.background = 'transparent'; }}>
                                    Use demo account
                                </button>
                            </motion.div>
                        </form>

                        <motion.p variants={item} className="text-center text-sm mt-6 font-normal"
                            style={{ color: 'rgba(160,140,210,0.38)' }}>
                            No account?{' '}
                            <Link to="/signup" className="font-medium transition-colors"
                                style={{ color: '#a855f7' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#a855f7'}>
                                Sign up free
                            </Link>
                        </motion.p>

                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
