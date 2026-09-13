import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Phone, Share2, Wrench, BookOpen, Search, Database, Wifi, WifiOff, FileText, ChevronRight } from 'lucide-react';
import { WIZARD_EQUIPMENT } from '../utils/constants.js';
import { useChat } from '../hooks/useChat.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { offlineStorage } from '../services/offlineStorage.js';

export function FieldAssistancePage() {
  const { t } = useTranslation();
  const [symptom, setSymptom] = useState('');
  const [equipment, setEquipment] = useState('pump');
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [cachedDocs, setCachedDocs] = useState([]);
  const [quickSearch, setQuickSearch] = useState('');
  const { messages, loading, sendMessage } = useChat();

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  const refreshCachedDocs = () => {
    offlineStorage.getDocuments().then(setCachedDocs).catch(() => setCachedDocs([]));
  };

  useEffect(() => {
    refreshCachedDocs();
  }, []);

  const ask = () => {
    if (!symptom.trim()) return;
    sendMessage(`[${equipment}] ${symptom}`).catch(() => {});
    setSymptom('');
  };

  const results = useMemo(() => {
    const query = quickSearch.trim().toLowerCase();
    if (!query) return [];
    return cachedDocs
      .filter((doc) => {
        const haystack = `${doc.filename || ''} ${doc.equipment_type || ''} ${doc.category || ''} ${doc.content || ''}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [quickSearch, cachedDocs]);

  const handleQuickSelect = (label) => {
    setQuickSearch(label);
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-3xl mx-auto w-full"
      style={{ background: '#f8fafc' }}
    >
      {/* Online / offline status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('field.title')}</h1>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            offline
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
          }`}
        >
          {offline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          {offline ? t('field.offline_mode') : t('field.online_mode')}
        </span>
      </div>

      {offline && (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-3">
          <Database className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t('field.offline_banner')}</span>
        </div>
      )}

      {/* Quick search over cached documents */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> {t('field.quick_search', { count: cachedDocs.length })}
        </label>
        <input
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder={t('field.search_placeholder')}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
        />
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {doc.filename}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {(doc.content_preview || doc.content || 'No cached text — open the document online once to cache it.').slice(0, 180)}
                  </p>
                  {doc.equipment_type && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-mono">{doc.equipment_type}</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
        {quickSearch.trim() && results.length === 0 && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> No cached documents match “{quickSearch}”.
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {WIZARD_EQUIPMENT.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setEquipment(e.id);
              handleQuickSelect(e.title);
            }}
            className={`shrink-0 px-4 py-3 rounded-2xl border text-left min-w-40 ${
              equipment === e.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'
            }`}
          >
            <Wrench className="w-5 h-5 text-teal-600 mb-1" />
            <p className="text-xs font-bold">{e.title}</p>
            <p className="text-[10px] text-slate-500">{e.subtitle}</p>
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('field.whats_wrong')}</label>
        <div className="flex gap-2">
          <input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder={t('field.symptom_placeholder')}
            className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
          />
          <button className="p-2.5 rounded-xl border border-slate-200" title="Take photo of equipment" aria-label="Take photo">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <button onClick={ask} disabled={loading || !symptom.trim()} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-60 min-h-12">
          {loading ? t('field.diagnosing') : t('field.get_fix')}
        </button>
        <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
          <button className="py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 min-h-12">
            <BookOpen className="w-3.5 h-3.5" /> {t('field.offline_manual')}
          </button>
          <button className="py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 min-h-12">
            <Phone className="w-3.5 h-3.5" /> {t('field.call_support')}
          </button>
          <button className="py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 min-h-12">
            <Share2 className="w-3.5 h-3.5" /> {t('field.share')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <LoadingSpinner label="MechMind is diagnosing…" />}
        {messages.slice(-4).map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-slate-900 text-white ml-8' : 'bg-white border border-slate-200'
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