import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, ArrowRight, Sparkles, Chrome, Github, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignIn() {
    const { login, isBackendAvailable } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const r = await login(email, password);
        setLoading(false);
        if (r.success) navigate('/dashboard');
        else setError(r.error || 'Invalid credentials. Try demo account.');
    }

    async function handleDemo() {
        setDemoLoading(true);
        setEmail('demo@finexa.ai');
        await new Promise(r => setTimeout(r, 400));
        setPassword('demo1234');
        setDemoLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg"
            style={{ background: 'var(--bg)' }}>

            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22), transparent)', filter: 'blur(70px)', animation: 'orb 12s ease-in-out infinite' }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.14), transparent)', filter: 'blur(60px)', animation: 'orb 16s ease-in-out infinite reverse' }} />

            {/* Card */}
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative w-full max-w-md mx-4">

                {/* Glow behind card */}
                <div className="absolute -inset-4 rounded-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.2), transparent)', filter: 'blur(30px)' }} />

                <div className="card-glow p-8 relative">
                    {/* Logo + title */}
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-sm"
                                style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)' }}>
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-xl text-1">finexa</span>
                        </Link>
                        <h1 className="font-display font-bold text-2xl text-1 mb-1">Welcome back</h1>
                        <p className="text-sm text-3">Sign in to your dashboard</p>
                    </div>

                    {/* Backend warning */}
                    {!isBackendAvailable && (
                        <div className="mb-5 px-4 py-3 rounded-xl text-xs text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                            Backend offline — use demo account below
                        </div>
                    )}

                    {/* Social / Demo buttons */}
                    <div className="space-y-2.5 mb-5">
                        <button onClick={handleDemo}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(200,190,255,0.85)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'}>
                            <Sparkles size={16} style={{ color: 'var(--purple)' }} />
                            {demoLoading ? 'Filling...' : 'Continue with Demo Account'}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button disabled
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium opacity-35"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,190,255,0.6)' }}>
                                <Chrome size={14} className="text-blue-400" /> Google
                            </button>
                            <button disabled
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium opacity-35"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,190,255,0.6)' }}>
                                <Github size={14} /> GitHub
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px" style={{ background: 'rgba(168,85,247,0.15)' }} />
                        <span className="text-[11px] text-3">or email</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(168,85,247,0.15)' }} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="text-xs text-3 font-medium mb-1.5 block">Email</label>
                            <input type="email" className="field" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs text-3 font-medium">Password</label>
                                <button type="button" className="text-[11px] transition-colors" style={{ color: 'var(--purple)' }}>Forgot?</button>
                            </div>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} className="field pr-10"
                                    placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-3 hover:text-2 transition-colors">
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-[11px] font-medium" style={{ color: '#ef4444' }}>{error}</p>}
                        <button type="submit" className="btn w-full py-3" disabled={loading}>
                            {loading
                                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 rounded-full" style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                                : <><span>Sign In</span><ArrowRight size={15} /></>}
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-1 mt-5 text-sm">
                        <span className="text-3">No account?</span>
                        <Link to="/signup" className="font-semibold transition-colors" style={{ color: 'var(--purple)' }}>Create one free</Link>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px]" style={{ color: 'rgba(160,148,210,0.35)' }}>
                        <Lock size={9} /> Bank-grade encryption
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
