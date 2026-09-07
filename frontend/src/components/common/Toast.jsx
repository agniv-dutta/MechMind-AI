import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-sky-500" />,
};

export function Toasts() {
  const { toasts, dismiss } = useNotifications();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-80" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/20 rounded-xl shadow-lg p-3 text-sm"
        >
          {ICONS[t.type] || ICONS.info}
          <span className="flex-1 text-slate-800 dark:text-slate-200">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
