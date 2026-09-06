import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  RefreshCw, 
  Download, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Pencil, 
  Plus, 
  Wrench, 
  Disc, 
  Layers, 
  Droplet,
  Loader2,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function DocumentDetails({ onBack }) {
  const [activeTab, setActiveTab] = useState('equipment');
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const entities = [
    { name: 'Rotor Assembly', page: 12, confidence: 99, icon: Wrench },
    { name: 'Bearing Housing', page: 18, confidence: 96, icon: Disc },
    { name: 'Coupling', page: 24, confidence: 98, icon: Layers },
    { name: 'Lube Oil Pump', page: 31, confidence: 92, icon: Droplet },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      
      {/* 1. Page Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        
        {/* Left Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              B-42 Turbine Maintenance Manual
            </h1>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1 font-mono">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>Turbine_Service_Manual_v4.pdf</span>
              <span>•</span>
              <span>14.2 MB</span>
              <span>•</span>
              <span>Uploaded Oct 12, 2023</span>
            </div>
          </div>
        </div>

        {/* Right Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <div className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-500/20 font-medium text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>Processing (84%)</span>
          </div>

          {/* Re-process */}
          <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-process</span>
          </button>

          {/* Download Data */}
          <button className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Download Data</span>
          </button>

          {/* Delete */}
          <button className="text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 p-2 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Workspace Layout (Canvas + Right Panel) */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 2. Left Document Viewer Canvas (Interactive OCR Viewer) */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-4 relative min-h-[600px] flex flex-col justify-between border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner">
          
          {/* Top Floating Badge Controls */}
          <div className="flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              OCR Overlay
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              OCR: High Accuracy (98%)
            </span>
          </div>

          {/* Document Page Preview Area */}
          <div className="my-6 flex-1 flex items-center justify-center relative">
            <div 
              className="w-full max-w-xl aspect-[3/4] bg-white dark:bg-slate-950 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Document Background Blueprint Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 rounded-xl pointer-events-none"></div>

              {/* Title Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 mb-6 relative">
                <div className="text-[10px] font-mono text-slate-400">SCHEMATIC DIAGRAM // SECTION 4.2</div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">TURBINE BEARING & ROTOR ASSEMBLY</h3>
              </div>

              {/* OCR Bounding Box 1 (Top Left) */}
              <div className="absolute top-28 left-12 w-48 h-32 border-2 border-teal-400 bg-teal-400/15 rounded-lg p-2 shadow-sm">
                <span className="absolute -top-3 left-2 bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-teal-400/50">
                  Bearing Housing Assm.
                </span>
                <div className="text-[9px] font-mono text-slate-600 dark:text-slate-400 pt-2">
                  PARTS ID: #882-B<br />
                  TOLERANCE: ±0.02mm
                </div>
              </div>

              {/* OCR Bounding Box 2 (Bottom Right) */}
              <div className="absolute bottom-20 right-12 w-52 h-36 border-2 border-teal-400 bg-teal-400/15 rounded-lg p-2 shadow-sm">
                <span className="absolute -top-3 left-2 bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-teal-400/50">
                  Rotor Stage 3
                </span>
                <div className="text-[9px] font-mono text-slate-600 dark:text-slate-400 pt-2">
                  RPM RATING: 3,600<br />
                  IMPELLER VANES: 16
                </div>
              </div>

              <div className="absolute bottom-4 left-8 text-[9px] font-mono text-slate-400">
                CONFIDENTIAL • MECHMIND DIAGNOSTIC SUITE
              </div>
            </div>
          </div>

          {/* Bottom Right Floating Controls */}
          <div className="absolute bottom-20 right-6 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg z-10 space-y-1">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 10, 140))}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 10, 70))}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(100)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Page Thumbnail Strip */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto p-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-xl border border-slate-200/80 dark:border-slate-800 z-10">
            {[1, 2, 3, 4, 5].map((pg) => (
              <button
                key={pg}
                onClick={() => setActivePage(pg)}
                className={`relative w-12 h-16 rounded-lg border-2 flex items-center justify-center font-mono text-xs transition-all ${
                  activePage === pg
                    ? 'border-blue-500 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'
                }`}
              >
                <span className="absolute top-1 left-1.5 text-[9px] font-bold">{pg}</span>
                {pg === 5 ? (
                  <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 opacity-40" />
                )}
              </button>
            ))}
          </div>

        </div>

        {/* 3. Right Processing & Extracted Data Panel (~360px width) */}
        <div className="w-full lg:w-[360px] space-y-4 shrink-0">
          
          {/* Card 1: Processing Status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Processing Status
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Page 42 of 50</span>
                <span className="text-slate-500 font-mono">84%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#1E293B] dark:bg-teal-500 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>

            {/* Extraction Metrics Grid (2 Columns) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  156
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  EQUIPMENT ITEMS
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 font-mono">
                  324
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  RELATIONSHIPS
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Metadata */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Metadata
              </h3>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">EQUIPMENT</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">Turbine</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CATEGORY</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">Maintenance Manual</p>
              </div>

              <div className="space-y-0.5 pt-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">VERSION</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100">v4.0</p>
              </div>
            </div>

            {/* Auto-Tags */}
            <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                AUTO-TAGS
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Turbine
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300">
                  High Vibration
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Maintenance
                </span>
                <button className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 text-xs">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Extracted Knowledge Entities */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Extracted Knowledge Entities
            </h3>

            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
              {['equipment', 'components', 'procedures'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`pb-2 pr-4 uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === t
                      ? 'border-teal-500 text-teal-600 dark:text-teal-300'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Entity Items List */}
            <div className="space-y-2 pt-1">
              {entities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-3 shadow-2xs hover:border-teal-500/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Page {item.page} • Confidence {item.confidence}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
