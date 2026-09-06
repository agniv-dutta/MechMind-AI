import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronUp, 
  ChevronDown, 
  FileText, 
  FileCode, 
  MessageSquare, 
  Eye, 
  Bookmark, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function SearchResults({ onUseInChat }) {
  const [confidence, setConfidence] = useState(85);
  const [selectedEq, setSelectedEq] = useState(['centrifugal', 'positive']);
  const [selectedDoc, setSelectedDoc] = useState(['logs', 'guides']);
  const [searchVal, setSearchVal] = useState('pump cavitation');

  const toggleEq = (id) => {
    setSelectedEq(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleDoc = (id) => {
    setSelectedDoc(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
      
      {/* 1. Page Header & Query Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Search Results
            </h1>
            <div className="mt-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-300/60 dark:border-slate-700/60">
                Query: {searchVal}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              FOUND 47 RESULTS
            </span>
            <div className="relative">
              <select className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none">
                <option>Sort by: Relevance</option>
                <option>Sort by: Date (Newest)</option>
                <option>Sort by: Confidence Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Sidebar + Results) */}
      <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
        
        {/* 2. Left Filter Sidebar (~240px width) */}
        <aside className="w-full md:w-[240px] space-y-4 shrink-0">
          
          {/* Filter Card 1: Equipment */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Equipment</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={selectedEq.includes('centrifugal')}
                    onChange={() => toggleEq('centrifugal')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Centrifugal Pump</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">24</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={selectedEq.includes('positive')}
                    onChange={() => toggleEq('positive')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Positive Displacement</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">12</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={selectedEq.includes('valves')}
                    onChange={() => toggleEq('valves')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Valves</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">8</span>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={selectedEq.includes('motors')}
                    onChange={() => toggleEq('motors')}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Motors</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">3</span>
              </label>
            </div>

            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:underline cursor-pointer">
                SHOW ALL CATEGORIES
              </span>
            </div>
          </div>

          {/* Filter Card 2: Document Type */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Document Type</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedDoc.includes('oem')}
                  onChange={() => toggleDoc('oem')}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>OEM Manuals</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedDoc.includes('logs')}
                  onChange={() => toggleDoc('logs')}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Maintenance Logs</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedDoc.includes('guides')}
                  onChange={() => toggleDoc('guides')}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Troubleshooting Guides</span>
              </label>
            </div>
          </div>

          {/* Filter Card 3: Min Confidence */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Min Confidence</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                {confidence}%
              </span>
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

          {/* Filter Card 4: Date Added */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
              <span>Date Added</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </aside>

        {/* 3. Search Result Cards (Right Main Area) */}
        <div className="flex-1 space-y-4">
          
          {/* Card 1: Centrifugal Pump O&M Manual v2.4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Centrifugal Pump O&M Manual v2.4
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Pg. 142</span>
                    <span>•</span>
                    <span>Oct 12, 2023</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      CENTRIFUGAL PUMP
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  98% Match
                </span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>

            {/* Snippet Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 font-mono">
              "...noise resembling gravel passing through the casing is a primary indicator of{' '}
              <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
                pump cavitation
              </mark>
              . This occurs when the Net Positive Suction Head Available (NPSHa) falls below the NPSH Required (NPSHr), causing vapor bubbles to form and aggressively collapse against the impeller vanes. Immediate action requires throttling the discharge valve to reduce flow or..."
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onUseInChat}
                  className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Use in Chat</span>
                </button>
                <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-slate-400">
                <button className="p-1.5 rounded-lg hover:text-slate-600 dark:hover:text-slate-200">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:text-slate-600 dark:hover:text-slate-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Maintenance Log: Station 4 Alpha */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Maintenance Log: Station 4 Alpha
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Log Entry</span>
                    <span>•</span>
                    <span>Nov 03, 2023</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      LOG
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Score */}
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  92% Match
                </span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            {/* Snippet Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 font-mono">
              "...operator reported severe vibration on Main Feed Pump B. Vibration analysis indicated high-frequency peaks at vane pass frequency. Upon inspection, significant pitting was found on the suction side of the impeller, confirming prolonged{' '}
              <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
                pump cavitation
              </mark>
              . The suction strainer was found 60% blinded, causing..."
            </div>

            {/* Action Footer */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onUseInChat}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Use in Chat</span>
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>View Document</span>
              </button>
            </div>
          </div>

          {/* Card 3: Fluid Dynamics & System Design Guide (With Thumbnail) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-4">
            
            {/* Thumbnail */}
            <div className="w-full md:w-40 h-32 rounded-xl bg-slate-950 p-2 border border-slate-800 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="flex items-center space-x-1 text-[9px] font-bold text-teal-400 uppercase tracking-wider">
                <ImageIcon className="w-3 h-3" />
                <span>Schematic</span>
              </div>
              <div className="text-center font-mono text-[9px] text-slate-400">
                Fig 4.2 TECHNICAL SCHEMATIC: PUMP SYSTEM CAVITATION ANAL...
              </div>
              <div className="w-full h-8 bg-teal-500/20 rounded border border-teal-500/30 flex items-center justify-center">
                <span className="text-[9px] font-mono text-teal-300">NPSHa &lt; NPSHr</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Fluid Dynamics & System Design Guide
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>Pg. 56</span>
                      <span>•</span>
                      <span>Jan 15, 2022</span>
                    </div>
                  </div>
                </div>

                {/* Match Score */}
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    88% Match
                  </span>
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>

              {/* Snippet Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800 font-mono">
                "...Figure 4.2 illustrates the pressure drop across the eye of the impeller. If suction piping diameter is undersized, fluid velocity increases, causing a localized pressure drop below vapor pressure. Designing systems to avoid{' '}
                <mark className="bg-teal-300/40 dark:bg-teal-500/30 text-teal-950 dark:text-teal-100 px-1 rounded font-bold">
                  pump cavitation
                </mark>
                {' '}requires calculating NPSHa with a safety margin of at least 3-5 ft above NPSHr..."
              </div>

              {/* Action Footer */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={onUseInChat}
                  className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Use in Chat</span>
                </button>
                <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Schematic</span>
                </button>
              </div>
            </div>

          </div>

          {/* 4. Pagination Footer */}
          <div className="flex items-center justify-center space-x-2 pt-6 pb-2">
            <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
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

      </div>
    </div>
  );
}
