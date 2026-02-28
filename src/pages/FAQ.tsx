import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft, MessageCircle } from 'lucide-react';

const FAQS = [
    {
        category: 'Getting Started',
        items: [
            { q: 'Is Finexa free to use?', a: 'Yes — the core app is completely free. You start with 400 AI credits on sign-up, which is enough to get a full financial health analysis. Additional credits are available as one-time purchases with no recurring fees.' },
            { q: 'Do I need a real bank account to try Finexa?', a: 'No. You can sign in with the demo account (demo@finexa.ai / demo1234) to explore all features with pre-loaded sample data. You can also sign up and use Finexa fully offline.' },
            { q: 'What file formats can I upload?', a: 'Finexa supports standard bank statement PDFs exported from major Indian banks. The AI parses the PDF, extracts all transactions, and structures them automatically — no manual entry needed.' },
        ],
    },
    {
        category: 'AI Credits',
        items: [
            { q: 'What are AI credits and how do they work?', a: 'AI credits power every AI feature — each chat message costs 100 credits, a document analysis costs 500 credits, and a risk simulation costs 200 credits. You start with 400 free credits. Top up any time from the Subscription page.' },
            { q: 'What happens if I run out of credits?', a: 'You can continue to use all non-AI features (budget tracking, goal setting, wallet, transactions etc.) even with zero credits. To use AI features again, simply top up with one of our credit packages.' },
            { q: 'Do credits expire?', a: 'Never. Credits you purchase stay in your account forever.' },
        ],
    },
    {
        category: 'Privacy & Security',
        items: [
            { q: 'Is my financial data secure?', a: 'Absolutely. Finexa is privacy-first — your data is never sold to third parties. Bank statement PDFs are processed and immediately discarded; only structured transaction data is kept. All data is encrypted at rest and in transit.' },
            { q: 'Can I delete my data?', a: 'Yes. You can delete all your data at any time from Settings → Account → Delete Account. This permanently removes everything from our servers.' },
        ],
    },
    {
        category: 'Features',
        items: [
            { q: 'How is my Financial Health Score calculated?', a: 'Your score (0–100) covers four dimensions: savings rate, emergency fund coverage, debt-to-income ratio, and spending discipline. It updates automatically as your data changes.' },
            { q: 'Can I use Finexa without uploading documents?', a: 'Yes. You can manually enter financial details, set goals, track habits, and chat with the AI coach. Document upload just speeds up the initial setup.' },
        ],
    },
];

export default function FAQ() {
    const navigate = useNavigate();
    const [open, setOpen] = useState<string | null>(null);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#07050f 0%,#0d0820 50%,#07050f 100%)' }}>

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.12), transparent)' }} />

            {/* Top bar — back only */}
            <div className="sticky top-0 z-50 px-6 py-4 flex items-center"
                style={{ background: 'rgba(7,5,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                <button onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: 'rgba(192,132,252,0.9)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.18)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.1)'; }}>
                    <ArrowLeft size={15} />
                    Back
                </button>
            </div>

            <div className="relative max-w-2xl mx-auto px-6 pt-14 pb-24">

                {/* Header */}
                <motion.div className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                        style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.25)' }}>
                        <MessageCircle size={22} style={{ color: '#a855f7' }} />
                    </div>
                    <h1 className="font-display font-black text-white mb-3" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h1>
                    <p className="text-sm" style={{ color: 'rgba(180,165,230,0.5)' }}>
                        Everything you need to know about Finexa
                    </p>
                </motion.div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                    {FAQS.map((cat, ci) => (
                        <motion.div key={cat.category}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ci * 0.08 }}>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                                style={{ color: 'rgba(168,85,247,0.55)' }}>{cat.category}</p>
                            <div className="space-y-2">
                                {cat.items.map((faq, fi) => {
                                    const key = `${ci}-${fi}`;
                                    const isOpen = open === key;
                                    return (
                                        <div key={fi}
                                            className="rounded-2xl overflow-hidden transition-all duration-200"
                                            style={{
                                                background: isOpen ? 'rgba(124,58,237,0.06)' : 'rgba(12,8,28,0.8)',
                                                border: `1px solid ${isOpen ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.1)'}`,
                                            }}>
                                            <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                                onClick={() => setOpen(isOpen ? null : key)}>
                                                <span className="text-sm font-semibold" style={{ color: isOpen ? '#fff' : 'rgba(220,210,255,0.8)' }}>
                                                    {faq.q}
                                                </span>
                                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                                                    <ChevronDown size={15} style={{ color: isOpen ? '#a855f7' : 'rgba(168,85,247,0.4)' }} />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                                                        <div className="px-5 pb-5 text-sm leading-relaxed"
                                                            style={{ color: 'rgba(180,165,230,0.55)', borderTop: '1px solid rgba(168,85,247,0.08)' }}>
                                                            <div className="pt-3">{faq.a}</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
