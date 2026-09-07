import React, { useState } from 'react';
import { FileText, MoreVertical, Download, Trash2, Eye } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters.js';

export function DocumentCard({ doc, viewMode = 'grid', onSelect, onDelete }) {
  const [menu, setMenu] = useState(false);
  const id = doc.id || doc.filename;
  const statusTone =
    doc.status === 'complete'
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      : doc.status === 'processing'
        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
        : 'bg-red-500/10 text-red-700 border-red-500/20';

  return (
    <div
      onClick={() => onSelect?.(doc)}
      className={`bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${
        viewMode === 'list' ? 'flex items-center gap-3' : 'flex flex-col'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <FileText className="w-6 h-6 text-blue-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-slate-900 truncate">{doc.filename}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {doc.pageCount ?? '?'} pages · {formatTimestamp(doc.uploadedAt || doc.createdAt || new Date().toISOString())}
          </p>
          {(doc.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(doc.tags || []).slice(0, 4).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusTone}`}>{doc.status || 'complete'}</span>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu(!menu);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg"
            aria-label="Document actions"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {menu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 min-w-36 text-xs">
              <button className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2" onClick={(e) => { e.stopPropagation(); onSelect?.(doc); }}>
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                  setMenu(false);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
