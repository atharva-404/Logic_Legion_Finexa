import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, ArrowRight, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function PwdStrength({ p }: { p: string }) {
    const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    const colors = ['', '#ef4444', '#f59e0b', '#7c3aed', '#10b981'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    if (!p) return null;
    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= score ? colors[score] : 'var(--border)' }} />
                ))}
            </div>
            <p className="text-[10px] font-medium" style={{ color: colors[score] }}>{labels[score]}</p>
        </div>
    );
}

export default function SignUp() {
    const { signup } = useAuth();
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        if (form.password.length < 8) return setError('Password must be at least 8 characters');
        setIsLoading(true);
        const r = await signup(form.username, form.email, form.password);
        setIsLoading(false);
        if (r.success) navigate('/dashboard');
        else setError(r.error || 'Signup failed');
    }

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative" style={{ background: 'var(--bg)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent)', filter: 'blur(80px)' }} />

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
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center glow"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <h1 className="font-display font-bold text-2xl text-1">Create account</h1>
                    <p className="text-sm text-3 mt-1">Get 100,000 free AI credits</p>
                </div>

                {/* Perks */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                    {['Free forever', '100k credits', 'Privacy first', 'No card needed'].map(b => (
                        <div key={b} className="flex items-center gap-1.5 text-xs text-3">
                            <Check size={10} style={{ color: 'var(--purple)' }} /> {b}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="text-xs text-3 mb-1.5 block">Username</label>
                        <input type="text" className="field" placeholder="arjun_sharma" value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="text-xs text-3 mb-1.5 block">Email</label>
                        <input type="email" className="field" placeholder="you@example.com" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="text-xs text-3 mb-1.5 block">Password</label>
                        <div className="relative">
                            <input type={showPwd ? 'text' : 'password'} className="field pr-10" placeholder="••••••••" value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-3 hover:text-2">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <PwdStrength p={form.password} />
                    </div>
                    <div>
                        <label className="text-xs text-3 mb-1.5 block">Confirm Password</label>
                        <input type="password" className="field" placeholder="••••••••" value={form.confirm}
                            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
                    </div>
                    {error && <p className="text-xs text-red-400 px-1">{error}</p>}
                    <button type="submit" className="btn w-full mt-1" disabled={isLoading}>
                        {isLoading ? 'Creating…' : <>Create Free Account <ArrowRight size={16} /></>}
                    </button>
                </form>

                <p className="text-center text-sm mt-5 text-3">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold" style={{ color: 'var(--purple)' }}>Sign in</Link>
                </p>
                <p className="text-center text-[10px] mt-2 text-3 opacity-50">Not investment advice. Terms apply.</p>
            </motion.div>
        </div>
    );
}
