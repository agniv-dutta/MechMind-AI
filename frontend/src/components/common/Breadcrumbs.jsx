import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500">
    <Home className="w-3.5 h-3.5" aria-hidden="true" />
    {items.map((item, index) => <React.Fragment key={item.label}><ChevronRight className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />{item.onClick && index < items.length - 1 ? <button type="button" onClick={item.onClick} className="hover:text-teal-700 hover:underline">{item.label}</button> : <span className={index === items.length - 1 ? 'font-semibold text-slate-700' : ''}>{item.label}</span>}</React.Fragment>)}
  </nav>;
}
