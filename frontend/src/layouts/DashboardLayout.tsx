import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, PieChart, Target, Wallet, Shield, Zap,
    Trophy, MessageCircle, BookOpen, Settings, LogOut,
    Bell, ChevronLeft, ChevronRight, Menu, FileText,
    ListOrdered, TrendingUp, Sparkles, X, Plus,
    AlertCircle, CheckCircle, Info, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { NotificationsAPI, HealthAPI } from '../lib/api';

// Sidebar items - Institutional navigation
const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
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

function FinexaScorePill() {
    const { isDark } = useTheme();
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        HealthAPI.getScore()
            .then(d => { if (!cancelled) setScore(d.score ?? 0); })
            .catch(() => { if (!cancelled) setScore(0); });
        return () => { cancelled = true; };
    }, []);

    const s = score ?? 0;
    const color = s >= 70 ? { bg: '34,197,94', text: isDark ? '#4ade80' : '#15803d' }
                 : s >= 40 ? { bg: '245,158,11', text: isDark ? '#fbbf24' : '#d97706' }
                 :           { bg: '239,68,68', text: isDark ? '#f87171' : '#dc2626' };

    return (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
                background: isDark ? `rgba(${color.bg},0.1)` : `rgba(${color.bg},0.05)`,
                border: isDark ? `1px solid rgba(${color.bg},0.3)` : `1px solid rgba(${color.bg},0.2)`,
                color: color.text,
                boxShadow: isDark ? `0 2px 12px rgba(${color.bg},0.15)` : `0 2px 8px rgba(${color.bg},0.05)`,
            }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color.text, boxShadow: `0 0 6px ${isDark ? `rgba(${color.bg},0.9)` : `rgba(${color.bg},0.4)`}` }} />
            <span className="opacity-80">Fin Score</span>
            <span className="font-bold">{score !== null ? s : '…'}</span>
        </div>
    );
}

const notifIcon = { warning: AlertCircle, success: CheckCircle, info: Info };
const notifColor = { warning: '#f59e0b', success: '#10b981', info: '#60a5fa' };

// Map backend notification_type to icon type
function mapNotifType(t: string): 'warning' | 'success' | 'info' {
    if (t === 'warning') return 'warning';
    if (t === 'success' || t === 'goal') return 'success';
    return 'info';
}

// Format relative time from ISO date
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

interface NotifItem {
    id: number;
    type: 'warning' | 'success' | 'info';
    title: string;
    body: string;
    time: string;
    read: boolean;
}

function NotifPanel({ open, onClose, onCountChange }: { open: boolean; onClose: () => void; onCountChange?: (count: number) => void }) {
    const [notifs, setNotifs] = useState<NotifItem[]>([]);
    const [loading, setLoading] = useState(false);
    const unread = notifs.filter(n => !n.read).length;

    // Fetch notifications from backend
    const fetchNotifs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationsAPI.list();
            const arr = (Array.isArray(data) ? data : (data as any)?.results ?? []);
            const mapped: NotifItem[] = arr.map((n: any) => ({
                id: n.id,
                type: mapNotifType(n.notification_type),
                title: n.title,
                body: n.message,
                time: timeAgo(n.created_at),
                read: n.is_read,
            }));
            setNotifs(mapped);
            onCountChange?.(mapped.filter(n => !n.read).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [onCountChange]);

    useEffect(() => {
        if (open) fetchNotifs();
    }, [open, fetchNotifs]);

    // Also fetch on mount for badge count
    useEffect(() => { fetchNotifs(); }, []);

    async function markAll() {
        try {
            await NotificationsAPI.markAllRead();
            setNotifs(n => n.map(x => ({ ...x, read: true })));
            onCountChange?.(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    }

    async function dismiss(id: number) {
        try {
            await NotificationsAPI.deleteNotif(id);
            setNotifs(prev => {
                const next = prev.filter(x => x.id !== id);
                onCountChange?.(next.filter(n => !n.read).length);
                return next;
            });
        } catch (err) {
            console.error('Failed to dismiss notification:', err);
        }
    }

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
                        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2">
                                <Bell size={16} style={{ color: 'var(--purple)' }} />
                                <span className="font-semibold text-sm text-1">Notifications</span>
                                {unread > 0 && <span className="badge text-[10px] px-2 py-0.5">{unread}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                {unread > 0 && (
                                    <button onClick={markAll} className="text-xs text-3 hover:text-1 transition-colors px-2">Mark all read</button>
                                )}
                                <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="py-12 text-center text-3 text-sm">Loading notifications...</div>
                            ) : notifs.length === 0 ? (
                                <div className="py-12 text-center text-3 text-sm">All caught up!</div>
                            ) : (
                                notifs.map(n => {
                                    const Icon = (notifIcon as any)[n.type] ?? Info;
                                    const color = (notifColor as any)[n.type] ?? '#60a5fa';
                                    return (
                                        <motion.div key={n.id} layout exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-3 p-4 transition-all"
                                            style={{
                                                background: n.read ? 'transparent' : 'rgba(168,85,247,0.04)',
                                                borderBottom: '1px solid var(--border)',
                                            }}>
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                                                <Icon size={13} style={{ color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-xs font-semibold text-1">{n.title}</p>
                                                    {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--purple)' }} />}
                                                </div>
                                                <p className="text-xs text-3 mt-0.5 leading-relaxed">{n.body}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-3 flex items-center gap-1"><Clock size={9} />{n.time}</span>
                                                    <button onClick={() => dismiss(n.id)} className="text-[10px] text-3 hover:text-red-400 transition-colors">Dismiss</button>
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



export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();
    const aiCredits = user?.ai_credits ?? 0;
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [unreadNotifs, setUnreadNotifs] = useState(0);

    const credPct = Math.min(100, (aiCredits / 100000) * 100);
    const initials = (user?.first_name || user?.username || 'U').charAt(0).toUpperCase();

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 px-4 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1.5 rounded-full opacity-55"
                        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)', filter: 'blur(5px)', animation: 'glowPulse 3s ease-in-out infinite' }} />
                    <img src="/logo.png" alt="Finexa" className="relative w-8 h-8 object-contain drop-shadow-[0_0_9px_rgba(168,85,247,0.9)]" />
                </div>
                {!collapsed && (
                    <span className="font-display font-extrabold text-xl"
                        style={{
                            background: isDark
                                ? 'linear-gradient(120deg, #ffffff 0%, #e8d5ff 50%, #c084fc 100%)'
                                : 'linear-gradient(120deg, #0a0a0a 0%, #4a3a6a 50%, #7c3aed 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.01em'
                        }}>
                        Finexa
                    </span>
                )}
            </Link>

            {/* AI Credits */}
            {!collapsed && (
                <div className="mx-3 mt-3 mb-1 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={11} style={{ color: 'var(--purple)' }} />
                            <span className="text-xs font-semibold text-2">AI Credits</span>
                        </div>
                        <button onClick={() => navigate('/subscription')}
                            className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all"
                            style={{ background: 'rgba(168,85,247,0.2)', color: 'var(--purple-light)' }}>
                            <Plus size={9} /> Buy
                        </button>
                    </div>
                    <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-bold text-1">{aiCredits.toLocaleString()}</span>
                        <span className="text-[10px] text-3">{credPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(168,85,247,0.12)' : 'rgba(124,58,237,0.08)' }}>
                        <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${credPct}%` }} transition={{ duration: 0.8 }}
                            style={{ background: credPct > 20 ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'linear-gradient(90deg, #ef4444, #f97316)' }} />
                    </div>
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

            <div className="px-2 pt-2 pb-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                {/* User Info Card */}
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{user?.username || 'User'}</div>
                            <div className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{user?.email || ''}</div>
                        </div>
                    </div>
                )}
                <button onClick={() => { logout(); navigate('/'); }}
                    className={`nav-item w-full hover:!text-red-500 hover:!bg-red-500/8 ${collapsed ? 'justify-center px-0' : ''}`}
                    style={{ color: isDark ? 'rgba(239,68,68,0.55)' : 'rgba(220,38,38,0.65)' }}>
                    <LogOut size={15} className="flex-shrink-0" />
                    {!collapsed && (
                        <span className="text-xs font-semibold">Sign Out</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            <motion.aside animate={{ width: collapsed ? 60 : 228 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen z-10"
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
                {/* Top bar � glassmorphism */}
                <header className="flex items-center justify-between px-5 py-3 flex-shrink-0 sticky top-0 z-30"
                    style={{
                        background: 'var(--surface)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderBottom: '1px solid var(--border)',
                        boxShadow: isDark
                            ? '0 1px 0 rgba(168,85,247,0.12), 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                            : '0 1px 0 rgba(124,58,237,0.08), 0 4px 20px rgba(124,58,237,0.04)',
                    }}>

                    <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.6) 25%, rgba(168,85,247,0.8) 50%, rgba(124,58,237,0.6) 75%, transparent 100%)' }} />

                    <div className="flex items-center gap-3">
                        <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-1">
                                {(() => {
                                    const h = new Date().getHours();
                                    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
                                    return `${greeting}, ${user?.first_name || user?.username?.split('_')[0] || 'there'} 👋`;
                                })()}
                            </p>
                            <p className="text-[11px] text-3">Your financial dashboard</p>
                        </div>
                    </div>

                    {/* Right-aligned controls */}
                    <div className="flex items-center gap-2">
                        {/* Credits pill */}
                        <button onClick={() => navigate('/subscription')}
                            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                            style={{
                                background: isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)',
                                border: '1px solid var(--border-hi)',
                                color: 'var(--purple)',
                                boxShadow: isDark ? '0 2px 12px rgba(124,58,237,0.15)' : '0 2px 8px rgba(124,58,237,0.05)',
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)', boxShadow: `0 0 6px ${isDark ? 'rgba(168,85,247,0.9)' : 'rgba(124,58,237,0.4)'}` }} />
                            <Sparkles size={11} />
                            {aiCredits >= 1000 ? `${(aiCredits / 1000).toFixed(0)}k` : aiCredits} credits
                        </button>

                        <FinexaScorePill />

                        <ThemeToggle size="sm" />

                        <button onClick={() => setNotifOpen(!notifOpen)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all duration-200"
                            style={{
                                background: notifOpen ? 'rgba(168,85,247,0.18)' : 'rgba(168,85,247,0.04)',
                                border: `1px solid ${notifOpen ? 'var(--purple)' : 'var(--border)'}`,
                                boxShadow: notifOpen ? (isDark ? '0 0 16px rgba(168,85,247,0.3)' : '0 0 12px rgba(168,85,247,0.15)') : 'none',
                            }}>
                            <Bell size={15} style={{ color: notifOpen ? 'var(--purple)' : 'var(--text-3)' }} />
                            {unreadNotifs > 0 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                    style={{ background: 'var(--purple)', boxShadow: `0 0 6px ${isDark ? 'rgba(168,85,247,0.9)' : 'rgba(124,58,237,0.4)'}` }} />
                            )}
                        </button>

                        <button onClick={() => navigate('/dashboard/settings')}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                boxShadow: '0 0 18px rgba(168,85,247,0.45), 0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(168,85,247,0.7), 0 2px 12px rgba(0,0,0,0.4)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 18px rgba(168,85,247,0.45), 0 2px 8px rgba(0,0,0,0.3)')}>
                            {initials}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-5 lg:p-6">
                    <Outlet />
                </main>
            </div>

            <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} onCountChange={setUnreadNotifs} />

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
