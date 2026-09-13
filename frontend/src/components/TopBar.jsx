import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Cpu,
  ChevronDown,
  Upload,
  Sparkles,
  Keyboard,
  Compass,
  Bell,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function TopBar({
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenWizard,
  onOpenKeyboardShortcuts,
  onOpenTour,
  onOpenWhatsNew,
}) {
  const { t } = useTranslation();
  return (
    <header
      className="topbar flex items-center justify-between shrink-0 z-20"
      style={{
        height: '56px',
        padding: '0 20px',
        background: 'linear-gradient(90deg, #1a237e 0%, #1e293b 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* ── Left: Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3" style={{ minWidth: '190px' }}>
        <div
          className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white shadow-md relative"
          style={{ width: '34px', height: '34px', flexShrink: 0 }}
        >
          <Cpu className="w-4 h-4 animate-pulse-subtle" />
          {/* Green online status dot */}
          <span
            className="absolute"
            style={{
              top: '-2px', right: '-2px',
              width: '9px', height: '9px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #1a237e',
            }}
          />
        </div>
        <span
          className="font-bold tracking-tight text-white"
          style={{ fontSize: '17px', letterSpacing: '-0.02em' }}
        >
          MechMind AI
        </span>
      </div>

      {/* ── Center: Global Search ─────────────────────────────────── */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/50" />
          </div>
          <input
            type="text"
            id="global-search-input"
            aria-label="Search system documentation and manuals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('topbar.search_placeholder')}
            className="w-full focus:outline-none transition-all"
            style={{
              height: '36px',
              paddingLeft: '36px',
              paddingRight: '48px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#ffffff',
              fontSize: '13.5px',
              caretColor: '#00bcd4',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.18)';
              e.target.style.border = '1px solid rgba(0,188,212,0.6)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.border = '1px solid rgba(255,255,255,0.18)';
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <kbd
              className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]"
              aria-hidden="true"
            >
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Right: Action Buttons & Profile ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onOpenTour} className="hidden lg:flex items-center justify-center rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="Start guided tour" title="Guided tour"><Compass className="w-4 h-4" /></button>
        <button type="button" onClick={onOpenWhatsNew} className="hidden lg:flex items-center justify-center rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white" aria-label="View what’s new" title="What’s new"><Bell className="w-4 h-4" /></button>
        <button
          type="button"
          onClick={onOpenKeyboardShortcuts}
          className="hidden lg:flex items-center justify-center rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts (Alt + H)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
        {/* Troubleshooting Wizard Action Button */}
        <button
          onClick={onOpenWizard}
          aria-label="Open troubleshooting wizard"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{t('topbar.wizard')}</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          aria-label="Upload documentation"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
          style={{
            background: 'linear-gradient(135deg, #00acc1, #00897b)',
            color: '#ffffff',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t('topbar.upload_docs')}</span>
        </button>

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* User avatar + name */}
        <div
          className="flex items-center gap-2 pl-2.5 cursor-pointer"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div
            className="rounded-full flex items-center justify-center font-bold text-white overflow-hidden shadow-sm"
            style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #00bcd4, #00897b)',
              fontSize: '12px',
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.8)',
            }}
          >
            JD
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/60 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
