import React, { useState } from 'react';
import { Compass, X } from 'lucide-react';

const STEPS = [
  ['Search knowledge', 'Use the global search or Ctrl + K to find manuals, diagrams, and diagnostic evidence.'],
  ['Ask MechMind', 'Open Chat to ask a troubleshooting question and receive citation-backed guidance.'],
  ['Manage documents', 'Upload source material in the Documents library, then compare two documents when needed.'],
  ['Work in the field', 'Use the Troubleshooting Wizard (Alt + T) for a focused diagnostic workflow.'],
];

export default function GuidedTour({ open, onClose }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const [title, description] = STEPS[step];
  const finish = () => { localStorage.setItem('mechmind-tour-complete', 'true'); setStep(0); onClose(); };
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={finish} role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="tour-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-2 text-teal-700"><Compass className="h-5 w-5" /><span className="text-sm font-bold">Getting started</span></div><button type="button" onClick={finish} className="text-slate-400 hover:text-slate-700" aria-label="Close guided tour"><X className="h-5 w-5" /></button></div><p className="mt-7 text-xs font-bold uppercase tracking-widest text-teal-600">Step {step + 1} of {STEPS.length}</p><h2 id="tour-title" className="mt-2 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p><div className="mt-7 flex justify-between"><button type="button" onClick={finish} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Skip tour</button><button type="button" onClick={() => step === STEPS.length - 1 ? finish() : setStep(step + 1)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">{step === STEPS.length - 1 ? 'Finish' : 'Next'}</button></div></section></div>;
}
