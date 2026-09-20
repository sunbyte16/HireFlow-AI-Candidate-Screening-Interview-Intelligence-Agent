import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, ShieldCheck, Database, 
  RotateCcw, Sparkles, CheckCircle2, AlertTriangle, 
  Cpu, HardDrive, Users, Shield, Crown, RefreshCw,
  Clock, Lock, Check, UserCheck, Heart, Globe, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import { CREATOR_INFO, GithubIcon, LinkedinIcon } from '../components/common/CreatorCredits';

interface Props {
  onResetDemo: () => void;
  isResetting?: boolean;
}

export const SettingsPage: React.FC<Props> = ({ onResetDemo, isResetting = false }) => {
  const { user, isAdmin, loginAsDemo } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [health, setHealth] = useState<{ status: string; version: string; llm_live: boolean; provider: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');

  const loadUsers = async () => {
    if (!isAdmin) return;
    setIsLoadingUsers(true);
    setUserError('');
    try {
      const u = await api.getUsers();
      setUsersList(u);
    } catch (err: any) {
      setUserError(err.message || 'Failed to load user directory');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Check health
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', version: '1.0.0', llm_live: false, provider: 'Deterministic Mock Engine' }));

    // Load keys from localStorage if saved
    const gKey = localStorage.getItem('HIREFLOW_GEMINI_KEY') || '';
    const oKey = localStorage.getItem('HIREFLOW_OPENAI_KEY') || '';
    setGeminiKey(gKey);
    setOpenaiKey(oKey);

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleSaveKeys = () => {
    localStorage.setItem('HIREFLOW_GEMINI_KEY', geminiKey);
    localStorage.setItem('HIREFLOW_OPENAI_KEY', openaiKey);
    setSaveStatus('API settings cached locally! Note: Backend will use server .env or mock engine.');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Platform Settings &amp; AI Engine Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage AI providers, local demo persistence, and recruitment compliance standards.
        </p>
      </div>

      {/* System Health Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>System &amp; AI Engine Health</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Backend Status</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-bold text-slate-200 capitalize">{health?.status || 'Active'}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">v{health?.version || '1.0.0'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Gateway Mode</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.llm_live ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
              <span className="text-sm font-bold text-slate-200">
                {health?.llm_live ? 'Live LLM Provider' : 'Deterministic Mock Engine'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {health?.llm_live ? 'API Active' : 'Zero-Dependency Offline Mode'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Data Layer</span>
            <div className="flex items-center space-x-2 mt-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200">SQLite / SQLAlchemy</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">PostgreSQL ready</span>
          </div>
        </div>
      </div>

      {/* AI Credentials Configuration */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>LLM API Keys (Optional)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Configure external LLM keys if desired. If left unconfigured, HireFlow AI seamlessly uses the built-in deterministic intelligence engine for a 100% reliable hackathon presentation without API rate limits or latency issues.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSaveKeys}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              Save Configuration
            </button>
            {saveStatus && (
              <span className="text-xs text-emerald-400 font-medium">
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Demo Seed Reset */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-blue-400" />
          <span>Hackathon Demo Quick Reset</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restore the database to the initial curated state with the Machine Learning Engineer role, 3 distinct demo candidates (Rahul Sharma, Priya Patel, Arjun Mehta), pre-computed evidence matches, and interview progress.
        </p>
        <div>
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Database...' : 'Re-seed Demo Data Now'}</span>
          </button>
        </div>
      </div>

      {/* Administrator User Directory & Role Governance (Admin Only) */}
      {isAdmin ? (
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <span>User Directory &amp; Role Governance</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Administrator Access
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active recruiter seats, credentials verification, and security parameters.
                </p>
              </div>
            </div>

            <button
              onClick={loadUsers}
              disabled={isLoadingUsers}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Users</span>
            </button>
          </div>

          {userError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {userError}
            </div>
          )}

          {/* User Directory List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {usersList.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    u.role === 'admin' 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                      : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  }`}>
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">{u.full_name}</span>
                      {u.id === user?.id && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Active</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Cryptographic Audit */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Hashing Security</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">PBKDF2-SHA256 (100k rounds)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Token Standard</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">PyJWT (7-Day Validity)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Active Session</span>
              <span className="font-semibold text-purple-300 mt-0.5 block">Admin Authority Verified</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Currently logged in as Recruiter: <strong className="text-slate-200">{user?.email}</strong></span>
          </div>
          <button
            onClick={() => loginAsDemo('admin')}
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition-colors"
          >
            👑 Switch to Admin View
          </button>
        </div>
      )}

      {/* Ethical AI & Fair Hiring Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Responsible AI &amp; Fair Hiring Safeguards</span>
        </div>
        <p className="leading-relaxed">
          HireFlow AI evaluates candidates exclusively on verifiable skills, explicit work experience, and tangible project evidence. The system prohibits analyzing or ranking candidates based on race, religion, gender, disability, age, or sensitive personal attributes. Final employment decisions remain under human recruiter judgment.
        </p>
      </div>

      {/* Platform Engineering & Creator Attribution Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/30 border border-slate-750 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">Platform Architect &amp; Lead Engineer</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Creator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Created with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline mx-0.5" /> by <strong className="text-white font-bold">{CREATOR_INFO.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <a
            href={CREATOR_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all hover:scale-105"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub: @sunbyte16</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={CREATOR_INFO.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 text-xs font-semibold text-blue-200 hover:text-white transition-all hover:scale-105"
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn: Sunil Kumar</span>
            <ExternalLink className="w-3 h-3 text-blue-400" />
          </a>

          <a
            href={CREATOR_INFO.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-xs font-semibold text-emerald-200 hover:text-white transition-all hover:scale-105"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portfolio Website</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
