import React, { useState } from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph.jsx';
import { KnowledgeGraphView } from '../components/graph/KnowledgeGraphView.jsx';
import { EntityDetail } from '../components/graph/EntityDetail.jsx';
import { useGraph } from '../hooks/useGraph.js';

export function GraphPage() {
  const { nodes, edges, selected, setSelected, query, loading } = useGraph();
  const [q, setQ] = useState('');

  const runQuery = async () => {
    if (!q.trim()) return;
    try {
      await query(q.trim(), { depth: 2 });
    } catch {}
  };

  // If the service-backed graph has data, show interactive canvas + detail;
  // otherwise fall back to the existing rich KnowledgeGraph component.
  const hasData = nodes.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runQuery()}
          placeholder="Search entities… (e.g. Centrifugal Pump)"
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
        />
        <button onClick={runQuery} disabled={loading} className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold disabled:opacity-60">
          {loading ? 'Querying…' : 'Query Graph'}
        </button>
      </div>
      {hasData ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
          <KnowledgeGraphView nodes={nodes} edges={edges} onNodeClick={setSelected} />
          <EntityDetail entity={selected} onClose={() => setSelected(null)} />
        </div>
      ) : (
        <KnowledgeGraph />
      )}
    </div>
  );
}

export default GraphPage;
