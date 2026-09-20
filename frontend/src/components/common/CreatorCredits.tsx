import React from 'react';
import { Heart, Globe, ExternalLink, Sparkles } from 'lucide-react';

export const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

export const CREATOR_INFO = {
  name: '𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒',
  plainName: 'Sunil Sharma',
  github: 'https://github.com/sunbyte16',
  linkedin: 'https://www.linkedin.com/in/sunil-kumar-bb88bb31a/',
  portfolio: 'https://lively-dodol-cc397c.netlify.app'
};

/**
 * Compact Creator Badge for Sidebars, Card Footers, and Toolbars
 */
export const CreatorSidebarCard: React.FC = () => {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-lg text-slate-300">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-200 tracking-tight">
            Created By
          </span>
        </div>
        <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          {CREATOR_INFO.name}
        </span>
      </div>

      <p className="text-[10px] text-slate-400 leading-tight mb-2.5">
        AI &amp; ML Architecture • Recruitment Intelligence
      </p>

      {/* Social Links Row */}
      <div className="flex items-center space-x-1.5 pt-1.5 border-t border-slate-800/60">
        <a
          href={CREATOR_INFO.github}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub: sunbyte16"
          className="flex-1 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center space-x-1 text-[10px] font-medium transition-all"
        >
          <GithubIcon className="w-3 h-3" />
          <span className="hidden sm:inline">GitHub</span>
        </a>

        <a
          href={CREATOR_INFO.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn Profile"
          className="flex-1 p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-blue-200 border border-blue-800/40 flex items-center justify-center space-x-1 text-[10px] font-medium transition-all"
        >
          <LinkedinIcon className="w-3 h-3" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>

        <a
          href={CREATOR_INFO.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          title="Live Portfolio"
          className="flex-1 p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 border border-emerald-800/40 flex items-center justify-center space-x-1 text-[10px] font-medium transition-all"
        >
          <Globe className="w-3 h-3" />
          <span className="hidden sm:inline">Portfolio</span>
        </a>
      </div>
    </div>
  );
};

/**
 * Full Footer for Public Homepage & Landing Page
 */
export const CreatorFooter: React.FC = () => {
  return (
    <footer className="mt-16 pt-12 pb-10 border-t border-slate-800/80 text-center text-slate-400">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        
        {/* Creator Identity Hero Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <span className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
            <span>Created with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse inline" />
            <span>by</span>
            <strong className="text-white font-bold tracking-wide">{CREATOR_INFO.name}</strong>
          </span>
        </div>

        {/* Social Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={CREATOR_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-200 hover:text-white transition-all hover:scale-105"
          >
            <GithubIcon className="w-4 h-4 text-slate-300" />
            <span>GitHub: @sunbyte16</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          <a
            href={CREATOR_INFO.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 text-xs font-semibold text-blue-200 hover:text-white transition-all hover:scale-105"
          >
            <LinkedinIcon className="w-4 h-4 text-blue-400" />
            <span>LinkedIn: Sunil Kumar</span>
            <ExternalLink className="w-3 h-3 text-blue-400/60" />
          </a>

          <a
            href={CREATOR_INFO.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:text-white transition-all hover:scale-105"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Portfolio: lively-dodol</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/60" />
          </a>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-500 space-y-1">
          <p>© 2026 HireFlow AI • Candidate Screening &amp; Interview Intelligence Agent</p>
          <p className="text-[11px] text-slate-400">
            Engineered with verifiable citations &amp; ethical human-in-the-loop candidate screening.
          </p>
        </div>

      </div>
    </footer>
  );
};
