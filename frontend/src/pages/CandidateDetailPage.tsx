import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, XCircle, 
  ShieldCheck, MessagesSquare, Calendar, Building, 
  Code, GraduationCap, Award, ExternalLink, Sparkles,
  Layers, ChevronRight, FileText
} from 'lucide-react';
import type { Candidate, Job, MatchAnalysis, AlignmentItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { HumanReviewNotice, AuditSourceBadge } from '../components/common/HumanReviewNotice';

interface Props {
  candidate: Candidate;
  job: Job | null;
  match: MatchAnalysis | null;
  onBack: () => void;
  onGenerateInterview: (candidateId: string) => void;
  onRefreshMatch: () => void;
  isGeneratingInterview?: boolean;
}

export const CandidateDetailPage: React.FC<Props> = ({
  candidate,
  job,
  match,
  onBack,
  onGenerateInterview,
  onRefreshMatch,
  isGeneratingInterview = false
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'profile' | 'projects' | 'experience'>('match');

  const score = match ? match.overall_score : 82.0;
  const strongCount = match ? match.strong_matches_count : 5;
  const partialCount = match ? match.partial_matches_count : 2;
  const missingCount = match ? match.missing_count : 1;
  const alignmentItems: AlignmentItem[] = match ? match.alignment_items : [];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Pool</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onGenerateInterview(candidate.id)}
            disabled={isGeneratingInterview}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            <MessagesSquare className="w-4 h-4" />
            <span>{isGeneratingInterview ? 'Generating Interview...' : 'Generate Personalized Interview'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Candidate Executive Hero Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-600/20 shrink-0">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {job ? job.title : 'Machine Learning Engineer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {candidate.email} • {candidate.phone} • {candidate.location}
            </p>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {candidate.summary}
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="flex items-center space-x-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 self-start md:self-auto">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              AI Match Indicator
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-3xl font-extrabold text-white">{score}%</span>
              <span className="text-xs text-blue-400 font-medium">Fit</span>
            </div>
          </div>

          <div className="border-l border-slate-800 pl-6 space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Strong Matches:</span>
              <span className="font-semibold text-emerald-400">{strongCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400">Partial Matches:</span>
              <span className="font-semibold text-amber-400">{partialCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="text-slate-400">Missing Gaps:</span>
              <span className="font-semibold text-rose-400">{missingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Human Review Notice */}
      <HumanReviewNotice />

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('match')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'match'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Evidence-Based Skill Alignment</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Categorized Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'projects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Projects ({candidate.projects?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'experience'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Experience &amp; Education</span>
        </button>
      </div>

      {/* Tab 1: Evidence-Based Match Alignment Table */}
      {activeTab === 'match' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Requirement Alignment Matrix</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Target: {job ? job.title : 'Machine Learning Engineer'}
            </span>
          </div>

          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Verifiable Evidence</th>
                    <th className="py-3 px-4">Resume Source Breadcrumb</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {alignmentItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      {/* Requirement */}
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {item.requirement}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {item.category}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Evidence */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-slate-300 leading-relaxed font-mono text-[11px]">
                          {item.evidence}
                        </div>
                        {item.missing_context && (
                          <div className="mt-1 text-[10px] text-amber-400/90 flex items-center space-x-1">
                            <span className="font-semibold">Context Gap:</span>
                            <span>{item.missing_context}</span>
                          </div>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <AuditSourceBadge source={item.source} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Categorized Skills */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(candidate.skills || {}).map(([cat, skills]) => (
            <div key={cat} className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span>{cat.replace('_', ' ')}</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700/80">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Projects Cards */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(candidate.projects || []).map((proj, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>{proj.name}</span>
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {proj.description}
              </p>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Experience & Education */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          {/* Experience */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Professional Experience</span>
            </h4>
            <div className="space-y-4">
              {(candidate.experience || []).map((exp, idx) => (
                <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-200">{exp.role}</span>
                    <span className="text-xs font-mono text-slate-400">{exp.duration}</span>
                  </div>
                  <p className="text-xs text-blue-400 font-medium">{exp.company}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300">
                    {exp.responsibilities.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start space-x-2">
                        <span className="text-slate-500">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Education</span>
            </h4>
            <div className="space-y-3">
              {(candidate.education || []).map((edu, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="font-semibold text-slate-200">{edu.degree}</p>
                    <p className="text-slate-400">{edu.institution}</p>
                  </div>
                  <span className="font-mono text-slate-400">{edu.graduation_year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
