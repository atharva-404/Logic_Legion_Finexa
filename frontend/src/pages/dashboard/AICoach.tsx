import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Sparkles, Bot, User, ToggleLeft, ToggleRight,
    AlertCircle, Zap, RefreshCw, Copy, Check, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AIAPI, AuthAPI, BASE_URL } from '../../lib/api';

// Debounced credit refresh to avoid hammering the API
let _creditRefreshTimer: ReturnType<typeof setTimeout> | null = null;

const CHAT_COST = 2; // Backend deducts 2 credits per message

const STARTERS = [
    'Analyze my spending habits this month',
    'What is my financial health score?',
    'How strong is my emergency fund?',
    'How do I reduce my financial stress?',
    'Give me 3 money saving tips',
    'Explain the 50/30/20 rule to me',
];

interface ChatMsg {
    id: string; role: 'user' | 'assistant'; content: string;
    credits?: number; ts: Date; streaming?: boolean;
}

// Removed mock getResponse

// Removed useStreamText logic because backend streams tokens already

function BotMessage({ msg, onCopy }: { msg: ChatMsg; onCopy: (t: string) => void }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(msg.content);
        setCopied(true); setTimeout(() => setCopied(false), 1500);
        onCopy(msg.content);
    }

    return (
        <div className="flex gap-3 group">
            {/* Avatar */}
            <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Bot size={14} className="text-white" />
                </div>
                {msg.streaming && (
                    <motion.div className="absolute -inset-1 rounded-xl border border-purple-400/40"
                        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} />
                )}
            </div>
            <div className="max-w-[82%]">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed relative"
                    style={{ background: 'rgba(168,85,247,0.08)', color: 'var(--text-2)', border: '1px solid rgba(168,85,247,0.14)' }}>
                    {/* Shimmer while streaming */}
                    {msg.streaming && (
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 shimmer opacity-30" />
                        </div>
                    )}
                    <span className="relative z-10 whitespace-pre-wrap leading-relaxed inline-block" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>{msg.content}</span>
                    {msg.streaming && (
                        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: 'var(--purple)', verticalAlign: 'text-bottom' }} />
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-3">
                        {msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button onClick={copy}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-0.5 text-3 hover:text-2">
                        {copied ? <><Check size={9} style={{ color: '#10b981' }} /> Copied</> : <><Copy size={9} /> Copy</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AICoach() {
    const { user, refreshUser } = useAuth();
    const { isDark } = useTheme();
    const aiCredits = user?.ai_credits ?? 0;
    const [eli15Mode, setEli15Mode] = useState(false);
    const toggleEli15 = () => setEli15Mode(p => !p);

    const [msgs, setMsgs] = useState<ChatMsg[]>([{
        id: '0', role: 'assistant',
        content: `Hi ${user?.first_name || 'there'}! I'm your Finexa AI Financial Coach \u2014 powered by advanced AI. I can analyse your spending, explain financial concepts, and guide you toward your goals.\n\nEach message costs ${CHAT_COST} AI credits. Ask me anything!`,
        ts: new Date(),
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showStarters, setShowStarters] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [wsError, setWsError] = useState('');

    // Load Chat History
    useEffect(() => {
        if (!user) return;
        AIAPI.getChatSessions().then((res) => {
            if (res && res.results && res.results.length > 0) {
                // Get the most recent session or 'all_docs' session ID
                const sessionId = res.results[0].id;
                AIAPI.getChatMessages(sessionId).then((msgsRes) => {
                    if (msgsRes && msgsRes.results && msgsRes.results.length > 0) {
                        const historyMsgs = msgsRes.results.reverse().map((m: any) => ({
                            id: m.id.toString(),
                            role: m.sender === 'ai' ? 'assistant' : 'user',
                            content: m.text,
                            ts: new Date(m.created_at),
                            streaming: false
                        }));
                        setMsgs(historyMsgs);
                        setShowStarters(false);
                    }
                }).catch(console.error);
            }
        }).catch(console.error);
    }, [user]);

    // WebSocket Connection
    useEffect(() => {
        if (!user) return;
        const tokens = AuthAPI.getTokens();
        if (!tokens || !tokens.access) return;

        const baseUrl = BASE_URL || 'http://localhost:8000';
        const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/ai/chat/?token=${tokens.access}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => { setIsConnected(true); setWsError(''); };
        socket.onclose = () => { setIsConnected(false); };
        socket.onerror = () => { setWsError('WebSocket connection error.'); setIsConnected(false); };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'typing') {
                    if (data.status === 'start') {
                        setIsTyping(true);
                        // Ensure we have a placeholder AI message to stream into.
                        setMsgs(prev => {
                            if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].streaming) return prev;
                            const newMsg: ChatMsg = { id: Date.now().toString(), role: 'assistant', content: '', ts: new Date(), streaming: true };
                            return [...prev, newMsg];
                        });
                    } else if (data.status === 'stop') {
                        setIsTyping(false);
                    }
                } else if (data.type === 'token') {
                    setMsgs(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
                            lastMsg.content += (lastMsg.content ? ' ' : '') + data.text;
                        }
                        return newMsgs;
                    });
                } else if (data.type === 'done') {
                    setMsgs(prev => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
                            lastMsg.content = data.complete;
                            lastMsg.streaming = false;
                        }
                        return newMsgs;
                    });
                    // Refresh user to get updated credits after backend deduction
                    if (_creditRefreshTimer) clearTimeout(_creditRefreshTimer);
                    _creditRefreshTimer = setTimeout(() => refreshUser(), 500);
                } else if (data.type === 'error') {
                    setIsTyping(false);
                    setMsgs(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Error: ${data.error}`, ts: new Date(), streaming: false }]);
                }
            } catch (e) {
                console.error('Error parsing WS message:', e);
            }
        };

        setWs(socket);

        return () => socket.close();
    }, [user]);

    const sendMsg = useCallback((text: string) => {
        if (!text.trim() || isTyping || !ws || !isConnected) return;

        // Backend deducts credits; check if we have enough
        if (aiCredits < CHAT_COST) return;

        const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', content: text, ts: new Date() };
        setMsgs(m => [...m, userMsg]);
        setInput('');
        setShowStarters(false);

        try {
            ws.send(JSON.stringify({ question: text }));
        } catch (e: any) {
            console.error('Failed to send message:', e);
            setMsgs(m => [...m, { id: Date.now().toString(), role: 'assistant', content: `Failed to send message: ${e.message}`, ts: new Date(), streaming: false }]);
        }

        inputRef.current?.focus();
    }, [isTyping, aiCredits, ws, isConnected]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [msgs, isTyping]);

    function clearChat() {
        setMsgs([{
            id: Date.now().toString(), role: 'assistant',
            content: "Chat cleared. What would you like to explore?",
            ts: new Date(),
        }]);
        setShowStarters(true);
    }

    const lowCredits = aiCredits < CHAT_COST;
    const credPct = Math.min(100, (aiCredits / 1000) * 100);

    return (
        <div className="flex flex-col h-[calc(100vh-9rem)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="card-glow rounded-b-none px-5 py-4 flex items-center justify-between flex-shrink-0"
                style={{ borderBottomColor: 'transparent', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
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
                        <p className="font-semibold text-sm text-1">Finexa AI Coach</p>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                            <p className="text-[10px] text-3">{isConnected ? 'Online' : 'Reconnecting...'} · {CHAT_COST} credits/msg</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Credits mini bar */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                            <Sparkles size={10} style={{ color: 'var(--purple)' }} />
                            <span className="font-mono font-bold text-1">{aiCredits.toLocaleString()}</span>
                        </div>
                        <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.15)' }}>
                            <motion.div className="h-full rounded-full" animate={{ width: `${credPct}%` }}
                                style={{ background: credPct > 20 ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'linear-gradient(90deg,#ef4444,#f97316)' }} />
                        </div>
                    </div>

                    {/* ELI-15 */}
                    <button onClick={toggleEli15}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={eli15Mode
                            ? { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: 'var(--purple-light)' }
                            : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
                        {eli15Mode ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        ELI-15
                    </button>

                    {/* Clear */}
                    <button onClick={clearChat} className="btn-ghost p-2" title="Clear chat">
                        <RefreshCw size={13} />
                    </button>
                </div>
            </div>

            {/* Disclaimer */}
            {wsError && (
                <div className="px-5 py-2 text-[10px] flex items-center gap-1.5"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderTop: 'none', borderBottom: 'none' }}>
                    <AlertCircle size={10} className="text-red-500 flex-shrink-0" />
                    <span style={{ color: 'rgba(239,68,68,0.8)' }}>{wsError}</span>
                </div>
            )}
            <div className="px-5 py-2 text-[10px] flex items-center gap-1.5"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', borderTop: 'none', borderBottom: 'none' }}>
                <AlertCircle size={10} className="text-yellow-500 flex-shrink-0" />
                <span style={{ color: 'rgba(245,158,11,0.8)' }}>Educational coach only — not investment, legal or financial advice.</span>
            </div>

            {/* Messages */}
            <div className="card-glow rounded-none border-y-0 flex-1 overflow-y-auto p-5 space-y-5"
                style={{ background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.6)' }}>
                {/* Starters */}
                <AnimatePresence>
                    {showStarters && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            {STARTERS.map((s, i) => (
                                <motion.button key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                    onClick={() => sendMsg(s)} whileHover={{ x: 3 }}
                                    className="text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2"
                                    style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.13)', color: 'var(--text-2)' }}>
                                    <span>{s}</span>
                                    <Zap size={11} style={{ color: 'var(--purple)', flexShrink: 0 }} />
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {msgs.map(msg => (
                    msg.role === 'assistant'
                        ? <BotMessage key={msg.id} msg={msg} onCopy={() => { }} />
                        : (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 justify-end">
                                <div className="max-w-[80%]">
                                    <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
                                        style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', color: '#fff' }}>
                                        {msg.content}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-1 px-1">
                                        <span className="text-[10px] text-3">{msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'rgba(168,85,247,0.6)' }}>
                                            <Sparkles size={8} /> -{CHAT_COST}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                                    <User size={13} />
                                </div>
                            </motion.div>
                        )
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            <Bot size={14} className="text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-2 h-2 rounded-full"
                                    style={{ background: 'var(--purple)' }}
                                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.14 }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="card-glow rounded-t-none border-t-0 px-4 py-4 flex-shrink-0"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                {lowCredits && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center justify-between p-2.5 mb-3 rounded-xl text-xs"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span className="flex items-center gap-2 text-red-400">
                            <AlertCircle size={12} /> Not enough AI credits
                        </span>
                        <span className="text-[10px] text-3">Buy more from the sidebar</span>
                    </motion.div>
                )}
                <div className="flex items-end gap-2.5">
                    <textarea ref={inputRef}
                        className="field flex-1 resize-none text-sm leading-relaxed"
                        style={{ minHeight: 44, maxHeight: 120, paddingTop: 10, paddingBottom: 10 }}
                        placeholder={lowCredits ? 'Insufficient credits…' : 'Ask about your finances… (Enter to send)'}
                        disabled={lowCredits}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(input); }
                        }}
                        rows={1}
                    />
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        className="btn px-3.5 py-3 flex-shrink-0 self-end"
                        style={(!input.trim() || isTyping || lowCredits) ? { opacity: 0.4 } : {}}
                        disabled={!input.trim() || isTyping || lowCredits}
                        onClick={() => sendMsg(input)}>
                        <motion.div animate={isTyping ? { rotate: 360 } : {}} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
                            {isTyping ? <RefreshCw size={15} /> : <Send size={15} />}
                        </motion.div>
                    </motion.button>
                </div>
                <p className="text-[10px] text-3 mt-2 text-center">
                    {CHAT_COST} credits/msg · <span style={{ color: 'var(--purple)' }}>{aiCredits.toLocaleString()} remaining</span>
                </p>
            </div>
        </div>
    );
}
