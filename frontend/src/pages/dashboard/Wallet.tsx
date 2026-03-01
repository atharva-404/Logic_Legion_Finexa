import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Check, Wifi, CreditCard as CardIcon, Trash2, Shield, Eye, EyeOff, Lock, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useFinancialStore, CardInfo } from '../../store/financialStore';
import { useTheme } from '../../contexts/ThemeContext';

function CardChip() {
    return (
        <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 relative overflow-hidden shadow-inner border border-yellow-700/30">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-yellow-900/20" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-yellow-900/20" />
            <div className="absolute inset-2 border-[1px] border-yellow-900/10 rounded-sm" />
        </div>
    );
}

function VirtualCard({ card, active, index, total, onRemove }: { card: CardInfo; active: boolean; index: number; total: number; onRemove: () => void }) {
    const [showFull, setShowFull] = useState(false);

    return (
        <motion.div
            initial={false}
            animate={{
                scale: active ? 1 : 0.9,
                x: (index - 0) * 20, // Offset for stack effect if we were showing all, but here we show active
                z: active ? 0 : -100,
                opacity: active ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`mx-auto w-full max-w-[420px] aspect-[1.586/1] relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 perspective-1000 ${active ? 'z-30 cursor-default' : 'z-0 pointer-events-none'}`}
            style={{ background: card.gradient }}>

            {/* Glossy overlay & textures */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />

            {/* Animated scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute left-0 right-0 h-[100%] w-[200%] -rotate-45"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
                    animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
            </div>

            <div className="relative z-10 p-7 h-full flex flex-col justify-between">
                {/* Top Section: Branding & Type */}
                <div className="flex items-start justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                                <CardIcon size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white text-[10px] font-mono tracking-[0.3em] opacity-60 leading-none">PROTOCOL</p>
                                <p className="text-white font-bold text-xs tracking-tight">FINEXA INSURED</p>
                            </div>
                        </div>
                        <CardChip />
                    </div>

                    <div className="flex flex-col items-end gap-3 text-right">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black italic tracking-tighter text-lg opacity-90">{card.type}</span>
                            {active && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/30 transition-all border border-white/5 opacity-40 hover:opacity-100"
                                >
                                    <Trash2 size={12} className="text-white" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-black/20 backdrop-blur-sm border border-white/5">
                            <Wifi size={12} className="text-white -rotate-90 opacity-60" />
                            <span className="text-white text-[8px] font-mono tracking-[0.2em] font-bold">RFID PROTECT</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Card Number */}
                <div className="space-y-1.5 relative group">
                    <div className="flex items-center justify-between">
                        <p className="text-white/30 text-[9px] font-mono tracking-[0.4em]">DYNAMIC ASSET IDENTIFIER</p>
                        {active && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowFull(!showFull); }}
                                className="relative z-20 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 group/btn border border-white/5 shadow-sm active:scale-95"
                            >
                                {showFull ? <EyeOff size={14} className="text-white/70" /> : <Eye size={14} className="text-white/70" />}
                                <span className="text-white text-[10px] font-bold tracking-widest">{showFull ? 'HIDE ASSET' : 'VIEW DETAILS'}</span>
                            </button>
                        )}
                    </div>
                    <p className="text-white font-mono text-xl sm:text-2xl tracking-[0.18em] drop-shadow-lg flex items-center gap-1.5 transition-all duration-300">
                        {showFull ? card.number : `•••• •••• •••• ${card.last4}`}
                    </p>
                </div>

                {/* Bottom: Holder & Expiry */}
                <div className="flex items-end justify-between">
                    <div className="min-w-0">
                        <p className="text-white/30 text-[8px] tracking-[0.3em] mb-1.5 uppercase font-mono">ASSET CONTROLLER</p>
                        <p className="text-white text-sm font-bold uppercase truncate max-w-[200px] tracking-wide">{card.holder}</p>
                    </div>

                    <div className="flex gap-8 items-end">
                        <div className="text-right">
                            <p className="text-white/30 text-[8px] tracking-[0.2em] mb-1.5 uppercase font-mono">CVV</p>
                            <p className="text-white text-sm font-bold font-mono">{showFull ? card.cvv : '•••'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/30 text-[8px] tracking-[0.2em] mb-1.5 uppercase font-mono">EXPIRY</p>
                            <p className="text-white text-sm font-bold font-mono">{card.expiry}</p>
                        </div>
                        <div className="flex -space-x-2.5 translate-y-0.5">
                            <div className="w-9 h-9 rounded-full bg-red-600/80 backdrop-blur-md border border-white/20 shadow-xl" />
                            <div className="w-9 h-9 rounded-full bg-orange-400/80 backdrop-blur-md border border-white/20 shadow-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

const CARD_GRADIENTS = [
    'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%)', // Stealth Black
    'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)', // Purple Deep
    'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #3b82f6 100%)', // Royal Blue
    'linear-gradient(135deg, #0c1a1a 0%, #065f46 60%, #10b981 100%)', // Emerald Green
    'linear-gradient(135deg, #1c0533 0%, #581c87 60%, #a855f7 100%)', // Radiant Purple
];

export default function WalletPage() {
    const { cards, addCard, removeCard } = useFinancialStore();
    const { isDark } = useTheme();

    const [activeCard, setActiveCard] = useState(0);
    const [isAddMode, setIsAddMode] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // Add-card form state
    const [newCard, setNewCard] = useState({
        number: '',
        holder: '',
        expiry: '',
        cvv: '',
        type: 'Visa' as 'Visa' | 'Mastercard' | 'Amex',
        colorIdx: 0
    });

    function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); }

    function handleAddCard() {
        const num = newCard.number.replace(/\s/g, '');
        if (num.length < 15 || !newCard.holder || !newCard.expiry) return;

        // Reject past expiry
        const [mm, yy] = newCard.expiry.split('/');
        if (mm && yy) {
            const expMonth = parseInt(mm, 10);
            const expYear = 2000 + parseInt(yy, 10);
            const now = new Date();
            if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                showToast('Card expiry cannot be in the past');
                return;
            }
        }

        addCard({
            number: newCard.number,
            last4: num.slice(-4),
            cvv: newCard.cvv || '123',
            holder: newCard.holder,
            expiry: newCard.expiry,
            type: newCard.type,
            gradient: CARD_GRADIENTS[newCard.colorIdx],
        });

        setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa', colorIdx: 0 });
        setIsAddMode(false);
        // Retain current card view as requested
        showToast('Credential integrated into vault');
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

    const nextCard = () => setActiveCard((prev) => (prev + 1) % cards.length);
    const prevCard = () => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);

    return (
        <div className="space-y-12 max-w-2xl mx-auto pb-24 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Lock size={14} className="text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/80">Secure Enclave</span>
                    </div>
                    <h1 className="font-display font-black text-4xl tracking-tight text-1">Institutional <span className="text-gradient">Wallet</span></h1>
                    <p className="text-xs text-3 mt-2 font-medium max-w-sm">Encrypted capital storage and primary asset credential management.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-2">Vault Active</span>
                </div>
            </div>

            <div className="space-y-10">
                {/* Card Stack Visualization */}
                {cards.length > 0 ? (
                    <div className="relative pt-12">
                        {/* Stack background elements */}
                        {cards.length > 1 && (
                            <div className="absolute inset-0 flex justify-center translate-y-4 opacity-40 scale-[0.96] pointer-events-none">
                                <div className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl bg-card border border-border shadow-xl rotate-[-2deg]"
                                    style={{ background: cards[(activeCard + 1) % cards.length].gradient }} />
                            </div>
                        )}
                        {cards.length > 2 && (
                            <div className="absolute inset-0 flex justify-center translate-y-8 opacity-20 scale-[0.92] pointer-events-none">
                                <div className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl bg-card border border-border shadow-lg rotate-[1deg]"
                                    style={{ background: cards[(activeCard + 2) % cards.length].gradient }} />
                            </div>
                        )}

                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeCard}
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}>
                                    <VirtualCard
                                        card={cards[activeCard]}
                                        active={true}
                                        index={activeCard}
                                        total={cards.length}
                                        onRemove={() => {
                                            removeCard(cards[activeCard].id);
                                            setActiveCard(0);
                                            showToast('Card decommissioned');
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Stack Navigation Controls */}
                            {cards.length > 1 && (
                                <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 flex flex-col gap-4">
                                    <button onClick={prevCard} className="p-3 rounded-full bg-card hover:bg-card-hi border border-border shadow-xl transition-all hover:scale-110 active:scale-90">
                                        <ChevronLeft size={20} className="text-1" />
                                    </button>
                                </div>
                            )}
                            {cards.length > 1 && (
                                <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 flex flex-col gap-4">
                                    <button onClick={nextCard} className="p-3 rounded-full bg-card hover:bg-card-hi border border-border shadow-xl transition-all hover:scale-110 active:scale-90">
                                        <ChevronRight size={20} className="text-1" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Pagination Selector */}
                        <div className="mt-12 flex items-center justify-center gap-3">
                            {cards.map((_, i) => (
                                <button key={i} onClick={() => setActiveCard(i)}
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: i === activeCard ? 40 : 10,
                                        background: i === activeCard ? 'var(--purple)' : 'var(--bg-card-hi)',
                                        opacity: i === activeCard ? 1 : 0.3
                                    }} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card p-16 text-center border-dashed border-[3px] border-purple-500/10 flex flex-col items-center gap-6 bg-purple-500/[0.02]">
                        <div className="w-20 h-20 rounded-3xl bg-purple-500/5 flex items-center justify-center border border-purple-500/10">
                            <CardIcon size={40} className="text-purple-500/30" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-1 mb-1">Vault empty</p>
                            <p className="text-xs text-3 max-w-[240px]">Integrate your first asset credential to begin institutional monitoring.</p>
                        </div>
                    </div>
                )}

                {/* Main Action Button */}
                {!isAddMode && (
                    <motion.button
                        layoutId="add-card-btn"
                        onClick={() => setIsAddMode(true)}
                        className="w-full card p-8 border-dashed border-2 hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all flex flex-col items-center gap-4 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                            <Plus size={24} className="text-purple-500" />
                        </div>
                        <div className="text-center">
                            <span className="font-black text-xs tracking-[0.2em] text-1 uppercase block mb-1">Integrate New Asset</span>
                            <span className="text-[10px] text-3 uppercase font-bold opacity-60">Add credentials to secure enclave</span>
                        </div>
                    </motion.button>
                )}

                {/* Add Card Form */}
                <AnimatePresence>
                    {isAddMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="card overflow-hidden bg-card"
                        >
                            <div className="p-8 sm:p-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-500/10">
                                            <Shield size={20} className="text-purple-500" />
                                        </div>
                                        <h3 className="font-black text-2xl text-1 tracking-tight">Credential Sync</h3>
                                    </div>
                                    <button onClick={() => setIsAddMode(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                {/* Preview mini-card */}
                                <div className="mx-auto w-full max-w-[360px] aspect-[1.586/1] relative p-6 flex flex-col justify-between rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                                    style={{ background: CARD_GRADIENTS[newCard.colorIdx] }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <CardChip />
                                        <span className="text-white font-black italic text-sm tracking-tight opacity-90">{newCard.type}</span>
                                    </div>
                                    <p className="text-white font-mono text-xl tracking-[0.2em] text-center my-1 relative z-10 drop-shadow-md">
                                        {newCard.number || '•••• •••• •••• ••••'}
                                    </p>
                                    <div className="flex justify-between items-end relative z-10">
                                        <div className="max-w-[170px]">
                                            <p className="text-white/40 text-[8px] uppercase tracking-[0.3em] leading-none mb-2 font-mono">ASSET CONTROLLER</p>
                                            <p className="text-white text-xs font-bold truncate uppercase">{newCard.holder || 'UNNAMED HOLDER'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/40 text-[8px] uppercase tracking-[0.2em] leading-none mb-2 font-mono">VALID THRU</p>
                                            <p className="text-white text-xs font-bold font-mono">{newCard.expiry || '00/00'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-8">
                                    <div className="grid grid-cols-5 gap-4">
                                        {CARD_GRADIENTS.map((g, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setNewCard(c => ({ ...c, colorIdx: i }))}
                                                className={`h-11 rounded-2xl transition-all border-2 ${newCard.colorIdx === i ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                                style={{ background: g }}
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-3 mb-2.5 block px-1">Primary Number</label>
                                                <input type="text" className="field font-mono text-base bg-card-hi" placeholder="4532 8821 3765 9012" maxLength={19}
                                                    value={newCard.number} onChange={e => setNewCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-3 mb-2.5 block px-1">Legal Holder</label>
                                                <input type="text" className="field bg-card-hi uppercase" placeholder="NAME AS PRINTED"
                                                    value={newCard.holder} onChange={e => setNewCard(c => ({ ...c, holder: e.target.value.toUpperCase() }))} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-5">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-3 mb-2.5 block px-1">Expiry</label>
                                                <input type="text" className="field font-mono bg-card-hi" placeholder="MM/YY" maxLength={5}
                                                    value={newCard.expiry} onChange={e => setNewCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-3 mb-2.5 block px-1">CVV</label>
                                                <input type="password" className="field font-mono bg-card-hi" placeholder="•••" maxLength={4}
                                                    value={newCard.cvv} onChange={e => setNewCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-3 mb-2.5 block px-1">Type</label>
                                                <select
                                                    className="field text-xs h-[46px] bg-card-hi"
                                                    value={newCard.type}
                                                    onChange={e => setNewCard(c => ({ ...c, type: e.target.value as any }))}
                                                >
                                                    <option value="Visa">Visa Protocol</option>
                                                    <option value="Mastercard">Mastercard Protocol</option>
                                                    <option value="Amex">Amex Protocol</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                        <button className="btn-outline flex-1 py-4 font-black text-xs uppercase tracking-widest" onClick={() => setIsAddMode(false)}>Cancel Protocol</button>
                                        <button
                                            className="btn flex-1 py-4 gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20"
                                            disabled={!newCard.number || !newCard.holder || !newCard.expiry}
                                            onClick={handleAddCard}
                                        >
                                            <Check size={20} /> Finalize Sync
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-3 px-8 py-4 rounded-3xl text-sm font-black text-white shadow-2xl backdrop-blur-xl border border-white/20"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Check size={14} />
                        </div>
                        <span className="tracking-wide uppercase text-xs">{toastMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
