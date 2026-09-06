import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Download, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  FileText, 
  Layers, 
  Wrench, 
  Activity, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export default function KnowledgeGraph() {
  const [depth, setDepth] = useState(4);
  const [selectedNode, setSelectedNode] = useState('pump');
  const [searchVal, setSearchVal] = useState('');
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      
      {/* 1. Page Header & Control Toolbar */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Knowledge Graph
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Equipment Relationships & Dependencies
            </p>
          </div>

          {/* Top-Right Action Group */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { setZoom(100); setDepth(4); }}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset View</span>
            </button>

            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Legend</span>
            </button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {/* Search field */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search entities..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          {/* Entity Type Dropdown */}
          <div className="relative">
            <select className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-8 focus:outline-none cursor-pointer">
              <option>ENTITY TYPE: All Types</option>
              <option>Equipment Only</option>
              <option>Sub-assemblies</option>
              <option>Sensors & Controls</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Depth Slider */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">DEPTH:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-24 accent-teal-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{depth}</span>
          </div>
        </div>
      </div>

      {/* Main Graph Workspace (Canvas + Right Inspector) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* 2. Interactive Graph Canvas */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-8">
          
          {/* Subtle Canvas Dot Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

          {/* Network SVG Graph Container */}
          <div 
            className="w-full h-full max-w-4xl max-h-[650px] relative transition-transform duration-200 flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-teal" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#5EEAD4" />
                </marker>
              </defs>

              {/* Edge 1: Cooling System -> Centrifugal Pump */}
              <line x1="180" y1="140" x2="420" y2="280" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />

              {/* Edge 2: Centrifugal Pump -> Motor Unit B */}
              <line x1="420" y1="280" x2="700" y2="150" stroke="#5EEAD4" strokeWidth="2.5" markerEnd="url(#arrow-teal)" />

              {/* Edge 3: Centrifugal Pump -> Main Drive */}
              <line x1="420" y1="280" x2="680" y2="420" stroke="#5EEAD4" strokeWidth="2.5" markerEnd="url(#arrow-teal)" />

              {/* Edge 4: Main Drive -> Impeller Assembly */}
              <line x1="680" y1="420" x2="400" y2="490" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
            </svg>

            {/* Edge Relationship Labels */}
            <div className="absolute top-[190px] left-[270px] bg-slate-900/90 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700 shadow-sm pointer-events-none">
              Monitors
            </div>
            <div className="absolute top-[200px] left-[540px] bg-slate-900/90 text-teal-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-teal-500/40 shadow-sm pointer-events-none">
              Contains
            </div>
            <div className="absolute top-[345px] left-[530px] bg-slate-900/90 text-teal-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-teal-500/40 shadow-sm pointer-events-none">
              Powers
            </div>

            {/* NODE 1: Cooling System */}
            <div 
              onClick={() => setSelectedNode('cooling')}
              className="absolute top-[100px] left-[130px] flex flex-col items-center cursor-pointer group z-10"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform ring-4 ring-amber-500/30">
                <Activity className="w-7 h-7" />
              </div>
              <span className="mt-2 text-xs font-bold text-amber-200 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30">
                Cooling System
              </span>
            </div>

            {/* NODE 2: Centrifugal Pump (Active / Selected Node) */}
            <div 
              onClick={() => setSelectedNode('pump')}
              className="absolute top-[230px] left-[370px] flex flex-col items-center cursor-pointer group z-20"
            >
              <div className="w-24 h-24 rounded-full bg-indigo-950 text-teal-300 font-bold flex items-center justify-center shadow-2xl ring-4 ring-indigo-400 border-2 border-teal-400 group-hover:scale-105 transition-transform animate-pulse-subtle">
                <Layers className="w-10 h-10 text-teal-300" />
              </div>
              <span className="mt-2 text-sm font-extrabold text-white bg-indigo-950 px-3 py-1 rounded-full border border-teal-400 shadow-md">
                Centrifugal Pump
              </span>
            </div>

            {/* NODE 3: Motor Unit B */}
            <div 
              onClick={() => setSelectedNode('motor')}
              className="absolute top-[110px] left-[660px] flex flex-col items-center cursor-pointer group z-10"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-900 text-white font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-indigo-700">
                <Wrench className="w-7 h-7 text-indigo-300" />
              </div>
              <span className="mt-2 text-xs font-bold text-indigo-200 bg-slate-900/80 px-2 py-0.5 rounded border border-indigo-700">
                Motor Unit B
              </span>
            </div>

            {/* NODE 4: Main Drive */}
            <div 
              onClick={() => setSelectedNode('drive')}
              className="absolute top-[380px] left-[640px] flex flex-col items-center cursor-pointer group z-10"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-900 text-white font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-indigo-700">
                <Activity className="w-7 h-7 text-indigo-300" />
              </div>
              <span className="mt-2 text-xs font-bold text-indigo-200 bg-slate-900/80 px-2 py-0.5 rounded border border-indigo-700">
                Main Drive
              </span>
            </div>

            {/* NODE 5: Impeller Assembly */}
            <div 
              onClick={() => setSelectedNode('impeller')}
              className="absolute top-[450px] left-[350px] flex flex-col items-center cursor-pointer group z-10"
            >
              <div className="w-14 h-14 rounded-full bg-teal-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform ring-4 ring-teal-400/30">
                <Layers className="w-6 h-6" />
              </div>
              <span className="mt-2 text-xs font-bold text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30">
                Impeller Assembly
              </span>
            </div>

          </div>

          {/* Canvas Zoom Controls (Bottom Floating Box) */}
          <div className="absolute bottom-6 left-6 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-lg z-20 space-y-1 backdrop-blur-xs">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 10, 140))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 10, 70))}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(100)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 3. Right Node Inspector Panel (~340px width) */}
        <div className="w-full md:w-[340px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 space-y-5 overflow-y-auto shrink-0 transition-colors duration-200">
          
          {/* Header Card */}
          <div className="space-y-1.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1E293B] text-white uppercase tracking-wider">
                EQUIPMENT
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ACTIVE
                </span>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 pt-1">
              Centrifugal Pump
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              ID: CP-4092-A
            </p>
          </div>

          {/* PROPERTIES Table/Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              PROPERTIES
            </span>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-2 text-xs border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Manufacturer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">FlowServe Corp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Model</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">Durco Mark 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Rating</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">500 GPM @ 120ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Install Date</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">2019-11-04</span>
              </div>
            </div>
          </div>

          {/* RELATED ENTITIES Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              RELATED ENTITIES
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-900"></span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Motor Unit B</span>
                </div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">Powers</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Impeller Assembly</span>
                </div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">Contains</span>
              </div>
            </div>
          </div>

          {/* LINKED PROCEDURES Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              LINKED PROCEDURES
            </span>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">Impeller Replacement</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Est. 4h • High Risk</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">Monthly Seal Inspection</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Est. 45m • Low Risk</p>
              </div>
            </div>
          </div>

          {/* SOURCE DOCUMENTS Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              SOURCE DOCUMENTS
            </span>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center space-x-2.5 text-xs">
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                FlowServe Mark 3 Manual
              </span>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-2">
            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm w-full transition-colors shadow-sm">
              Open Full Profile
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
