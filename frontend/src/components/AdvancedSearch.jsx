import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  ChevronDown, 
  SlidersHorizontal, 
  FileText, 
  ArrowRight,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { search } from '../lib/api';

const EQUIPMENT_CLASS = ['Pump', 'Turbine', 'Generator', 'Compressor', 'Motor', 'Valve'];
const DOC_TYPES = ['Manual', 'Guide', 'Log', 'Report'];

export default function AdvancedSearch({ initialQuery = '', onUseInChat, onViewDoc, darkMode }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [equipmentClass, setEquipmentClass] = useState('');
  const [docType, setDocType] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [engineMode, setEngineMode] = useState('hybrid');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const didAutoSearch = useRef(false);

  useEffect(() => {
    if (initialQuery && (initialQuery !== query || !didAutoSearch.current)) {
      setQuery(initialQuery);
      if (initialQuery.trim()) {
        didAutoSearch.current = true;
        runSearch(initialQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const runSearch = async (q = query) => {
    const term = q || query;
    if (!term.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await search({
        q: term,
        searchMode: engineMode,
        k: 10,
        minScore: confidence > 0 ? confidence / 100 : undefined,
      });
      setResults(res);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery('');
    setEquipmentClass('');
    setDocType('');
    setConfidence(0);
    setEngineMode('hybrid');
    setResults(null);
  };

  const filteredResults = (results?.results || []).filter((r) => {
    if (!equipmentClass) return true;
    return String(r.source_doc).toLowerCase().includes(equipmentClass.toLowerCase()) ||
      String(r.content).toLowerCase().includes(equipmentClass.toLowerCase());
  });

  return (
    <div
      className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-[#0a0e27] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
      style={{
        background: darkMode ? 'linear-gradient(#0a0e27, #1a2456)' : '#f8f9fa',
        padding: '24px',
      }}
    >
      
      {/* 1. Page Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Advanced Search
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Deep dive into technical documentation and historical diagnostics.
        </p>
      </div>

      {/* 2. Advanced Search & Filter Panel */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-6 shadow-2xs space-y-6">
        
        {/* Query Bar Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
              placeholder="Query system knowledge... (e.g. 'hydraulic pump overheating symptoms')"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-teal-500/20 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 cursor-not-allowed">
              <Mic className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5 hover:bg-teal-200 dark:hover:bg-teal-900 transition-colors border border-teal-500/20"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <button
              onClick={() => runSearch()}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors flex-1 md:flex-initial"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-teal-500/10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">EQUIPMENT CLASS</label>
                <div className="relative">
                  <select value={equipmentClass} onChange={(e) => setEquipmentClass(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 appearance-none focus:outline-none">
                    <option value="">All Equipment</option>
                    {EQUIPMENT_CLASS.map((c) => <option key={c} value={c}>{c}s</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">DOCUMENT TYPE</label>
                <div className="relative">
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 appearance-none focus:outline-none">
                    <option value="">All Documents</option>
                    {DOC_TYPES.map((c) => <option key={c} value={c}>{c}s</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MIN. CONFIDENCE</label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-teal-500/10 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">ENGINE MODE</span>
                <div className="flex items-center space-x-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {[['semantic', 'Semantic (AI)'], ['hybrid', 'Hybrid'], ['keyword', 'Exact Match']].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="radio" name="engineMode" checked={engineMode === val} onChange={() => setEngineMode(val)} className="text-teal-600 focus:ring-teal-500" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={clearAll} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">Clear All</button>
                <button onClick={() => runSearch()} className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm transition-colors">Apply Filters</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Results Header */}
      {results && !loading && !error && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/10 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {filteredResults.length} Results Found
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            mode: {engineMode.toUpperCase()}
          </span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
            <span>Searching knowledge base...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Search Result Cards */}
      {results && !loading && !error && (
        <div className="space-y-4">
          {filteredResults.length === 0 && (
            <div className="py-10 text-center">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No matching results. Try adjusting the filters or query.</p>
            </div>
          )}
          {filteredResults.map((r, i) => {
            const scorePct = Math.min(100, Math.round((r.score || 0) * 100));
            return (
              <div key={r.chunk_id || i} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{r.source_doc}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">PAGE {r.page ?? 1}</span>
                        <span>•</span>
                        <span className="truncate max-w-[220px]">{r.document_id?.slice(0, 24) || r.chunk_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{scorePct}% MATCH</span>
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorePct}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-teal-500/10 line-clamp-4">
                  {r.content}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                    <span>Score {(r.score || 0).toFixed(3)}</span>
                  </span>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUseInChat && onUseInChat(query || '')}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Use in Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onViewDoc && onViewDoc(r.document_id)}
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>View Document</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}