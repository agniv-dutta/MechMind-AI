import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Sun, 
  Moon, 
  Monitor, 
  Sliders, 
  Check, 
  Cpu, 
  Trash2, 
  Save, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

export default function GeneralSettings({ onBackToDashboard, onNavigateSettings, darkMode, setDarkMode }) {
  const [themeMode, setThemeMode] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [searchMode, setSearchMode] = useState('hybrid');
  const [language, setLanguage] = useState('English (US)');

  const menuItems = [
    { id: 'settings', label: 'General' },
    { id: 'ai', label: 'AI Configuration' },
    { id: 'search_settings', label: 'Search Settings' },
    { id: 'data', label: 'Data & Privacy' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div
      className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-[#0a0e27] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
      style={{
        background: darkMode ? 'linear-gradient(#0a0e27, #1a2456)' : '#f8f9fa',
        padding: '24px',
      }}
    >
      
      {/* 1. Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-teal-500/10 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 dark:bg-teal-500 dark:text-slate-950 font-bold text-xs flex items-center justify-center">
            JD
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        General Settings
      </h1>

      {/* Main Settings Layout (Left Menu + Center Panels + Right Inspector) */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* 2. Left Settings Menu Sidebar (~200px width) */}
        <aside className="w-full md:w-[200px] space-y-1 shrink-0">
          <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 px-3">
            <SettingsIcon className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigateSettings && onNavigateSettings(item.id)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  item.id === 'settings'
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* 3. Main Content Area (Center Panels) */}
        <div className="flex-1 space-y-6">
          
          {/* Card 1: Appearance & Locale */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-teal-500/10 pb-3">
              <Globe className="w-5 h-5 text-teal-500" />
              <h2>Appearance & Locale</h2>
            </div>

            {/* INTERFACE THEME Selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                INTERFACE THEME
              </span>
              <div className="grid grid-cols-3 gap-4">
                
                {/* 1. Light (Selected) */}
                <div
                  onClick={() => { setThemeMode('light'); setDarkMode(false); }}
                  className={`p-4 rounded-xl text-center cursor-pointer relative transition-all ${
                    themeMode === 'light'
                      ? 'border-2 border-slate-900 dark:border-teal-400 bg-slate-50 dark:bg-slate-800 shadow-xs'
                      : 'border border-slate-200 dark:border-teal-500/10 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  {themeMode === 'light' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 dark:bg-teal-400 text-white dark:text-slate-950 flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <Sun className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Light</span>
                </div>

                {/* 2. Dark */}
                <div
                  onClick={() => { setThemeMode('dark'); setDarkMode(true); }}
                  className={`p-4 rounded-xl text-center cursor-pointer relative transition-all ${
                    themeMode === 'dark'
                      ? 'border-2 border-slate-900 dark:border-teal-400 bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-teal-500/10 bg-slate-900 text-slate-300'
                  }`}
                >
                  {themeMode === 'dark' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <Moon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs font-bold block">Dark</span>
                </div>

                {/* 3. System */}
                <div
                  onClick={() => setThemeMode('system')}
                  className={`p-4 rounded-xl text-center cursor-pointer relative transition-all ${
                    themeMode === 'system'
                      ? 'border-2 border-slate-900 dark:border-teal-400 bg-slate-200 text-slate-900 shadow-xs'
                      : 'border border-slate-200 dark:border-teal-500/10 bg-slate-200/60 text-slate-500'
                  }`}
                >
                  {themeMode === 'system' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <Monitor className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <span className="text-xs font-bold block">System</span>
                </div>

              </div>
            </div>

            {/* SYSTEM LANGUAGE Selection */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                SYSTEM LANGUAGE
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 appearance-none focus:outline-none"
                >
                  <option>English (US)</option>
                  <option>German (Deutsch)</option>
                  <option>Japanese (日本語)</option>
                  <option>Spanish (Español)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
              <p className="text-xs text-slate-400 font-mono italic">
                Requires system restart to apply fully to NLP models.
              </p>
            </div>
          </div>

          {/* Card 2: Behavior & Notifications */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-teal-500/10 pb-3">
              <Sliders className="w-5 h-5 text-teal-500" />
              <h2>Behavior & Notifications</h2>
            </div>

            {/* Setting Row 1: Enable system notifications */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-teal-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Enable system notifications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Receive alerts for completed diagnostics, AI model updates, and critical system errors.
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${
                  notifications ? 'bg-[#00897b]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Setting Row 2: Auto-save diagnostic sessions */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-teal-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Auto-save diagnostic sessions
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Automatically persist chat history and telemetry data every 30 seconds.
                </p>
              </div>
              <button
                onClick={() => setAutosave(!autosave)}
                className={`w-12 h-6 rounded-full transition-colors p-1 ${
                  autosave ? 'bg-[#00897b]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autosave ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* DEFAULT SEARCH MODE Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                DEFAULT SEARCH MODE
              </label>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 max-w-md">
                {['semantic', 'keyword', 'hybrid'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSearchMode(mode)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                      searchMode === mode
                        ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {mode === 'hybrid' ? 'Hybrid (Fast)' : mode === 'keyword' ? 'Aa Keyword' : 'Semantic'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-mono italic">
                Hybrid balances speed with contextual accuracy for large documentation sets.
              </p>
            </div>
          </div>

          {/* 5. Sticky Bottom Action Bar */}
          <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border border-slate-200 dark:border-teal-500/10 rounded-2xl p-4 flex items-center justify-between shadow-lg sticky bottom-4 z-30">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase">
                UNSAVED CHANGES
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors">
                RESET TO DEFAULTS
              </button>
              <button className="bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all">
                <Save className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </button>
            </div>
          </div>

        </div>

        {/* 4. Right Inspector Sidebar (~300px width) */}
        <div className="w-full md:w-[300px] space-y-6 shrink-0">
          
          {/* Card 1: System Status */}
          <div className="bg-[#18224B] dark:bg-[#0f172a] text-white rounded-2xl p-5 relative overflow-hidden shadow-md space-y-4 border border-indigo-900/50">
            <div className="flex items-center space-x-2 font-bold text-base">
              <Cpu className="w-5 h-5 text-teal-300" />
              <span>System Status</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Core API</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  24ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">NLP Engine</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  112ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Sync Service</span>
                <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  Syncing...
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Storage Usage */}
          <div className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Storage Usage
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">65GB Used</span>
                <span className="text-slate-400 font-mono">100GB Total</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#18224B] dark:bg-indigo-500" style={{ width: '45%' }}></div>
                <div className="h-full bg-teal-500" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18224B] dark:bg-indigo-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Diagnostic Logs</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">45GB</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Indexed Docs</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">20GB</span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-xs py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-4">
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR LOCAL CACHE</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
