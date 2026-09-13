import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';
import { LANGUAGES, changeLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: 'rgba(255,255,255,0.12)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden z-50"
          style={{ top: 'calc(100% + 4px)' }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                {lang.label}
              </span>
              {lang.code === i18n.language && <Check className="w-3.5 h-3.5 text-teal-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}