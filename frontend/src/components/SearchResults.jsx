import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Loader2,
  AlertTriangle,
  MessageSquare,
  Eye,
  Copy,
  Download
} from 'lucide-react';
import { search } from '../lib/api';
import EmptyState from './common/EmptyState.jsx';
import HighlightedText from './common/HighlightedText.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

export default function SearchResults({ onUseInChat, onViewDoc, query: initialQuery = '' }) {
  const { notify } = useNotifications();
  const [query, setQuery] = useState(initialQuery || 'pump cavitation');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = useCallback(async (q) => {
    const term = q || query;
    if (!term.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await search({ q: term, searchMode: 'hybrid', k: 10 });
      setResults(res);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { runSearch(initialQuery || 'pump cavitation'); }, [runSearch, initialQuery]);
  const copyResult = async (result) => {
    try { await navigator.clipboard.writeText(`${result.source_doc || 'Search result'} (page ${result.page ?? 1})\n\n${result.content || ''}`); notify('Search result copied to clipboard.', 'success'); }
    catch { notify('Unable to copy the result. Please check browser permissions.', 'error'); }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-slate-100/60 overflow-y-auto transition-colors duration-200"
      style={{
        background: '#f8fafc',
        padding: '24px',
      }}
    >
      <div className="p-6 bg-white border-b border-slate-200 space-y-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Search Results</h1>
            <div className="mt-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-700 font-mono border border-slate-300/60">
                Query: {query}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {results ? `FOUND ${results.total_count} RESULTS` : ''}
            </span>
            <button type="button" onClick={() => window.print()} className="no-print inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" title="Open the print dialog to save results as PDF"><Download className="h-3.5 w-3.5" />Export PDF</button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
            className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <button onClick={() => runSearch()} className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
              <span>Searching...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {results && !loading && !error && (
          <div className="space-y-4">
            {results.results.length === 0 && (
              <EmptyState icon={FileText} title="No results found" description="Try a more specific symptom, component, or equipment name." />
            )}
            {results.results.map((r, i) => {
              const scorePct = Math.min(100, Math.round((r.score || 0) * 100));
              return (
                <div key={r.chunk_id || i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{r.source_doc}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>Pg. {r.page ?? 1}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 border border-teal-500/20">{(results.search_mode || 'hybrid').toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 font-mono">{scorePct}% Match</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorePct}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200/60 line-clamp-3">
                    <HighlightedText text={r.content} query={query} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onUseInChat && onUseInChat(query)}
                      className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Use in Chat</span>
                    </button>
                    <button onClick={() => copyResult(r)} className="no-print px-3 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors flex items-center space-x-1.5" title="Copy result and citation">
                      <Copy className="w-3.5 h-3.5" /><span>Copy</span>
                    </button>
                    <button
                      onClick={() => onViewDoc && onViewDoc(r.document_id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Document</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
