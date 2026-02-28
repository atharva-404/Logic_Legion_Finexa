import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowDownLeft, ArrowUpRight, Plus, Eye, EyeOff,
    TrendingUp, TrendingDown, Clock, X, Banknote,
    RefreshCw, Check, Wifi, CreditCard as CardIcon
} from 'lucide-react';
import { WalletAPI } from '../../lib/api';

interface Tx {
    id: number; type: 'credit' | 'debit'; description: string;
    amount: number; date: string; category: string;
}

interface Card {
    id: number; last4: string; holder: string; expiry: string;
    type: 'Visa' | 'Mastercard'; gradient: string;
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

const INITIAL_CARDS: Card[] = [
    { id: 1, last4: '4231', holder: 'Arjun Sharma', expiry: '08/28', type: 'Visa', gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)' },
    { id: 2, last4: '9087', holder: 'Arjun Sharma', expiry: '12/27', type: 'Mastercard', gradient: 'linear-gradient(135deg, #0d0b2e 0%, #3b1d8c 70%, #7c3aed 100%)' },
];

function VirtualCard({ card, hidden, active }: { card: Card; hidden: boolean; active: boolean }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotateY: 3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="credit-card w-full cursor-pointer relative overflow-hidden"
            style={{ background: card.gradient, opacity: active ? 1 : 0.5 }}>
            {/* Circle decorations */}
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <circle cx="300" cy="-30" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                <circle cx="300" cy="-30" r="175" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                <circle cx="-20" cy="200" r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
            </svg>
            {/* Top sheen */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 55%)' }} />
            {/* Animated scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.8), transparent)' }}
                    animate={{ y: ['0%', '280%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
            </div>
            <div className="relative z-10 p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-auto">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Wifi size={11} className="text-white -rotate-90" />
                        <span className="text-white text-[10px] font-mono tracking-widest">NFC</span>
                    </div>
                    <span className="text-white/80 text-xs font-bold tracking-wider">{card.type}</span>
                </div>
                <div className="mt-4 mb-2.5">
                    <p className="text-white/35 text-[9px] mb-1 font-mono tracking-[0.25em]">CARD NUMBER</p>
                    <p className="text-white font-mono text-sm tracking-[0.22em]">
                        {hidden ? '•••• •••• ••••' : '4532 8821 3765'} {card.last4}
                    </p>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-white/35 text-[9px] tracking-[0.2em] mb-0.5">CARD HOLDER</p>
                        <p className="text-white text-xs font-semibold">{card.holder}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/35 text-[9px] tracking-[0.2em] mb-0.5">EXPIRES</p>
                        <p className="text-white text-xs font-semibold">{card.expiry}</p>
                    </div>
                    <div className="flex -space-x-2 pb-0.5">
                        <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(220,38,38,0.75)' }} />
                        <div className="w-7 h-7 rounded-full" style={{ background: 'rgba(234,179,8,0.75)' }} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

type ModalMode = 'add-money' | 'withdraw' | 'add-card' | null;

const CARD_GRADIENTS = [
    'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)',
    'linear-gradient(135deg, #0d0b2e 0%, #3b1d8c 70%, #7c3aed 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #3b82f6 100%)',
    'linear-gradient(135deg, #0c1a1a 0%, #065f46 60%, #10b981 100%)',
    'linear-gradient(135deg, #1c0533 0%, #581c87 60%, #a855f7 100%)',
];

export default function WalletPage() {
    const [balance, setBalance] = useState(120000);
    const [txList, setTxList] = useState<Tx[]>(SEED_TXS);
    const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
    const [activeCard, setActiveCard] = useState(0);
    const [hidden, setHidden] = useState(false);
    const [modal, setModal] = useState<ModalMode>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Add-card form state
    const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' as 'Visa' | 'Mastercard', colorIdx: 0 });

    useEffect(() => {
        WalletAPI.getWallet().then(w => setBalance(w.balance)).catch(() => { });
        WalletAPI.getTransactions().then(d => { if (d.results?.length) setTxList(d.results); }).catch(() => { });
    }, []);

    function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); }

    async function handleMoneySubmit() {
        const num = parseFloat(amount);
        if (!amount || isNaN(num) || num <= 0) return;
        if (modal === 'withdraw' && num > balance) { showToast('Insufficient balance'); return; }
        setIsSaving(true);
        const newTx: Tx = {
            id: Date.now(), type: modal === 'add-money' ? 'credit' : 'debit',
            description: desc || (modal === 'add-money' ? 'Deposit' : 'Withdrawal'),
            amount: num, date: new Date().toISOString(), category: modal === 'add-money' ? 'Transfer In' : 'Transfer Out',
        };
        try {
            if (modal === 'add-money') await WalletAPI.addMoney(num, newTx.description);
            else await WalletAPI.withdraw(num, newTx.description);
        } catch { /* offline */ }
        setBalance(b => modal === 'add-money' ? b + num : b - num);
        setTxList(t => [newTx, ...t]);
        showToast(modal === 'add-money' ? `Added Rs ${num.toLocaleString('en-IN')}` : `Withdrawn Rs ${num.toLocaleString('en-IN')}`);
        setAmount(''); setDesc(''); setModal(null); setIsSaving(false);
    }

    function handleAddCard() {
        const num = newCard.number.replace(/\s/g, '');
        if (num.length < 15 || !newCard.holder || !newCard.expiry) return;
        const last4 = num.slice(-4);
        const card: Card = {
            id: Date.now(), last4, holder: newCard.holder,
            expiry: newCard.expiry, type: newCard.type as 'Visa' | 'Mastercard',
            gradient: CARD_GRADIENTS[newCard.colorIdx],
        };
        setCards(c => [...c, card]);
        setActiveCard(cards.length);
        setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa', colorIdx: 0 });
        setModal(null);
        showToast('Card added successfully');
    }

    function formatCardNumber(v: string) {
        const digits = v.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    }

    function formatExpiry(v: string) {
        const digits = v.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    }

    const filtered = filter === 'all' ? txList : txList.filter(t => t.type === filter);
    const income = txList.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const expense = txList.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display font-bold text-2xl text-1">Wallet</h1>
                    <p className="text-xs text-3 mt-0.5">Manage cards, balance and transactions</p>
                </div>
                <button onClick={async () => {
                    setIsRefreshing(true);
                    try {
                        const [w, d] = await Promise.all([WalletAPI.getWallet(), WalletAPI.getTransactions()]);
                        setBalance(w.balance);
                        if (d.results?.length) setTxList(d.results);
                        showToast('Refreshed');
                    } catch { showToast('Offline — showing cached data'); }
                    setTimeout(() => setIsRefreshing(false), 700);
                }} className="btn-ghost p-2">
                    <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 0.7 }}>
                        <RefreshCw size={16} />
                    </motion.div>
                </button>
            </div>

            {/* Top grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Card stack */}
                <div className="lg:col-span-3 space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeCard}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                            <VirtualCard card={cards[activeCard] ?? cards[0]} hidden={hidden} active={true} />
                        </motion.div>
                    </AnimatePresence>
                    {/* Dots + add */}
                    <div className="flex items-center justify-center gap-2">
                        {cards.map((_, i) => (
                            <button key={i} onClick={() => setActiveCard(i)}
                                className="rounded-full transition-all duration-300"
                                style={{ width: i === activeCard ? 22 : 7, height: 7, background: i === activeCard ? 'var(--purple)' : 'var(--border)' }} />
                        ))}
                        <button onClick={() => setModal('add-card')}
                            className="w-7 h-7 rounded-full flex items-center justify-center ml-1 transition-all hover:scale-110"
                            style={{ border: '1.5px dashed var(--border-hi)', color: 'var(--text-3)' }}
                            title="Add new card">
                            <Plus size={12} />
                        </button>
                    </div>
                </div>

                {/* Balance panel */}
                <div className="lg:col-span-2 card p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-2 font-medium">Available Balance</p>
                        <button onClick={() => setHidden(!hidden)} className="btn-ghost p-1.5">
                            {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                    </div>
                    <motion.p key={balance} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="font-mono font-bold text-3xl text-1 mb-1">
                        {hidden ? 'Rs ••,•••' : `Rs ${balance.toLocaleString('en-IN')}`}
                    </motion.p>
                    <div className="flex items-center gap-1.5 mb-6">
                        <TrendingUp size={11} className="text-green-400" />
                        <span className="text-xs" style={{ color: '#10b981' }}>
                            +Rs {(income - expense).toLocaleString('en-IN')} net this month
                        </span>
                    </div>
                    <div className="space-y-2.5 mt-auto">
                        <button onClick={() => setModal('add-money')} className="btn w-full justify-between py-3 text-sm">
                            <div className="flex items-center gap-2"><ArrowDownLeft size={15} /> Add Money</div>
                            <Plus size={13} className="opacity-70" />
                        </button>
                        <button onClick={() => setModal('withdraw')} className="btn-outline w-full justify-between py-3 text-sm">
                            <div className="flex items-center gap-2"><ArrowUpRight size={15} /> Transfer / Withdraw</div>
                            <ArrowUpRight size={13} className="opacity-70" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                {[{ l: 'Total In', v: income, icon: TrendingUp, c: '#10b981' }, { l: 'Total Out', v: expense, icon: TrendingDown, c: '#ef4444' }].map((s, i) => (
                    <motion.div key={s.l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${s.c}14`, border: `1px solid ${s.c}30` }}>
                            <s.icon size={17} style={{ color: s.c }} />
                        </div>
                        <div>
                            <p className="text-xs text-3 mb-0.5">{s.l}</p>
                            <p className="font-bold text-xl text-1">Rs {s.v.toLocaleString('en-IN')}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transactions */}
            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-1 text-sm">Transaction History</h3>
                    <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        {(['all', 'credit', 'debit'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                                style={filter === f
                                    ? { background: 'rgba(168,85,247,0.18)', color: 'var(--purple-light)', border: '1px solid rgba(168,85,247,0.3)' }
                                    : { color: 'var(--text-3)' }}>
                                {f === 'credit' ? 'In' : f === 'debit' ? 'Out' : 'All'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map((tx, i) => (
                            <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: i * 0.025 }}
                                className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: tx.type === 'credit' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                    {tx.type === 'credit'
                                        ? <ArrowDownLeft size={14} style={{ color: '#10b981' }} />
                                        : <ArrowUpRight size={14} style={{ color: '#ef4444' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-1 truncate">{tx.description}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="badge text-[10px] px-2 py-0.5"
                                            style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)', color: 'var(--purple-light)' }}>
                                            {tx.category}
                                        </span>
                                        <span className="text-[10px] text-3 flex items-center gap-1">
                                            <Clock size={8} />
                                            {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <p className="font-bold text-sm flex-shrink-0" style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                                    {tx.type === 'credit' ? '+' : '-'}Rs {tx.amount.toLocaleString('en-IN')}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && <div className="text-center py-10 text-3 text-sm">No transactions found</div>}
                </div>
            </div>

            {/* ── Modals ─────────────────────────── */}
            <AnimatePresence>
                {modal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setModal(null)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">

                            {/* Add Money / Withdraw */}
                            {(modal === 'add-money' || modal === 'withdraw') && (
                                <div className="card w-full max-w-sm p-6 my-auto">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                                                {modal === 'add-money' ? <Banknote size={15} style={{ color: 'var(--purple)' }} /> : <ArrowUpRight size={15} style={{ color: 'var(--purple)' }} />}
                                            </div>
                                            <h3 className="font-display font-bold text-1">{modal === 'add-money' ? 'Add Money' : 'Transfer / Withdraw'}</h3>
                                        </div>
                                        <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><X size={15} /></button>
                                    </div>
                                    {modal === 'add-money' && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {[5000, 10000, 25000, 50000, 100000, 200000].map(q => (
                                                <button key={q} onClick={() => setAmount(String(q))}
                                                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                                                    style={amount === String(q)
                                                        ? { background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.4)', color: 'var(--purple-light)' }
                                                        : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                    Rs {(q / 1000).toFixed(0)}k
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="space-y-3 mb-5">
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Amount (Rs)</label>
                                            <input type="number" className="field text-lg font-bold" placeholder="0"
                                                value={amount} onChange={e => setAmount(e.target.value)} />
                                            {modal === 'withdraw' && <p className="text-[10px] text-3 mt-1">Available: Rs {balance.toLocaleString('en-IN')}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Note (optional)</label>
                                            <input type="text" className="field" placeholder={modal === 'add-money' ? 'e.g. Salary' : 'e.g. Rent payment'}
                                                value={desc} onChange={e => setDesc(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
                                        <button className="btn" disabled={!amount || isSaving} onClick={handleMoneySubmit}>
                                            {isSaving
                                                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}><RefreshCw size={15} /></motion.div>
                                                : modal === 'add-money' ? 'Add Money' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add Card */}
                            {modal === 'add-card' && (
                                <div className="card w-full max-w-sm p-6 my-auto">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                                                <CardIcon size={15} style={{ color: 'var(--purple)' }} />
                                            </div>
                                            <h3 className="font-display font-bold text-1">Add New Card</h3>
                                        </div>
                                        <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><X size={15} /></button>
                                    </div>

                                    {/* Live card preview */}
                                    <div className="mb-5 rounded-2xl overflow-hidden relative h-36"
                                        style={{ background: CARD_GRADIENTS[newCard.colorIdx] }}>
                                        <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 320 145" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                                            <circle cx="290" cy="-20" r="110" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
                                            <circle cx="290" cy="-20" r="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                                        </svg>
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }} />
                                        <div className="relative z-10 p-4 flex flex-col h-full">
                                            <div className="flex justify-between items-center mb-auto">
                                                <Wifi size={11} className="text-white/50 -rotate-90" />
                                                <span className="text-white/70 text-xs font-bold">{newCard.type}</span>
                                            </div>
                                            <p className="text-white font-mono text-sm tracking-[0.2em] mb-2">
                                                {newCard.number || '•••• •••• •••• ••••'}
                                            </p>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-white/30 text-[8px] tracking-widest">CARD HOLDER</p>
                                                    <p className="text-white text-xs font-semibold">{newCard.holder || 'FULL NAME'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white/30 text-[8px] tracking-widest">EXPIRES</p>
                                                    <p className="text-white text-xs font-semibold">{newCard.expiry || 'MM/YY'}</p>
                                                </div>
                                                <div className="flex -space-x-2 self-end pb-0.5">
                                                    <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(220,38,38,0.7)' }} />
                                                    <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(234,179,8,0.7)' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color chooser */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs text-3">Card color:</span>
                                        {CARD_GRADIENTS.map((g, i) => (
                                            <button key={i} onClick={() => setNewCard(c => ({ ...c, colorIdx: i }))}
                                                className="w-6 h-6 rounded-full transition-all"
                                                style={{ background: g, outline: newCard.colorIdx === i ? '2px solid var(--purple)' : 'none', outlineOffset: 2 }} />
                                        ))}
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Card Number</label>
                                            <input type="text" className="field font-mono" placeholder="1234 5678 9012 3456" maxLength={19}
                                                value={newCard.number} onChange={e => setNewCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Cardholder Name</label>
                                            <input type="text" className="field" placeholder="ARJUN SHARMA"
                                                value={newCard.holder} onChange={e => setNewCard(c => ({ ...c, holder: e.target.value.toUpperCase() }))} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <label className="text-xs text-3 mb-1.5 block">Expiry (MM/YY)</label>
                                                <input type="text" className="field font-mono" placeholder="08/28" maxLength={5}
                                                    value={newCard.expiry} onChange={e => setNewCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-3 mb-1.5 block">CVV</label>
                                                <input type="password" className="field font-mono" placeholder="•••" maxLength={4}
                                                    value={newCard.cvv} onChange={e => setNewCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-3 mb-1.5 block">Card Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['Visa', 'Mastercard'] as const).map(t => (
                                                    <button key={t} onClick={() => setNewCard(c => ({ ...c, type: t }))}
                                                        className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                                                        style={newCard.type === t
                                                            ? { background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.4)', color: 'var(--purple-light)' }
                                                            : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="btn-outline text-sm" onClick={() => setModal(null)}>Cancel</button>
                                        <button className="btn text-sm" onClick={handleAddCard}
                                            disabled={!newCard.number || !newCard.holder || !newCard.expiry}>
                                            <Plus size={14} /> Add Card
                                        </button>
                                    </div>
                                </div>
                            )}
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
