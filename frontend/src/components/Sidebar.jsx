import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Network, 
  Wrench, 
  Settings,
  ChevronRight,
  Activity,
  HelpCircle,
  Rocket
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, darkMode }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 'Live' },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
    { id: 'field_page', label: 'Field Assistance', icon: Wrench },
  ];

  return (
    <aside 
      className="bg-white dark:bg-gradient-to-b dark:from-[#0a0e27] dark:to-[#1a1f3c] border-r border-slate-200 dark:border-teal-500/10 flex flex-col justify-between h-full shrink-0 transition-colors duration-200 select-none"
      style={{ 
        width: '268px',
        background: darkMode ? 'linear-gradient(to bottom, #0a0e27, #1a1f3c)' : '#ffffff',
        borderRight: darkMode ? '1px solid rgba(0,137,123,0.1)' : '1px solid #dee2e6',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Header section (within sidebar) */}
      <div 
        className="p-3 border-b border-slate-200 dark:border-teal-500/10"
        style={{ 
          padding: '20px',
          borderBottom: '1px solid rgba(0,137,123,0.1)',
        }}
      />

      {/* Top Navigation Links */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? darkMode
                    ? 'bg-[#00897b]/15 text-white dark:border-l-4 dark:border-[#00897b] shadow-sm font-bold'
                    : 'bg-teal-50 text-teal-800 border-l-4 border-teal-500 shadow-sm font-bold'
                  : `text-slate-600 ${darkMode ? 'dark:text-[#7a8aaa] hover:bg-white/5 hover:text-slate-200' : 'hover:bg-slate-100 hover:text-slate-900'}`
              }`}
              style={{ 
                height: '48px',
                padding: '0 16px',
                gap: '12px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  className={`w-4 h-4 ${isActive ? (darkMode ? 'text-white' : 'text-teal-800') : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} 
                  style={{ width: '20px', height: '20px' }}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span 
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? (darkMode ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-800') : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider line */}
      <div 
        className="border-t border-slate-200 dark:border-teal-500/10 mx-3 my-2"
        style={{ 
          borderTop: darkMode ? '1px solid rgba(0,137,123,0.1)' : '1px solid #dee2e6',
          margin: '0 16px',
        }}
      />

      {/* Equipment Quick Status Widget */}
      <div 
        className="mx-3 my-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-teal-500/10"
        style={{ 
          background: darkMode ? 'rgba(255,107,0,0.08)' : 'rgba(255,107,0,0.05)',
          border: darkMode ? '1px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,107,0,0.2)',
          borderRadius: '8px',
          padding: '12px',
          position: 'sticky',
          bottom: '0',
        }}
      >
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Turbine B-42</span>
          </span>
          <span 
            className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20"
            style={{ fontSize: '10px', fontWeight: 'bold' }}
          >
            Alert
          </span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>RPM:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">3,600 (Fluctuating)</span>
          </div>
          <div className="flex justify-between">
            <span>Vibration:</span>
            <span className="font-mono font-medium text-amber-600 dark:text-amber-400">4.8 mm/s</span>
          </div>
        </div>
      </div>

      {/* Bottom Pinned Section */}
      <div 
        className="p-3 border-t border-slate-200 dark:border-teal-500/10 space-y-1"
        style={{ 
          borderTop: darkMode ? '1px solid rgba(0,137,123,0.1)' : '1px solid #dee2e6',
          padding: '0 16px',
        }}
      >
        <button
          onClick={() => setActiveNav('landing')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          style={{ 
            height: '48px',
            padding: '0 16px',
            gap: '12px',
            fontSize: '15px',
          }}
        >
          <Rocket className="w-4 h-4 text-slate-500" />
          <span>Landing Page</span>
        </button>
        <button
          onClick={() => setActiveNav('help')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          style={{ 
            height: '48px',
            padding: '0 16px',
            gap: '12px',
            fontSize: '15px',
          }}
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={() => setActiveNav('settings')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            activeNav === 'settings'
              ? darkMode
                ? 'bg-[#00897b]/15 text-white dark:border-l-4 dark:border-[#00897b] font-bold'
                : 'bg-teal-50 text-teal-800 border-l-4 border-teal-500 font-bold'
              : 'text-slate-600 dark:text-[#7a8aaa] hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          style={{ 
            height: '48px',
            padding: '0 16px',
            gap: '12px',
            fontSize: '15px',
          }}
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </aside>
  );
}
