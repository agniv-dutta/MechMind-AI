import React from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Cpu, 
  Bell, 
  Upload,
  Wrench
} from 'lucide-react';

export default function TopBar({ 
  darkMode, 
  setDarkMode, 
  searchQuery, 
  setSearchQuery, 
  onOpenUpload,
  onOpenWizard 
}) {
  return (
    <header 
      className="border-b border-slate-200 dark:border-teal-500/10 bg-white dark:bg-gradient-to-r dark:from-[#1a2456] dark:via-[#1a3a52] dark:to-[#1a3a52] px-4 md:px-6 flex items-center justify-between z-20 shrink-0 transition-colors duration-200 shadow-sm"
      style={{ 
        height: '64px',
        borderBottom: darkMode ? '1px solid rgba(0,137,123,0.1)' : '1px solid #dee2e6',
        boxShadow: darkMode ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        padding: '0 24px',
        backgroundColor: darkMode ? 'transparent' : '#ffffff',
      }}
    >
      {/* Left: Logo */}
      <div 
        className="flex items-center space-x-3"
        style={{ width: '200px' }}
      >
        <div 
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a2456] to-[#00897b] text-white shadow-md shadow-teal-500/20 group cursor-pointer"
          onMouseEnter={(e) => e.currentTarget.querySelector('svg').classList.add('animate-rotate-gear')}
          onMouseLeave={(e) => e.currentTarget.querySelector('svg').classList.remove('animate-rotate-gear')}
        >
          <Cpu className="w-5 h-5 animate-pulse-subtle" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-white dark:border-[#0a0e27]"></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span 
              className="font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 dark:from-white dark:via-slate-200 dark:to-teal-300 bg-clip-text text-transparent"
              style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? 'white' : '#0f172a' }}
            >
              MechMind AI
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 dark:text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search system knowledge..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-teal-500/30 rounded-full text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all shadow-inner"
            style={{ 
              width: '400px',
              height: '40px',
              background: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f3f5',
              color: darkMode ? 'white' : '#212121',
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-teal-500/20">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2" style={{ gap: '16px' }}>
        {/* Wizard Button */}
        <button
          onClick={onOpenWizard}
          className="px-3.5 py-1.5 rounded-xl bg-[#ff6f00] hover:bg-[#e66300] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
          style={{ 
            height: '40px',
            padding: '0 20px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">⚡ Wizard</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
          style={{ 
            height: '40px',
            padding: '0 20px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">⬆ Upload Doc</span>
        </button>

        {/* Status indicator (Telemetry) */}
        <div 
          className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-medium"
          style={{ margin: '0 12px' }}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ color: '#00ff88' }}></span>
          <span>⚪ Telemetry 60Hz</span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        {/* Night mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-teal-500/10">
          <div className="relative">
            <div 
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a2456] to-[#00897b] text-white font-bold text-xs flex items-center justify-center ring-2 ring-teal-500/30"
              style={{ width: '40px', height: '40px' }}
            >
              JD
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0a0e27] rounded-full"></span>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              Technician J. Doe
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
              Senior Turbomachinery Eng
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
