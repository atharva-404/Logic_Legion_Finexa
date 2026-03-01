import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Shield, Wallet as WalletIcon, MoreHorizontal, History, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/calculations';
import { WalletAPI, TransactionsAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

const cardVariants = {
    hover: { 
        y: -10, 
        rotateX: -10, 
        rotateY: 5, 
        transition: { type: 'spring', stiffness: 300, damping: 20 } 
    }
};

function VisualCard({ type, balance, lastFour }: { type: 'Primary' | 'Secondary'; balance: number; lastFour: string }) {
    const isPrimary = type === 'Primary';
    
    return (
        <motion.div 
            whileHover="hover"
            variants={cardVariants}
            className={`relative rounded-2xl p-6 h-52 aspect-[1.6/1] overflow-hidden cursor-pointer shadow-2xl group border-[1px] ${isPrimary ? 'border-purple-400/30' : 'border-blue-400/30'}`}
            style={{ 
                perspective: '1000px',
                background: isPrimary 
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.9) 100%)'
            }}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{type} Wallet</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Shield size={14} className="text-white/70" />
                            <span className="text-sm font-medium">Secured Node</span>
                        </div>
                    </div>
                    <CreditCard size={24} className="opacity-80" />
                </div>

                <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold tracking-tight">{formatCurrency(balance)}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[8px] uppercase opacity-60 font-bold">Expires</p>
                            <p className="text-xs font-medium">12/28</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] uppercase opacity-60 font-bold">Network</p>
                            <p className="text-xs font-medium uppercase">{lastFour === '4242' ? 'Visa' : 'Rupay'}</p>
                        </div>
                    </div>
                    <p className="text-sm font-mono tracking-widest">•••• {lastFour}</p>
                </div>
            </div>
            
            {/* Animated Edge Shine */}
            <motion.div 
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }} 
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
        </motion.div>
    );
}

export default function Wallet() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch wallet balance
                const wallet = await WalletAPI.getWallet().catch(() => null);
                if (wallet) setWalletBalance(wallet.balance || 0);

                // Fetch transactions from backend
                const txData = await TransactionsAPI.list(1).catch(() => null);
                if (txData?.results) {
                    setTransactions(txData.results.map((t: any) => ({
                        id: t.id,
                        merchant: t.description || t.category || 'Transaction',
                        amount: t.type === 'income' ? +t.amount : -(+t.amount),
                        category: t.category || 'Other',
                        date: t.date || t.created_at?.split('T')[0] || '',
                        status: 'completed' as const,
                    })));
                }

                // Fetch summary for income/expenses
                const summary = await TransactionsAPI.summary().catch(() => null);
                if (summary) {
                    setMonthlyIncome(summary.total_income || user?.income || 0);
                    setMonthlyExpenses(summary.total_expense || 0);
                } else if (user?.income) {
                    setMonthlyIncome(user.income);
                }
            } catch (err) {
                console.error('Wallet fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'income') return tx.amount > 0;
        return tx.amount < 0;
    });

    const aiCredits = user?.ai_credits ?? 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 size={32} className="text-purple-400" />
                </motion.div>
                <span className="ml-3 text-3">Loading wallet data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl text-1">Digital Wallet</h1>
                    <p className="text-3 text-sm mt-1">Manage your institutional accounts and liquidity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="button-primary flex items-center gap-2 px-4 py-2">
                        <Plus size={18} /> Add Funds
                    </button>
                    <button className="button-secondary bg-surface p-2.5 rounded-xl border-[1px] border-border hover:bg-surface-2 transition-colors">
                        <MoreHorizontal size={20} className="text-3" />
                    </button>
                </div>
            </div>

            {/* AI Credits Badge */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: 'var(--purple)' }}
            >
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI Computing Balance: {aiCredits.toLocaleString()} Credits
            </motion.div>

            {/* Cards Showcase */}
            <div className="flex flex-col lg:flex-row gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <VisualCard type="Primary" balance={walletBalance || monthlyIncome * 2.4} lastFour="4242" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <VisualCard type="Secondary" balance={walletBalance > 0 ? walletBalance * 0.3 : monthlyIncome * 0.8} lastFour="8891" />
                </motion.div>
                
                {/* Balance Summary Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="card p-6 flex-1 min-w-[280px]"
                >
                    <p className="text-3 text-[10px] uppercase font-bold tracking-widest mb-4">Total Liquidity</p>
                    <div className="flex items-end gap-3 mb-6">
                        <div className="text-4xl font-bold text-1">{formatCurrency(walletBalance || monthlyIncome + (monthlyIncome - monthlyExpenses))}</div>
                        <div className="text-green-500 flex items-center gap-1 text-sm font-semibold pb-1.5">
                            <ArrowUpRight size={14} /> +12.4%
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                    <ArrowUpRight size={16} />
                                </div>
                                <span className="text-sm font-medium text-2 italic">Monthly Ingress</span>
                            </div>
                            <span className="text-sm font-bold text-1">+{formatCurrency(monthlyIncome)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                    <ArrowDownLeft size={16} />
                                </div>
                                <span className="text-sm font-medium text-2 italic">Monthly Egress</span>
                            </div>
                            <span className="text-sm font-bold text-1">-{formatCurrency(monthlyExpenses)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Transaction History */}
            <div className="card-no-bg space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-1 font-bold flex items-center gap-2">
                        <History size={18} className="text-purple-600" /> Transaction Ledger
                    </h3>
                    <div className="flex gap-2 bg-surface-2 p-1 rounded-xl border-[1px] border-border">
                        {(['all', 'income', 'expense'] as const).map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                                    filter === f ? 'bg-white dark:bg-zinc-800 text-purple-600 shadow-sm' : 'text-3 hover:text-2'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 overflow-hidden rounded-2xl border-[1px] border-border bg-surface/50">
                    <AnimatePresence mode="popLayout">
                        {filteredTransactions.length === 0 ? (
                            <div className="p-8 text-center text-3 text-sm">
                                No transactions found. Add your first transaction to get started.
                            </div>
                        ) : filteredTransactions.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all border-b-[1px] border-border last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg border-[1px] border-border group-hover:scale-110 transition-transform">
                                        {tx.category === 'Food' ? '🍔' : tx.category === 'Transport' ? '🚗' : tx.category === 'Salary' ? '💰' : '🏷️'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-1">{tx.merchant}</p>
                                        <p className="text-xs text-3">{tx.date} · <span className="italic">{tx.category}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-1'}`}>
                                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                    </p>
                                    <p className="text-[10px] text-3 uppercase font-bold tracking-tighter opacity-70">Settled</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
