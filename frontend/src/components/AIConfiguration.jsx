import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Info, 
  ArrowRight, 
  Save, 
  ChevronDown,
  Settings as SettingsIcon,
  Loader2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { getAIConfig, getAIModels, updateAIConfig, testAIConnection } from '../lib/api';

export default function AIConfiguration({ onBackToDashboard: _onBackToDashboard, onNavigateSettings, darkMode }) {
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(0.70);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [citationThreshold, setCitationThreshold] = useState(85);
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [mode, setMode] = useState('offline');
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    Promise.all([getAIConfig(), getAIModels().catch(() => null)])
      .then(([cfg, models]) => {
        setProvider(cfg.provider || 'groq');
        setModel(cfg.model || '');
        setMode(cfg.mode || 'offline');
        setKeyConfigured(!!cfg.api_key_configured);
        setTemperature(cfg.temperature ?? 0.7);
        setMaxTokens(cfg.max_tokens ?? 2048);
        if (models) setAvailableModels(models.models || []);
      })
      .catch(() => {});
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testAIConnection(model);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const res = await updateAIConfig({ provider, model });
      setSaveMsg(res.message || 'Configuration saved');
      const cfg = await getAIConfig();
      setMode(cfg.mode || mode);
      setKeyConfigured(!!cfg.api_key_configured);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
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
      className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-[#0a0e27] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
      style={{
        background: darkMode ? 'linear-gradient(#0a0e27, #1a2456)' : '#f8f9fa',
        padding: '24px',
      }}
    >
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-teal-500/10 shadow-2xs">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            AI Model Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage the Groq inference engine, model selection, and connectivity.
          </p>
        </div>

        <div className={`text-xs font-bold tracking-wider uppercase px-3.5 py-2 rounded-full flex items-center gap-2 border ${
          mode === 'groq'
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-slate-800 border-emerald-500/30'
            : 'text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-slate-800 border-amber-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${mode === 'groq' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
          <span>{mode === 'groq' ? 'SYSTEM ONLINE' : 'OFFLINE MODE'}</span>
        </div>
      </div>

      {/* Main Configuration Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Settings Menu */}
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
                  item.id === 'ai'
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Configuration Cards */}
        <div className="flex-1 space-y-6">
          
          {/* Card 1: Core Engine */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-6 shadow-2xs space-y-5 relative">
            <span className="absolute top-6 right-6 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200/60 dark:border-teal-500/20">
              CFG-01-A
            </span>

            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-teal-500/10 pb-3">
              <Server className="w-5 h-5 text-teal-500" />
              <h2>Core Engine</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">PROVIDER / BACKEND</label>
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                  >
                    <option value="groq">Groq (Cloud)</option>
                    <option value="openai" disabled>OpenAI (disabled)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE MODEL</label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                  >
                    {availableModels.length === 0 && <option value="">Loading models...</option>}
                    {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AUTHENTICATION KEY</label>
                <span className="text-[10px] font-mono text-slate-500">{keyConfigured ? 'CONFIGURED' : 'NOT SET'}</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  readOnly
                  placeholder={keyConfigured ? 'GROQ API key configured' : mode === 'offline' ? 'No GROQ_API_KEY set — running in offline mode' : 'GROQ API key configured'}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-teal-500/20 rounded-xl text-sm font-mono text-slate-500 dark:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Set GROQ_API_KEY in backend/.env to enable live inference.</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2.5">
                {testing ? (
                  <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
                ) : testResult === null ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                ) : testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    {testing ? 'Testing connection...' : testResult === null ? (mode === 'groq' ? 'Connection not yet tested' : 'Offline mode active') : testResult.success ? 'Connection Successful' : 'Connection Failed'}
                  </span>
                  {testResult && (
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {testResult.success ? `Latency: ${testResult.latency_ms ?? '—'}ms | Provider: ${testResult.provider ?? 'groq'}` : testResult.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleTest}
                disabled={testing}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${testing ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {testResult && !testResult.success && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Card 2: Inference Parameters */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-teal-500/10 pb-3">
              <Sliders className="w-5 h-5 text-teal-500" />
              <h2>Inference Parameters</h2>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">TEMPERATURE</label>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-teal-500/20">{temperature.toFixed(2)}</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-teal-500 cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Precise / Analytical</span>
                <span>Creative / Hallucinogenic</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">MAX OUTPUT TOKENS</label>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-teal-500/20">{maxTokens}</span>
              </div>
              <input type="range" min="256" max="4096" step="256" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-teal-500 cursor-pointer" />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>256</span><span>1024</span><span>2048</span><span>4096</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CITATION CONFIDENCE THRESHOLD</label>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">{citationThreshold}%</span>
              </div>
              <input type="range" min="50" max="100" value={citationThreshold} onChange={(e) => setCitationThreshold(parseInt(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Provider/model are persisted to the backend. Temperature and token sliders preview Groq defaults (temperature 0.7, max_tokens 2048).
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-teal-500/10">
            <div className="text-xs space-y-1">
              {saveMsg && <span className="font-semibold text-emerald-600 dark:text-emerald-400">{saveMsg}</span>}
              {saveError && <span className="font-semibold text-red-600 dark:text-red-400">{saveError}</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !model}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>

        </div>

        {/* 3. Right Panel */}
        <div className="w-full md:w-[300px] space-y-6 shrink-0">
          <div className="bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RUN MODE</span>
              <span className={`text-xs font-extrabold font-mono ${mode === 'groq' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{mode.toUpperCase()}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span className="text-slate-600 dark:text-slate-400">Groq Inference</span>
                </div>
                <span className={`font-mono font-bold ${mode === 'groq' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{mode === 'groq' ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-slate-600 dark:text-slate-400">Embedded Fallback</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{mode === 'groq' ? 'STANDBY' : 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0f172a] border-l-4 border-slate-900 dark:border-teal-400 border-y border-r border-slate-200 dark:border-teal-500/10 rounded-r-2xl p-5 space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase block">SYSTEM NOTICE</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {keyConfigured
                ? 'Groq API key detected. Chat, quick-fix and query endpoints will use live inference through Groq.'
                : 'No GROQ_API_KEY is configured. The system runs in offline mode using rule-based retrieval, citations, and structured troubleshooting so the app remains fully usable.'}
            </p>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1 pt-1">
              <span>Read Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden relative h-32 border border-slate-200 dark:border-teal-500/10 bg-slate-950 p-3 flex flex-col justify-between shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between text-xs text-teal-400 font-mono font-bold">
              <span>GROQ // INFERENCE NODE</span>
              <span className={`w-2 h-2 rounded-full ${mode === 'groq' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
            </div>
            <div className="bg-black/70 backdrop-blur-md text-slate-200 font-mono text-[10px] px-3 py-1.5 rounded-lg relative z-10 border border-slate-800">
              {mode === 'groq' ? `MODEL: ${model || '—'}` : 'OFFLINE • EMBEDDED FALLBACK'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}