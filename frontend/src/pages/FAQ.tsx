import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const FAQS = [
    {
        category: 'Getting Started',
        items: [
            { q: 'Is Finexa free to use?', a: 'Yes — the core app is completely free. You start with 100,000 AI credits on sign-up, which is more than enough to get a full financial health analysis, multiple AI Coach chats, and risk simulations. Additional credits are available as one-time purchases with no recurring fees.' },
            { q: 'Do I need a real bank account to try Finexa?', a: 'No. Simply sign up with your email, complete the onboarding flow, and start using Finexa right away. Upload a bank statement PDF to auto-import your transactions, or add them manually.' },
            { q: 'What file formats can I upload?', a: 'Finexa supports standard bank statement PDFs exported from major Indian banks. The AI parses the PDF, extracts all transactions, and structures them automatically — no manual entry needed.' },
        ],
    },
    {
        category: 'AI Credits',
        items: [
            { q: 'What are AI credits and how do they work?', a: 'AI credits power every AI feature — each chat message costs 100 credits, a document analysis costs 500 credits, and a risk simulation costs 200 credits. You start with 100,000 free credits. Top up any time from the Subscription page.' },
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
    const [open, setOpen] = useState<string | null>(null);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, var(--purple-dim), transparent)' }} />

            <Navbar />

            <div className="relative max-w-2xl mx-auto px-6 pt-28 pb-24">

                {/* Header */}
                <motion.div className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                        style={{ background: 'var(--purple-dim)', border: '1px solid var(--border-hi)' }}>
                        <MessageCircle size={22} className="text-purple" />
                    </div>
                    <h1 className="font-display font-black text-1 mb-3" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h1>
                    <p className="text-sm text-3">
                        Everything you need to know about Finexa
                    </p>
                </motion.div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                    {FAQS.map((cat, ci) => (
                        <motion.div key={cat.category}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ci * 0.08 }}>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-purple"
                                style={{ opacity: 0.8 }}>{cat.category}</p>
                            <div className="space-y-3">
                                {cat.items.map((faq, fi) => {
                                    const key = `${ci}-${fi}`;
                                    const isOpen = open === key;
                                    return (
                                        <div key={fi}
                                            className="card overflow-hidden transition-all duration-300"
                                            style={{
                                                background: isOpen ? 'var(--purple-dim)' : 'var(--surface)',
                                                borderColor: isOpen ? 'var(--purple)' : 'var(--border)',
                                            }}>
                                            <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                                                onClick={() => setOpen(isOpen ? null : key)}>
                                                <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-1' : 'text-2'}`}>
                                                    {faq.q}
                                                </span>
                                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                                                    <ChevronDown size={15} className={isOpen ? 'text-purple' : 'text-3'} />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                                                        <div className="px-6 pb-6 text-sm leading-relaxed text-3"
                                                            style={{ borderTop: '1px solid var(--border)' }}>
                                                            <div className="pt-4">{faq.a}</div>
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
