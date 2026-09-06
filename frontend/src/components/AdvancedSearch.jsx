import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Filter, 
  ChevronDown, 
  Calendar, 
  SlidersHorizontal, 
  FileText, 
  BarChart2, 
  Wrench, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AdvancedSearch({ onUseInChat, onViewDoc }) {
  const [query, setQuery] = useState("Hydraulic pump overheating symptoms");
  const [showFilters, setShowFilters] = useState(true);
  const [confidence, setConfidence] = useState(85);
  const [engineMode, setEngineMode] = useState('semantic');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      
      {/* 1. Page Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Advanced Search
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Deep dive into technical documentation and historical diagnostics.
        </p>
      </div>

      {/* 2. Advanced Search & Filter Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        
        {/* Query Bar Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query system knowledge... (e.g. 'Hydraulic pump overheating symptoms')"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <Mic className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5 hover:bg-teal-200 dark:hover:bg-teal-900 transition-colors border border-teal-500/20"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors flex-1 md:flex-initial">
              Search
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Equipment Class */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  EQUIPMENT CLASS
                </label>
                <div className="relative">
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 appearance-none focus:outline-none">
                    <option>All Equipment</option>
                    <option>Pumps</option>
                    <option>Turbines</option>
                    <option>Generators</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Document Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  DOCUMENT TYPE
                </label>
                <div className="relative">
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 appearance-none focus:outline-none">
                    <option>All Documents</option>
                    <option>Manuals</option>
                    <option>Maintenance Logs</option>
                    <option>Reports</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Temporal Range */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TEMPORAL RANGE
                </label>
                <div className="flex items-center space-x-1.5">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="mm/dd/yyyy" 
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <span className="text-slate-400 text-xs">to</span>
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="mm/dd/yyyy" 
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Min Confidence */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    MIN. CONFIDENCE
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

            </div>

            {/* Engine Mode Selector & Form Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 gap-4">
              
              {/* Radio Group */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  ENGINE MODE
                </span>
                <div className="flex items-center space-x-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="engineMode" 
                      checked={engineMode === 'semantic'} 
                      onChange={() => setEngineMode('semantic')}
                      className="text-teal-600 focus:ring-teal-500" 
                    />
                    <span>Semantic (AI)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="engineMode" 
                      checked={engineMode === 'hybrid'} 
                      onChange={() => setEngineMode('hybrid')}
                      className="text-teal-600 focus:ring-teal-500" 
                    />
                    <span>Hybrid</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="engineMode" 
                      checked={engineMode === 'exact'} 
                      onChange={() => setEngineMode('exact')}
                      className="text-teal-600 focus:ring-teal-500" 
                    />
                    <span>Exact Match</span>
                  </label>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                  Clear All
                </button>
                <button className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm transition-colors">
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. Active Constraints Bar & Results Header */}
      <div className="space-y-4">
        
        {/* Active Constraints Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">
            Active Constraints:
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
            <span>CLASS: PUMPS</span>
            <button className="hover:text-indigo-900">✕</button>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <span>CONFIDENCE &gt; 85%</span>
            <button className="hover:text-amber-900">✕</button>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>MODE: SEMANTIC</span>
          </span>
        </div>

        {/* Results Count & Sorting Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            42 Results Found
          </h2>
          <div className="flex items-center space-x-1">
            <select className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-transparent cursor-pointer focus:outline-none">
              <option>Sort by: Relevance</option>
              <option>Sort by: Newest</option>
              <option>Sort by: Confidence</option>
            </select>
          </div>
        </div>

      </div>

      {/* 4. Search Result Cards */}
      <div className="space-y-4">
        
        {/* Card 1: Centrifugal Pump Troubleshooting Guide */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Centrifugal Pump Troubleshooting Guide
                </h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                    MANUAL
                  </span>
                  <span>•</span>
                  <span>ID: DOC-7729</span>
                  <span>•</span>
                  <span>Last updated: Oct 12, 2023</span>
                </div>
              </div>
            </div>

            {/* Score Match */}
            <div className="text-right">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                94% MATCH
              </span>
              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>

          {/* Snippet Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 font-mono">
            "...check the impeller clearance. If the{' '}
            <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
              hydraulic pump is overheating
            </mark>
            , it is often due to insufficient flow or cavitation caused by improper suction conditions..."
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Wrench className="w-3.5 h-3.5 text-slate-500" />
              <span>PUMP-CX200</span>
            </span>

            <button 
              onClick={onViewDoc}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Diagnostic Report: Overheating Event Q3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Diagnostic Report: Overheating Event Q3
                </h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-500/20">
                    REPORT
                  </span>
                  <span>•</span>
                  <span>ID: REP-4011</span>
                  <span>•</span>
                  <span>Last updated: Aug 05, 2023</span>
                </div>
              </div>
            </div>

            {/* Score Match */}
            <div className="text-right">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                88% MATCH
              </span>
              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>

          {/* Snippet Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 font-mono">
            "Analysis of the{' '}
            <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
              overheating symptoms
            </mark>
            {' '}recorded on Unit B indicates bearing failure resulting from lubrication loss in the main{' '}
            <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
              hydraulic
            </mark>
            {' '}assembly..."
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>UNIT-B-HYD</span>
            </span>

            <button 
              onClick={onViewDoc}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 5. Pagination Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-8 pb-4">
        <button disabled className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
          1
        </button>
        <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center">
          2
        </button>
        <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center">
          3
        </button>
        <span className="text-slate-400 font-bold px-1">...</span>
        <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
