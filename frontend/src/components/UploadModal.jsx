import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileImage, 
  CheckCircle2, 
  FileCode, 
  Tag, 
  Upload,
  ChevronDown
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  const [tags, setTags] = useState(['B-Series', 'Startup', 'High Vibration']);
  const [newTagInput, setNewTagInput] = useState('');

  if (!isOpen) return null;

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Upload Technical Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Drag & Drop Upload Zone */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-800/40 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drag files here or click to select
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            PDF, DOCX, PNG, JPG, TIFF up to 100MB
          </p>
        </div>

        {/* 3. ACTIVE FILES Section */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
            Active Files
          </div>

          <div className="space-y-2">
            {/* File Row 1 (Completed) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    Turbine_Service_Manual_v4.pdf
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    34 MB
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
            </div>

            {/* File Row 2 (Uploading) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      B-42_Wiring_Diagram.png
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      12 MB
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  65%
                </span>
              </div>
              {/* Blue progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* File Row 3 (Processing) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Lube_System_Specs.docx
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      2 MB
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 italic">
                  Processing...
                </span>
              </div>
              {/* Active progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. AUTO-EXTRACTED METADATA Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-3 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Tag className="w-3.5 h-3.5 text-teal-500" />
            <span>AUTO-EXTRACTED METADATA</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Grid Row 1: Equipment Type & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Equipment Type
                </label>
                <div className="relative">
                  <select className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 appearance-none font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500">
                    <option>Turbine</option>
                    <option>Generator</option>
                    <option>Compressor</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 appearance-none font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500">
                    <option>Wiring Diagram</option>
                    <option>Service Manual</option>
                    <option>Telemetry Specs</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid Row 2: Version / Date */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Version / Date
              </label>
              <input
                type="text"
                defaultValue="v4.0 - Oct 2023"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Grid Row 3: Tags */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Dark navy tag */}
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#1E293B] text-white text-[11px] font-medium">
                  <span>B-Series</span>
                  <button onClick={() => removeTag('B-Series')} className="hover:text-slate-300">✕</button>
                </span>

                {/* Bright teal tag */}
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-teal-400 text-slate-950 text-[11px] font-bold">
                  <span>Startup</span>
                  <button onClick={() => removeTag('Startup')} className="hover:text-slate-800">✕</button>
                </span>

                {/* Dark red/brown tag */}
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-900/90 text-amber-100 text-[11px] font-medium">
                  <span>High Vibration</span>
                  <button onClick={() => removeTag('High Vibration')} className="hover:text-amber-300">✕</button>
                </span>

                {/* Inline text prompt */}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag..."
                  className="px-2 py-0.5 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Footer & Global Upload Status */}
        <div className="pt-2 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Processing 2 of 5 documents</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">40%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: '40%' }}></div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6857] hover:bg-teal-900 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload All</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
