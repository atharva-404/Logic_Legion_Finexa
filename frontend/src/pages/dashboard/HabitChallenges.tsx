import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Flame,
    Star,
    Shield,
    Activity,
    Scissors,
    Landmark,
    TrendingUp,
    Search,
    Globe,
    Layers,
    ShieldCheck,
    Droplet,
    Award,
    Layout,
    Zap,
    ChevronRight,
    Target,
    Loader2
} from 'lucide-react';
import { GamificationAPI, HealthAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

const RARITY_COLORS = {
    common: '#94a3b8',
    uncommon: '#10b981',
    rare: '#3b82f6',
    epic: '#a855f7',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
    'shield': Shield,
    'activity': Activity,
    'scissors': Scissors,
    'landmark': Landmark,
    'trending-up': TrendingUp,
    'search': Search,
    'globe': Globe,
    'layers': Layers,
    'shield-check': ShieldCheck,
    'droplet': Droplet,
    'award': Award,
    'layout': Layout,
    'zap': Zap,
    'target': Target
};

export default function HabitChallenges() {
    const { isDark } = useTheme();

    const [challenges, setChallenges] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [healthScore, setHealthScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [challengeRes, badgeRes, scoreRes] = await Promise.all([
                GamificationAPI.getChallenges(),
                GamificationAPI.getBadges(),
                HealthAPI.getScore().catch(() => ({ score: 0 })),
            ]);
            setChallenges(challengeRes.results ?? challengeRes ?? []);
            setBadges(Array.isArray(badgeRes) ? badgeRes : (badgeRes as any).results ?? []);
            setHealthScore((scoreRes as any).score ?? 0);
        } catch (e) {
            console.error('Failed to load gamification data', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleToggle = async (id: number) => {
        setTogglingId(id);
        try {
            const updated = await GamificationAPI.toggleChallenge(id);
            setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
            // Refresh score after toggle
            HealthAPI.getScore().then(r => setHealthScore((r as any).score ?? healthScore)).catch(() => {});
        } catch (e) {
            console.error('Toggle failed', e);
        } finally {
            setTogglingId(null);
        }
    };

    const completedCount = challenges.filter(h => h.completed).length;
    const maxStreak = challenges.length > 0 ? Math.max(...challenges.map(h => h.streak ?? 0)) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
        );
    }

    const renderIcon = (iconName: string, size = 20, className = "") => {
        const IconComponent = ICON_MAP[iconName] || Star;
        return <IconComponent size={size} className={className} />;
    };

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Protocol Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-10 transition-all duration-300 ${isDark ? 'border-purple-500/10' : 'border-black/5'}`}>
                <div className="space-y-3">
                    <div className={`flex items-center gap-2 mb-1 transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Fiduciary Discipline</span>
                    </div>
                    <h1 className={`font-display font-bold text-4xl lg:text-5xl tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Strategic <span className="text-gradient">Excellence</span> Protocol
                    </h1>
                    <p className={`text-sm max-w-xl font-medium leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Enforce institutional financial discipline through rigorous capital management protocols. Compliance directly improves your Alpha Rating (Fin Score).
                    </p>
                </div>

                <div className="mt-8 md:mt-0 flex flex-col items-end gap-5">
                    <div className={`px-5 py-2.5 backdrop-blur-md border rounded-2xl flex items-center gap-3 shadow-2xl transition-all duration-300 ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-black/[0.02] border-black/5'
                        }`}>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Real-time Compliance Monitor</span>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Alpha Rating (Score)', value: healthScore, icon: Star, color: isDark ? '#f59e0b' : '#d97706' },
                    { label: 'Compliance Rate', value: `${completedCount}/${challenges.length}`, icon: Trophy, color: isDark ? '#a855f7' : '#7c3aed' },
                    { label: 'Peak Consistency', value: `${maxStreak} Cycles`, icon: Flame, color: isDark ? '#ef4444' : '#dc2626' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className={`card-glow p-6 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
                                <s.icon size={18} style={{ color: s.color }} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</span>
                        </div>
                        <div className={`font-display font-bold text-3xl transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Protocol Progression */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={`card-glow p-8 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target size={18} className="text-purple-500" />
                        <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Score Target: Institutional Grade</span>
                    </div>
                    <span className="text-purple-500 text-sm font-bold tracking-tighter">{healthScore} / 100</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <motion.div className="h-full rounded-full bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        initial={{ width: 0 }} animate={{ width: `${healthScore}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-3">
                    <span>Alpha Level 1</span><span>Elite Tier (Score 90+)</span>
                </div>
            </motion.div>

            {/* Protocol List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(challenges || []).map((habit, i) => {
                    const statusColor = isDark ? 'text-purple-400' : 'text-purple-600';
                    return (
                        <motion.div key={habit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className={`card-glow p-6 group transition-all duration-300 ${habit.completed
                                ? (isDark ? 'opacity-60 bg-black/40 border-white/5' : 'opacity-70 bg-slate-50 border-black/5')
                                : (isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-md hover:border-purple-200')
                                }`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${habit.completed ? 'opacity-50 grayscale' : 'group-hover:scale-110 shadow-inner'
                                        } ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-500/5 border border-purple-500/10'}`}>
                                        {renderIcon(habit.icon, 24, statusColor)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-base leading-tight transition-all duration-300 ${habit.completed ? 'line-through text-slate-500' : (isDark ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-600')
                                            }`}>{habit.title}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-500/5 border-purple-500/10 text-purple-600'
                                                }`}>
                                                {habit.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 text-orange-400 text-[10px] font-bold uppercase tracking-tighter">
                                        <Flame size={12} /> {habit.streak ?? 0} CYCLES
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-widest ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>+{habit.points ?? 5} Rating</span>
                                </div>
                            </div>

                            <p className={`text-xs mb-6 leading-relaxed font-medium transition-colors duration-300 ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                {habit.description}
                            </p>

                            <button
                                onClick={() => handleToggle(habit.id)}
                                disabled={togglingId === habit.id}
                                className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border ${habit.completed
                                    ? (isDark ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400' : 'bg-green-600/5 border-green-600/10 text-green-600 hover:bg-red-500/5 hover:border-red-500/10 hover:text-red-600')
                                    : (isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-900 border-slate-900 text-white hover:bg-black')
                                    } shadow-md`}>
                                {togglingId === habit.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : habit.completed ? (
                                    <><Trophy size={14} /> Protocol Compliant (Revoke)</>
                                ) : (
                                    <><Target size={14} /> Approve Protocol Compliance</>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Achievements Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className={`card-glow p-8 transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`font-bold text-lg tracking-tight flex items-center gap-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Star size={18} className="text-yellow-400" /> Strategic Milestone Achievements
                    </h3>
                    <div className={`h-px flex-1 ml-6 transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-purple-500/30 to-transparent' : 'bg-gradient-to-r from-purple-600/20 to-transparent'}`} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                    {(badges || []).map((badge) => {
                        const threshold = badge.threshold_score ?? 100;
                        const isEarned = healthScore >= threshold;
                        const rarityColor = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS] || '#94a3b8';

                        return (
                            <div key={badge.id} className={`p-5 rounded-2xl text-center transition-all duration-500 group relative border ${isEarned
                                ? (isDark ? 'opacity-100 bg-white/[0.03] border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'opacity-100 bg-slate-50 border-black/5 shadow-sm')
                                : 'opacity-30 grayscale'
                                }`}>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${isEarned ? 'bg-gradient-to-br from-purple-500/20 to-transparent' : 'bg-black/10 shadow-inner'
                                    }`}>
                                    {renderIcon(badge.icon, 24, isEarned ? (isDark ? 'text-purple-400' : 'text-purple-600') : 'text-slate-500')}
                                </div>
                                <div className={`text-[11px] font-bold leading-tight mb-2 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{badge.name}</div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em]"
                                    style={{ color: rarityColor }}>
                                    {badge.rarity}
                                </div>
                                {!isEarned && (
                                    <div className="mt-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                        LVL {threshold}
                                    </div>
                                )}
                                {isEarned && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-[#0a0a1a] flex items-center justify-center shadow-lg">
                                        <ShieldCheck size={10} className="text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
