import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, ToggleLeft, ToggleRight, AlertCircle, Zap } from 'lucide-react';
import { useFinancialStore } from '../../store/financialStore';
import { aiResponses } from '../../lib/mockData';
import { useAuth } from '../../contexts/AuthContext';

const CHAT_COST = 100; // credits per message

const STARTERS = [
    { text: 'Analyze my spending habits', key: 'budget' },
    { text: 'What is my financial health score?', key: 'score' },
    { text: 'How strong is my emergency fund?', key: 'emergency' },
    { text: 'Tips to reduce financial stress', key: 'stress' },
    { text: 'How to build better money habits?', key: 'habit' },
];

interface ChatMsg {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    credits?: number;
    ts: Date;
}

function getResponse(input: string, eli15: boolean): string {
    const low = input.toLowerCase();
    if (eli15) return aiResponses.eli15;
    for (const [key, val] of Object.entries(aiResponses)) {
        if (key !== 'default' && low.includes(key)) return val;
    }
    if (low.includes('budget') || low.includes('spend')) return aiResponses.budget;
    if (low.includes('score') || low.includes('health')) return aiResponses.score;
    if (low.includes('emergency') || low.includes('fund')) return aiResponses.emergency;
    if (low.includes('stress') || low.includes('anxiety')) return aiResponses.stress;
    if (low.includes('habit') || low.includes('challenge')) return aiResponses.habit;
    return aiResponses.default;
}

export default function AICoach() {
    const { aiCredits, useCredits, eli15Mode, toggleEli15 } = useFinancialStore();
    const { user } = useAuth();
    const [msgs, setMsgs] = useState<ChatMsg[]>([{
        id: '0', role: 'assistant',
        content: `Hi ${user?.first_name || 'there'}! I'm your Finexa AI Coach. Ask me anything about your finances — budgeting, savings, goals, or how to improve your financial health. Each message costs ${CHAT_COST} AI credits.`,
        ts: new Date(),
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lowCredit, setLowCredit] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, isTyping]);

    useEffect(() => {
        setLowCredit(aiCredits < CHAT_COST);
    }, [aiCredits]);

    async function sendMsg(text: string) {
        if (!text.trim()) return;
        if (!useCredits(CHAT_COST, 'AI Coach message')) {
            setLowCredit(true);
            return;
        }

        const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: text, credits: CHAT_COST, ts: new Date() };
        setMsgs(m => [...m, userMsg]);
        setInput('');
        setIsTyping(true);

        await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

        const responseText = getResponse(text, eli15Mode);
        const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, ts: new Date() };
        setMsgs(m => [...m, botMsg]);
        setIsTyping(false);
    }

    return (
        <div className="flex flex-col h-[calc(100vh-9rem)] max-w-3xl mx-auto space-y-0">
            {/* Header */}
            <div className="card rounded-b-none border-b-0 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            <Bot size={18} className="text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                            style={{ background: '#10b981', borderColor: 'var(--surface)' }} />
                    </div>
                    <div>
                        <p className="font-semibold text-1 text-sm">Finexa AI Coach</p>
                        <p className="text-xs text-3">Financial adviser · {CHAT_COST} credits/msg</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Credits indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                        style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <Sparkles size={11} style={{ color: 'var(--purple)' }} />
                        <span className="font-mono font-bold text-1">{aiCredits.toLocaleString()}</span>
                        <span className="text-3">credits</span>
                    </div>

                    {/* ELI-15 toggle */}
                    <button onClick={toggleEli15}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={eli15Mode
                            ? { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: 'var(--purple-light)' }
                            : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                        {eli15Mode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        ELI-15
                    </button>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 px-5 py-2.5 text-xs"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderTop: 'none', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                <AlertCircle size={11} className="text-yellow-500 flex-shrink-0" />
                <span style={{ color: 'rgba(245,158,11,0.85)' }}>Educational only — not investment, legal, or financial advice.</span>
            </div>

            {/* Messages */}
            <div className="card rounded-none border-t-0 border-b-0 flex-1 overflow-y-auto p-5 space-y-4">
                {/* Starters */}
                {msgs.length <= 1 && (
                    <div className="grid grid-cols-1 gap-2 mb-4">
                        {STARTERS.map(s => (
                            <motion.button key={s.key} whileHover={{ x: 4 }} onClick={() => sendMsg(s.text)}
                                className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3"
                                style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', color: 'var(--text-2)' }}>
                                <span>{s.text}</span>
                                <Zap size={13} style={{ color: 'var(--purple)', flexShrink: 0 }} />
                            </motion.button>
                        ))}
                    </div>
                )}

                {msgs.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                                <Bot size={14} className="text-white" />
                            </div>
                        )}
                        <div className="max-w-[82%]">
                            <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                                style={msg.role === 'user'
                                    ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                                    : { background: 'rgba(168,85,247,0.08)', color: 'var(--text-2)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '18px 18px 18px 4px' }
                                }>
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="text-[10px] text-3">
                                    {msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.role === 'user' && msg.credits && (
                                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'rgba(168,85,247,0.6)' }}>
                                        <Sparkles size={8} /> -{msg.credits}
                                    </span>
                                )}
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                <User size={14} style={{ color: 'var(--text-2)' }} />
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            <Bot size={14} className="text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-2 h-2 rounded-full"
                                    style={{ background: 'var(--purple)' }}
                                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="card rounded-t-none border-t-0 px-4 py-4 flex-shrink-0">
                {lowCredit && (
                    <div className="flex items-center justify-between p-2.5 mb-3 rounded-xl text-xs"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span className="flex items-center gap-2 text-red-400">
                            <AlertCircle size={13} /> Insufficient credits
                        </span>
                        <button className="btn btn-sm text-xs px-3 py-1.5"
                            onClick={() => { /* Open buy modal */ }}>
                            Buy Credits
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-3">
                    <textarea
                        className="field flex-1 resize-none min-h-[44px] max-h-32 py-3 text-sm"
                        placeholder={lowCredit ? 'Not enough credits…' : 'Ask about your finances…'}
                        disabled={lowCredit}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                        rows={1}
                    />
                    <button className="btn px-4 py-3 flex-shrink-0"
                        disabled={!input.trim() || isTyping || lowCredit}
                        onClick={() => sendMsg(input)}>
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-3 mt-2 text-center">
                    Each message costs <span style={{ color: 'var(--purple)' }}>{CHAT_COST} credits</span> · {aiCredits.toLocaleString()} remaining
                </p>
            </div>
        </div>
    );
}
