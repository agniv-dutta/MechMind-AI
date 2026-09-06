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
  Disc
} from 'lucide-react';

export default function WizardModal({ isOpen, onClose }) {
  const [selectedEquipment, setSelectedEquipment] = useState('pump');

  if (!isOpen) return null;

  const equipmentList = [
    {
      id: 'pump',
      title: 'Pump System',
      subtitle: 'Centrifugal, Positive Displacement',
      icon: Disc
    },
    {
      id: 'motor',
      title: 'Industrial Motor',
      subtitle: 'AC/DC, Servo, Stepper',
      icon: Wrench
    },
    {
      id: 'valve',
      title: 'Control Valve',
      subtitle: 'Pneumatic, Hydraulic, Manual',
      icon: ArrowLeftRight
    },
    {
      id: 'compressor',
      title: 'Compressor',
      subtitle: 'Rotary Screw, Reciprocating',
      icon: Wind
    },
    {
      id: 'plc',
      title: 'PLC / Controller',
      subtitle: 'Logic, I/O Modules, Comm',
      icon: Cpu
    },
    {
      id: 'electrical',
      title: 'Electrical Panel',
      subtitle: 'Breakers, Relays, Wiring',
      icon: Zap
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[95vh] overflow-y-auto space-y-6">
        
        {/* 1. Modal Container & Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Quick Troubleshooting Wizard
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              STEP 1 OF 5: EQUIPMENT SELECTION
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 pt-2">
            Select the primary equipment type experiencing the issue to begin targeted diagnostics.
          </p>
        </div>

        {/* 2. Equipment Selection Grid (2 Rows x 3 Columns) */}
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
                    ? 'border-2 border-slate-900 dark:border-teal-400 bg-white dark:bg-slate-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {/* Selected Check Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Circular Icon Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  isSelected 
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950' 
                    : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* 3. Modal Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5 mt-6">
          {/* Left Action: Back button (disabled) */}
          <button
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed border border-slate-200/60 dark:border-slate-700/60 opacity-60"
          >
            Back
          </button>

          {/* Right Action Group */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium px-4 py-2"
            >
              Cancel
            </button>

            {/* Generate Quick Fix button */}
            <button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quick Fix</span>
            </button>

            {/* Next -> button */}
            <button
              onClick={onClose}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
