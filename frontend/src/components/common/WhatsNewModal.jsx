import React from 'react';
import { Sparkles, X } from 'lucide-react';

const UPDATES = ['Document comparison for side-by-side technical review', 'Copyable and highlighted search evidence', 'Print-friendly document and search views for PDF export', 'Guided onboarding, contextual tooltips, and keyboard-shortcut help'];
export default function WhatsNewModal({ open, onClose }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={onClose}><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="whats-new-title" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /><h2 id="whats-new-title" className="text-xl font-bold text-slate-900">What’s new</h2></div><button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close release notes"><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-slate-500">Submission polish update</p><ul className="mt-5 space-y-3">{UPDATES.map((update) => <li key={update} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />{update}</li>)}</ul><button type="button" onClick={onClose} className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Got it</button></section></div>;
}
