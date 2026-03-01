import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, ChevronRight, Sparkles, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { AIAPI } from '../../lib/api';
import { useTheme } from '../../contexts/ThemeContext';

interface Doc {
    id: number;
    name: string;
    uploaded_at: string;
    summary?: string;
    suggestions?: string[];
    mongo_id?: string;
}

export default function Documents() {
    const { isDark } = useTheme();
    const [docs, setDocs] = useState<Doc[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const fileRef = useRef<HTMLInputElement>(null);

    // Load existing documents from backend on mount
    useEffect(() => {
        setLoading(true);
        AIAPI.listDocuments()
            .then((data: any) => {
                const list = Array.isArray(data) ? data : (data?.results || []);
                const mapped: Doc[] = list.map((d: any) => ({
                    id: d.id,
                    name: d.file_name || d.name || `Document ${d.id}`,
                    uploaded_at: d.created_at || new Date().toISOString(),
                    summary: d.summary || '',
                    mongo_id: d.mongo_doc_id || '',
                }));
                setDocs(mapped);
            })
            .catch((err: any) => { console.error('Failed to load documents:', err); })
            .finally(() => setLoading(false));
    }, []);

    async function handleFile(file: File) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return; }
        setIsUploading(true);
        setError('');
        try {
            const result = await AIAPI.processDocument(file);
            // Extract summary text — backend may return string or object
            let summaryText = '';
            if (typeof result.summary === 'string') summaryText = result.summary;
            else if (result.summary?.summary) summaryText = result.summary.summary;
            else if (result.summary?.text) summaryText = result.summary.text;
            else if (result.summary) summaryText = JSON.stringify(result.summary);

            const newDoc: Doc = {
                id: result.document_id || result.sql_document_id || Date.now(),
                name: file.name,
                uploaded_at: new Date().toISOString(),
                summary: summaryText,
                mongo_id: result.mongo_id || '',
            };
            if (result.mongo_id) {
                try {
                    const [sumData, sugData] = await Promise.allSettled([
                        AIAPI.getExpenseSummary(result.mongo_id),
                        AIAPI.getSuggestions(result.mongo_id),
                    ]);
                    if (sumData.status === 'fulfilled' && sumData.value?.summary) {
                        newDoc.summary = sumData.value.summary;
                    }
                    if (sugData.status === 'fulfilled') {
                        const sug = sugData.value;
                        const rawList = Array.isArray(sug) ? sug : (sug?.suggestions || []);
                        newDoc.suggestions = rawList.map((s: any) =>
                            typeof s === 'string' ? s : (s?.suggestion || s?.text || s?.title || JSON.stringify(s))
                        );
                    }
                } catch { /* ignore secondary fetch failures */ }
            }
            if (!newDoc.summary && result.transactions_created > 0) {
                newDoc.summary = `Successfully extracted ${result.transactions_created} transaction(s) from this document.`;
            }
            setDocs(d => [newDoc, ...d]);
            setActiveDoc(newDoc);
        } catch (e: any) {
            console.error('Document upload error:', e);
            setError(e.message || 'Failed to process document. Please try again.');
        }
        setIsUploading(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isDark ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
                    <FileText size={18} style={{ color: 'var(--aqua)' }} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI-Powered</p>
                    <h1 className="font-display font-bold text-2xl text-gradient">Documents & Analysis</h1>
                </div>
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

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-purple-400" />
                    <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>Loading documents...</span>
                </div>
            )}

            {/* Empty state */}
            {!loading && docs.length === 0 && (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Upload a bank statement or PDF to get AI-powered insights</p>
                </div>
            )}

            {/* Documents list */}
            {docs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Doc list */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow p-5" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
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
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow p-5 space-y-4" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)' }}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeDoc.name}</h3>
                            </div>

                            {/* Document info */}
                            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    Uploaded {new Date(activeDoc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {activeDoc.mongo_id && (
                                    <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        AI Analyzed
                                    </span>
                                )}
                            </div>

                            {activeDoc.summary ? (
                                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={13} style={{ color: 'var(--aqua)' }} />
                                        <span className="text-xs font-semibold" style={{ color: 'var(--aqua)' }}>AI Summary</span>
                                    </div>
                                    {(() => {
                                        let text = activeDoc.summary || '';
                                        // Try to parse JSON or Python-dict-style summary
                                        try {
                                            const cleaned = text.replace(/'/g, '"');
                                            const obj = JSON.parse(cleaned);
                                            if (typeof obj === 'object' && obj !== null) {
                                                const parts: string[] = [];
                                                if (obj.total_amount) parts.push(`Total Amount: ₹${Number(obj.total_amount).toLocaleString('en-IN')}`);
                                                if (obj.record_count) parts.push(`Records: ${obj.record_count}`);
                                                if (obj.biggest_category) parts.push(`Biggest Category: ${obj.biggest_category}`);
                                                if (obj.currency) parts.push(`Currency: ${obj.currency}`);
                                                if (obj.top_merchants?.length) parts.push(`Top Merchants: ${obj.top_merchants.join(', ')}`);
                                                if (obj.summary) parts.push(obj.summary);
                                                if (obj.text) parts.push(obj.text);
                                                if (obj.suggestions?.length) {
                                                    parts.push(`\nSuggestions:\n${obj.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`);
                                                }
                                                if (parts.length > 0) text = parts.join('\n');
                                            }
                                        } catch { /* use raw text */ }
                                        return (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                                {text}
                                            </p>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)' }}>
                                    <FileText size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No AI analysis available</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        This document was uploaded but analysis may have failed.
                                    </p>
                                </div>
                            )}

                            {activeDoc.suggestions && activeDoc.suggestions.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>AI Recommendations</p>
                                    <div className="space-y-2">
                                        {(Array.isArray(activeDoc.suggestions) ? activeDoc.suggestions : []).map((s: any, i: number) => {
                                            const text = typeof s === 'string' ? s : (s?.suggestion || s?.text || s?.title || JSON.stringify(s));
                                            return (
                                                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
                                                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}>
                                                    <Sparkles size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--aqua)' }} />
                                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}

        </div>
    );
}
