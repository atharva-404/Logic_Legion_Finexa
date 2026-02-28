import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, PieChart, Target, CreditCard, Shield,
    Trophy, MessageCircle, BookOpen, Settings, LogOut,
    Bell, ChevronLeft, ChevronRight, Menu, FileText,
    ListOrdered, TrendingUp, Sparkles, X, Plus,
    AlertCircle, CheckCircle, Info, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationsAPI } from '../lib/api';

// Remove Subscription from navItems
const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/cards', icon: CreditCard, label: 'Cards' },
    { to: '/dashboard/transactions', icon: ListOrdered, label: 'Transactions' },
    { to: '/dashboard/spending', icon: PieChart, label: 'Spending' },
    { to: '/dashboard/budget', icon: TrendingUp, label: 'Budget' },
    { to: '/dashboard/goals', icon: Target, label: 'Goals' },
    { to: '/dashboard/emergency', icon: Shield, label: 'Risk & Safety' },
    { to: '/dashboard/habits', icon: Trophy, label: 'Challenges' },
    { to: '/dashboard/coach', icon: MessageCircle, label: 'AI Coach' },
    { to: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { to: '/dashboard/education', icon: BookOpen, label: 'Education' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const CREDIT_PACKS = [
    { amount: 50000, price: 49, label: '50k', desc: 'Good for ~500 AI chats' },
    { amount: 200000, price: 149, label: '200k', desc: 'Best value · ~2000 chats', popular: true },
    { amount: 500000, price: 299, label: '500k', desc: 'Power user pack' },
];

const notifIcon: Record<string, any> = { warning: AlertCircle, success: CheckCircle, info: Info };
const notifColor: Record<string, string> = { warning: '#f59e0b', success: '#10b981', info: '#60a5fa' };

function NotifPanel({ open, onClose, notifs, onMarkAll, onDismiss }: { open: boolean; onClose: () => void; notifs: any[]; onMarkAll: () => void; onDismiss: (id: number) => void; }) {
    const unread = notifs.filter(n => !n.is_read).length;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed right-4 top-16 z-50 w-80 card overflow-hidden"
                        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2">
                                <Bell size={16} style={{ color: 'var(--purple)' }} />
                                <span className="font-semibold text-sm text-1">Notifications</span>
                                {unread > 0 && <span className="badge text-[10px] px-2 py-0.5">{unread}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                {unread > 0 && (
                                    <button onClick={onMarkAll} className="text-xs text-3 hover:text-1 transition-colors px-2">Mark all read</button>
                                )}
                                <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
                            </div>
                        </div>
                        {/* List */}
                        <div className="overflow-y-auto flex-1">
                            {notifs.length === 0 ? (
                                <div className="py-12 text-center text-3 text-sm">All caught up!</div>
                            ) : (
                                notifs.map(n => {
                                    // Derive type from title/message if possible, or default to info
                                    let type = 'info';
                                    const lower = (n.title + ' ' + n.message).toLowerCase();
                                    if (lower.includes('warning') || lower.includes('over budget') || lower.includes('alert')) type = 'warning';
                                    if (lower.includes('success') || lower.includes('reached') || lower.includes('streak')) type = 'success';

                                    const Icon = notifIcon[type] ?? Info;
                                    const color = notifColor[type] ?? '#60a5fa';
                                    return (
                                        <motion.div key={n.id} layout exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-3 p-4 transition-all"
                                            style={{
                                                background: n.is_read ? 'transparent' : 'rgba(168,85,247,0.04)',
                                                borderBottom: '1px solid var(--border)',
                                            }}>
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                                                <Icon size={13} style={{ color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-xs font-semibold text-1">{n.title}</p>
                                                    {!n.is_read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--purple)' }} />}
                                                </div>
                                                <p className="text-xs text-3 mt-0.5 leading-relaxed">{n.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-3 flex items-center gap-1"><Clock size={9} />{new Date(n.created_at).toLocaleDateString()}</span>
                                                    {!n.is_read && <button onClick={() => onDismiss(n.id)} className="text-[10px] text-3 hover:text-purple-400 transition-colors">Mark read</button>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CreditsBuyModal({ isOpen, onClose, onBuy }: { isOpen: boolean; onClose: () => void; onBuy: (amount: number) => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.96 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="card w-full max-w-xs p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="font-display font-bold text-1">Top Up Credits</h3>
                                    <p className="text-xs text-3 mt-0.5">100 credits per AI message</p>
                                </div>
                                <button onClick={onClose} className="btn-ghost p-1.5"><X size={15} /></button>
                            </div>
                            <div className="space-y-2.5 mb-4">
                                {CREDIT_PACKS.map(p => (
                                    <button key={p.amount} onClick={() => { onBuy(p.amount); onClose(); }}
                                        className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all relative overflow-hidden"
                                        style={p.popular
                                            ? { borderColor: 'rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.08)' }
                                            : { borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                                        {p.popular && (
                                            <span className="absolute top-0 right-0 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg"
                                                style={{ background: 'var(--purple)', color: '#fff' }}>POPULAR</span>
                                        )}
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
                                                <Sparkles size={14} style={{ color: 'var(--purple)' }} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm text-1">{p.label} Credits</p>
                                                <p className="text-[10px] text-3">{p.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-1">Rs {p.price}</p>
                                            <p className="text-[10px] text-3">one-time</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-center text-3">Credits never expire. Instant activation.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const aiCredits = user?.ai_credits ?? 0;
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [notifs, setNotifs] = useState<any[]>([]);

    // Fetch notifications
    const fetchNotifs = () => {
        if (!user) return;
        NotificationsAPI.list().then(data => {
            if (Array.isArray(data)) setNotifs(data);
            else if (data && Array.isArray((data as any).results)) setNotifs((data as any).results);
        }).catch(() => { });
    };

    useEffect(() => {
        fetchNotifs();
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const unreadNotifs = notifs.filter(n => !n.is_read).length;

    async function handleMarkRead(id: number) {
        try {
            await NotificationsAPI.markRead(id);
            setNotifs(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch { /* ignore offline */ }
    }

    async function handleMarkAll() {
        try {
            await NotificationsAPI.markAllRead();
            setNotifs(ns => ns.map(n => ({ ...n, is_read: true })));
        } catch { /* ignore */ }
    }

    function handleBuy(amount: number) {
        // TODO: Implement real payment flow via backend
        setToast(`Credit purchase coming soon!`);
        setTimeout(() => setToast(''), 2800);
    }

    const credPct = Math.min(100, (aiCredits / 1000) * 100);
    const initials = (user?.first_name || user?.username || 'U').charAt(0).toUpperCase();

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center glow-sm"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <TrendingUp size={15} className="text-white" />
                </div>
                {!collapsed && <span className="font-display font-bold text-lg text-gradient">Finexa</span>}
            </div>

            {/* AI Credits */}
            {!collapsed && (
                <div className="mx-3 mt-3 mb-1 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={11} style={{ color: 'var(--purple)' }} />
                            <span className="text-xs font-semibold text-2">AI Credits</span>
                        </div>
                        <button onClick={() => setBuyCreditsOpen(true)}
                            className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all"
                            style={{ background: 'rgba(168,85,247,0.2)', color: 'var(--purple-light)' }}>
                            <Plus size={9} /> Buy
                        </button>
                    </div>
                    <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-bold text-1">{aiCredits.toLocaleString()}</span>
                        <span className="text-[10px] text-3">{credPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.12)' }}>
                        <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${credPct}%` }} transition={{ duration: 0.8 }}
                            style={{ background: credPct > 20 ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'linear-gradient(90deg, #ef4444, #f97316)' }} />
                    </div>
                    {aiCredits < 10 && <p className="text-[10px] text-red-400 mt-1.5 font-medium">Low — top up now</p>}
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.end}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                        onClick={() => setMobileOpen(false)}>
                        <item.icon size={16} className="flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="px-2 pt-2 pb-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white glow-sm"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-1 truncate">{user?.first_name || user?.username}</p>
                            <p className="text-[10px] text-3 truncate">{user?.email}</p>
                        </div>
                    </div>
                )}
                <button onClick={() => { logout(); navigate('/'); }}
                    className={`nav-item w-full hover:!text-red-400 hover:!bg-red-500/8 ${collapsed ? 'justify-center px-0' : ''}`}
                    style={{ color: 'rgba(239,68,68,0.55)' }}>
                    <LogOut size={15} className="flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            {/* Desktop Sidebar */}
            <motion.aside animate={{ width: collapsed ? 60 : 228 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="hidden md:flex flex-col flex-shrink-0 relative z-10"
                style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
                <SidebarContent />
                <button onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-20 glow-sm"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-hi)' }}>
                    {collapsed
                        ? <ChevronRight size={11} style={{ color: 'var(--purple)' }} />
                        : <ChevronLeft size={11} style={{ color: 'var(--purple)' }} />}
                </button>
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" />
                        <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                            transition={{ type: 'tween', duration: 0.22 }}
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
                    style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-1">
                                Hello, {user?.first_name || user?.username?.split('_')[0] || 'there'}
                            </p>
                            <p className="text-[11px] text-3">Your financial dashboard</p>
                        </div>
                    </div>

                    {/* Right-aligned controls */}
                    <div className="flex items-center gap-2">
                        {/* Credits pill */}
                        <button onClick={() => setBuyCreditsOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--purple-light)' }}>
                            <Sparkles size={11} />
                            {aiCredits >= 1000 ? `${(aiCredits / 1000).toFixed(0)}k` : aiCredits} credits
                        </button>



                        {/* Bell */}
                        <button onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
                            style={{
                                background: notifOpen ? 'rgba(168,85,247,0.15)' : 'var(--surface-2)',
                                border: `1px solid ${notifOpen ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
                            }}>
                            <Bell size={15} style={{ color: notifOpen ? 'var(--purple)' : 'var(--text-3)' }} />
                            {unreadNotifs > 0 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                    style={{ background: 'var(--purple)' }} />
                            )}
                        </button>

                        {/* Avatar */}
                        <button onClick={() => navigate('/dashboard/settings')}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white glow-sm"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {initials}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-5 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Notification Panel */}
            <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifs={notifs} onMarkAll={handleMarkAll} onDismiss={handleMarkRead} />

            {/* Buy Credits Modal */}
            <CreditsBuyModal isOpen={buyCreditsOpen} onClose={() => setBuyCreditsOpen(false)} onBuy={handleBuy} />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                        <Sparkles size={14} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
