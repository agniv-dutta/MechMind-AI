import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sliders, 
  Zap, 
  Info, 
  ChevronDown, 
  Save, 
  Settings as SettingsIcon,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getSearchConfig, updateSearchConfig } from '../lib/api';

export default function SearchSettings({ onBackToDashboard: _onBackToDashboard, onNavigateSettings }) {
  const [semanticWeight, setSemanticWeight] = useState(0.7);
  const [minConfidence, setMinConfidence] = useState(30);
  const [maxResults, setMaxResults] = useState(20);
  const [queryExpansion, setQueryExpansion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getSearchConfig()
      .then((res) => {
        const cfg = res.config || {};
        setSemanticWeight(typeof cfg.semantic_weight === 'number' ? cfg.semantic_weight : 0.7);
        setMinConfidence(Math.round((typeof cfg.min_confidence === 'number' ? cfg.min_confidence : 0.3) * 100));
        setMaxResults(typeof cfg.max_results === 'number' ? cfg.max_results : 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      await updateSearchConfig({
        semantic_weight: semanticWeight,
        keyword_weight: Math.round((1 - semanticWeight) * 100) / 100,
        min_confidence: minConfidence / 100,
        max_results: maxResults,
      });
      setSaveMsg('Search configuration saved successfully');
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSemanticWeight(0.7);
    setMinConfidence(30);
    setMaxResults(20);
    setSaveMsg('Reset to defaults (click Save to persist)');
  };

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
      className="flex-1 flex flex-col h-full bg-slate-100/60 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
      style={{
        background: '#f8fafc',
        padding: '24px',
      }}
    >
      
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Search Settings</h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Configure retrieval algorithms, hybrid weighting, and query expansion logic for optimal diagnostic accuracy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Settings Menu */}
        <aside className="w-full md:w-[200px] space-y-1 shrink-0">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm mb-4 px-3">
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
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Central Configuration Cards */}
        <div className="flex-1 space-y-6">
          
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                <span>Loading search configuration...</span>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Card 1: Vector & Retrieval Engine */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  <Database className="w-5 h-5 text-teal-500" />
                  <h2>Vector & Retrieval Engine</h2>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">EMBEDDING MODEL</label>
                  <div className="relative">
                    <select
                      defaultValue="HashEmbedder (Local - fallback)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 appearance-none focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    >
                      <option>HashEmbedder (Local - fallback)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Lightweight embedded fallback active (sentence-transformers not installed). Install backend/requirements.txt for semantic embeddings.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HYBRID SEARCH WEIGHTING</label>
                    <span className="bg-teal-100 text-teal-800 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-teal-500/20">Alpha = {semanticWeight.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Semantic (Dense)</span>
                        <span className="font-mono text-teal-600">{Math.round(semanticWeight * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={semanticWeight}
                        onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Keyword (Sparse/BM25)</span>
                        <span className="font-mono text-indigo-600">{Math.round((1 - semanticWeight) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={Math.round((1 - semanticWeight) * 100) / 100}
                        onChange={(e) => setSemanticWeight(1 - parseFloat(e.target.value))}
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  <Sliders className="w-5 h-5 text-teal-500" />
                  <h2>Filters & Thresholds</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MIN CONFIDENCE SCORE</label>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs border border-emerald-500/20">{minConfidence}%</span>
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MAX RESULTS</label>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-xs text-slate-900 border border-slate-200">{maxResults}</span>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  <Zap className="w-5 h-5 text-teal-500" />
                  <h2>Advanced Behaviors</h2>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQueryExpansion(!queryExpansion)}
                        className={`w-11 h-6 rounded-full transition-colors p-1 ${queryExpansion ? 'bg-[#18224B]' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${queryExpansion ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                      <h3 className="font-semibold text-slate-900 text-sm">Query Expansion</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pl-14">
                    Expands technical jargon using the MechMind industrial knowledge graph before executing retrieval.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs space-y-1 max-w-sm">
              {saveMsg && <span className="flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />{saveMsg}</span>}
              {saveError && <span className="flex items-center gap-1.5 font-semibold text-red-600"><AlertTriangle className="w-3.5 h-3.5" />{saveError}</span>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-[#0D6857] hover:bg-teal-900 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Search Settings</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Inspector Panel */}
        <div className="w-full md:w-[300px] space-y-6 shrink-0">
          <div className="bg-white border-t-4 border-emerald-600 border-x border-b border-slate-200 rounded-b-2xl rounded-t-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-base">
              <Info className="w-5 h-5 text-emerald-500" />
              <span>Current Configuration</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Semantic Weight</span>
                <span className="font-mono text-slate-900 font-bold">{semanticWeight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Min Confidence</span>
                <span className="font-mono text-slate-900 font-bold">{minConfidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Max Results</span>
                <span className="font-mono text-slate-900 font-bold">{maxResults}</span>
              </div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 flex items-start gap-2.5 mt-3">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Settings are persisted by the backend to data/search_config.json and applied to every retrieval.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
