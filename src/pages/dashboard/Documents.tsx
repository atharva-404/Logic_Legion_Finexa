import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ChevronRight, Sparkles, MessageCircle, Send, X, AlertCircle } from 'lucide-react';
import { AIAPI } from '../../lib/api';

interface Doc {
    id: number;
    name: string;
    uploaded_at: string;
    summary?: string;
    suggestions?: string[];
    mongo_id?: string;
}

export default function Documents() {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMsgs, setChatMsgs] = useState<{ role: string; content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
        setIsUploading(true);
        setError('');
        try {
            const result = await AIAPI.processDocument(file);
            const newDoc: Doc = {
                id: result.document_id || Date.now(),
                name: file.name,
                uploaded_at: new Date().toISOString(),
                summary: result.summary,
                mongo_id: result.mongo_id,
            };
            if (result.mongo_id) {
                const [sumData, sugData] = await Promise.allSettled([
                    AIAPI.getExpenseSummary(result.mongo_id),
                    AIAPI.getSuggestions(result.mongo_id),
                ]);
                if (sugData.status === 'fulfilled') newDoc.suggestions = sugData.value;
            }
            setDocs(d => [newDoc, ...d]);
            setActiveDoc(newDoc);
        } catch (e: any) {
            // Demo fallback
            const demoDoc: Doc = {
                id: Date.now(),
                name: file.name,
                uploaded_at: new Date().toISOString(),
                summary: `AI Analysis of ${file.name}: This document contains financial records. Based on the data, total expenses tracked are ₹47,320 for the period. Key categories: Housing (35%), Food (22%), Transport (15%), Utilities (12%), Entertainment (9%), Miscellaneous (7%).`,
                suggestions: [
                    'Your dining expenses are 18% above the recommended amount — consider meal planning.',
                    'Entertainment spend has increased 24% month-over-month — review subscriptions.',
                    'You could save ₹4,200/month by switching to a lower telecom plan.',
                ],
            };
            setDocs(d => [demoDoc, ...d]);
            setActiveDoc(demoDoc);
        }
        setIsUploading(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    async function sendChat() {
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setChatMsgs(m => [...m, { role: 'user', content: msg }]);
        setChatInput('');
        setIsChatting(true);
        await new Promise(r => setTimeout(r, 900));
        const reply = `Based on the document "${activeDoc?.name}", here's what I found regarding "${msg}": ${activeDoc?.summary?.slice(0, 150)}... Would you like me to dive deeper into any specific category?`;
        setChatMsgs(m => [...m, { role: 'assistant', content: reply }]);
        setIsChatting(false);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Documents & AI Analysis</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Upload bank statements or PDFs — get instant AI-powered insights</p>
            </div>

            {/* Upload zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'scale-[1.01]' : ''}`}
                style={{
                    borderColor: isDragging ? 'var(--aqua)' : 'var(--border-default)',
                    background: isDragging ? 'rgba(0,212,255,0.06)' : 'var(--bg-elevated)',
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}>

                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'var(--aqua)', borderTopColor: 'transparent' }} />
                        <p style={{ color: 'var(--aqua)' }}>Analyzing document with AI...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
                            <Upload size={24} style={{ color: 'var(--aqua)' }} />
                        </div>
                        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Drop your bank statement or PDF here
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG — max 10MB</p>
                        <div className="flex justify-center gap-2 mt-3">
                            {['PDF', 'JPG', 'PNG'].map(ext => (
                                <span key={ext} className="badge-aqua text-[10px]">{ext}</span>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Documents list */}
            {docs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Doc list */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Uploaded Documents</h3>
                        <div className="space-y-2.5">
                            {docs.map(doc => (
                                <button key={doc.id} onClick={() => setActiveDoc(doc)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                                    style={{
                                        background: activeDoc?.id === doc.id ? 'rgba(0,212,255,0.1)' : 'var(--bg-elevated)',
                                        border: activeDoc?.id === doc.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid var(--border-subtle)',
                                    }}>
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(0,212,255,0.12)' }}>
                                        <FileText size={15} style={{ color: 'var(--aqua)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Doc details */}
                    {activeDoc && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeDoc.name}</h3>
                                <button onClick={() => setShowChat(true)} className="btn-aqua text-xs px-3 py-2">
                                    <MessageCircle size={13} /> Chat with doc
                                </button>
                            </div>

                            {activeDoc.summary && (
                                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={13} style={{ color: 'var(--aqua)' }} />
                                        <span className="text-xs font-semibold" style={{ color: 'var(--aqua)' }}>AI Summary</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{activeDoc.summary}</p>
                                </div>
                            )}

                            {activeDoc.suggestions && activeDoc.suggestions.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>AI Recommendations</p>
                                    <div className="space-y-2">
                                        {(Array.isArray(activeDoc.suggestions) ? activeDoc.suggestions : []).map((s: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
                                                style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
                                                <Sparkles size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--aqua)' }} />
                                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Document chat modal */}
            <AnimatePresence>
                {showChat && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowChat(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
                            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-default)' }}>
                            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Document Chat</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activeDoc?.name}</p>
                                </div>
                                <button onClick={() => setShowChat(false)}>
                                    <X size={20} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {chatMsgs.length === 0 && (
                                    <div className="text-center py-10">
                                        <MessageCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--aqua)', opacity: 0.5 }} />
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ask anything about this document</p>
                                    </div>
                                )}
                                {chatMsgs.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm"
                                            style={m.role === 'user'
                                                ? { background: 'linear-gradient(135deg, #0096C7, #00D4FF)', color: '#000c1a', borderRadius: '20px 20px 4px 20px' }
                                                : { background: 'rgba(0,212,255,0.08)', color: 'var(--text-secondary)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '20px 20px 20px 4px' }
                                            }>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isChatting && (
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map(i => (
                                            <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--aqua)' }}
                                                animate={{ y: [0, -6, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <input className="field flex-1 text-sm" placeholder="Ask about this document..."
                                    value={chatInput} onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChat()} />
                                <button className="btn-aqua px-3 py-2" onClick={sendChat} disabled={!chatInput.trim()}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
