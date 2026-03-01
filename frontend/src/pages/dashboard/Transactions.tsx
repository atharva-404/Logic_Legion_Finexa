import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, TrendingDown, Filter, FileText, Loader2, ArrowUpDown } from 'lucide-react';
import { TransactionsAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

const BASE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Income', 'Other'];

const SOURCE_FILTERS = ['All Sources', 'PDF Upload', 'Manual'] as const;

type TxType = { id: number; amount: number; category: string; type: string; description: string; date: string; source?: string; source_document?: string };

export default function Transactions() {
    const [txList, setTxList] = useState<TxType[]>([]);
    const [category, setCategory] = useState('All');
    const [sourceFilter, setSourceFilter] = useState<string>('All Sources');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', category: 'Food', type: 'expense', description: '', date: new Date().toISOString().slice(0, 10) });
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [summaryIncome, setSummaryIncome] = useState(0);
    const { isDark } = useTheme();

    // Build dynamic categories from fetched transactions
    const allCategories = ['All', ...Array.from(new Set([...BASE_CATEGORIES, ...txList.map(t => t.category)]))].filter(Boolean);

    useEffect(() => {
        setPageLoading(true);
        async function fetchAll() {
            try {
                let allTx: TxType[] = [];
                let page = 1;
                let hasMore = true;
                while (hasMore) {
                    const d = await TransactionsAPI.list(page);
                    const results = d.results || (Array.isArray(d) ? d : []);
                    allTx = [...allTx, ...results.map((t: any) => ({ ...t, amount: parseFloat(t.amount) || t.amount }))];
                    hasMore = !!d.next;
                    page++;
                }
                setTxList(allTx);
                // Fetch income from API summary
                try {
                    const summary = await TransactionsAPI.summary();
                    setSummaryIncome(summary.total_income || 0);
                } catch { /* summary unavailable */ }
            } catch (err) {
                console.error('Failed to load transactions:', err);
            } finally {
                setPageLoading(false);
            }
        }
        fetchAll();
    }, []);

    async function handleAdd() {
        if (!form.amount || !form.description) return;
        setIsLoading(true);
        const newTx: TxType = { id: Date.now(), amount: +form.amount, category: form.category, type: form.type, description: form.description, date: form.date, source: 'manual' };
        try {
            await TransactionsAPI.create({ amount: +form.amount, category: form.category, type: form.type as any, description: form.description, date: form.date });
        } catch { /* offline — still add locally */ }
        setTxList(t => [newTx, ...t]);
        setForm({ amount: '', category: 'Food', type: 'expense', description: '', date: new Date().toISOString().slice(0, 10) });
        setShowForm(false);
        setIsLoading(false);
    }

    let filtered = category === 'All' ? txList : txList.filter(t => t.category === category);
    if (sourceFilter === 'PDF Upload') filtered = filtered.filter(t => t.source === 'pdf');
    else if (sourceFilter === 'Manual') filtered = filtered.filter(t => !t.source || t.source === 'manual');

    const txIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalIncome = txIncome > 0 ? txIncome : summaryIncome;
    const totalExpenses = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const pdfCount = txList.filter(t => t.source === 'pdf').length;

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--aqua)' }} />
                <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Loading transactions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                            <TrendingUp size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--aqua)' }}>Financial Ledger</p>
                            <h1 className="font-display font-bold text-2xl text-gradient">Transactions</h1>
                        </div>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {txList.length} transactions · {pdfCount} from PDF uploads
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-aqua text-sm px-4 py-2.5 flex items-center gap-2">
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
                        className="card-glow p-5"
                        style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                                <s.icon size={16} style={{ color: s.color }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        </div>
                        <p className="font-bold text-2xl" style={{ color: s.color }}>₹{Math.abs(s.value).toLocaleString('en-IN')}</p>
                    </motion.div>
                ))}
            </div>

            {/* Add form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="card-glow p-5"
                    style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Transaction</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <div>
                            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Amount (₹)</label>
                            <input type="number" className="field text-sm" placeholder="0" min="0" value={form.amount}
                                onChange={e => { const v = e.target.value; if (v === '' || Number(v) >= 0) setForm(f => ({ ...f, amount: v })); }} />
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
                                {allCategories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
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
                                min={new Date().toISOString().split('T')[0]}
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

            {/* Filters Section */}
            <div className={`card-glow p-4 space-y-3`} style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)' }}>
                <div className="flex items-center gap-2 mb-1">
                    <ArrowUpDown size={13} style={{ color: 'var(--aqua)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--aqua)' }}>Filters</span>
                </div>
                {/* Source filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    <FileText size={13} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    {SOURCE_FILTERS.map(sf => (
                        <button key={sf} onClick={() => setSourceFilter(sf)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                            style={sourceFilter === sf
                                ? { background: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.35)', color: '#a855f7' }
                                : { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: 'var(--text-muted)' }}>
                            {sf === 'PDF Upload' ? `📄 ${sf} (${pdfCount})` : sf}
                        </button>
                    ))}
                </div>
                {/* Category filter chips */}
                <div className="flex flex-wrap gap-2">
                    <Filter size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                    {allCategories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                            style={category === cat
                                ? { background: isDark ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.35)', color: 'var(--aqua)' }
                                : { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: 'var(--text-muted)' }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction list */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="card-glow p-5"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--aqua)' }}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="space-y-2">
                    {filtered.map((tx, i) => (
                        <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center justify-between p-3.5 rounded-xl transition-all hover:scale-[1.007]"
                            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                                    {tx.type === 'income'
                                        ? <TrendingUp size={16} className="text-green-400" />
                                        : <TrendingDown size={16} className="text-red-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--aqua)' }}>
                                            {tx.category}
                                        </span>
                                        {tx.source === 'pdf' ? (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7' }}
                                                title={tx.source_document || 'PDF Upload'}>
                                                📄 {tx.source_document ? tx.source_document.slice(0, 20) + (tx.source_document.length > 20 ? '…' : '') : 'PDF'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                ✏️ Manual
                                            </span>
                                        )}
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="font-bold" style={{ color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                                {tx.type === 'income' ? '+' : '-'}₹{(typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount)) || 0).toLocaleString('en-IN')}
                            </p>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                            {sourceFilter !== 'All Sources'
                                ? `No ${sourceFilter.toLowerCase()} transactions${category !== 'All' ? ` in "${category}"` : ''}`
                                : `No transactions${category !== 'All' ? ` in "${category}"` : ''}`}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
