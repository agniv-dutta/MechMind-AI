import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Droplet,
  Loader2,
  AlertTriangle,
  Printer,
  Shield,
  Cpu,
  CircuitBoard,
  Waypoints
} from 'lucide-react';
import { getDocument, getDocumentPage, listDocuments, deleteDocument } from '../lib/api';

const TYPE_ICONS = {
  Equipment: Printer,
  Component: CircuitBoard,
  System: Layers,
  Property: Droplet,
  Procedure: Cpu,
};

export default function DocumentDetails({ documentId, onBack, onDelete }) {
  const [activeTab, setActiveTab] = useState('entities');
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [doc, setDoc] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pageText, setPageText] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    setDoc(null);
    setError('');
    setActivePage(1);
    Promise.all([
      getDocument(documentId),
      listDocuments({ limit: 200 }).catch(() => ({ documents: [] })),
    ])
      .then(([detail, list]) => {
        setDoc(detail);
        setSummary(list.documents.find((d) => d.id === documentId) || null);
      })
      .catch((err) => setError(err.message || 'Failed to load document details'));
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    setPageLoading(true);
    getDocumentPage(documentId, activePage)
      .then((p) => setPageText(p.text_content || ''))
      .catch(() => setPageText(''))
      .finally(() => setPageLoading(false));
  }, [documentId, activePage]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${summary?.filename || doc?.filename}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteDocument(documentId);
      if (onDelete) onDelete(documentId);
      else if (onBack) onBack();
    } catch (err) {
      setError(err.message || 'Delete failed');
      setDeleting(false);
    }
  };

  if (!documentId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100/60 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Select a document to view details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100/60 dark:bg-slate-950 space-y-4 p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Back to Library</button>
      </div>
    );
  }

  if (doc === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100/60 dark:bg-slate-950">
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  const pageCount = summary?.pages_count || 1;
  const meta = doc?.metadata || {};
  const entities = doc?.entities || [];
  const relationships = doc?.relationships || [];
  const tags = summary?.tags || meta.tags || [];
  const status = summary?.status || (doc?.processed_at ? 'complete' : 'complete');
  const iconFor = (type) => TYPE_ICONS[type] || Shield;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {doc.filename}
                  </h1>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1 font-mono">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    <span>{doc.file_type?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{pageCount} pages</span>
                    <span>•</span>
                    <span>{summary?.equipment_type || meta.equipment_type || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border ${
                  status === 'complete'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-500/20'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${status === 'complete' ? 'bg-emerald-500' : 'bg-teal-500 animate-ping'}`}></span>
                  <span>{status === 'complete' ? 'Complete' : 'Processing'}</span>
                </div>
                <button onClick={handleDelete} disabled={deleting} className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 p-2 rounded-lg transition-colors" title="Delete document">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left viewer */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 relative min-h-[600px] flex flex-col justify-between border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    Page {activePage} of {pageCount}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold font-mono shadow-2xs">
                    {entities.length} ENTITIES
                  </span>
                </div>

                <div className="my-6 flex-1 flex items-center justify-center relative">
                  <div
                    className="w-full max-w-xl aspect-[3/4] bg-slate-50 dark:bg-slate-950 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-y-auto"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  >
                    {pageLoading ? (
                      <div className="space-y-3">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-11/12 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                      </div>
                    ) : pageText ? (
                      <>
                        <div className="text-[10px] font-mono text-slate-400 mb-2">TEXT EXTRACTION // PAGE {activePage}</div>
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">{pageText}</pre>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                        <p className="text-xs text-slate-400 dark:text-slate-500">No text content extracted for this page.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-20 right-6 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg z-10 space-y-1">
                  <button onClick={() => setZoomLevel(prev => Math.min(prev + 10, 140))} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => setZoomLevel(prev => Math.max(prev - 10, 70))} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={() => setZoomLevel(100)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 overflow-x-auto p-2 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800 z-10">
                  {Array.from({ length: pageCount }).slice(0, 12).map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setActivePage(pg)}
                        className={`relative w-12 h-16 rounded-lg border-2 flex items-center justify-center font-mono text-xs transition-all ${
                          activePage === pg
                            ? 'border-teal-500 bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'
                        }`}
                      >
                        <span className="absolute top-1 left-1.5 text-[9px] font-bold">{pg}</span>
                        <FileText className="w-4 h-4 opacity-40" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right panel */}
              <div className="w-full lg:w-[360px] space-y-4 shrink-0">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Extraction Summary</h3>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{entities.length}</span>
                      <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">ENTITY ITEMS</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 font-mono">{relationships.length}</span>
                      <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">RELATIONSHIPS</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Metadata</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">EQUIPMENT</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{summary?.equipment_type || meta.equipment_type || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CATEGORY</span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{summary?.category || meta.category || '—'}</p>
                    </div>
                    <div className="space-y-0.5 pt-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">VERSION</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{summary?.version || meta.version || '—'}</p>
                    </div>
                    <div className="space-y-0.5 pt-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CHUNKS</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{summary?.chunks_count ?? meta.chunks_count ?? '—'}</p>
                    </div>
                  </div>
                  {(tags.length > 0) && (
                    <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">TAGS</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Waypoints className="w-4 h-4 text-teal-500" />
                    Extracted Knowledge Entities
                  </h3>
                  <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                    {['entities', 'relationships', 'preview'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`pb-2 pr-4 uppercase tracking-wider border-b-2 transition-colors ${
                          activeTab === t
                            ? 'border-teal-500 text-teal-600 dark:text-teal-300'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t === 'entities' ? `Entities (${entities.length})` : t === 'relationships' ? `Relationships (${relationships.length})` : 'Preview'}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'entities' && (
                    <div className="space-y-2 pt-1">
                      {entities.length === 0 && <p className="text-xs text-slate-400">No entities extracted.</p>}
                      {entities.map((item, idx) => {
                        const Icon = iconFor(item.type);
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-3 shadow-2xs hover:border-teal-500/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {item.type} • {item.page && `Page ${item.page}`}{item.confidence ? ` • ${Math.round(item.confidence * 100)}%` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'relationships' && (
                    <div className="space-y-2 pt-1">
                      {relationships.length === 0 && <p className="text-xs text-slate-400">No relationships extracted.</p>}
                      {relationships.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{r.source}</span>
                          <span className="mx-2 px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-300 font-mono text-[10px]">{r.type}</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{r.target}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'preview' && (
                    <div className="pt-1">
                      {doc.content_preview ? (
                        <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3 max-h-64 overflow-y-auto font-sans">{doc.content_preview}</pre>
                      ) : (
                        <p className="text-xs text-slate-400">No preview available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
      </div>
    );
}