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
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 transition-colors duration-200">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3 w-56">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-teal-900 to-slate-900 dark:from-teal-600 dark:to-cyan-400 text-teal-300 dark:text-slate-950 shadow-md shadow-teal-500/20">
          <Cpu className="w-5 h-5 animate-pulse-subtle" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-white dark:border-slate-900"></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 dark:from-white dark:via-slate-200 dark:to-teal-300 bg-clip-text text-transparent">
              MechMind
            </span>
            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 uppercase tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wide">
            DIAGNOSTIC SUITE v2.4
          </span>
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
            placeholder="Search system knowledge, turbine manuals, error codes..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full text-slate-800 dark:text-slate-200 placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Wizard Button */}
        <button
          onClick={onOpenWizard}
          className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wizard</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-xl bg-[#0D6857] hover:bg-teal-900 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Doc</span>
        </button>

        {/* Diagnostic Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Telemetry 60Hz</span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 dark:bg-teal-500 dark:text-slate-950 font-bold text-xs flex items-center justify-center ring-2 ring-teal-500/30">
              JD
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
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
