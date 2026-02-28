import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, ArrowRight, Check, Lock, Chrome, Github } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function StrengthBar({ p }: { p: string }) {
    const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    const colors = ['', '#ef4444', '#f59e0b', '#7c3aed', '#10b981'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    if (!p) return null;
    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400"
                        style={{ background: i <= score ? colors[score] : 'rgba(168,85,247,0.12)' }} />
                ))}
            </div>
            <p className="text-[10px] font-semibold" style={{ color: colors[score] }}>{labels[score]}</p>
        </div>
    );
}

export default function SignUp() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        if (form.password.length < 8) return setError('Password must be 8+ characters');
        setLoading(true);
        const r = await signup(form.username, form.email, form.password);
        setLoading(false);
        if (r.success) navigate('/dashboard');
        else setError(r.error || 'Signup failed. Try again.');
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden grid-bg py-8"
            style={{ background: 'var(--bg)' }}>

            {/* Background orbs */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent)', filter: 'blur(70px)', animation: 'orb 12s ease-in-out infinite' }} />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent)', filter: 'blur(60px)', animation: 'orb 14s ease-in-out infinite reverse' }} />

            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md mx-4">

                <div className="absolute -inset-4 rounded-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.18), transparent)', filter: 'blur(30px)' }} />

                <div className="card-glow p-8 relative">
                    {/* Logo + title */}
                    <div className="flex flex-col items-center mb-7">
                        <Link to="/" className="flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-sm"
                                style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)' }}>
                                <TrendingUp size={18} className="text-white" />
                            </div>
                            <span className="font-display font-bold text-xl text-1">finexa</span>
                        </Link>
                        <h1 className="font-display font-bold text-2xl text-1 mb-1">Create account</h1>
                        <p className="text-sm text-3">Start free with 100,000 AI credits</p>
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
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

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px" style={{ background: 'rgba(168,85,247,0.15)' }} />
                        <span className="text-[11px] text-3">or register with email</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(168,85,247,0.15)' }} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="text-xs text-3 font-medium mb-1.5 block">Username</label>
                            <input type="text" className="field" placeholder="arjun_sharma"
                                value={form.username} onChange={set('username')} required />
                        </div>
                        <div>
                            <label className="text-xs text-3 font-medium mb-1.5 block">Email</label>
                            <input type="email" className="field" placeholder="you@example.com"
                                value={form.email} onChange={set('email')} required />
                        </div>
                        <div>
                            <label className="text-xs text-3 font-medium mb-1.5 block">Password</label>
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} className="field pr-10"
                                    placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-3 hover:text-2 transition-colors">
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            <StrengthBar p={form.password} />
                        </div>
                        <div>
                            <label className="text-xs text-3 font-medium mb-1.5 block">Confirm Password</label>
                            <input type="password" className="field" placeholder="••••••••"
                                value={form.confirm} onChange={set('confirm')} required />
                        </div>
                        {error && <p className="text-[11px] font-medium" style={{ color: '#ef4444' }}>{error}</p>}
                        <button type="submit" className="btn w-full py-3 mt-1" disabled={loading}>
                            {loading
                                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 rounded-full" style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                                : <><span>Create Free Account</span><ArrowRight size={15} /></>}
                        </button>
                    </form>

                    {/* Perks */}
                    <div className="grid grid-cols-3 gap-1.5 mt-4">
                        {['No credit card', 'Privacy first', '100k credits'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(160,148,210,0.5)' }}>
                                <Check size={9} style={{ color: 'var(--purple)' }} /> {b}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-5 text-sm">
                        <span className="text-3">Have an account?</span>
                        <Link to="/login" className="font-semibold" style={{ color: 'var(--purple)' }}>Sign in</Link>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px]" style={{ color: 'rgba(160,148,210,0.3)' }}>
                        <Lock size={9} /> Not investment advice · Educational only
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
