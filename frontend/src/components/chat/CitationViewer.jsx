import React, { useState } from 'react';
import { ChevronRight, Eye } from 'lucide-react';

export function CitationViewer({ citations = [], onViewDocument }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900">Sources & Citations</h3>
      {citations.length === 0 && <p className="text-xs text-slate-500">No sources yet. Ask a question to retrieve context.</p>}
      {citations.map((c, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-50 text-left"
          >
            <div>
              <div className="text-xs font-bold text-slate-900">{c.sourceDoc}</div>
              <div className="text-[11px] text-slate-500">Page {c.page} · {Math.round((c.confidence || 0) * 100)}%</div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded === idx ? 'rotate-90' : ''}`} />
          </button>
          {expanded === idx && (
            <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-2">
              <p className="text-xs italic text-slate-600 ">“{c.excerpt}”</p>
              <button
                onClick={() => onViewDocument?.(c.sourceDoc, c.page)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View in document
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CitationViewer;
