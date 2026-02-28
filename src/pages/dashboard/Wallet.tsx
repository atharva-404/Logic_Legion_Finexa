import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowDownLeft, ArrowUpRight, Plus, CreditCard, Eye, EyeOff,
    TrendingUp, TrendingDown, Clock, ChevronDown, Check, X,
    Banknote, RefreshCw, Wifi, Signal
} from 'lucide-react';
import { WalletAPI } from '../../lib/api';

interface Tx {
    id: number; type: 'credit' | 'debit'; description: string;
    amount: number; date: string; category: string;
}

const SEED_TXS: Tx[] = [
    { id: 1, type: 'credit', description: 'Salary Deposit', amount: 85000, date: '2026-02-28T09:00:00Z', category: 'Income' },
    { id: 2, type: 'debit', description: 'Grocery Store', amount: 3200, date: '2026-02-27T14:30:00Z', category: 'Food' },
    { id: 3, type: 'debit', description: 'Electricity Bill', amount: 1700, date: '2026-02-26T11:00:00Z', category: 'Utilities' },
    { id: 4, type: 'credit', description: 'Freelance Project', amount: 12000, date: '2026-02-25T16:00:00Z', category: 'Income' },
    { id: 5, type: 'debit', description: 'Netflix Subscription', amount: 649, date: '2026-02-24T08:00:00Z', category: 'Entertainment' },
    { id: 6, type: 'debit', description: 'Restaurant Dinner', amount: 2100, date: '2026-02-23T20:00:00Z', category: 'Dining' },
    { id: 7, type: 'debit', description: 'Fuel Refill', amount: 1500, date: '2026-02-22T07:30:00Z', category: 'Transport' },
    { id: 8, type: 'credit', description: 'Cashback Reward', amount: 320, date: '2026-02-21T00:00:00Z', category: 'Rewards' },
];

const CARDS = [
    { id: 1, last4: '4231', holder: 'Arjun Sharma', expiry: '08/28', type: 'Visa', gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)' },
    { id: 2, last4: '9087', holder: 'Arjun Sharma', expiry: '12/27', type: 'Mastercard', gradient: 'linear-gradient(135deg, #0d0b2e 0%, #7c3aed 80%, #a855f7 100%)' },
];

function VirtualCard({ card, hidden, active }: { card: typeof CARDS[0]; hidden: boolean; active: boolean }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotateY: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="credit-card w-full cursor-pointer relative overflow-hidden"
            style={{ background: card.gradient, opacity: active ? 1 : 0.55 }}>
            {/* Pattern */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
                <circle cx="300" cy="-30" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                <circle cx="300" cy="-30" r="175" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                <circle cx="-20" cy="200" r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                <line x1="0" y1="135" x2="320" y2="135" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </svg>
            {/* Shine */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 50%)' }} />
            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.7), transparent)' }}
                    animate={{ y: ['0%', '300%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
            </div>

            <div className="relative z-10 p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-auto">
                    <div className="flex items-center gap-1.5">
                        <Wifi size={12} className="text-white/60 -rotate-90" />
                        <span className="text-white/60 text-[10px]">NFC</span>
                    </div>
                    <span className="text-white/80 text-xs font-bold tracking-wider">{card.type}</span>
                </div>
                <div className="mt-3 mb-2">
                    <p className="text-white/40 text-[9px] mb-1 font-mono tracking-widest">CARD NUMBER</p>
                    <p className="text-white font-mono text-sm tracking-[0.2em]">
                        {hidden ? '•••• •••• ••••' : '4532 8821 3765'} {card.last4}
                    </p>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-white/40 text-[9px] tracking-widest mb-0.5">CARD HOLDER</p>
                        <p className="text-white text-xs font-semibold">{card.holder}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/40 text-[9px] tracking-widest mb-0.5">EXPIRES</p>
                        <p className="text-white text-xs font-semibold">{card.expiry}</p>
                    </div>
                    <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-red-500/80" />
                        <div className="w-7 h-7 rounded-full bg-yellow-500/80" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

type ModalMode = 'add' | 'withdraw' | null;

export default function WalletPage() {
    const [balance, setBalance] = useState(120000);
    const [txList, setTxList] = useState<Tx[]>(SEED_TXS);
    const [activeCard, setActiveCard] = useState(0);
    const [hidden, setHidden] = useState(false);
    const [modal, setModal] = useState<ModalMode>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load from API
    useEffect(() => {
        WalletAPI.getWallet().then(w => setBalance(w.balance)).catch(() => { });
        WalletAPI.getTransactions().then(d => { if (d.results?.length) setTxList(d.results); }).catch(() => { });
    }, []);

    function showToast(msg: string) {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    }

    async function handleSubmit() {
        const num = parseFloat(amount);
        if (!amount || isNaN(num) || num <= 0) return;
        if (modal === 'withdraw' && num > balance) { showToast('Insufficient balance'); return; }
        setIsSaving(true);

        const newTx: Tx = {
            id: Date.now(),
            type: modal === 'add' ? 'credit' : 'debit',
            description: desc || (modal === 'add' ? 'Deposit' : 'Withdrawal'),
            amount: num,
            date: new Date().toISOString(),
            category: modal === 'add' ? 'Transfer In' : 'Transfer Out',
        };

        try {
            if (modal === 'add') await WalletAPI.addMoney(num, newTx.description);
            else await WalletAPI.withdraw(num, newTx.description);
        } catch { /* offline */ }

        setBalance(b => modal === 'add' ? b + num : b - num);
        setTxList(t => [newTx, ...t]);
        showToast(modal === 'add' ? `₹${num.toLocaleString('en-IN')} added!` : `₹${num.toLocaleString('en-IN')} withdrawn`);
        setAmount(''); setDesc(''); setModal(null); setIsSaving(false);
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        try {
            const [wallet, txs] = await Promise.all([WalletAPI.getWallet(), WalletAPI.getTransactions()]);
            setBalance(wallet.balance);
            if (txs.results?.length) setTxList(txs.results);
            showToast('Refreshed');
        } catch { showToast('Unable to connect to server'); }
        setTimeout(() => setIsRefreshing(false), 800);
    }

    const filtered = filter === 'all' ? txList : txList.filter(t => t.type === filter);
    const income = txList.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const expense = txList.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-5 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl text-1">Wallet</h1>
                    <p className="text-sm text-3 mt-0.5">Manage your balance and transactions</p>
                </div>
                <button onClick={handleRefresh} className="btn-ghost p-2">
                    <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 0.8 }}>
                        <RefreshCw size={17} />
                    </motion.div>
                </button>
            </div>

            {/* Cards + Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Card stack */}
                <div className="lg:col-span-3 space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeCard}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                            <VirtualCard card={CARDS[activeCard]} hidden={hidden} active={true} />
                        </motion.div>
                    </AnimatePresence>
                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2">
                        {CARDS.map((_, i) => (
                            <button key={i} onClick={() => setActiveCard(i)}
                                className="rounded-full transition-all duration-300"
                                style={{ width: i === activeCard ? 24 : 7, height: 7, background: i === activeCard ? 'var(--purple)' : 'var(--border)' }} />
                        ))}
                        <button className="w-7 h-7 rounded-full flex items-center justify-center ml-2"
                            style={{ border: '1px dashed var(--border-hi)', color: 'var(--text-3)' }}>
                            <Plus size={11} />
                        </button>
                    </div>
                </div>

                {/* Balance */}
                <div className="lg:col-span-2 card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-2 font-medium">Available Balance</p>
                        <button onClick={() => setHidden(!hidden)} className="btn-ghost p-1.5">
                            {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                    </div>

                    <motion.div key={balance} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-1">
                        <span className="font-mono font-bold text-3xl text-1">
                            {hidden ? '₹ ••,•••' : `₹ ${balance.toLocaleString('en-IN')}`}
                        </span>
                    </motion.div>
                    <div className="flex items-center gap-1.5 mb-6">
                        <TrendingUp size={11} className="text-green-400" />
                        <span className="text-xs" style={{ color: '#10b981' }}>
                            +₹{(income - expense).toLocaleString('en-IN')} net
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2.5 mt-auto">
                        <button onClick={() => setModal('add')} className="btn w-full justify-between py-3">
                            <div className="flex items-center gap-2"><ArrowDownLeft size={16} /> Add Money</div>
                            <Plus size={14} className="opacity-70" />
                        </button>
                        <button onClick={() => setModal('withdraw')} className="btn-outline w-full justify-between py-3">
                            <div className="flex items-center gap-2"><ArrowUpRight size={16} /> Transfer / Withdraw</div>
                            <ChevronDown size={14} className="opacity-70" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Total In', value: income, icon: TrendingUp, color: '#10b981' },
                    { label: 'Total Out', value: expense, icon: TrendingDown, color: '#ef4444' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}>
                            <s.icon size={18} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-xs text-3 mb-0.5">{s.label}</p>
                            <p className="font-bold text-xl text-1">₹{s.value.toLocaleString('en-IN')}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transactions */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-1">Transaction History</h3>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        {(['all', 'credit', 'debit'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                                style={filter === f
                                    ? { background: 'rgba(168,85,247,0.2)', color: 'var(--purple-light)', border: '1px solid rgba(168,85,247,0.3)' }
                                    : { color: 'var(--text-3)' }}>
                                {f === 'credit' ? 'In' : f === 'debit' ? 'Out' : 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map((tx, i) => (
                            <motion.div key={tx.id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:border-opacity-50"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: tx.type === 'credit' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                                    {tx.type === 'credit'
                                        ? <ArrowDownLeft size={15} style={{ color: '#10b981' }} />
                                        : <ArrowUpRight size={15} style={{ color: '#ef4444' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-1 truncate">{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="badge text-[10px] px-2 py-0.5"
                                            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: 'var(--purple-light)' }}>
                                            {tx.category}
                                        </span>
                                        <span className="text-xs text-3 flex items-center gap-1">
                                            <Clock size={9} />
                                            {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <p className="font-bold text-sm flex-shrink-0" style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-3">No transactions found</div>
                    )}
                </div>
            </div>

            {/* Add/Withdraw Modal */}
            <AnimatePresence>
                {modal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModal(null)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.96 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="card card-sm w-full max-w-sm p-6 relative">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ background: 'rgba(168,85,247,0.15)' }}>
                                            {modal === 'add' ? <Banknote size={16} style={{ color: 'var(--purple)' }} /> : <ArrowUpRight size={16} style={{ color: 'var(--purple)' }} />}
                                        </div>
                                        <h3 className="font-display font-bold text-1">{modal === 'add' ? 'Add Money' : 'Transfer / Withdraw'}</h3>
                                    </div>
                                    <button onClick={() => setModal(null)} className="btn-ghost p-1.5">
                                        <X size={16} />
                                    </button>
                                </div>

                                {modal === 'add' && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[5000, 10000, 25000, 50000, 100000, 200000].map(q => (
                                            <button key={q} onClick={() => setAmount(String(q))}
                                                className="py-2 rounded-xl text-xs font-semibold transition-all"
                                                style={amount === String(q)
                                                    ? { background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: 'var(--purple-light)' }
                                                    : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                ₹{(q / 1000).toFixed(0)}k
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3 mb-5">
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Amount (₹)</label>
                                        <input type="number" className="field text-base font-bold" placeholder="0.00"
                                            value={amount} onChange={e => setAmount(e.target.value)} />
                                        {modal === 'withdraw' && balance > 0 && (
                                            <p className="text-[10px] text-3 mt-1">Available: ₹{balance.toLocaleString('en-IN')}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Note (optional)</label>
                                        <input type="text" className="field" placeholder={modal === 'add' ? 'e.g. Salary' : 'e.g. ATM withdrawal'}
                                            value={desc} onChange={e => setDesc(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
                                    <button className="btn" disabled={!amount || isSaving} onClick={handleSubmit}>
                                        {isSaving ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
                                                <RefreshCw size={16} />
                                            </motion.div>
                                        ) : modal === 'add' ? 'Add Money' : 'Withdraw'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                        <Check size={14} /> {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
