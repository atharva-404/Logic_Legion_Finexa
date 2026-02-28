import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function SignIn() {
    const { login, isBackendAvailable } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (result.success) navigate('/dashboard');
        else setError(result.error || 'Invalid credentials');
    }

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative" style={{ background: 'var(--bg)' }}>
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent)', filter: 'blur(80px)' }} />

            {/* Nav */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center glow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <TrendingUp size={13} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-gradient">Finexa</span>
                </Link>
                <button onClick={toggle} className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid var(--border)' }}>
                    {isDark ? <Sun size={14} style={{ color: 'var(--purple)' }} /> : <Moon size={14} style={{ color: 'var(--purple)' }} />}
                </button>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-sm p-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-7">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center glow"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-1">Welcome back</h1>
                    <p className="text-sm text-3 mt-1">Sign in to your Finexa account</p>
                </div>

                {/* Offline badge */}
                {!isBackendAvailable && (
                    <div className="mb-5 p-3 rounded-xl text-xs text-center badge-yellow">
                        Offline mode — use demo account
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-3 mb-1.5 block font-medium">Email</label>
                        <input type="email" className="field" placeholder="you@example.com" value={email}
                            onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs text-3 mb-1.5 block font-medium">Password</label>
                        <div className="relative">
                            <input type={showPwd ? 'text' : 'password'} className="field pr-10" placeholder="••••••••" value={password}
                                onChange={e => setPassword(e.target.value)} required />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-3 hover:text-2 transition-colors">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-400 px-1">{error}</p>}
                    <button type="submit" className="btn w-full mt-1" disabled={isLoading}>
                        {isLoading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
                    </button>
                </form>

                <div className="mt-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs text-3">or</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                    <button onClick={() => { setEmail('demo@finexa.ai'); setPassword('demo1234'); }}
                        className="btn-outline w-full text-sm gap-2">
                        <Sparkles size={14} /> Use Demo Account
                    </button>
                </div>

                <p className="text-center text-sm mt-6 text-3">
                    No account?{' '}
                    <Link to="/signup" className="font-semibold" style={{ color: 'var(--purple)' }}>Create one free</Link>
                </p>
            </motion.div>
        </div>
    );
}
