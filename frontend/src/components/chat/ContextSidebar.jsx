import React, { useState } from 'react';

export function ContextSidebar({ citations = [] }) {
  const [tab, setTab] = useState('sources');
  const tabs = [
    { id: 'sources', label: 'Sources' },
    { id: 'entities', label: 'Entities' },
    { id: 'history', label: 'History' },
  ];
  return (
    <div className="w-80 bg-white dark:bg-[#0a0e27] border-l border-slate-200 dark:border-teal-500/10 hidden lg:flex flex-col">
      <div className="flex border-b border-slate-200 dark:border-teal-500/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${
              tab === t.id ? 'border-[#00897b] text-teal-400 font-bold' : 'border-transparent text-slate-500 dark:text-[#7a8aaa] hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {tab === 'sources' &&
          (citations.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No sources yet.</p>
          ) : (
            citations.map((c, i) => (
              <div key={i} className="mb-2 p-2 rounded-lg bg-blue-50 dark:bg-[#121f3c] border border-blue-100 dark:border-teal-500/20">
                <div className="font-bold text-blue-900 dark:text-slate-100">{c.sourceDoc}</div>
                <div className="opacity-70 dark:text-slate-300">Page {c.page} · {Math.round((c.confidence || 0) * 100)}%</div>
              </div>
            ))
          ))}
        {tab === 'entities' && (
          <div className="space-y-2">
            {['Centrifugal Pump', 'Inlet Pressure Sensor', 'Relief Valve'].map((e) => (
              <div key={e} className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 font-semibold text-teal-900 dark:text-teal-300">{e}</div>
            ))}
          </div>
        )}
        {tab === 'history' && <p className="text-slate-500 dark:text-slate-400">Conversation history appears here.</p>}
      </div>
    </div>
  );
}

export default ContextSidebar;
