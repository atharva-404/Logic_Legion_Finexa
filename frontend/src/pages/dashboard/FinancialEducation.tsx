import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    RotateCcw,
    Play,
    TrendingUp,
    Landmark,
    ChevronRight,
    X,
    ShieldCheck,
    BarChart3,
    RefreshCcw,
    Brain,
    Award,
    Info,
    Search,
    Download,
    Eye
} from 'lucide-react';
import { educationCards, videoLessons, advisoryQuiz } from '../../lib/mockData';
import { useTheme } from '../../contexts/ThemeContext';

// --- Sub-components (Refined for Theme Awareness) ---

function FlipCard({ card }: { card: typeof educationCards[0] }) {
    const [flipped, setFlipped] = useState(false);
    const { isDark } = useTheme();

    const diff = {
        'Beginner': { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
        'Intermediate': { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' },
        'Advanced': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' }
    }[card.difficulty as 'Beginner' | 'Intermediate' | 'Advanced'] || { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.2)', text: '#6b7280' };

    const icons = {
        'Asset Management': <Landmark size={20} />,
        'Portfolio Theory': <TrendingUp size={20} />,
        'Risk Mitigation': <ShieldCheck size={20} />,
        'Tax Strategy': <BookOpen size={20} />
    };

    return (
        <div className="relative h-64 cursor-none group" style={{ perspective: '1200px' }} onClick={() => setFlipped(!flipped)}>
            <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.7, type: 'spring', stiffness: 200, damping: 25 }}>
                {/* Front */}
                <div className={`absolute inset-0 card-glow p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 hover:border-purple-200'}`}
                    style={{ backfaceVisibility: 'hidden' }}>
                    <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />
                    <div className="flex items-start justify-between relative z-10">
                        <div className={`p-2.5 rounded-lg border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 text-purple-400 group-hover:bg-purple-500/10' : 'bg-black/5 border-black/5 text-purple-600 group-hover:bg-purple-500/5'} group-hover:scale-110`}>
                            {icons[card.category as keyof typeof icons] || <ShieldCheck size={20} />}
                        </div>
                        <div className="text-right">
                            <div className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/20'}`}
                                style={{ color: diff.text }}>
                                {card.difficulty}
                            </div>
                            <div className={`text-[10px] mt-1.5 font-bold uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{card.category}</div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className={`font-display font-bold text-lg leading-tight mb-4 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-600'}`}>{card.question}</h3>
                        <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span>System Insight</span>
                        </div>
                    </div>
                </div>
                {/* Back */}
                <div className={`absolute inset-0 card-glow p-6 flex flex-col justify-between ${isDark ? 'border-white/5' : 'border-black/5'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: isDark ? 'linear-gradient(135deg, #0f0f2d 0%, #050510 100%)' : '#ffffff'
                    }}>
                    <div className={`flex items-center justify-between mb-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Advisory Analysis</span>
                        <div className={`w-2 h-2 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-400/20' : 'bg-purple-600/20'}`}>
                            <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} />
                        </div>
                    </div>
                    <p className={`text-sm leading-relaxed flex-1 overflow-y-auto pr-2 custom-scrollbar font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {card.answer}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Click to exit analysis</span>
                        <div className={`${isDark ? 'text-purple-500/40' : 'text-purple-600/20'}`}><ShieldCheck size={14} /></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function AdvisoryQuiz() {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showRationale, setShowRationale] = useState(false);
    const { isDark } = useTheme();

    const handleSelect = (idx: number) => {
        if (showRationale) return;
        setSelectedOption(idx);
        setShowRationale(true);
        if (idx === advisoryQuiz[currentStep].answer) setScore(s => s + 1);

        setTimeout(() => {
            if (currentStep < advisoryQuiz.length - 1) {
                setCurrentStep(currentStep + 1);
                setSelectedOption(null);
                setShowRationale(false);
            } else {
                setCompleted(true);
            }
        }, 2000);
    };

    const reset = () => {
        setCurrentStep(0);
        setScore(0);
        setCompleted(false);
        setSelectedOption(null);
        setShowRationale(false);
    };

    if (completed) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`card-glow p-6 text-center space-y-4 ${isDark ? 'bg-[#0a0a1a]/80' : 'bg-white'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/10'}`}>
                    <Award className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={32} />
                </div>
                <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Assessment Complete</h3>
                    <p className={`text-xs mt-1 font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Advisory IQ Level: <span className="text-purple-400">{(score / advisoryQuiz.length * 100).toFixed(0)}%</span></p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-black/5 border-black/5'}`}>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {score === advisoryQuiz.length
                            ? "Elite strategic comprehension. You possess institutional-grade financial literacy."
                            : "Solid foundations. Consider reviewing advanced portfolio theory modules."}
                    </p>
                </div>
                <button onClick={reset} className={`w-full py-2.5 border rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'}`}>
                    Retake Assessment
                </button>
            </motion.div>
        );
    }

    const q = advisoryQuiz[currentStep];

    return (
        <div className={`card-glow p-6 relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#0a0a1a]/80 border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Brain size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    <h3 className={`font-bold text-sm tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Advisory IQ</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{currentStep + 1} / {advisoryQuiz.length}</span>
            </div>

            <div className="min-h-[80px]">
                <h4 className={`text-xs font-bold leading-relaxed mb-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{q.question}</h4>
            </div>

            <div className="space-y-2">
                {q.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-[11px] font-medium transition-all ${selectedOption === idx
                            ? (idx === q.answer ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400')
                            : (showRationale && idx === q.answer ? 'bg-green-500/10 border-green-500/40 text-green-400' :
                                (isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10' : 'bg-black/[0.02] border-black/5 text-slate-600 hover:border-purple-200'))
                            }`}>
                        {opt}
                    </button>
                ))}
            </div>

            {showRationale && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-xl border flex items-start gap-2 ${isDark ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-600/5 border-purple-600/10'}`}>
                    <Info size={14} className="text-purple-400 mt-0.5" />
                    <p className={`text-[10px] leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{q.rationale}</p>
                </motion.div>
            )}
        </div>
    );
}


function VideoMasterclass({ video }: { video: typeof videoLessons[0] }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark } = useTheme();

    return (
        <>
            <motion.div whileHover={{ y: -4 }} onClick={() => setIsOpen(true)}
                className={`flex-shrink-0 w-72 card-glow overflow-hidden group cursor-none transition-all duration-300 ${isDark ? 'border-white/5 bg-[#0a0a1a]/80' : 'border-black/5 bg-white shadow-sm hover:border-purple-200'}`}>
                <div className="relative h-40 bg-black overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className={`w-full h-full object-cover transition-all duration-700 grayscale-[0.3] group-hover:grayscale-0 ${isDark ? 'opacity-40 group-hover:opacity-80' : 'opacity-70 group-hover:opacity-100'} group-hover:scale-105`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 group-hover:bg-purple-500/20 transition-all duration-500">
                            <Play size={20} className="text-white fill-white/10 ml-1 group-hover:fill-white/80 transition-all" />
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded text-[9px] font-bold text-white uppercase tracking-widest">
                        {video.category}
                    </div>
                </div>
                <div className={`p-4 ${isDark ? 'bg-black/20' : 'bg-slate-50/50'}`}>
                    <h4 className={`text-sm font-bold leading-snug line-clamp-2 transition-all duration-300 mb-2 ${isDark ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-600'}`}>{video.title}</h4>
                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold tracking-tighter">
                        <span className="flex items-center gap-1"><Play size={10} /> {video.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
                        <span>PREMIUM CONTENT</span>
                    </div>
                </div>
            </motion.div>

            {/* Video Modal (Properly Themed) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border ${isDark ? 'border-white/10' : 'border-white/20'}`}>
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                                title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                            <button onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all border border-white/10">
                                <X size={24} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

// --- Main Strategic Advisory Hub ---

export default function StrategicAdvisory() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const { isDark } = useTheme();

    const categories = ['All', ...new Set(educationCards.map(c => c.category))];
    const filtered = activeCategory && activeCategory !== 'All'
        ? educationCards.filter(c => c.category === activeCategory)
        : educationCards;

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Institutional Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-10 transition-all duration-300 ${isDark ? 'border-purple-500/10' : 'border-black/5'}`}>
                <div className="space-y-3">
                    <div className={`flex items-center gap-2 mb-1 transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Institutional Intelligence</span>
                    </div>
                    <h1 className={`font-display font-bold text-4xl lg:text-5xl tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Strategic <span className="text-gradient">Advisory</span> Hub
                    </h1>
                    <p className={`text-sm max-w-xl font-medium leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Access proprietary portfolio frameworks, enterprise-grade tax strategies, and systemic risk mitigation models.</p>
                </div>

                <div className="mt-8 md:mt-0 flex flex-col items-end gap-5">
                    <div className={`px-5 py-2.5 backdrop-blur-md border rounded-2xl flex items-center gap-3 shadow-2xl transition-all duration-300 ${isDark ? 'bg-purple-500/5 border-purple-500/20' : 'bg-black/[0.02] border-black/5'
                        }`}>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Proprietary Alpha Feed Active</span>
                    </div>
                </div>
            </div>

            {/* Strategic Masterclasses */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-all duration-300 ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-500/5 border-purple-500/10'
                            }`}>
                            <TrendingUp size={22} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-xl tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Executive Masterclasses</h2>
                            <p className="text-slate-500 text-xs font-medium">Advanced strategies for high-net-worth capital preservation.</p>
                        </div>
                    </div>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400' : 'bg-black/5 border-black/5 hover:bg-black/10 text-slate-600'
                        }`}>
                        Archive Repository <ChevronRight size={14} />
                    </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar no-scrollbar scroll-smooth">
                    {videoLessons.map(video => (
                        <VideoMasterclass key={video.id} video={video} />
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Advisory Repository */}
                <div className="lg:col-span-8 space-y-10">
                    <div className={`flex items-center justify-between p-2 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-black/5'
                        }`}>
                        <div className="flex items-center gap-3 px-3">
                            <Landmark size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                            <h2 className={`font-bold text-lg tracking-wide transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Advisory Repository</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {categories.slice(0, 4).map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat === 'All' ? null : cat)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${(!activeCategory && cat === 'All') || activeCategory === cat
                                        ? (isDark ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500' : 'bg-slate-900 text-white border border-slate-900')
                                        : (isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-black/5')}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.map((card, i) => (
                                <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                                    <FlipCard card={card} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Disclosure */}
                    <div className={`pt-10 border-t transition-all duration-300 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                        <div className={`flex items-center gap-4 p-6 rounded-3xl border transition-all duration-300 ${isDark ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-600/[0.02] border-purple-600/5'
                            }`}>
                            <Info size={24} className="text-purple-500 flex-shrink-0" />
                            <p className={`text-[11px] leading-relaxed italic uppercase tracking-wider transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                All strategic findings and modeling are proprietary. This content is intended for institutional wealth management and does not constitute individual fiduciary advice. Past performance is not indicative of forward-looking alpha.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Interactive IQ & Capital Hub */}
                <div className="lg:col-span-4 space-y-12">
                    <AdvisoryQuiz />

                    {/* Elite Directives */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tactical Directives</h3>
                            <div className={`h-px flex-1 ml-4 transition-all duration-300 ${isDark ? 'bg-gradient-to-r from-purple-500/30 to-transparent' : 'bg-gradient-to-r from-purple-600/20 to-transparent'}`} />
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'The 24-Hour Velocity Check', text: 'Enforce a 24-hour moratorium on capital outflows exceeding 1% of liquid net worth.' },
                                { title: 'Automated Capital Harvesting', text: 'Schedule asset relocation triggers immediate upon income receipt to maximize yield time.' },
                                { title: 'Systemic Diversification', text: 'Ensure target asset allocation reflects global sector shifts and inflationary forecasts.' },
                            ].map((tip, i) => (
                                <motion.div key={i} whileHover={{ x: 5 }} className={`group p-5 rounded-2xl border-l-2 transition-all duration-300 ${isDark ? 'bg-black/20 border-white/5 border-l-purple-500 hover:bg-black/40' : 'bg-white border-black/5 border-l-purple-600 hover:bg-slate-50 shadow-sm hover:shadow-md'
                                    }`}>
                                    <h4 className={`text-[10px] font-bold uppercase mb-2 tracking-widest transition-colors duration-300 ${isDark ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-700'
                                        }`}>{tip.title}</h4>
                                    <p className={`text-xs leading-relaxed transition-colors duration-300 ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'
                                        }`}>{tip.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
