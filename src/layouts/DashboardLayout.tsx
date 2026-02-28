import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, PieChart, Target, Wallet, Shield, Zap,
    Trophy, MessageCircle, BookOpen, Settings, LogOut,
    Bell, ChevronLeft, ChevronRight, Menu, FileText,
    CreditCard, ListOrdered, TrendingUp, Sun, Moon,
    Sparkles, X, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFinancialStore } from '../store/financialStore';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/dashboard/transactions', icon: ListOrdered, label: 'Transactions' },
    { to: '/dashboard/spending', icon: PieChart, label: 'Spending' },
    { to: '/dashboard/budget', icon: TrendingUp, label: 'Budget' },
    { to: '/dashboard/goals', icon: Target, label: 'Goals' },
    { to: '/dashboard/emergency', icon: Shield, label: 'Risk & Safety' },
    { to: '/dashboard/simulator', icon: Zap, label: 'Simulator' },
    { to: '/dashboard/habits', icon: Trophy, label: 'Challenges' },
    { to: '/dashboard/coach', icon: MessageCircle, label: 'AI Coach' },
    { to: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { to: '/dashboard/education', icon: BookOpen, label: 'Education' },
    { to: '/dashboard/subscription', icon: CreditCard, label: 'Subscription' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

// Credit packages to buy
const CREDIT_PACKS = [
    { amount: 50000, price: 99, label: '50k', popular: false },
    { amount: 200000, price: 299, label: '200k', popular: true },
    { amount: 500000, price: 599, label: '500k', popular: false },
];

function CreditsBuyModal({ isOpen, onClose, onBuy }: { isOpen: boolean; onClose: () => void; onBuy: (amount: number) => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="card w-full max-w-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-1">Top Up AI Credits</h3>
                                    <p className="text-xs text-3 mt-0.5">Credits power every AI feature</p>
                                </div>
                                <button onClick={onClose} className="btn-ghost p-2"><X size={16} /></button>
                            </div>
                            <div className="space-y-3 mb-5">
                                {CREDIT_PACKS.map(pack => (
                                    <button key={pack.amount} onClick={() => { onBuy(pack.amount); onClose(); }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${pack.popular ? 'border-purple-500 bg-purple-500/10' : 'border-default bg-surface-2 hover:border-purple-500'}`}
                                        style={pack.popular ? { borderColor: 'var(--purple)', background: 'rgba(168,85,247,0.08)' } : {}}>
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={16} style={{ color: 'var(--purple)' }} />
                                            <div className="text-left">
                                                <p className="font-bold text-1">{pack.label} Credits</p>
                                                {pack.popular && <span className="text-[10px] badge mt-0.5">Most Popular</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-1">₹{pack.price}</p>
                                            <p className="text-xs text-3">one-time</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-center text-3">Credits never expire. Secure payment.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const { aiCredits, addCredits, totalPoints } = useFinancialStore();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
    const [creditToast, setCreditToast] = useState<{ text: string; show: boolean }>({ text: '', show: false });

    function handleLogout() { logout(); navigate('/'); }

    function handleBuyCredits(amount: number) {
        addCredits(amount);
        setCreditToast({ text: `+${(amount / 1000).toFixed(0)}k credits added!`, show: true });
        setTimeout(() => setCreditToast(t => ({ ...t, show: false })), 3000);
    }

    const credPct = Math.min(100, (aiCredits / 100000) * 100);

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 flex-shrink-0`}
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center glow-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <TrendingUp size={15} className="text-white" />
                </div>
                {!collapsed && <span className="font-display font-bold text-lg text-gradient">Finexa</span>}
            </div>

            {/* AI Credits panel */}
            {!collapsed && (
                <div className="mx-3 mt-3 mb-1 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={12} style={{ color: 'var(--purple)' }} />
                            <span className="text-xs font-semibold text-2">AI Credits</span>
                        </div>
                        <button onClick={() => setBuyCreditsOpen(true)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-all"
                            style={{ background: 'rgba(168,85,247,0.2)', color: 'var(--purple-light)' }}>
                            <Plus size={9} className="inline mr-0.5" /> Buy
                        </button>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-1">{aiCredits.toLocaleString()}</span>
                        <span className="text-xs text-3">{credPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.15)' }}>
                        <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${credPct}%` }} transition={{ duration: 1 }}
                            style={{ background: credPct > 20 ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'linear-gradient(90deg, #ef4444, #f97316)' }} />
                    </div>
                    {aiCredits < 10000 && (
                        <p className="text-[10px] text-red-400 mt-1.5">Low credits — top up now!</p>
                    )}
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.end}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                        }>
                        <item.icon size={16} className="flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Habit points */}
            {!collapsed && (
                <div className="mx-3 mb-2 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-3">Habit Points</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--purple-light)' }}>{totalPoints} pts</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.12)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (totalPoints / 1000) * 100)}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
                    </div>
                </div>
            )}

            {/* User + logout */}
            <div className="px-2 pb-4 pt-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-1 truncate">{user?.first_name || user?.username}</p>
                            <p className="text-[10px] text-3 truncate">{user?.email}</p>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout}
                    className={`nav-item w-full hover:!text-red-400 hover:!bg-red-500/8 ${collapsed ? 'justify-center px-2' : ''}`}
                    style={{ color: 'rgba(239,68,68,0.6)' }}>
                    <LogOut size={15} className="flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            {/* Desktop sidebar */}
            <motion.aside animate={{ width: collapsed ? 60 : 228 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="hidden md:flex flex-col flex-shrink-0 relative z-10"
                style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
                <SidebarContent />
                <button onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center z-20"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-hi)' }}>
                    {collapsed
                        ? <ChevronRight size={12} style={{ color: 'var(--purple)' }} />
                        : <ChevronLeft size={12} style={{ color: 'var(--purple)' }} />}
                </button>
            </motion.aside>

            {/* Mobile drawer overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />
                        <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                            transition={{ type: 'tween', duration: 0.25 }}
                            className="fixed left-0 top-0 bottom-0 z-50 w-60 flex flex-col md:hidden"
                            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                    style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex items-center gap-3">
                        <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-sm font-semibold text-1">
                                Hello, {user?.first_name || user?.username?.split('_')[0] || 'there'}
                            </p>
                            <p className="text-xs text-3">Your financial dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Credits quick view (mobile) */}
                        <button onClick={() => setBuyCreditsOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--purple-light)' }}>
                            <Sparkles size={12} />
                            {aiCredits >= 1000 ? `${(aiCredits / 1000).toFixed(0)}k` : aiCredits}
                        </button>

                        {/* Theme toggle */}
                        <button onClick={toggle}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            {isDark
                                ? <Sun size={15} style={{ color: 'var(--purple-light)' }} />
                                : <Moon size={15} style={{ color: 'var(--purple)' }} />}
                        </button>

                        {/* Bell */}
                        <button className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <Bell size={15} className="text-3" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-glow-pulse"
                                style={{ background: 'var(--purple)' }} />
                        </button>

                        {/* Avatar */}
                        <button onClick={() => navigate('/dashboard/settings')}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white glow-sm"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-5 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Buy Credits Modal */}
            <CreditsBuyModal isOpen={buyCreditsOpen} onClose={() => setBuyCreditsOpen(false)} onBuy={handleBuyCredits} />

            {/* Credit toast */}
            <AnimatePresence>
                {creditToast.show && (
                    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                        <Sparkles size={14} /> {creditToast.text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
