import React, { useState } from 'react';
import {
  Boxes, GitBranch, ScanText, Tags, ArrowRight, CircleDot,
} from 'lucide-react';

const TYPE_COLORS = {
  pump: '#0ea5e9',
  valve: '#8b5cf6',
  tank: '#f97316',
  compressor: '#ef4444',
  motor: '#f59e0b',
  sensor: '#10b981',
  controller: '#0d9488',
  filter: '#6366f1',
  junction: '#94a3b8',
  symbol: '#64748b',
  unknown_component: '#94a3b8',
};

function ComponentDetail({ component }) {
  const x0 = component.bbox?.[0];
  const y0 = component.bbox?.[1];
  const x1 = component.bbox?.[2];
  const y1 = component.bbox?.[3];
  return (
    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4" style={{ color: TYPE_COLORS[component.type] || '#94a3b8' }} />
          <span className="font-bold text-slate-900 capitalize text-sm">{component.type}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{component.id}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">{component.shape}</span>
        <span>{Math.round((component.confidence || 0) * 100)}% confidence</span>
      </div>
      {(x0 !== undefined && x1 !== undefined && (
        <div className="mt-1.5 text-[10px] font-mono text-slate-400">
          region ({x0},{y0}) → ({x1},{y1})
        </div>
      ))}
      {component.labels_near?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {component.labels_near.map((label, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono">{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiagramViewer({ diagram }) {
  const [selected, setSelected] = useState(null);
  if (!diagram) return null;

  const components = diagram.components || [];
  const connections = diagram.connections || [];
  const labels = diagram.labels || [];
  const symbols = diagram.symbols || {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-[#00897b]" />
          <h4 className="font-bold text-slate-900">
            Diagram Type: <span className="text-[#00897b] font-mono">{diagram.type?.replaceAll('_', ' ')}</span>
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-[11px] font-bold">
            {components.length} components
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
            {connections.length} connections
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[11px] font-bold">
            {labels.length} labels
          </span>
        </div>
      </div>

      {diagram.extracted_data?.summary && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
          {diagram.extracted_data.summary}
        </p>
      )}

      {Object.keys(symbols).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Tags className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
          {Object.entries(symbols).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize"
              style={{ background: `${TYPE_COLORS[type] || '#94a3b8'}18`, color: TYPE_COLORS[type] || '#475569' }}
            >
              {type.replaceAll('_', ' ')} × {count}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Components */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
          <h5 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
            <CircleDot className="w-4 h-4 text-sky-500" />
            Components Found ({components.length})
          </h5>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {components.length === 0 && <p className="text-xs text-slate-400">No components detected.</p>}
            {components.map((comp, idx) => (
              <button
                key={idx}
                onClick={() => setSelected(selected?.id === comp.id ? null : comp)}
                className={`w-full text-left rounded-xl border transition-all ${
                  selected?.id === comp.id ? 'border-sky-400 ring-2 ring-sky-200' : 'border-transparent'
                }`}
              >
                <ComponentDetail component={comp} />
              </button>
            ))}
          </div>
        </div>

        {/* Connections */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <h5 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-emerald-500" />
            Connections ({connections.length})
          </h5>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {connections.length === 0 && <p className="text-xs text-slate-400">No connections detected.</p>}
            {connections.map((conn, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-bold capitalize text-slate-900">{conn.from_type}</span>
                  <span className="font-mono text-slate-400">{conn.from}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span className="font-bold capitalize text-slate-900">{conn.to_type}</span>
                  <span className="font-mono text-slate-400">{conn.to}</span>
                </span>
                <span className="ml-2 text-[10px] font-mono text-slate-400">
                  {conn.line_type} · {conn.flow_direction}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
          <h5 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
            <ScanText className="w-4 h-4 text-purple-500" />
            Extracted Labels ({labels.length})
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((label, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-xs font-mono">
                {label.text}
                <span className="ml-1.5 text-[10px] text-purple-500">({Math.round((label.confidence || 0) * 100)}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selected component details */}
      {selected && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400">
          <h4 className="font-semibold text-sm text-amber-800 mb-2">Component Details — {selected.id}</h4>
          <pre className="text-[11px] mt-2 overflow-auto text-amber-900 max-h-48">{JSON.stringify(selected, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}