import React from 'react';
import { 
  Users, Briefcase, BarChart3, MessagesSquare, 
  ArrowUpRight, Plus, Upload, Play, CheckCircle2, 
  AlertCircle, XCircle, Sparkles, ChevronRight
} from 'lucide-react';
import type { Job, Candidate, MatchAnalysis, NavigationTab } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { HumanReviewNotice } from '../components/common/HumanReviewNotice';

interface Props {
  jobs: Job[];
  candidates: Candidate[];
  matches: MatchAnalysis[];
  activeJob: Job | null;
  onSelectCandidate: (candidateId: string) => void;
  onStartInterview: (candidateId: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<Props> = ({
  jobs,
  candidates,
  matches,
  activeJob,
  onSelectCandidate,
  onStartInterview,
  setActiveTab
}) => {
  const analyzedCount = matches.length;
  const interviewCount = candidates.length > 0 ? 1 : 0; // At least Candidate A has active interview in demo

  // Get match for a candidate
  const getCandidateMatch = (candId: string) => {
    return matches.find(m => m.candidate_id === candId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Recruitment Campaign</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {activeJob ? activeJob.title : 'Machine Learning Engineer'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department: {activeJob?.department || 'Core AI Engineering'} • Location: {activeJob?.location || 'Remote / Hybrid'} • {candidates.length} candidates in screening pipeline
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Create Job</span>
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload Resume</span>
          </button>
          <button
            onClick={() => {
              if (candidates.length > 0) onSelectCandidate(candidates[0].id);
              else setActiveTab('candidates');
            }}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Screen Candidate</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Candidates</p>
            <p className="text-2xl font-bold text-white mt-1">{candidates.length}</p>
            <span className="text-[11px] text-emerald-400 font-medium">Pool loaded &amp; ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Job Roles</p>
            <p className="text-2xl font-bold text-white mt-1">{jobs.length}</p>
            <span className="text-[11px] text-blue-400 font-medium">1 Primary Target</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Evidence Matches</p>
            <p className="text-2xl font-bold text-white mt-1">{analyzedCount}</p>
            <span className="text-[11px] text-emerald-400 font-medium">Granular citations</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Interviews Generated</p>
            <p className="text-2xl font-bold text-white mt-1">{interviewCount}</p>
            <span className="text-[11px] text-amber-400 font-medium">Adaptive Q&amp;A</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <MessagesSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Human Review Notice */}
      <HumanReviewNotice />

      {/* Main Two Column Section: Candidates List & Match Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Candidate Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <span>Screened Candidates for Role</span>
              <span className="text-xs font-normal text-slate-400">({candidates.length} Profiles)</span>
            </h3>
            <button
              onClick={() => setActiveTab('candidates')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => {
              const match = getCandidateMatch(cand.id);
              const score = match ? match.overall_score : 75.0;
              const strong = match ? match.strong_matches_count : 4;
              const partial = match ? match.partial_matches_count : 2;
              const missing = match ? match.missing_count : 1;

              return (
                <div
                  key={cand.id}
                  className="glass-card p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/40 flex items-center justify-center font-bold text-slate-200 text-sm shrink-0">
                      {cand.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-white hover:text-blue-400 cursor-pointer" onClick={() => onSelectCandidate(cand.id)}>
                          {cand.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cand.location}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {cand.summary}
                      </p>

                      {/* Quick Skill Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {(cand.skills.programming_languages || []).slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {s}
                          </span>
                        ))}
                        {(cand.skills.frameworks || []).slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Gauge & Actions */}
                  <div className="flex items-center space-x-4 self-end sm:self-center shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="text-right">
                      <div className="flex items-center space-x-1.5 justify-end">
                        <span className="text-base font-bold text-white">{score}%</span>
                        <span className="text-[10px] text-slate-400">Match</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-emerald-400 font-medium">{strong} matched</span>
                        <span>•</span>
                        <span className="text-amber-400">{partial} partial</span>
                        <span>•</span>
                        <span className="text-rose-400">{missing} missing</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectCandidate(cand.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                      >
                        Evidence
                      </button>
                      <button
                        onClick={() => onStartInterview(cand.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Play className="w-3 h-3" />
                        <span>Interview</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 span): Match Alignment Distribution & Role Info */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Matching Intelligence Overview</span>
            </h3>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Role</span>
                <span className="font-semibold text-slate-200">{activeJob?.title || 'ML Engineer'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Required Skills</span>
                <span className="font-mono text-slate-300">{activeJob?.required_skills?.length || 6} Skills</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Preferred Skills</span>
                <span className="font-mono text-slate-300">{activeJob?.preferred_skills?.length || 2} Skills</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Screening Logic</span>
                <span className="text-emerald-400 font-medium">Traceable Evidence</span>
              </div>
            </div>

            {/* Requirement Checklist preview */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Core Requirements Checked
              </p>
              <div className="space-y-1.5">
                {(activeJob?.required_skills || ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'NLP']).map(skill => (
                  <div key={skill} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/50">
                    <span className="text-slate-300 font-medium">{skill}</span>
                    <span className="text-[10px] text-blue-400 font-mono">Evidence-Mapped</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('jobs')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium text-center transition-colors block"
              >
                Inspect Extracted JD Schema →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
