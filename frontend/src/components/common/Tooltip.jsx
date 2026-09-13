import React from 'react';
import { CircleHelp } from 'lucide-react';

export default function Tooltip({ text, label = 'More information' }) {
  return <span className="group relative inline-flex align-middle"><CircleHelp className="h-3.5 w-3.5 cursor-help text-slate-400" aria-label={label} tabIndex={0} /><span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{text}</span></span>;
}
