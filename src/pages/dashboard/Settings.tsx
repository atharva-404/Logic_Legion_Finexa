import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield, Palette, Database, ChevronRight,
    Save, Trash2, Eye, EyeOff, Sun, Moon, Check,
    Download, LogOut, TrendingUp, Sparkles, Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinancialStore } from '../../store/financialStore';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)} className="relative flex-shrink-0 transition-all duration-200"
            style={{ width: 40, height: 22 }}>
            <div className="absolute inset-0 rounded-full transition-all duration-300"
                style={{ background: checked ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'var(--border)' }} />
            <motion.div className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white"
                animate={{ left: checked ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
        </button>
    );
}

function SettingRow({ label, desc, children, compact = false }: { label: string; desc?: string; children: React.ReactNode; compact?: boolean }) {
    return (
        <div className={`flex items-center justify-between gap-4 ${compact ? 'py-3' : 'py-4'}`}
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-1">{label}</p>
                {desc && <p className="text-xs text-3 mt-0.5">{desc}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

export default function Settings() {
    const { user, logout } = useAuth();
    const { isDark, toggle } = useTheme();
    const { monthlyIncome, monthlyExpenses, emergencySavings, aiCredits, deleteAllData } = useFinancialStore();
    const navigate = useNavigate();

    const [tab, setTab] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');

    // Profile form
    const [name, setName] = useState(user?.first_name || user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currency, setCurrency] = useState('INR');

    // Notifications
    const [notifs, setNotifs] = useState({
        budgetAlerts: true, goalReminders: true, weeklyReport: true,
        aiInsights: false, marketUpdates: false,
    });

    // Privacy
    const [privacy, setPrivacy] = useState({
        showBalance: true, analyticsSharing: false, crashReports: true,
    });

    function showSaved(msg = 'Changes saved') {
        setShowSuccess(msg);
        setTimeout(() => setShowSuccess(''), 2000);
    }

    function handleDeleteData() {
        if (window.confirm('This will reset all your financial data to defaults. Continue?')) {
            deleteAllData();
            showSaved('Data reset to defaults');
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Header */}
            <div>
                <h1 className="font-display font-bold text-2xl text-1">Settings</h1>
                <p className="text-xs text-3 mt-0.5">Manage your account and preferences</p>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Sidebar tabs */}
                <div className="card p-3 space-y-0.5 md:col-span-1 h-fit">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`nav-item w-full ${tab === t.id ? 'active' : ''}`}>
                            <t.icon size={15} className="flex-shrink-0" />
                            <span className="truncate text-sm">{t.label}</span>
                            {tab !== t.id && <ChevronRight size={11} className="ml-auto opacity-30" />}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-4">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                        {/* ── Profile ── */}
                        {tab === 'profile' && (
                            <div className="card p-5">
                                <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white glow"
                                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                                        {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-1 text-lg">{user?.first_name || user?.username}</p>
                                        <p className="text-sm text-3">{user?.email}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="badge text-[10px] px-2 py-0.5">Free Plan</span>
                                            <span className="text-[10px] text-3 flex items-center gap-1">
                                                <Sparkles size={9} style={{ color: 'var(--purple)' }} />
                                                {aiCredits.toLocaleString()} credits
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Display Name</label>
                                            <input type="text" className="field" value={name} onChange={e => setName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Currency</label>
                                            <select className="field" value={currency} onChange={e => setCurrency(e.target.value)}>
                                                <option value="INR">INR — Indian Rupee</option>
                                                <option value="USD">USD — US Dollar</option>
                                                <option value="EUR">EUR — Euro</option>
                                                <option value="GBP">GBP — British Pound</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Email</label>
                                        <input type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Password</label>
                                        <input type="password" className="field" value="••••••••" readOnly />
                                        <button className="text-xs mt-1.5" style={{ color: 'var(--purple)' }}>Change password</button>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    <button className="btn text-sm px-5" onClick={() => showSaved()}>
                                        <Save size={14} /> Save Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Notifications ── */}
                        {tab === 'notifications' && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                    Notification Preferences
                                </h3>
                                {[
                                    { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Alert when you exceed a spending category limit' },
                                    { key: 'goalReminders', label: 'Goal Reminders', desc: 'Weekly reminders about savings goal progress' },
                                    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of your financial activity every Sunday' },
                                    { key: 'aiInsights', label: 'AI Insights', desc: 'Proactive tips from your AI coach' },
                                    { key: 'marketUpdates', label: 'Market Updates', desc: 'General financial news and updates' },
                                ].map(n => (
                                    <SettingRow key={n.key} label={n.label} desc={n.desc} compact>
                                        <Toggle
                                            checked={notifs[n.key as keyof typeof notifs]}
                                            onChange={v => setNotifs(x => ({ ...x, [n.key]: v }))}
                                        />
                                    </SettingRow>
                                ))}
                                <div className="flex justify-end mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                    <button className="btn text-sm px-5" onClick={() => showSaved('Notification preferences saved')}>
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Privacy ── */}
                        {tab === 'privacy' && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>Privacy & Security</h3>
                                {[
                                    { key: 'showBalance', label: 'Show Balance on Dashboard', desc: 'Display your balance on the overview card' },
                                    { key: 'analyticsSharing', label: 'Usage Analytics', desc: 'Help improve Finexa with anonymous usage data' },
                                    { key: 'crashReports', label: 'Crash Reports', desc: 'Automatically send error reports to improve stability' },
                                ].map(p => (
                                    <SettingRow key={p.key} label={p.label} desc={p.desc} compact>
                                        <Toggle
                                            checked={privacy[p.key as keyof typeof privacy]}
                                            onChange={v => setPrivacy(x => ({ ...x, [p.key]: v }))}
                                        />
                                    </SettingRow>
                                ))}

                                <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={14} style={{ color: 'var(--purple)' }} />
                                        <span className="text-xs font-semibold text-1">Your data is safe</span>
                                    </div>
                                    <p className="text-xs text-3 leading-relaxed">
                                        All financial data is stored locally on your device. We never sell your data or share it with third parties.
                                        Transactions are end-to-end encrypted in transit.
                                    </p>
                                </div>

                                <div className="flex justify-end mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                    <button className="btn text-sm px-5" onClick={() => showSaved('Privacy settings saved')}>
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Appearance ── */}
                        {tab === 'appearance' && (
                            <div className="card p-5">
                                <h3 className="font-semibold text-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>Appearance</h3>

                                <SettingRow label="Theme" desc="Choose your preferred colour scheme">
                                    <div className="flex items-center gap-2">
                                        {[{ v: 'dark', label: 'Dark', icon: Moon }, { v: 'light', label: 'Light', icon: Sun }].map(t => (
                                            <button key={t.v} onClick={() => { if ((isDark && t.v === 'light') || (!isDark && t.v === 'dark')) toggle(); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                                style={(isDark && t.v === 'dark') || (!isDark && t.v === 'light')
                                                    ? { background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: 'var(--purple-light)' }
                                                    : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                                                <t.icon size={12} /> {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </SettingRow>

                                <SettingRow label="Language" desc="Interface language">
                                    <select className="field text-sm py-2 w-36">
                                        <option>English</option>
                                        <option>Hindi</option>
                                        <option>Tamil</option>
                                    </select>
                                </SettingRow>

                                {/* Accent preview */}
                                <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                                    <p className="text-xs text-3 mb-3">Accent colour (coming soon)</p>
                                    <div className="flex gap-3">
                                        {['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'].map(c => (
                                            <button key={c} className="w-7 h-7 rounded-full ring-2 ring-offset-1 transition-all"
                                                style={{ background: c, ringColor: c === '#7c3aed' ? c : 'transparent', opacity: c === '#7c3aed' ? 1 : 0.4 }}
                                                disabled />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Data ── */}
                        {tab === 'data' && (
                            <div className="space-y-4">
                                <div className="card p-5">
                                    <h3 className="font-semibold text-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>Financial Data Summary</h3>
                                    {[
                                        { label: 'Monthly Income', value: `Rs ${monthlyIncome.toLocaleString('en-IN')}` },
                                        { label: 'Monthly Expenses', value: `Rs ${monthlyExpenses.toLocaleString('en-IN')}` },
                                        { label: 'Emergency Savings', value: `Rs ${emergencySavings.toLocaleString('en-IN')}` },
                                        { label: 'AI Credits Remaining', value: aiCredits.toLocaleString() },
                                    ].map(s => (
                                        <SettingRow key={s.label} label={s.label} compact>
                                            <span className="text-sm font-semibold text-1">{s.value}</span>
                                        </SettingRow>
                                    ))}
                                </div>

                                <div className="card p-5">
                                    <h3 className="font-semibold text-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>Data Management</h3>
                                    <div className="space-y-3">
                                        <button className="btn-outline w-full justify-start gap-3 text-sm py-3">
                                            <Download size={15} /> Export all data (CSV)
                                        </button>
                                        <button onClick={handleDeleteData}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                                            <Trash2 size={15} /> Reset all financial data
                                        </button>
                                        <button onClick={() => { logout(); navigate('/'); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)' }}>
                                            <LogOut size={15} /> Sign out of Finexa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Success toast */}
            {showSuccess && (
                <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }}
                    className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                    <Check size={14} /> {showSuccess}
                </motion.div>
            )}
        </div>
    );
}
