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
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 'Live' },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
    { id: 'field', label: 'Field Assistance', icon: Wrench },
  ];

  return (
    <aside className="w-[220px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full shrink-0 transition-colors duration-200 select-none">
      {/* Top Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-[#5EEAD4] text-slate-950 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-[#5EEAD4]' : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Equipment Quick Status Widget */}
      <div className="mx-3 my-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-500" />
            <span>Turbine B-42</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
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
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button
          onClick={() => setActiveNav('help')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={() => setActiveNav('settings')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
            activeNav === 'settings'
              ? 'bg-[#5EEAD4] text-slate-950 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
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
