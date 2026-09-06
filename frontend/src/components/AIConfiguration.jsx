import React, { useState } from 'react';
import { 
  Cpu, 
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
  Settings as SettingsIcon
} from 'lucide-react';

export default function AIConfiguration({ onBackToDashboard, onNavigateSettings }) {
  const [showKey, setShowKey] = useState(false);
  const [temperature, setTemperature] = useState(0.70);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [citationThreshold, setCitationThreshold] = useState(85);
  const [provider, setProvider] = useState('OpenAI (Cloud)');
  const [model, setModel] = useState('GPT-4o');

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
      
      {/* 1. Page Header & Navigation State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            AI Model Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage model providers, authentication keys, inference hyper-parameters, and telemetry.
          </p>
        </div>

        {/* Status Badge (Top Right) */}
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Main Configuration Layout (Left Menu + Center Panels + Right Inspector) */}
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
                  item.id === 'ai'
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5 relative">
            
            {/* Top-Right ID Badge */}
            <span className="absolute top-6 right-6 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200/60 dark:border-slate-700/60">
              CFG-01-A
            </span>

            {/* Card Header */}
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Server className="w-5 h-5 text-teal-500" />
              <h2>Core Engine</h2>
            </div>

            {/* Grid Row 1 (Provider & Model Dropdowns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  PROVIDER / BACKEND
                </label>
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                  >
                    <option>OpenAI (Cloud)</option>
                    <option>Anthropic (Claude)</option>
                    <option>Local Ollama / Llama-3</option>
                    <option>Azure OpenAI Service</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ACTIVE MODEL
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none"
                  >
                    <option>GPT-4o</option>
                    <option>GPT-4 Turbo</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>Llama-3-70B-Instruct</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid Row 2 (Authentication Key Input) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  AUTHENTICATION KEY
                </label>
                <a href="#" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  manage keys
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  defaultValue="sk-proj-99482736104826194726194827164920"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
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
                <span>Key encrypted at rest using AES-256.</span>
              </p>
            </div>

            {/* Connection Status Bar Footer */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    Connection Established
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Latency: 42ms | Status: 200 OK
                  </span>
                </div>
              </div>

              <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Test Connection</span>
              </button>
            </div>

          </div>

          {/* Card 2: Inference Parameters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
            
            <div className="flex items-center space-x-2 text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-teal-500" />
              <h2>Inference Parameters</h2>
            </div>

            {/* Slider 1: Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  TEMPERATURE
                </label>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Precise / Analytical</span>
                <span>Creative / Hallucinogenic</span>
              </div>
            </div>

            {/* Slider 2: Max Output Tokens */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  MAX OUTPUT TOKENS
                </label>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  {maxTokens}
                </span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>256</span>
                <span>1024</span>
                <span>2048</span>
                <span>4096</span>
              </div>
            </div>

            {/* Slider 3: Citation Confidence Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    CITATION CONFIDENCE THRESHOLD
                  </label>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                  {citationThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={citationThreshold}
                onChange={(e) => setCitationThreshold(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

          </div>

          {/* 4. Bottom Action Footer Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Reset to Defaults
            </button>

            <button className="bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

        </div>

        {/* 3. Right Panel (~300px width) */}
        <div className="w-full md:w-[300px] space-y-6 shrink-0">
          
          {/* Card 1: Resource Allocation */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                RESOURCE ALLOCATION
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                76% VRAM UTIL.
              </span>
            </div>

            {/* Breakdown Meter Bar */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
              <div className="h-full bg-slate-900 dark:bg-indigo-500 rounded-l-full" style={{ width: '50%' }}></div>
              <div className="h-full bg-teal-400 rounded-r-full" style={{ width: '26%' }}></div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-indigo-500"></span>
                  <span className="text-slate-600 dark:text-slate-400">Compute</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">50%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span className="text-slate-600 dark:text-slate-400">Context Cache</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">26%</span>
              </div>
            </div>
          </div>

          {/* Card 2: System Notice */}
          <div className="bg-slate-50 dark:bg-slate-900 border-l-4 border-slate-900 dark:border-teal-400 border-y border-r border-slate-200 dark:border-slate-800 rounded-r-2xl p-5 space-y-3 shadow-2xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase block">
              SYSTEM NOTICE
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switching between local and cloud providers will invalidate current session context caches. Ensure ongoing diagnostics are saved before modifying active models.
            </p>
            <a href="#" className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1 pt-1">
              <span>Read Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Infrastructure Node Card */}
          <div className="rounded-2xl overflow-hidden relative h-32 border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 flex flex-col justify-between shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-20"></div>
            <div className="relative z-10 flex items-center justify-between text-xs text-teal-400 font-mono font-bold">
              <span>RACK-402 // GPU NODE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="bg-black/70 backdrop-blur-md text-slate-200 font-mono text-[10px] px-3 py-1.5 rounded-lg relative z-10 border border-slate-800">
              INFRASTRUCTURE NODE: US-EAST-1A
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
