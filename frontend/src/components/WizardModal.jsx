import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Wrench, 
  Cpu, 
  ArrowLeftRight, 
  Wind, 
  Zap, 
  Sparkles, 
  ChevronRight,
  Disc,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { quickFix } from '../lib/api';

export default function WizardModal({ isOpen, onClose }) {
  const [selectedEquipment, setSelectedEquipment] = useState('pump');
  const [symptom, setSymptom] = useState('');
  const [step, setStep] = useState('select'); // select | symptom | results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const equipmentList = [
    { id: 'pump', title: 'Pump System', subtitle: 'Centrifugal, Positive Displacement', icon: Disc },
    { id: 'motor', title: 'Industrial Motor', subtitle: 'AC/DC, Servo, Stepper', icon: Wrench },
    { id: 'valve', title: 'Control Valve', subtitle: 'Actuator, Solenoid, Hydraulic', icon: ArrowLeftRight },
    { id: 'compressor', title: 'Compressor', subtitle: 'Rotary Screw, Reciprocating', icon: Wind },
    { id: 'plc', title: 'PLC / Controller', subtitle: 'Logic, I/O Modules, Comm', icon: Cpu },
    { id: 'electrical', title: 'Electrical Panel', subtitle: 'Breakers, Relays, Wiring', icon: Zap },
  ];

  const equipmentLabel = (id) => equipmentList.find((e) => e.id === id)?.title || id;

  const reset = () => {
    setStep('select');
    setSymptom('');
    setError('');
    setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const generate = async () => {
    if (!symptom.trim()) {
      setError('Describe the symptom first (e.g. "overheating during startup")');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await quickFix({ equipmentType: equipmentLabel(selectedEquipment), symptom: symptom.trim() });
      setResult(res);
      setStep('results');
    } catch (err) {
      setError(err.detail || err.message || 'Failed to generate quick fix');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-3xl w-full bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Quick Troubleshooting Wizard
            </h2>
            <button onClick={handleClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              {step === 'select' ? 'STEP 1 OF 2: EQUIPMENT SELECTION' : step === 'symptom' ? 'STEP 2 OF 2: SYMPTOM DESCRIPTION' : 'QUICK FIX GENERATED'}
            </span>
          </div>

          <p className="text-sm text-slate-600 pt-2">
            {step === 'select'
              ? 'Select the primary equipment type experiencing the issue to begin targeted diagnostics.'
              : step === 'symptom'
                ? `Describe what is failing on the ${equipmentLabel(selectedEquipment)}.`
                : `Troubleshooting chain for ${equipmentLabel(selectedEquipment)}.`}
          </p>
        </div>

        {step === 'select' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipmentList.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedEquipment === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEquipment(item.id)}
                    className={`p-6 text-center rounded-xl transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-2 border-slate-900 bg-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 'symptom' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SYMPTOM / FAULT DESCRIPTION
              </label>
              <textarea
                rows={4}
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="e.g. Overheating above 80C during startup, pressure fluctuating, vibration increasing..."
                className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
              <p className="text-[11px] text-slate-400">
                The wizard will match your symptom against the indexed knowledge base and produce a structured field checklist.
              </p>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {step === 'results' && result && (
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">IDENTIFIED PROBLEM</span>
              <p className="text-sm font-semibold text-slate-900">{result.problem || '—'}</p>
            </div>

            {result.root_causes?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">LIKELY ROOT CAUSES</span>
                {result.root_causes.map((rc, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 text-sm">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-slate-700 text-xs leading-relaxed">{rc}</p>
                  </div>
                ))}
              </div>
            )}

            {result.steps?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">FIELD Action STEPS</span>
                {result.steps.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#0D6857] text-white flex items-center justify-center text-[10px] font-bold">{s.step ?? i + 1}</span>
                      <span className="text-sm font-bold text-slate-900">{s.action}</span>
                    </div>
                    {s.expected && (
                      <p className="text-xs text-slate-500 pl-8">
                        <span className="font-semibold text-slate-600">Expected: </span>{s.expected}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {result.sources_used?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SOURCES USED</span>
                <div className="flex flex-wrap gap-2">
                  {result.sources_used.map((s, i) => (
                    <span key={i} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 text-[11px] font-semibold border border-blue-500/20">
                      <FileText className="w-3 h-3" />
                      <span className="max-w-[220px] truncate">{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.citations?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CITATIONS</span>
                {result.citations.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">{c.source_doc}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">page {c.page}</span>
                    <p className="text-slate-500 mt-1 text-[11px] line-clamp-2">{c.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-5 mt-6">
          {step === 'select' ? (
            <button disabled className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200/60 opacity-60">
              Back
            </button>
          ) : (
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200/60 hover:bg-slate-200 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <button onClick={handleClose} className="text-slate-600 hover:text-slate-900 text-sm font-medium px-4 py-2">
              Cancel
            </button>

            {step !== 'results' && (
              <button
                onClick={step === 'select' ? () => setStep('symptom') : generate}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Generating...' : 'Generate Quick Fix'}</span>
              </button>
            )}

            {step === 'select' && (
              <button
                onClick={() => setStep('symptom')}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 'results' && (
              <button
                onClick={handleClose}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
