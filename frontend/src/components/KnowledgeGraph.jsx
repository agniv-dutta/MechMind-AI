import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  FileText, 
  Layers, 
  Wrench, 
  Activity,
  Loader2,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import { getKGVisualization, getKGStatistics, getKGEntity } from '../lib/api';

const SVG_W = 1200;
const SVG_H = 760;

function computeLayout(nodes) {
  if (!nodes || nodes.length === 0) return [];
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const baseRadius = Math.min(SVG_W, SVG_H) * 0.34;
  const maxSize = Math.max(...nodes.map((n) => n.size || 1), 1);
  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const radius = node.size === maxSize && maxSize > 2 ? baseRadius * 0.72 : baseRadius;
    return {
      ...node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

const TYPE_COLORS = {
  Equipment: '#f59e0b',
  Component: '#6366f1',
  System: '#22d3ee',
  Property: '#34d399',
  Procedure: '#a78bfa',
};

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [zoom, setZoom] = useState(100);

  const loadGraph = () => {
    setLoading(true);
    setError('');
    Promise.all([
      getKGVisualization(),
      getKGStatistics().catch(() => null),
    ])
      .then(([viz, statsRes]) => {
        setNodes(viz.nodes || []);
        setEdges(viz.edges || []);
        setStats(statsRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load knowledge graph');
        setLoading(false);
      });
  };

  useEffect(() => { loadGraph(); }, []);

  const layout = useMemo(() => computeLayout(nodes), [nodes]);

  const position = (id) => layout.find((n) => (n.id === id || n.label === id));

  const selectNode = (id) => {
    setSelectedId(id);
    setSelectedDetail(null);
    const node = nodes.find((n) => n.id === id) || layout.find((n) => n.id === id);
    if (!node) return;
    getKGEntity(node.id)
      .then((detail) => setSelectedDetail(detail))
      .catch(() => setSelectedDetail(null));
  };

  const filtered = searchVal
    ? layout.filter((n) => (n.label || n.id).toLowerCase().includes(searchVal.toLowerCase()))
    : layout;

  const relatedEdges = useMemo(() => {
    if (!selectedId) return [];
    return edges.filter((e) => e.source === selectedId || e.target === selectedId);
  }, [edges, selectedId]);

  const selected = layout.find((n) => n.id === selectedId) || null;
  const selectedNode = selectedDetail || selected;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      
      {/* 1. Page Header & Control Toolbar */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Knowledge Graph
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {stats
                ? `${stats.total_entities} entities • ${stats.total_relationships} relationships`
                : 'Equipment Relationships & Dependencies'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setZoom(100); setSelectedId(null); setSelectedDetail(null); }}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors" title="Legend">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Legend</span>
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search entities..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          <div className="flex items-center space-x-2">
            {Object.entries(TYPE_COLORS).map(([t, color]) => (
              <span key={t} className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></span>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                <span>Rendering knowledge graph...</span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-sm text-slate-300">{error}</p>
              <button onClick={loadGraph} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700">Retry</button>
            </div>
          )}

          {!loading && !error && layout.length > 0 && (
            <div
              className="w-full h-full max-w-4xl max-h-[650px] relative transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="meet">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="17" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                  </marker>
                  <marker id="arrow-teal" viewBox="0 0 10 10" refX="17" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#5EEAD4" />
                  </marker>
                </defs>
                {edges.map((e, i) => {
                  const s = position(e.source);
                  const t = position(e.target);
                  if (!s || !t) return null;
                  const isActive = e.source === selectedId || e.target === selectedId;
                  return (
                    <line
                      key={`${e.source}-${e.target}-${i}`}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isActive ? '#5EEAD4' : '#64748b'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      strokeDasharray={isActive ? 'none' : '4 4'}
                      markerEnd={isActive ? 'url(#arrow-teal)' : 'url(#arrow)'}
                      opacity={selectedId && !isActive ? 0.2 : 0.85}
                    />
                  );
                })}
              </svg>

              {filtered.map((node) => {
                const isSelected = node.id === selectedId;
                const color = TYPE_COLORS[node.type] || node.color || '#6366f1';
                const size = (node.size || 1) > 3 ? 80 : (node.size || 1) > 1 ? 60 : 44;
                return (
                  <div
                    key={node.id}
                    onClick={() => selectNode(node.id)}
                    className="absolute flex flex-col items-center cursor-pointer group z-10 transition-opacity"
                    style={{ left: `${(node.x / SVG_W) * 100}%`, top: `${(node.y / SVG_H) * 100}%`, transform: 'translate(-50%, -50%)', opacity: selectedId && !isSelected ? 0.35 : 1 }}
                  >
                    <div
                      className="flex items-center justify-center font-bold text-slate-950 shadow-lg ring-4 transition-transform group-hover:scale-110 rounded-full"
                      style={{ width: size, height: size, background: color, boxShadow: `0 0 18px ${color}55` }}
                    >
                      {node.type === 'Equipment' ? <Wrench className="w-5 h-5" /> : node.type === 'Component' ? <Layers className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <span className={`mt-1.5 text-[10px] font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-center ${isSelected ? 'border-teal-400 text-teal-300' : 'text-slate-200'}`}>
                      {node.label}
                    </span>
                  </div>
                );
              })}

              {!searchVal && (
                <div className="absolute bottom-0 left-0 w-full text-center text-[10px] font-mono text-slate-500">
                  {edges.length} RELATIONSHIPS • {nodes.length} ENTITIES
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-6 left-6 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-lg z-20 space-y-1 backdrop-blur-xs">
            <button onClick={() => setZoom(prev => Math.min(prev + 10, 140))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(prev => Math.max(prev - 10, 70))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(100)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Node Inspector */}
        <div className="w-full md:w-[340px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 space-y-5 overflow-y-auto shrink-0 transition-colors duration-200">
          {!selectedNode ? (
            <div className="text-center py-10 space-y-2">
              <BarChart2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Select an entity node to inspect its relationships and source documents.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1E293B] text-white uppercase tracking-wider">
                    {(selectedNode.type || 'Entity').toUpperCase()}
                  </span>
                  <button onClick={() => { setSelectedId(null); setSelectedDetail(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 pt-1">
                  {selectedNode.label || selectedNode.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedNode.id || selectedNode.name}
                </p>
              </div>

              {selectedDetail && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">PROPERTIES</span>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-2 text-xs border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Description</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-right max-w-[70%]">{selectedDetail.properties?.description || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Frequency</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedDetail.frequency ?? (selectedDetail.properties?.frequency ?? '—')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Documents</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedDetail.documents?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">RELATED ENTITIES</span>
                <div className="space-y-2 text-xs">
                  {(relatedEdges.length === 0) && <p className="text-slate-400 text-xs">No connected entities.</p>}
                  {relatedEdges.map((e, i) => {
                    const otherId = e.source === selectedId ? e.target : e.source;
                    const other = layout.find((n) => n.id === otherId) || layout.find((n) => n.label === otherId);
                    const color = TYPE_COLORS[other?.type] || '#6366f1';
                    return (
                      <button
                        key={i}
                        onClick={() => selectNode(otherId)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-teal-500/50 text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{other?.label || otherId}</span>
                        </div>
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">{e.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDetail?.documents?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">SOURCE DOCUMENTS</span>
                  {selectedDetail.documents.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-2.5 text-xs">
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{d.doc_id}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Pages: {d.pages?.join(', ') || '—'} • {d.mentions_count} mentions</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
}