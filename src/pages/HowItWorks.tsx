import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, TrendingUp, ArrowLeft, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#07050f 0%,#0d0820 60%,#07050f 100%)' }}>
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.12), transparent)' }} />

            {/* Back bar */}
            <div className="sticky top-0 z-50 px-6 py-4"
                style={{ background: 'rgba(7,5,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'rgba(192,132,252,0.9)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.18)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.1)'; }}>
                    <ArrowLeft size={15} />
                    Back
                </button>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-24">

                {/* Header */}
                <motion.div className="text-center mb-16"
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold mb-5"
                        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'rgba(192,132,252,0.85)' }}>
                        Simple Onboarding
                    </div>
                    <h1 className="font-display font-black text-white mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
                        Start in <span className="text-gradient">3 Simple Steps</span>
                    </h1>
                    <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(200,190,255,0.5)' }}>
                        From sign-up to full financial clarity in minutes — no complexity, no jargon.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
                    {[
                        { n: '01', icon: FileText, title: 'Upload Statement', desc: 'Drop any bank statement PDF — AI extracts and structures your entire financial history instantly.' },
                        { n: '02', icon: Brain, title: 'Get AI Insights', desc: 'Receive a health score, spending personality, anomalies, and personalised recommendations.' },
                        { n: '03', icon: TrendingUp, title: 'Build Better Habits', desc: 'Follow habit challenges, chat with your AI coach, and hit every savings goal you set.' },
                    ].map((s, i) => (
                        <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className="relative p-7 rounded-2xl"
                            style={{ background: 'rgba(12,8,28,0.9)', border: '1px solid rgba(168,85,247,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
                            <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#7c3aed,transparent)', marginBottom: 24, borderRadius: 1 }} />
                            <div className="relative inline-flex mb-5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.22)' }}>
                                    <s.icon size={20} style={{ color: '#a855f7' }} />
                                </div>
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>{i + 1}</span>
                            </div>
                            <h3 className="font-bold text-white mb-2">{s.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(160,148,210,0.55)' }}>{s.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <Link to="/signup" className="btn inline-flex px-8 py-3.5 text-sm font-semibold">
                        Start Free — 400 Credits <ArrowRight size={15} />
                    </Link>
                    <p className="text-xs mt-3" style={{ color: 'rgba(160,148,210,0.35)' }}>No credit card required</p>
                </motion.div>
            </div>
        </div>
    );
}
