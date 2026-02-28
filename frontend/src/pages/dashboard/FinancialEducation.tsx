import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw } from 'lucide-react';
import { educationCards as rawCards } from '../../lib/mockData';

const CATEGORY_EMOJIS: Record<string, string> = {
    Foundations: '🏗️', Debt: '💳', Behavior: '🧠', Planning: '📋', Savings: '🐖',
};

const educationCards = rawCards.map(c => ({
    ...c,
    emoji: CATEGORY_EMOJIS[c.category] || '📚',
}));

const DIFFICULTY_COLORS = {
    Beginner: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
    Intermediate: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b' },
    Advanced: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
};

function FlipCard({ card }: { card: typeof educationCards[0] }) {
    const [flipped, setFlipped] = useState(false);
    const diff = DIFFICULTY_COLORS[card.difficulty as keyof typeof DIFFICULTY_COLORS];

    return (
        <div className="relative h-56 cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setFlipped(!flipped)}>
            <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
                {/* Front */}
                <div className="absolute inset-0 glass-card p-5 flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden' }}>
                    <div className="flex items-start justify-between">
                        <span className="text-3xl">{card.emoji}</span>
                        <div className="text-right">
                            <div className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text }}>
                                {card.difficulty}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-1">{card.category}</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold leading-snug mb-3">{card.question}</h3>
                        <div className="flex items-center gap-1.5 text-purple-400 text-xs">
                            <RotateCcw size={11} />
                            <span>Tap to reveal answer</span>
                        </div>
                    </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 glass-card p-5 flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(168,85,247,0.08)' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-lg">{card.emoji}</span>
                        <span className="text-[10px] text-purple-400 px-2.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>Answer</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed flex-1 mt-3 overflow-y-auto">{card.answer}</p>
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-2">
                        <RotateCcw size={11} />
                        <span>Tap to flip back</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function FinancialEducation() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const categories = ['All', ...new Set(educationCards.map(c => c.category))];
    const filtered = activeCategory && activeCategory !== 'All'
        ? educationCards.filter(c => c.category === activeCategory)
        : educationCards;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Financial Education</h1>
                <p className="text-slate-500 text-sm mt-1">Tap any card to reveal the answer — learn finance in minutes</p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat === 'All' ? null : cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${(!activeCategory && cat === 'All') || activeCategory === cat
                            ? 'bg-purple-500/25 border border-purple-500/50 text-purple-300'
                            : 'bg-slate-800/60 border border-slate-700/30 text-slate-400 hover:border-purple-500/25'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Topics', value: educationCards.length, color: '#a855f7' },
                    { label: 'Categories', value: categories.length - 1, color: '#3b82f6' },
                    { label: 'Beginner Friendly', value: educationCards.filter(c => c.difficulty === 'Beginner').length, color: '#10b981' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-4 text-center">
                        <div className="font-bold text-xl mb-1" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-slate-500 text-xs">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Info banner */}
            <div className="glass-card p-4 flex items-start gap-3">
                <BookOpen size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-white text-sm font-medium">Learning made simple</p>
                    <p className="text-slate-400 text-xs mt-0.5">Each card covers a key financial concept in plain language — no jargon, no complexity. Perfect for anyone new to personal finance.</p>
                </div>
            </div>

            {/* Cards grid */}
            <AnimatePresence mode="popLayout">
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {filtered.map((card, i) => (
                        <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                            <FlipCard card={card} />
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Bottom disclaimer */}
            <div className="text-center text-xs text-slate-700 py-4">
                ℹ️ All educational content is for informational purposes only. Not financial or investment advice.
            </div>
        </div>
    );
}
