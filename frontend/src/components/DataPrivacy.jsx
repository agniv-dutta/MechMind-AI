import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Scale,
  AtSign,
  ExternalLink,
  Save
} from 'lucide-react';
import ConfirmDialog from './common/ConfirmDialog.jsx';
import { offlineStorage } from '../services/offlineStorage.js';
import { useNotifications } from '../context/NotificationContext.jsx';

export default function DataPrivacy({ onBackToDashboard, onNavigateSettings }) {
  const { notify } = useNotifications();
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);

  const executeDestructiveAction = async () => {
    if (!confirmation) return;
    setBusy(true);
    try {
      if (confirmation.kind === 'cache') await offlineStorage.clearDocuments();
      if (confirmation.kind === 'wipe') await offlineStorage.clearAllLocalData();
      notify(confirmation.success, 'success');
      setConfirmation(null);
    } catch (error) {
      notify(`Action failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setBusy(false);
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
      className="flex-1 flex flex-col h-full bg-slate-100/60 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
      style={{
        background: '#f8fafc',
        padding: '24px',
      }}
    >

      {/* 1. Navigation & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Data & Privacy
          </h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Manage your data retention, export options, and compliance settings.
          </p>
        </div>
        <div className="bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
          <Shield className="w-4 h-4" />
          <span>END-TO-END ENCRYPTED</span>
        </div>
      </div>

      {/* Main Workspace Layout (Left Menu + Center Panels + Right Inspector) */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Left Settings Menu Sidebar (~200px width) */}
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
                className={
                  item.id === 'data'
                    ? 'w-full text-left font-bold text-slate-900 bg-slate-100 rounded-lg px-3 py-2 text-xs transition-all shadow-sm'
                    : 'w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all'
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Central Configuration Cards */}
        <div className="flex-1 min-w-0">
          {/* Card 1: Data Lifecycle Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-700" />
                <span>Data Lifecycle Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                MechMind AI operates on a strictly controlled data retention policy. Your diagnostic logs and chat history are cached locally and synced securely.
              </p>
            </div>

            {/* Grid Row (2 Action Sub-Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sub-Card A: Export Telemetry */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <Download className="w-5 h-5 text-slate-700" />
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                    TXT/JSON
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Export Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Download a comprehensive archive of your session data.
                </p>
                <button className="w-full border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold text-xs py-2 rounded-xl text-center transition-colors mt-2">
                  Execute Export →
                </button>
              </div>

              {/* Sub-Card B: Purge Vector Cache */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-slate-700" />
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    ● 342 MB
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Purge Vector Cache
                </h3>
                <p className="text-xs text-slate-500">
                  Clear local embeddings to free space and reset AI context.
                </p>
                <button type="button" onClick={() => setConfirmation({ kind: 'cache', title: 'Purge local vector cache?', message: 'This removes downloaded document embeddings from this browser only. Your uploaded documents remain available on the server.', success: 'Local vector cache cleared.' })} className="w-full border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors mt-2">
                  <span>Initialize Purge</span>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Danger Zone (Data Eradication) */}
          <div className="bg-white border-l-4 border-red-500 border-y border-r border-slate-200 rounded-r-2xl p-6 flex items-center justify-between shadow-sm mt-6 gap-4 flex-col sm:flex-row">
            <div>
              <h2 className="text-base font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Critical: Data Eradication</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Permanently remove locally cached documents, search history, and chat history from this browser.
              </p>
            </div>
            <button type="button" onClick={() => setConfirmation({ kind: 'wipe', title: 'Erase all local data?', message: 'This permanently removes locally cached documents, searches, and chat history from this browser. It cannot be undone.', success: 'All local browser data has been erased.' })} className="border border-red-500 text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors shrink-0">
              INITIATE WIPE
            </button>
          </div>

          {/* 4. Sticky Bottom Action Bar */}
          <div className="bg-slate-100/90 backdrop-blur-md border-t border-slate-200 p-4 flex items-center justify-between mt-8 sticky bottom-0 gap-3">
            <button className="text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider transition-colors">
              REVERT TO DEFAULTS
            </button>
            <span className="text-xs text-slate-400 font-mono italic hidden sm:block">
              Unsaved changes
            </span>
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-sm transition-colors">
              <Save className="w-4 h-4" />
              <span>COMMIT PARAMETERS</span>
            </button>
          </div>
        </div>

        {/* 3. Right Inspector Panel (~300px width) */}
        <div className="w-full md:w-[300px] shrink-0">
          {/* Card 1: Compliance Directives */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Compliance Directives
            </h3>

            <div>
              <a href="#" className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-900 py-1.5 transition-colors">
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-500" />
                  <span>Terms of Service</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a href="#" className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-900 py-1.5 transition-colors">
                <span className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-slate-500" />
                  <span>Privacy Policy</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* GDPR Status Sub-Section */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GDPR Status</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                This instance complies with EU General Data Protection Regulation (GDPR) mandates. Data processing is confined to diagnostic parameters necessary for operational integrity. No telemetry is sold to third parties.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Region:</span>
                  <span className="text-slate-500">EU-CENTRAL-1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Anonymization:</span>
                  <span className="text-slate-500">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Audit:</span>
                  <span className="text-slate-500">2023-10-24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security Watermark Graphic Box */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center mt-6 flex flex-col justify-center items-center h-32 relative overflow-hidden">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase relative z-10">
              PROTOCOL SYNC
            </span>
            <span className="text-4xl font-extrabold text-slate-300 tracking-wider uppercase mt-1 relative z-10 select-none">
              SECURE
            </span>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.title || ''}
        message={confirmation?.message || ''}
        confirmLabel={confirmation?.kind === 'wipe' ? 'Erase local data' : 'Purge cache'}
        busy={busy}
        onConfirm={executeDestructiveAction}
        onCancel={() => !busy && setConfirmation(null)}
      />
    </div>
  );
}
