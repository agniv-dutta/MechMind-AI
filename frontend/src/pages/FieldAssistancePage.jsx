import React, { useState } from 'react';
import { Camera, Phone, Share2, Wrench, BookOpen } from 'lucide-react';
import { WIZARD_EQUIPMENT } from '../utils/constants.js';
import { useChat } from '../hooks/useChat.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export function FieldAssistancePage({ darkMode }) {
  const [symptom, setSymptom] = useState('');
  const [equipment, setEquipment] = useState('pump');
  const { messages, loading, sendMessage } = useChat();

  const ask = () => {
    if (!symptom.trim()) return;
    sendMessage(`[${equipment}] ${symptom}`).catch(() => {});
    setSymptom('');
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-3xl mx-auto w-full"
      style={{ background: darkMode ? 'linear-gradient(#0a0e27, #1a2456)' : '#f8f9fa' }}
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quick Troubleshooting</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {WIZARD_EQUIPMENT.map((e) => (
          <button
            key={e.id}
            onClick={() => setEquipment(e.id)}
            className={`shrink-0 px-4 py-3 rounded-2xl border text-left min-w-40 ${
              equipment === e.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10' : 'border-slate-200 dark:border-teal-500/20 bg-white dark:bg-[#0f172a]'
            }`}
          >
            <Wrench className="w-5 h-5 text-teal-600 mb-1" />
            <p className="text-xs font-bold">{e.title}</p>
            <p className="text-[10px] text-slate-500">{e.subtitle}</p>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">What&apos;s wrong?</label>
        <div className="flex gap-2">
          <input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder="Describe the symptom…"
            className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-teal-500/20 bg-white dark:bg-slate-800"
          />
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-teal-500/20" title="Take photo of equipment" aria-label="Take photo">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <button onClick={ask} disabled={loading || !symptom.trim()} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-60 min-h-12">
          {loading ? 'Diagnosing…' : 'Get Quick Fix'}
        </button>
        <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
          <button className="py-2.5 rounded-xl border border-slate-200 dark:border-teal-500/20 flex items-center justify-center gap-1.5 min-h-12">
            <BookOpen className="w-3.5 h-3.5" /> Offline manual
          </button>
          <button className="py-2.5 rounded-xl border border-slate-200 dark:border-teal-500/20 flex items-center justify-center gap-1.5 min-h-12">
            <Phone className="w-3.5 h-3.5" /> Call support
          </button>
          <button className="py-2.5 rounded-xl border border-slate-200 dark:border-teal-500/20 flex items-center justify-center gap-1.5 min-h-12">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <LoadingSpinner label="MechMind is diagnosing…" />}
        {messages.slice(-4).map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-slate-900 text-white ml-8' : 'bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10'
            }`}
          >
            {m.role === 'assistant' && (
              <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                ⚠ Follow lockout-tagout before touching rotating equipment.
              </p>
            )}
            <p className="whitespace-pre-wrap text-base">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FieldAssistancePage;
