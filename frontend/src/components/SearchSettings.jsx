import React, { useState } from 'react';
import { 
  Database, 
  Sliders, 
  Zap, 
  BarChart2, 
  Info, 
  ChevronDown, 
  Save, 
  Settings as SettingsIcon
} from 'lucide-react';

export default function SearchSettings({ onBackToDashboard, onNavigateSettings }) {
  const [embeddingModel, setEmbeddingModel] = useState('MechMind Embeddings v2 (Large - 1536d)');
  const [denseWeight, setDenseWeight] = useState(0.70);
  const [minConfidence, setMinConfidence] = useState(82);
  const [maxResults, setMaxResults] = useState(15);
  const [queryExpansion, setQueryExpansion] = useState(true);

  const menuItems = [
    { id: 'settings', label: 'General' },
    { id: 'ai', label: 'AI Configuration' },
    { id: 'search_settings', label: 'Search Settings' },
    { id: 'data', label: 'Data & Privacy' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      
      {/* 1. Navigation & Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Search Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Configure retrieval algorithms, hybrid weighting, and query expansion logic for optimal diagnostic accuracy.
        </p>
      </div>

      {/* Main Workspace Layout (Left Menu + Center Panels + Right Inspector) */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Settings Menu Sidebar (~200px width) */}
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
                  item.id === 'search_settings'
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Central Configuration Cards */}
        <div className="flex-1 space-y-6">
          
          {/* Card 1: Vector & Retrieval Engine */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
            
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Database className="w-5 h-5 text-teal-500" />
              <h2>Vector & Retrieval Engine</h2>
            </div>

            {/* EMBEDDING MODEL Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                EMBEDDING MODEL
              </label>
              <div className="relative">
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                >
                  <option>MechMind Embeddings v2 (Large - 1536d)</option>
                  <option>text-embedding-3-large (OpenAI)</option>
                  <option>bge-large-en-v1.5 (Local)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* HYBRID SEARCH WEIGHTING */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  HYBRID SEARCH WEIGHTING
                </label>
                <span className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-teal-500/20">
                  Alpha = {denseWeight.toFixed(2)}
                </span>
              </div>

              {/* Dual Slider Control */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Semantic (Dense)</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">{Math.round(denseWeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={denseWeight}
                    onChange={(e) => setDenseWeight(parseFloat(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Keyword (Sparse/BM25)</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{Math.round((1 - denseWeight) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={1 - denseWeight}
                    onChange={(e) => setDenseWeight(1 - parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono italic">
                Adjusts the interpolation between semantic understanding and exact keyword matching.
              </p>
            </div>

          </div>

          {/* Card 2: Filters & Thresholds */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
            
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-teal-500" />
              <h2>Filters & Thresholds</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column 1: MIN CONFIDENCE SCORE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    MIN CONFIDENCE SCORE
                  </label>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                    {minConfidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Column 2: MAX RESULTS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    MAX RESULTS
                  </label>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                    {maxResults}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>

            </div>

          </div>

          {/* Card 3: Advanced Behaviors */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
            
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-teal-500" />
              <h2>Advanced Behaviors</h2>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQueryExpansion(!queryExpansion)}
                    className={`w-11 h-6 rounded-full transition-colors p-1 ${
                      queryExpansion ? 'bg-[#18224B] dark:bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${queryExpansion ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Query Expansion
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 pl-14">
                Automatically expands technical jargon and acronyms using the MechMind industrial knowledge graph before executing retrieval.
              </p>
            </div>

          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Reset to Defaults
            </button>

            <button className="bg-[#0D6857] hover:bg-teal-900 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Search Settings</span>
            </button>
          </div>

        </div>

        {/* Right Inspector Panel (~300px width) */}
        <div className="w-full md:w-[300px] space-y-6 shrink-0">
          
          {/* Card 1: Estimated Impact */}
          <div className="bg-white dark:bg-slate-900 border-t-4 border-emerald-600 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl rounded-t-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-slate-100 text-base">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              <span>Estimated Impact</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Avg Latency</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">~142ms</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Recall@10</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">94.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Cost per Query</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">$0.0012</span>
              </div>
            </div>

            {/* Context Info Box */}
            <div className="bg-teal-50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700 rounded-xl p-3 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5 mt-3">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Current configuration strongly biases semantic meaning over exact match. Ideal for natural language troubleshooting.
              </p>
            </div>
          </div>

          {/* Card 2: Vector Space Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
              VECTOR SPACE PREVIEW
            </span>

            {/* Graphic Box */}
            <div className="h-44 w-full bg-slate-950 rounded-xl p-3 relative overflow-hidden border border-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:14px_14px] opacity-25"></div>
              
              {/* Clustered constellation dots */}
              <div className="relative w-full h-full">
                {/* Node cluster 1 (Teal) */}
                <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-teal-400 animate-ping"></div>
                <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-teal-400 shadow-md shadow-teal-400/50"></div>
                <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-teal-300"></div>
                <div className="absolute top-1/2 left-1/5 w-2 h-2 rounded-full bg-teal-300"></div>

                {/* Node cluster 2 (Amber/Orange) */}
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/50"></div>
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-amber-300"></div>
                <div className="absolute bottom-1/2 right-1/5 w-2 h-2 rounded-full bg-amber-300"></div>

                {/* Connecting lines */}
                <svg className="w-full h-full absolute inset-0 opacity-40">
                  <line x1="25%" y1="33%" x2="33%" y2="25%" stroke="#2dd4bf" strokeWidth="1" />
                  <line x1="25%" y1="33%" x2="20%" y2="50%" stroke="#2dd4bf" strokeWidth="1" />
                  <line x1="75%" y1="66%" x2="66%" y2="75%" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="75%" y1="66%" x2="80%" y2="50%" stroke="#fbbf24" strokeWidth="1" />
                  <line x1="25%" y1="33%" x2="75%" y2="66%" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>

              <span className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500">
                1536D TSNE PROJECTION
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
