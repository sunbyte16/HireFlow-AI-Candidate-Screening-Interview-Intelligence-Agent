import { Search, RotateCcw, User, Sparkles, LogOut, Shield, KeyRound } from 'lucide-react';
import type { NavigationTab } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onResetDemo: () => void;
  isResetting?: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  isResetting = false,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'landing': return 'Product Overview';
      case 'dashboard': return 'Recruiter Command Center';
      case 'jobs': return 'Job Requirements & JD Analyzer';
      case 'candidates': return 'Candidate Pool & Resume Upload';
      case 'matching': return 'Evidence-Based Match Analysis';
      case 'interview': return 'AI Interview Intelligence Workspace';
      case 'report': return 'Structured Candidate Evaluation';
      case 'search': return 'Natural Language Candidate Search';
      case 'settings': return 'Platform Settings & AI Configuration';
      default: return 'Recruiter Portal';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-16 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb / Title */}
      <div className="flex items-center space-x-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
            <span>{getTabTitle(activeTab)}</span>
          </h1>
          <p className="text-[11px] text-slate-400">
            HireFlow AI Platform • Enterprise Candidate Intelligence
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask HireFlow... e.g., 'candidates with PyTorch and YOLO'"
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-20 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <button
            onClick={onSearchSubmit}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-medium flex items-center space-x-1 transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Reset / Reload Demo */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reload Demo Data"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isResetting ? 'Seeding...' : 'Load Demo Data'}</span>
        </button>

        {/* User Profile or Sign In */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 border border-blue-500/40 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{user.full_name}</div>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
