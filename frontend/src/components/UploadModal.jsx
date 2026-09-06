import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Tag, 
  Upload,
  ChevronDown,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { uploadDocument } from '../lib/api';

const EQUIPMENT_OPTIONS = ['Turbine', 'Generator', 'Compressor', 'Pump', 'Motor', 'Valve Actuator', 'Heat Exchanger', 'Control Valve', 'Other'];
const CATEGORY_OPTIONS = ['Service Manual', 'Wiring Diagram', 'Telemetry Specs', 'Maintenance Log', 'Troubleshooting Guide', 'P&ID', 'Other'];

export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [equipmentType, setEquipmentType] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | uploading | processing | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [resultMsg, setResultMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const reset = () => {
    setSelectedFile(null);
    setEquipmentType('');
    setCategory('');
    setVersion('');
    setTags([]);
    setNewTagInput('');
    setProgress(0);
    setPhase('idle');
    setErrorMsg('');
    setResultMsg('');
  };

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhase('idle');
      setErrorMsg('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhase('idle');
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Select a file to upload first');
      setPhase('error');
      return;
    }
    setPhase('uploading');
    setProgress(0);
    setErrorMsg('');
    try {
      const result = await uploadDocument({
        file: selectedFile,
        category,
        equipmentType,
        version,
        tags,
        onProgress: (p) => setProgress(p),
      });
      setPhase('processing');
      setProgress(95);
      setTimeout(() => {
        setPhase('done');
        setProgress(100);
        setResultMsg(result.message || `Processed ${result.pages} page(s), extracted ${result.entities_found} entities`);
        if (onUploaded) onUploaded(result);
      }, 400);
    } catch (err) {
      setPhase('error');
      setErrorMsg(err.message || 'Upload failed');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            onClick={() => { reset(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Drag & Drop Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-800/40 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors group"
        >
          {selectedFile ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatSize(selectedFile.size)}
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag files here or click to select
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDF, DOCX, PNG, JPG, TIFF up to 100MB
              </p>
            </>
          )}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.png,.jpg,.jpeg,.tiff" />
        </div>

        {/* 3. Processing Progress (active states) */}
        {phase !== 'idle' && phase !== 'done' && (
          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>{phase === 'uploading' ? 'Uploading...' : 'Processing document...'}</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                <div className={`h-full bg-teal-500 rounded-full transition-all ${phase === 'processing' ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2.5 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-700 dark:text-emerald-300">Upload complete</p>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5">{resultMsg}</p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="font-semibold text-red-700 dark:text-red-300">{errorMsg}</p>
          </div>
        )}

        {/* 4. AUTO-EXTRACTED METADATA Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-3 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Tag className="w-3.5 h-3.5 text-teal-500" />
            <span>DOCUMENT METADATA</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Grid Row 1: Equipment Type & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Equipment Type
                </label>
                <div className="relative">
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 appearance-none font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select equipment...</option>
                    {EQUIPMENT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 appearance-none font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select category...</option>
                    {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid Row 2: Version */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. v2.0"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Grid Row 3: Tags */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      i % 3 === 0
                        ? 'bg-[#1E293B] text-white'
                        : i % 3 === 1
                          ? 'bg-teal-400 text-slate-950'
                          : 'bg-amber-900/90 text-amber-100'
                    }`}
                  >
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="hover:opacity-70">✕</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag..."
                  className="px-2 py-0.5 text-[11px] bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none w-24"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Footer & Global Upload Status */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-end space-x-2.5 pt-1">
            <button
              onClick={() => { reset(); onClose(); }}
              disabled={phase === 'uploading' || phase === 'processing'}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {phase === 'done' ? 'Close' : 'Cancel'}
            </button>
            {phase === 'done' ? (
              <button
                onClick={() => { reset(); onClose(); }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6857] hover:bg-teal-900 transition-all flex items-center space-x-1.5 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || phase === 'uploading' || phase === 'processing'}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6857] hover:bg-teal-900 transition-all flex items-center space-x-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phase === 'uploading' || phase === 'processing' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{phase === 'uploading' ? 'Uploading...' : phase === 'processing' ? 'Processing...' : 'Upload Document'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}