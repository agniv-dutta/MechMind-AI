import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Upload, 
  FileText, 
  MoreVertical, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  FileCode, 
  Cpu,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function DocumentLibrary({ onOpenUpload }) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-6 md:p-8 transition-colors duration-200">
      
      {/* 1. Page Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Technical Documentation Library
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Central repository for technical schematics, maintenance manuals, and diagnostic reports. All documents are automatically indexed by MechMind AI.
        </p>
      </div>

      {/* 2. Control & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 my-6">
        
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by equipment tag, ID, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 shadow-2xs"
          />
        </div>

        {/* Filter & Sort & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter button */}
          <button className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 shadow-2xs transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filter</span>
          </button>

          {/* Sort button */}
          <button className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2 shadow-2xs transition-colors">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span>Sort: Newest</span>
          </button>

          {/* View Toggle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Document button */}
          <button
            onClick={onOpenUpload}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

      </div>

      {/* 3. Document Library Grid Cards (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: B-42 Turbine Maintenance Manual */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            {/* Thumbnail Section */}
            <div className="h-36 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 p-4 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg relative z-10 font-bold font-mono text-xs">
                <FileText className="w-6 h-6" />
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-blue-300/80 uppercase">
                SCHEMATIC // BLUEPRINT REV-B
              </span>
            </div>

            {/* Content Area */}
            <div className="p-5 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                  B-42 Turbine Maintenance Manual
                </h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded Oct 12, 2023 • 14.2 MB
              </p>

              {/* Tag Group */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#1E293B] text-white">
                  Turbine
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20">
                  High Vibration
                </span>
              </div>
            </div>
          </div>

          {/* Status Line */}
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Complete</span>
          </div>
        </div>

        {/* Card 2: Centrifugal Pump P&ID Diagrams */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            {/* Thumbnail Section */}
            <div className="h-36 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 p-4 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg relative z-10 font-bold font-mono text-xs">
                <Layers className="w-6 h-6" />
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-amber-300/80 uppercase">
                P&ID FLOWCHART // HYDRAULICS
              </span>
            </div>

            {/* Content Area */}
            <div className="p-5 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                  Centrifugal Pump P&ID Diagrams
                </h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded Oct 14, 2023 • 8.5 MB
              </p>

              {/* Tag Group */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  Pump
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                  Hydraulics
                </span>
              </div>
            </div>
          </div>

          {/* Status Line */}
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              Processing...
            </span>
          </div>
        </div>

        {/* Card 3: Control System Reboot Sequence */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            {/* Thumbnail Section */}
            <div className="h-36 bg-gradient-to-tr from-slate-950 via-slate-900 to-purple-950 p-4 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg relative z-10 font-bold font-mono text-xs">
                <FileCode className="w-6 h-6" />
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-purple-300/80 uppercase">
                SCADA // CONTROL LOGIC
              </span>
            </div>

            {/* Content Area */}
            <div className="p-5 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                  Control System Reboot Sequence
                </h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded Oct 15, 2023 • 114.0 MB
              </p>

              {/* Tag Group */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  SCADA
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20">
                  Critical
                </span>
              </div>
            </div>
          </div>

          {/* Status Line */}
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Complete</span>
          </div>
        </div>

        {/* Card 4: Drop New Document (Upload Slot Card) */}
        <div
          onClick={onOpenUpload}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-teal-500 transition-all h-full min-h-[260px] group"
        >
          <div className="w-14 h-14 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-4">
            Drop New Document
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
            PDF, DOCX, CAD, or Image formats up to 500MB
          </p>
        </div>

      </div>

    </div>
  );
}
