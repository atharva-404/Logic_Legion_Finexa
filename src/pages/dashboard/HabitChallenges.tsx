import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { badges } from '../../lib/mockData';

const RARITY_COLORS = {
    common: '#94a3b8',
    uncommon: '#10b981',
    rare: '#3b82f6',
    epic: '#a855f7',
};

export default function HabitChallenges() {
    const { habits, totalPoints, toggleHabit } = useFinancialStore();

    const completedCount = habits.filter(h => h.completed).length;
    const maxStreak = Math.max(...habits.map(h => h.streak));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-white">Habit Challenges</h1>
                <p className="text-slate-500 text-sm mt-1">Build consistent financial habits and earn rewards</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Points', value: totalPoints, icon: Star, color: '#f59e0b' },
                    { label: 'Completed Today', value: `${completedCount}/${habits.length}`, icon: Trophy, color: '#a855f7' },
                    { label: 'Best Streak', value: `${maxStreak} days`, icon: Flame, color: '#ef4444' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="glass-card p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <s.icon size={16} style={{ color: s.color }} />
                            <span className="text-xs text-slate-500">{s.label}</span>
                        </div>
                        <div className="font-bold text-xl text-white">{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Progress to next level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 font-medium">Level Progress</span>
                    <span className="text-purple-400 text-sm font-semibold">{totalPoints} / 500 pts</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-purple shimmer"
                        initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalPoints / 500) * 100)}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1.5">
                    <span>Level 1</span><span>Level 2 (500 pts)</span>
                </div>
            </motion.div>

            {/* Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((habit, i) => (
                    <motion.div key={habit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className={`glass-card p-5 transition-all duration-300 ${habit.completed ? 'opacity-80' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${habit.completed ? 'opacity-60' : ''}`}
                                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                    {habit.icon}
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-sm ${habit.completed ? 'line-through text-slate-500' : 'text-white'}`}>{habit.title}</h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
                                        {habit.category}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
                                    <Flame size={12} /> {habit.streak}d streak
                                </div>
                                <span className="text-yellow-400 text-xs font-bold">+{habit.points} pts</span>
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs mb-4 leading-relaxed">{habit.description}</p>

                        <button onClick={() => toggleHabit(habit.id)}
                            className={`w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${habit.completed
                                ? 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                                : 'bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25'}`}>
                            {habit.completed ? (
                                <><Trophy size={14} /> Completed! (click to undo)</>
                            ) : (
                                <>Mark as Complete</>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" /> Achievement Badges
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {badges.map((badge) => (
                        <div key={badge.id} className={`p-3 rounded-xl text-center transition-all duration-200 ${badge.earned ? 'opacity-100' : 'opacity-40 grayscale'}`}
                            style={{
                                background: badge.earned ? `${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]}15` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${badge.earned ? `${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]}30` : 'rgba(255,255,255,0.05)'}`
                            }}>
                            <div className="text-2xl mb-1.5">{badge.icon}</div>
                            <div className="text-xs text-white font-medium leading-tight mb-1">{badge.name}</div>
                            <div className={`text-[9px] font-semibold uppercase`}
                                style={{ color: RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS] }}>
                                {badge.rarity}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
