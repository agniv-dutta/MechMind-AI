import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading…', size = 'md' }) {
  const dims = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-2 text-slate-500" role="status" aria-live="polite">
      <Loader2 className={`${dims} animate-spin text-teal-500`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
