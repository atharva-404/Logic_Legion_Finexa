import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { TransactionsAPI } from '../../lib/api';

const CATEGORIES = ['All', 'Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Income', 'Other'];

const MOCK: any[] = [
    { id: 1, amount: 3200, category: 'Food', type: 'expense', description: 'Grocery Shopping', date: '2026-02-28' },
    { id: 2, amount: 85000, category: 'Income', type: 'income', description: 'Monthly Salary', date: '2026-02-28' },
    { id: 3, amount: 1200, category: 'Transport', type: 'expense', description: 'Cab rides (weekly)', date: '2026-02-27' },
    { id: 4, amount: 12500, category: 'Housing', type: 'expense', description: 'Rent (Feb)', date: '2026-02-25' },
    { id: 5, amount: 649, category: 'Entertainment', type: 'expense', description: 'Netflix', date: '2026-02-24' },
    { id: 6, amount: 8000, category: 'Income', type: 'income', description: 'Freelance Project', date: '2026-02-22' },
    { id: 7, amount: 2400, category: 'Food', type: 'expense', description: 'Dining Out', date: '2026-02-21' },
    { id: 8, amount: 1700, category: 'Utilities', type: 'expense', description: 'Electricity Bill', date: '2026-02-20' },
];

type TxType = { id: number; amount: number; category: string; type: string; description: string; date: string };

export default function Transactions() {
    const [txList, setTxList] = useState<TxType[]>(MOCK);
    const [category, setCategory] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', category: 'Food', type: 'expense', description: '', date: new Date().toISOString().slice(0, 10) });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        TransactionsAPI.list().then(d => { if (d.results?.length) setTxList(d.results); }).catch(() => { });
    }, []);

    async function handleAdd() {
        if (!form.amount || !form.description) return;
        setIsLoading(true);
        const newTx: TxType = { id: Date.now(), amount: +form.amount, category: form.category, type: form.type, description: form.description, date: form.date };
        try {
            await TransactionsAPI.create({ amount: +form.amount, category: form.category, type: form.type as any, description: form.description, date: form.date });
        } catch { /* offline — still add locally */ }
        setTxList(t => [newTx, ...t]);
        setForm({ amount: '', category: 'Food', type: 'expense', description: '', date: new Date().toISOString().slice(0, 10) });
        setShowForm(false);
        setIsLoading(false);
    }

    const filtered = category === 'All' ? txList : txList.filter(t => t.category === category);
    const totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Transactions</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track income and expenses manually</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-aqua text-sm px-4 py-2.5">
                    <PlusCircle size={16} /> Add Transaction
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: '#10b981' },
                    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: '#ef4444' },
                    { label: 'Net Balance', value: totalIncome - totalExpenses, icon: TrendingUp, color: totalIncome > totalExpenses ? '#10b981' : '#ef4444' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="glass p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <s.icon size={13} style={{ color: s.color }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        </div>
                        <p className="font-bold text-xl" style={{ color: s.color }}>₹{Math.abs(s.value).toLocaleString('en-IN')}</p>
                    </motion.div>
                ))}
            </div>

            {/* Add form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass p-5">
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Transaction</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
                            <input type="number" className="field text-sm" placeholder="0" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Type</label>
                            <select className="field text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                            <select className="field text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                            <input type="text" className="field text-sm" placeholder="e.g. Grocery" value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Date</label>
                            <input type="date" className="field text-sm" value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-outline text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                        <button className="btn-aqua text-sm" onClick={handleAdd} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Add Transaction'}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
                <Filter size={14} className="self-center" style={{ color: 'var(--text-muted)' }} />
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={category === cat
                            ? { background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.35)', color: 'var(--aqua)' }
                            : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Transaction list */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                <div className="space-y-2">
                    {filtered.map((tx, i) => (
                        <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between p-3.5 rounded-xl transition-all hover:scale-[1.007]"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                                    {tx.type === 'income'
                                        ? <TrendingUp size={16} className="text-green-400" />
                                        : <TrendingDown size={16} className="text-red-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="badge-aqua text-[10px] px-2 py-0.5"
                                            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--aqua)' }}>
                                            {tx.category}
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="font-bold" style={{ color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                            </p>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                            No transactions in this category
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
