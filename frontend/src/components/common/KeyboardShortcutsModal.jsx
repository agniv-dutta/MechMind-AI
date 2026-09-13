import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  ['Search documentation', 'Ctrl + K'],
  ['Open this help', 'Alt + H'],
  ['Troubleshooting wizard', 'Alt + T'],
  ['Close dialog', 'Esc'],
];

export default function KeyboardShortcutsModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={onClose}>
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2"><Keyboard className="w-5 h-5 text-teal-600" /><h2 id="keyboard-shortcuts-title" className="text-xl font-bold text-slate-900">Keyboard shortcuts</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close keyboard shortcuts"><X className="w-5 h-5" /></button>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {SHORTCUTS.map(([label, shortcut]) => <div key={shortcut} className="flex items-center justify-between py-3 text-sm text-slate-700"><span>{label}</span><kbd className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">{shortcut}</kbd></div>)}
        </div>
      </section>
    </div>
  );
}
