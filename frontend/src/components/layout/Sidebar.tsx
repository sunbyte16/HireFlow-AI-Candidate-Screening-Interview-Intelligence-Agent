import React from 'react';
import { 
  LayoutDashboard, Briefcase, Users, 
  MessagesSquare, FileText, Sparkles, 
  Settings, Zap, ShieldAlert, Compass
} from 'lucide-react';
import type { NavigationTab } from '../../types';
import { CreatorSidebarCard } from '../common/CreatorCredits';

interface Props {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  candidateCount?: number;
  jobCount?: number;
}

export const Sidebar: React.FC<Props> = ({ 
  activeTab, 
  setActiveTab,
  candidateCount = 3,
  jobCount = 1
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs' as NavigationTab, label: 'Job Descriptions', icon: Briefcase, badge: jobCount },
    { id: 'candidates' as NavigationTab, label: 'Candidate Pool', icon: Users, badge: candidateCount },
    { id: 'interview' as NavigationTab, label: 'Interview Workspace', icon: MessagesSquare },
    { id: 'report' as NavigationTab, label: 'Reports', icon: FileText },
    { id: 'search' as NavigationTab, label: 'AI Search', icon: Sparkles, highlight: true },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0c1222] border-r border-slate-800/80 flex flex-col h-screen shrink-0 selection:bg-blue-600">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-white tracking-tight">HireFlow</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Interview Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Platform
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Presentation
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'landing'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Product Landing Page</span>
        </button>
      </div>

      {/* Footer / Creator Attribution & Demo Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <CreatorSidebarCard />

        <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-slate-300">Hackathon Mode</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Active</span>
        </div>
      </div>
    </aside>
  );
};
