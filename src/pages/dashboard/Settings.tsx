import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Trash2, Bell, Eye, AlertTriangle, Edit2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFinancialStore } from '../../store/financialStore';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, logout } = useAuth();
    const { monthlyIncome, monthlyExpenses, emergencySavings, setIncome, setExpenses, setSavings, deleteAllData } = useFinancialStore();
    const navigate = useNavigate();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editFinancials, setEditFinancials] = useState(false);
    const [financials, setFinancials] = useState({
        income: monthlyIncome.toString(),
        expenses: monthlyExpenses.toString(),
        savings: emergencySavings.toString(),
    });
    const [saved, setSaved] = useState(false);

    function handleSaveFinancials() {
        setIncome(+financials.income);
        setExpenses(+financials.expenses);
        setSavings(+financials.savings);
        setEditFinancials(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    function handleDeleteData() {
        deleteAllData();
        logout();
        navigate('/');
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your profile, financial data, and privacy</p>
            </div>

            {saved && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl text-green-400 text-sm flex items-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    ✅ Financial data updated successfully
                </motion.div>
            )}

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <User size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Profile</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-semibold">{user?.name}</p>
                        <p className="text-slate-400 text-sm">{user?.email}</p>
                        <p className="text-slate-600 text-xs mt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}</p>
                    </div>
                </div>
            </motion.div>

            {/* Financial Data */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-purple-400" />
                        <h3 className="text-white font-semibold">Your Financial Data</h3>
                    </div>
                    <button onClick={() => setEditFinancials(!editFinancials)}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        <Edit2 size={13} /> {editFinancials ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                {editFinancials ? (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Monthly Income (₹)</label>
                            <input type="number" className="input-field text-sm" value={financials.income}
                                onChange={e => setFinancials(f => ({ ...f, income: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Monthly Expenses (₹)</label>
                            <input type="number" className="input-field text-sm" value={financials.expenses}
                                onChange={e => setFinancials(f => ({ ...f, expenses: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Emergency Savings (₹)</label>
                            <input type="number" className="input-field text-sm" value={financials.savings}
                                onChange={e => setFinancials(f => ({ ...f, savings: e.target.value }))} />
                        </div>
                        <button onClick={handleSaveFinancials} className="btn-primary w-full text-sm py-2.5">Save Changes</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[
                            { label: 'Monthly Income', value: `₹${(+financials.income).toLocaleString('en-IN')}` },
                            { label: 'Monthly Expenses', value: `₹${(+financials.expenses).toLocaleString('en-IN')}` },
                            { label: 'Emergency Savings', value: `₹${(+financials.savings).toLocaleString('en-IN')}` },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-purple-900/20 last:border-0">
                                <span className="text-slate-400 text-sm">{item.label}</span>
                                <span className="text-white font-medium text-sm">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Privacy Dashboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Privacy Dashboard</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { icon: '🔒', label: 'Data Encryption', desc: 'All data stored locally on your device, encrypted', status: 'Active', good: true },
                        { icon: '🚫', label: 'No Data Selling', desc: 'Your financial data is never sold or shared with third parties', status: 'Guaranteed', good: true },
                        { icon: '📊', label: 'Analytics', desc: 'Anonymous usage analytics to improve the product', status: 'Enabled', good: true },
                        { icon: '🤖', label: 'AI Processing', desc: 'AI responses are processed locally — no data sent to servers', status: 'Local Only', good: true },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-purple-900/20 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <div>
                                    <p className="text-white text-sm font-medium">{item.label}</p>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-2"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Bell size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Notification Preferences</h3>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Weekly Financial Summary', desc: 'Every Monday morning' },
                        { label: 'Budget Alert', desc: 'When you exceed category budgets' },
                        { label: 'Goal Milestones', desc: 'When you reach savings targets' },
                        { label: 'Habit Reminders', desc: 'Daily challenge reminders' },
                    ].map((item, i) => (
                        <div key={item.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-white text-sm">{item.label}</p>
                                <p className="text-slate-500 text-xs">{item.desc}</p>
                            </div>
                            <button className={`w-10 h-5 rounded-full transition-all duration-300 relative ${i < 2 ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${i < 2 ? 'left-5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-card p-5"
                style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-yellow-400" />
                    <h3 className="text-white font-semibold">Legal Disclaimer</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                    Finexa is a financial education and budgeting tool. It does not provide investment, trading, or portfolio management advice. All content is for informational and educational purposes only. Financial decisions should be made in consultation with a SEBI-registered financial advisor.
                </p>
            </motion.div>

            {/* Delete Data */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="glass-card p-5"
                style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Trash2 size={16} className="text-red-400" />
                    <h3 className="text-white font-semibold">Delete My Data</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">Permanently delete all your financial data and account. This action cannot be undone.</p>

                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 text-sm font-medium transition-all hover:bg-red-500/15"
                        style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
                        <Trash2 size={15} /> Delete All Data & Account
                    </button>
                ) : (
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-red-400 text-sm font-medium mb-3">⚠️ Are you absolutely sure? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={handleDeleteData}
                                className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                                Yes, Delete Everything
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2 px-4 rounded-xl text-slate-300 text-sm hover:bg-slate-700/40 transition-colors"
                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
