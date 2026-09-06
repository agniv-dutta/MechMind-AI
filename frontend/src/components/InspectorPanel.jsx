import React from 'react';
import { 
  BookOpen, 
  BarChart2, 
  CheckCircle2, 
  Loader2, 
  Gauge, 
  History, 
  FileText 
} from 'lucide-react';
import VibrationSpectrum from './VibrationSpectrum';

export default function InspectorPanel() {
  return (
    <aside className="w-[340px] bg-slate-50/90 dark:bg-slate-900/60 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 overflow-y-auto transition-colors duration-200 select-none">
      {/* Header & Tabs */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Context Retrieval
        </h2>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          ACTIVE
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Confidence Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Confidence Score
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              73%
            </span>
          </div>

          {/* Progress Bar (73%) */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <div 
              className="h-full bg-[#10B981] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: '73%' }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Calibrating parameters...
          </p>
        </div>

        {/* KNOWLEDGE SOURCES Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
            <span>Knowledge Sources</span>
            <span className="text-teal-600 dark:text-teal-400 font-mono text-[10px]">Indexed</span>
          </div>

          {/* Source Card 1 */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  B-Series Turbine Operations & Maintenance Manual
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  TechDocs-V3 • Sec 4.2
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
          </div>

          {/* Source Card 2 */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  Historical Incidents: B-42 Rotor Bow
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Oct 2023 • Maintenance Log
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
          </div>

          {/* Loading Card (Scanning State) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
              <span>Scanning SCADA logs...</span>
            </div>
            
            {/* Text skeleton loader */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Simulated Vibration Spectrum Box */}
        <VibrationSpectrum />
      </div>
    </aside>
  );
}
