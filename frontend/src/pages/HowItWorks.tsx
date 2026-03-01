import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const STEPS = [
    {
        n: '01',
        title: 'Upload Your Bank Statement',
        tagline: 'Any bank · PDF or CSV · Instant extraction',
        desc: 'Drop any bank statement and Finexa\'s AI parser extracts every transaction in seconds — no manual entry required. Supports 30+ Indian banks including HDFC, SBI, ICICI, Kotak, and Axis. Transactions are automatically sorted into 18 spending categories and stitched into a single timeline across multiple months.',
        bullets: [
            'Upload PDF or CSV — done in under 10 seconds',
            'Auto-categorised into 18 spending buckets',
            'Multi-month history unified into one view',
            'All data encrypted at rest with AES-256',
        ],
    },
    {
        n: '02',
        title: 'Get Deep AI Financial Insights',
        tagline: 'Health score · Anomaly alerts · Spending personality',
        desc: 'Finexa analyses every transaction to compute your Financial Health Score (0–100), detect unusual spending patterns, identify your spending personality, and surface personalised recommendations based on your real income and lifestyle.',
        bullets: [
            'Financial Health Score updated with every upload',
            'Anomaly alerts flag unexpected charges or sudden spikes',
            'Spending personality: Saver, Spender, Investor, or Hustler',
            'Peer benchmarking vs. similar financial profiles',
        ],
    },
    {
        n: '03',
        title: 'Build Better Financial Habits',
        tagline: 'AI coach · Goal tracker · Habit challenges',
        desc: 'Turn insights into lasting change. Chat with your always-on AI Coach, set SMART savings goals, and join weekly habit challenges. Finexa tracks your progress and keeps you on track — so your goals don\'t remain just goals.',
        bullets: [
            'AI Coach answers money questions in plain language, 24/7',
            'SMART goal builder with milestone tracking',
            '21-day habit challenges with streaks and rewards',
            'Income simulator: test "what if" salary and expense scenarios',
        ],
    },
];

const FAQS = [
    { q: 'Which banks are supported?', a: '30+ Indian banks including HDFC, SBI, ICICI, Kotak, Axis, and more.' },
    { q: 'Is my data safe?', a: 'Yes — all data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never sell or share your data.' },
    { q: 'What are AI credits?', a: 'Credits power AI features — each chat message or analysis consumes a small amount. New accounts start with 100,000 free credits.' },
    { q: 'Can I upload multiple months?', a: 'Absolutely. Upload statements from multiple months and Finexa stitches them into one unified timeline.' },
];

export default function HowItWorks() {

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, var(--purple-dim), transparent)' }} />

            <Navbar />

            <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-24">

                {/* Header */}
                <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest mb-5 badge">
                        HOW IT WORKS
                    </div>
                    <h1 className="font-display font-black text-1 mb-4" style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.1 }}>
                        From Statement to<br /><span className="text-gradient">Financial Clarity</span>
                    </h1>
                    <p className="text-sm max-w-md mx-auto leading-relaxed text-3">
                        Three steps powered by AI — go from raw bank data to a personalised financial roadmap in minutes.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="space-y-6 mb-16">
                    {STEPS.map((s, i) => (
                        <motion.div key={s.n}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className="card overflow-hidden">
                            {/* Top bar */}
                            <div style={{ height: 2.5, background: 'linear-gradient(90deg,transparent,var(--purple),transparent)' }} />

                            <div className="p-8">
                                {/* Step number + title row */}
                                <div className="flex items-start gap-5 mb-5">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'var(--purple-dim)', border: '1px solid var(--border-hi)' }}>
                                        <span className="font-display font-black text-lg text-purple">{s.n}</span>
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <p className="text-[10px] font-bold tracking-[0.15em] mb-1.5 text-purple" style={{ opacity: 0.7 }}>{s.tagline.toUpperCase()}</p>
                                        <h2 className="font-bold text-1 text-xl">{s.title}</h2>
                                    </div>
                                </div>

                                <p className="text-sm leading-relaxed mb-6 text-3">{s.desc}</p>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {s.bullets.map(b => (
                                        <li key={b} className="flex items-start gap-2.5 text-xs leading-snug text-2">
                                            <ChevronRight size={12} className="mt-0.5 flex-shrink-0 text-purple" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick FAQ */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-bold tracking-widest mb-2 text-purple" style={{ opacity: 0.6 }}>COMMON QUESTIONS</p>
                        <h2 className="font-display font-black text-1 text-2xl">Quick Answers</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FAQS.map((f, i) => (
                            <motion.div key={f.q}
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 + i * 0.07 }}
                                className="card p-6">
                                <p className="font-bold text-1 text-sm mb-2">{f.q}</p>
                                <p className="text-xs leading-relaxed text-3">{f.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
