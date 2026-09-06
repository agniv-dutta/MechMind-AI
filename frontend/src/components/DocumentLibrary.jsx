import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Upload, 
  FileText, 
  MoreVertical, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  FileCode, 
  Layers,
  AlertTriangle
} from 'lucide-react';
import { listDocuments } from '../lib/api';

const TYPE_META = {
  'Service Manual': { bg: 'from-slate-950 via-slate-900 to-blue-950', dot: 'bg-blue-600', label: 'MANUAL // REV' },
  'Wiring Diagram': { bg: 'from-slate-950 via-slate-900 to-cyan-950', dot: 'bg-cyan-600', label: 'SCHEMATIC // WIRING' },
  'P&ID': { bg: 'from-slate-950 via-slate-900 to-amber-950', dot: 'bg-amber-600', label: 'P&ID FLOWCHART' },
  'Troubleshooting Guide': { bg: 'from-slate-950 via-slate-900 to-purple-950', dot: 'bg-purple-600', label: 'DIAGNOSTIC // GUIDE' },
  'Maintenance Log': { bg: 'from-slate-950 via-slate-900 to-emerald-950', dot: 'bg-emerald-600', label: 'MAINTENANCE LOG' },
};

function typeMeta(category, fileType) {
  if (category && TYPE_META[category]) return TYPE_META[category];
  if (fileType === 'docx') return TYPE_META['Service Manual'];
  if (fileType === 'pdf') return TYPE_META['Troubleshooting Guide'];
  if (['png', 'jpg', 'jpeg', 'tiff'].includes(fileType)) return TYPE_META['Wiring Diagram'];
  return { bg: 'from-slate-950 via-slate-900 to-slate-950', dot: 'bg-slate-600', label: 'DOCUMENT' };
}

function StatusBadge({ status }) {
  if (status === 'complete') {
    return (
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Complete</span>
      </div>
    );
  }
  if (status === 'processing') {
    return (
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping"></span>
        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />Processing...
        </span>
      </div>
    );
  }
  return (
    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
      <span className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" />Failed
      </span>
    </div>
  );
}

export default function DocumentLibrary({ onOpenUpload, onSelectDocument }) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchVal, setSearchVal] = useState('');
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setDocs(null);
    setError('');
    listDocuments({ limit: 100 })
      .then((res) => setDocs(res.documents || []))
      .catch((err) => { setError(err.message || 'Failed to load documents'); setDocs([]); });
  };

  useEffect(() => { load(); }, []);

  const filtered = (docs || []).filter((d) => {
    const q = searchVal.toLowerCase();
    if (!q) return true;
    return (
      String(d.filename || '').toLowerCase().includes(q) ||
      String(d.equipment_type || '').toLowerCase().includes(q) ||
      String(d.category || '').toLowerCase().includes(q) ||
      (d.tags || []).some((t) => String(t).toLowerCase().includes(q))
    );
  });

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-6 md:p-8 transition-colors duration-200">
      
      {/* 1. Page Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Technical Documentation Library
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Central repository for technical schematics, maintenance manuals, and diagnostic reports. All documents are automatically indexed by MechMind AI.
        </p>
      </div>

      {/* 2. Control & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 my-6">
        
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by filename, equipment, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 shadow-2xs"
          />
        </div>

        {/* Filter & Sort & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 shadow-2xs transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filter</span>
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenUpload}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

      </div>

      {docs === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
            <span>Loading documents...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-700 dark:text-red-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No documents found.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDocument && onSelectDocument(d.id)}
              className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between hover:shadow-md hover:border-teal-500/40 transition-all text-left"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{d.filename}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {d.equipment_type || '—'} • {d.pages_count || 0} pages • {formatDate(d.uploaded_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">{d.category || (d.file_type || '').toUpperCase()}</span>
                <span className="flex items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">{d.chunks_count || 0} chunks</span>
                <span className={`w-2 h-2 rounded-full ${d.status === 'complete' ? 'bg-emerald-500' : d.status === 'processing' ? 'bg-blue-500 animate-ping' : 'bg-red-500'}`}></span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => {
            const meta = typeMeta(d.category, d.file_type);
            return (
              <div
                key={d.id}
                onClick={() => onSelectDocument && onSelectDocument(d.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className={`h-36 bg-gradient-to-tr ${meta.bg} p-4 relative overflow-hidden flex items-center justify-center border-b border-slate-800`}>
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.4)_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                    <div className={`w-12 h-12 rounded-full ${meta.dot} text-white flex items-center justify-center shadow-lg relative z-10 font-bold font-mono text-xs group-hover:scale-110 transition-transform`}>
                      {d.file_type === 'pdf' ? <FileText className="w-6 h-6" /> : d.file_type === 'docx' ? <FileCode className="w-6 h-6" /> : d.file_type === 'png' || d.file_type === 'jpg' || d.file_type === 'jpeg' ? <Layers className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <span className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-300/80 uppercase">
                      {meta.label}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                        {d.filename}
                      </h3>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(d.uploaded_at)} • {d.pages_count || 0} pages
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {d.equipment_type && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#1E293B] text-white">
                          {d.equipment_type}
                        </span>
                      )}
                      {d.category && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20">
                          {d.category}
                        </span>
                      )}
                      {(d.tags || []).slice(0, 2).map((t) => (
                        <span key={t} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <StatusBadge status={d.status} />
              </div>
            );
          })}

          <div
            onClick={onOpenUpload}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-teal-500 transition-all h-full min-h-[260px] group"
          >
            <div className="w-14 h-14 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-4">
              Drop New Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              PDF, DOCX, or Image formats
            </p>
          </div>
        </div>
      )}

    </div>
  );
}