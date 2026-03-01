import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard as CardIcon, Plus, X, Wifi, Trash2, Check, RefreshCw,
} from 'lucide-react';
import { CardAPI } from '../../lib/api';

/* ── Types ──────────────────────────── */
interface Card {
    id: number;
    last4: string;
    card_holder: string;
    expiry: string;
    card_type: 'Visa' | 'Mastercard';
    gradient_index: number;
}

/* ── Gradients ──────────────────────── */
const CARD_GRADIENTS = [
    'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%)',
    'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #1e1b4b 100%)',
    'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e3a8a 100%)',
    'linear-gradient(135deg, #065f46 0%, #10b981 50%, #064e3b 100%)',
    'linear-gradient(135deg, #6b21a8 0%, #c084fc 50%, #7e22ce 100%)',
];

/* ── Animated Card Component ────────── */
function VirtualCard({ card, isActive }: { card: Card; isActive: boolean }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: isActive ? 1 : 0.92 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-2xl overflow-hidden relative select-none"
            style={{
                background: CARD_GRADIENTS[card.gradient_index] || CARD_GRADIENTS[0],
                aspectRatio: '1.6/1',
                maxWidth: 380,
                width: '100%',
                boxShadow: isActive
                    ? '0 20px 50px rgba(124,58,237,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset'
                    : '0 8px 20px rgba(0,0,0,0.2)',
            }}>
            {/* decorative circles */}
            <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <circle cx="290" cy="-20" r="110" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none" />
                <circle cx="290" cy="-20" r="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
            </svg>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }} />

            {/* scan line */}
            {isActive && (
                <motion.div
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
                />
            )}

            <div className="relative z-10 p-5 flex flex-col h-full">
                <div className="flex justify-between items-center mb-auto">
                    <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
                        <Wifi size={11} className="-rotate-90" />
                        <span>NFC</span>
                    </div>
                    <span className="text-white/70 text-xs font-bold tracking-wide">{card.card_type}</span>
                </div>
                <p className="text-white font-mono text-base tracking-[0.25em] mb-3">
                    •••• •••• •••• {card.last4}
                </p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-white/30 text-[8px] tracking-widest">CARD HOLDER</p>
                        <p className="text-white text-xs font-semibold">{card.card_holder}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/30 text-[8px] tracking-widest">EXPIRES</p>
                        <p className="text-white text-xs font-semibold">{card.expiry}</p>
                    </div>
                    <div className="flex -space-x-2 self-end pb-0.5">
                        <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(220,38,38,0.7)' }} />
                        <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(234,179,8,0.7)' }} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Helpers ────────────────────────── */
function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
}
function formatExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

/* ══════════════════════════════════════
   Cards Page
   ══════════════════════════════════════ */
export default function CardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [activeCard, setActiveCard] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa' as 'Visa' | 'Mastercard', colorIdx: 0 });

    /* load cards */
    useEffect(() => {
        CardAPI.list()
            .then((res) => {
                const data = Array.isArray(res) ? res : [];
                setCards(data as Card[]);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    /* toast helper */
    function toast(msg: string) {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    }

    /* add card (save to DB) */
    async function handleAddCard() {
        if (!newCard.number || !newCard.holder || !newCard.expiry) return;

        // Reject past expiry
        const [mm, yy] = newCard.expiry.split('/');
        if (mm && yy) {
            const expMonth = parseInt(mm, 10);
            const expYear = 2000 + parseInt(yy, 10);
            const now = new Date();
            if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                toast('Card expiry cannot be in the past');
                return;
            }
        }

        setIsSaving(true);
        try {
            const saved = await CardAPI.add({
                card_number: newCard.number,
                card_holder: newCard.holder,
                expiry: newCard.expiry,
                card_type: newCard.type,
                gradient_index: newCard.colorIdx,
            });
            setCards(prev => [saved, ...prev]);
            setActiveCard(0);
            setShowAddModal(false);
            setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'Visa', colorIdx: 0 });
            toast('Card added successfully');
        } catch {
            toast('Failed to add card');
        } finally {
            setIsSaving(false);
        }
    }

    /* delete card */
    async function handleDeleteCard(id: number) {
        try {
            await CardAPI.remove(id);
            setCards(prev => prev.filter(c => c.id !== id));
            setActiveCard(0);
            toast('Card removed');
        } catch {
            toast('Failed to remove card');
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw size={24} className="text-purple-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-1">My Cards</h2>
                    <p className="text-xs text-3 mt-0.5">{cards.length} card{cards.length !== 1 ? 's' : ''} saved</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn text-sm px-4 py-2">
                    <Plus size={15} /> Add Card
                </button>
            </div>

            {/* Card display */}
            {cards.length > 0 ? (
                <>
                    {/* Active card */}
                    <div className="flex justify-center">
                        <AnimatePresence mode="wait">
                            <VirtualCard key={cards[activeCard]?.id} card={cards[activeCard]} isActive />
                        </AnimatePresence>
                    </div>

                    {/* Dot indicators + delete */}
                    <div className="flex items-center justify-center gap-2">
                        {cards.map((_, i) => (
                            <button key={i} onClick={() => setActiveCard(i)}
                                className="rounded-full transition-all"
                                style={{
                                    width: i === activeCard ? 22 : 7,
                                    height: 7,
                                    background: i === activeCard ? 'var(--purple)' : 'var(--border)',
                                }} />
                        ))}
                    </div>

                    {/* Card details row */}
                    <div className="card p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                    <CardIcon size={16} style={{ color: 'var(--purple)' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-1">{cards[activeCard]?.card_type} •••• {cards[activeCard]?.last4}</p>
                                    <p className="text-xs text-3">{cards[activeCard]?.card_holder} · Expires {cards[activeCard]?.expiry}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteCard(cards[activeCard]?.id)}
                                className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                                title="Remove card">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>

                    {/* All cards list */}
                    {cards.length > 1 && (
                        <div className="card p-4 space-y-2">
                            <p className="text-xs text-3 font-medium mb-2">All Cards</p>
                            {cards.map((c, i) => (
                                <button key={c.id} onClick={() => setActiveCard(i)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                                    style={{
                                        background: i === activeCard ? 'rgba(168,85,247,0.08)' : 'var(--surface-2)',
                                        border: i === activeCard ? '1px solid rgba(168,85,247,0.25)' : '1px solid var(--border)',
                                    }}>
                                    <div className="w-8 h-8 rounded-lg flex-shrink-0"
                                        style={{ background: CARD_GRADIENTS[c.gradient_index] || CARD_GRADIENTS[0] }} />
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-medium text-1">{c.card_type} •••• {c.last4}</p>
                                        <p className="text-xs text-3 truncate">{c.card_holder}</p>
                                    </div>
                                    <span className="text-[10px] text-3">{c.expiry}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="card p-10 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <CardIcon size={24} style={{ color: 'var(--purple)' }} />
                    </div>
                    <p className="text-1 font-semibold">No Cards Added</p>
                    <p className="text-xs text-3">Add your first card to get started</p>
                    <button onClick={() => setShowAddModal(true)} className="btn text-sm px-4 py-2 mx-auto">
                        <Plus size={14} /> Add Card
                    </button>
                </div>
            )}

            {/* ── Add Card Modal ──────────────── */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <div className="card w-full max-w-sm p-6 my-auto">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                                            <CardIcon size={15} style={{ color: 'var(--purple)' }} />
                                        </div>
                                        <h3 className="font-display font-bold text-1">Add New Card</h3>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="btn-ghost p-1.5"><X size={15} /></button>
                                </div>

                                {/* Live preview */}
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

                                {/* Form fields */}
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Card Number</label>
                                        <input type="text" className="field font-mono" placeholder="1234 5678 9012 3456" maxLength={19}
                                            value={newCard.number} onChange={e => setNewCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-3 mb-1.5 block">Cardholder Name</label>
                                        <input type="text" className="field" placeholder="FULL NAME"
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
                                    <button className="btn-outline text-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button className="btn text-sm" onClick={handleAddCard}
                                        disabled={!newCard.number || !newCard.holder || !newCard.expiry || isSaving}>
                                        {isSaving
                                            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}><RefreshCw size={15} /></motion.div>
                                            : <><Plus size={14} /> Add Card</>}
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
