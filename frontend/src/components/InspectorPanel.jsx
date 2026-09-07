import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText,
  Loader2
} from 'lucide-react';
import VibrationSpectrum from './VibrationSpectrum';

export default function InspectorPanel({ sources = [], isStreaming = false, activeCitation, onCitationClick, darkMode }) {
  const avgConfidence = sources.length
    ? Math.round((sources.reduce((sum, s) => sum + (s.confidence || 0), 0) / sources.length) * 100)
    : null;

  const citationActive = (idx) => activeCitation && activeCitation.id === idx;

  return (
    <aside
      className="w-[340px] bg-slate-50/90 dark:bg-[#0a0e27] border-l border-slate-200 dark:border-teal-500/10 flex flex-col h-full shrink-0 overflow-y-auto transition-colors duration-200 select-none"
      style={{
        backgroundColor: darkMode ? '#0a0e27' : '#f8f9fa',
        borderLeft: darkMode ? '1px solid rgba(0,137,123,0.1)' : '1px solid #dee2e6',
      }}
    >
      {/* Header & Tabs */}
      <div className="p-4 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-teal-500/10 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Context Retrieval
        </h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
          isStreaming
            ? 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30 animate-pulse'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-teal-500/20'
        }`}>
          {isStreaming ? 'SCANNING' : sources.length ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Confidence Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Confidence Score
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              {avgConfidence !== null ? `${avgConfidence}%` : '--'}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-teal-500/20">
            <div 
              className="h-full bg-[#10B981] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${avgConfidence ?? 0}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            {sources.length
              ? `${sources.length} source${sources.length > 1 ? 's' : ''} retrieved from ${new Set(sources.map(s => s.source_doc)).size} document(s)`
              : isStreaming ? 'Scanning knowledge base...' : 'Ask a question to retrieve context sources.'}
          </p>
        </div>

        {/* KNOWLEDGE SOURCES Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
            <span>Knowledge Sources</span>
            <span className={`text-teal-600 dark:text-teal-400 font-mono text-[10px] ${isStreaming ? 'animate-pulse' : ''}`}>
              {isStreaming ? 'Scanning' : sources.length ? 'Retrieved' : 'None'}
            </span>
          </div>

          {sources.length === 0 && !isStreaming && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/70 dark:border-teal-500/10 text-center">
              <FileText className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                No sources retrieved yet.
              </p>
            </div>
          )}

          {isStreaming && sources.length === 0 && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-teal-500/10 space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                <span>Scanning SCADA logs...</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}

          {sources.map((src, idx) => (
            <div
              key={src.id ?? idx}
              onClick={() => onCitationClick && onCitationClick(src)}
              className={`p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border flex items-center justify-between shadow-2xs cursor-pointer transition-all ${
                citationActive(idx)
                  ? 'border-teal-500 ring-1 ring-teal-500/40'
                  : 'border-slate-200 dark:border-teal-500/10 hover:border-teal-500/40'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {src.source_doc}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Page {src.page} • Confidence {Math.round((src.confidence || 0) * 100)}%
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
                    {String(src.excerpt || '').slice(0, 140)}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
            </div>
          ))}
        </div>

        {/* Simulated Vibration Spectrum Box */}
        <VibrationSpectrum />
      </div>
    </aside>
  );
}