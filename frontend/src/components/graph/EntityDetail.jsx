import React from 'react';
import { X } from 'lucide-react';
import { ENTITY_COLORS } from '../../types/index.js';

export function EntityDetail({ entity, onClose }) {
  if (!entity) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900">{entity.name}</h3>
          <span
            className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: ENTITY_COLORS[entity.type] || '#64748b' }}
          >
            {(entity.type || 'Equipment').toUpperCase()} · ACTIVE
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg" aria-label="Close entity details">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {entity.properties && (
        <dl className="mt-4 space-y-1.5 text-xs">
          {Object.entries(entity.properties).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-mono font-bold text-slate-800 text-right">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3 text-[11px] text-slate-500">
        Frequency {entity.frequency ?? '—'} · {entity.documentCount ?? 0} documents
      </div>
    </div>
  );
}

export default EntityDetail;
