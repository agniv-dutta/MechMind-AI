import React, { useState } from 'react';

// Table-format alternative to the canvas graph (Prompt 2, Frame 6).
export function GraphTableView({ nodes = [], edges = [], onSelectNode }) {
  const [tab, setTab] = useState('entities');
  const [q, setQ] = useState('');

  const filteredNodes = nodes.filter((n) => (n.name || n.label || n.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-teal-500/10">
        {['entities', 'relationships'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-bold capitalize border-b-2 ${tab === t ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500'}`}
          >
            {t}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search table…"
          className="m-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-teal-500/20 bg-white dark:bg-slate-800 w-40"
        />
      </div>
      <div className="overflow-x-auto">
        {tab === 'entities' ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-teal-500/10">
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Documents</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((n) => (
                <tr key={n.id} onClick={() => onSelectNode?.(n)} className="border-b border-slate-100 dark:border-teal-500/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                  <td className="p-3 font-bold text-teal-700">{n.name || n.label || n.id}</td>
                  <td className="p-3">{n.type}</td>
                  <td className="p-3 font-mono">{n.frequency ?? '—'}</td>
                  <td className="p-3 font-mono">{n.documentCount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-teal-500/10">
                <th className="p-3">Entity 1</th>
                <th className="p-3">Relationship</th>
                <th className="p-3">Entity 2</th>
                <th className="p-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((e, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-teal-500/10">
                  <td className="p-3 font-semibold">{e.entity1 || e.source}</td>
                  <td className="p-3 font-mono">{e.type}</td>
                  <td className="p-3 font-semibold">{e.entity2 || e.target}</td>
                  <td className="p-3 font-mono">{e.confidence != null ? `${Math.round(e.confidence * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GraphTableView;
