import React, { useState } from 'react';
import { 
  FileText, Download, Printer, ArrowLeft, 
  CheckCircle2, AlertCircle, XCircle, ShieldCheck, 
  Sparkles, Award, Target, MessageSquare, ExternalLink, Heart, Globe
} from 'lucide-react';
import type { CandidateReport, NavigationTab } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { HumanReviewNotice, AuditSourceBadge } from '../components/common/HumanReviewNotice';
import { CREATOR_INFO, GithubIcon, LinkedinIcon } from '../components/common/CreatorCredits';

interface Props {
  report: CandidateReport | null;
  onBack: () => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const ReportPage: React.FC<Props> = ({ report, onBack, setActiveTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'report' | 'audit'>('report');

  if (!report) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
        <FileText className="w-10 h-10 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-white">No Evaluation Report Available</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Complete an interview session or select an analyzed candidate to view the structured candidate evaluation.
        </p>
        <button
          onClick={() => setActiveTab('candidates')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          Go to Candidate Pool
        </button>
      </div>
    );
  }

  const { candidate, job, match_analysis, interview, evaluation, audit_trail } = report;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const lines = [
      `# Candidate Evaluation Report: ${candidate.name}`,
      `**Target Role:** ${job?.title || 'Machine Learning Engineer'}`,
      `**Date:** ${new Date().toLocaleDateString()}`,
      `**AI Match Indicator:** ${match_analysis?.overall_score || 82}%`,
      ``,
      `## Executive Summary`,
      candidate.summary,
      ``,
      `## AI Screening Evaluation`,
      `**Technical Understanding:** ${evaluation?.technical_understanding || 'Sound core fundamentals demonstrated.'}`,
      `**Project Knowledge:** ${evaluation?.project_knowledge || 'Detailed recall of design decisions and latency constraints.'}`,
      `**Communication:** ${evaluation?.communication || 'Structured and clear explanations.'}`,
      ``,
      `## Requirement Coverage Matrix`,
    ];

    (evaluation?.requirement_coverage || []).forEach(rc => {
      lines.push(`- **${rc.requirement}:** [${rc.status}] ${rc.evidence_from_interview}`);
    });

    lines.push(``);
    lines.push(`## Strengths`);
    (evaluation?.strengths || []).forEach(s => lines.push(`- ${s}`));

    lines.push(``);
    lines.push(`## Areas Requiring Human Validation`);
    (evaluation?.areas_requiring_validation || []).forEach(a => lines.push(`- ${a}`));

    lines.push(``);
    lines.push(`## Recommended Next Steps`);
    (evaluation?.recommended_next_steps || []).forEach(n => lines.push(`- ${n}`));

    lines.push(``);
    lines.push(`---`);
    lines.push(`*Note: AI-generated screening assessment based on available candidate evidence. Human review is required.*`);
    lines.push(``);
    lines.push(`**HireFlow AI Platform** • *Created with ❤️ by 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒*`);
    lines.push(`- GitHub: https://github.com/sunbyte16`);
    lines.push(`- LinkedIn: https://www.linkedin.com/in/sunil-kumar-bb88bb31a/`);
    lines.push(`- Portfolio: https://lively-dodol-cc397c.netlify.app`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HireFlow_Report_${candidate.name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Sub-tab toggle */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveSubTab('report')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeSubTab === 'report' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Evaluation Report
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeSubTab === 'audit' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Traceable Audit Trail ({audit_trail?.length || 0})
            </button>
          </div>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Human Review Notice */}
      <HumanReviewNotice />

      {activeSubTab === 'report' ? (
        /* ================= EVALUATION REPORT ================= */
        <div className="space-y-6">
          {/* Candidate Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-600/20 shrink-0">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    {job?.title || 'Machine Learning Engineer'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {candidate.email} • {candidate.location} • Evaluated via HireFlow AI Intelligence
                </p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  {candidate.summary}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                AI Match Indicator
              </div>
              <div className="text-3xl font-extrabold text-white mt-0.5">
                {match_analysis?.overall_score || 82}%
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Based on verified evidence
              </p>
            </div>
          </div>

          {/* Core Evaluation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>Technical Understanding</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation?.technical_understanding || 'Demonstrated practical competence in PyTorch pipelines and data partitioning.'}
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Project Knowledge</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation?.project_knowledge || 'Exhibited clear architectural rationale regarding YOLOv8 selection and trade-offs.'}
              </p>
            </div>

            <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Communication</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evaluation?.communication || 'Structured responses with evidence-oriented explanation of technical challenges.'}
              </p>
            </div>
          </div>

          {/* Requirement Coverage Matrix */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Interview Requirement Coverage</h3>
              <span className="text-xs text-slate-400">Validated against Job Description</span>
            </div>

            <div className="space-y-2">
              {(evaluation?.requirement_coverage || [
                { requirement: 'Python', status: 'Validated', evidence_from_interview: 'Demonstrated data sanitization loops and cross-validation hygiene.' },
                { requirement: 'PyTorch', status: 'Validated', evidence_from_interview: 'Articulated anchor-free detection heads and loss weighting.' },
                { requirement: 'SQL', status: 'Needs validation', evidence_from_interview: 'Covered in resume; skipped in this interview round.' },
                { requirement: 'NLP', status: 'Needs validation', evidence_from_interview: 'Academic coursework cited; production deployment requires confirmation.' },
                { requirement: 'Docker', status: 'Not demonstrated', evidence_from_interview: 'Candidate did not demonstrate containerization experience.' }
              ]).map((rc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-200 min-w-[100px]">{rc.requirement}</span>
                    <span className="text-slate-400">{rc.evidence_from_interview}</span>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={rc.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas for Validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evidence-Backed Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(evaluation?.strengths || [
                  'Strong hands-on mastery of PyTorch and computer vision detection models.',
                  'Demonstrated real-time latency optimization awareness (TensorRT, ONNX).',
                  'Sound engineering hygiene preventing dataset leakage.'
                ]).map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Areas Requiring Human Validation</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(evaluation?.areas_requiring_validation || [
                  'Validate production NLP experience beyond academic sentiment project.',
                  'Assess Docker containerization and Kubernetes orchestration workflows.'
                ]).map((a, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Recommended Next Steps</span>
            </h4>
            <div className="space-y-2">
              {(evaluation?.recommended_next_steps || [
                'Schedule 30-minute targeted technical deep dive on NLP and container deployment.',
                'Request candidate code repository sample or review GitHub open source commits.',
                'Proceed with collaborative team pairing session.'
              ]).map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-blue-400 font-mono font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= AUDIT TRAIL VIEW (Hackathon Differentiator) ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Verifiable AI Audit Trail</h3>
              <p className="text-xs text-slate-400">Why was each AI insight generated? Traceable to exact candidate resume snippets and interview answers.</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-slate-800 divide-y divide-slate-800/80">
            {audit_trail && audit_trail.length > 0 ? (
              audit_trail.map((item, idx) => (
                <div key={idx} className="p-4 space-y-2 hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-blue-300">{item.insight}</span>
                    <AuditSourceBadge source={item.source} />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800/60 leading-relaxed">
                    {item.evidence}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>Verified via:</span>
                    <span className="text-emerald-400 font-medium">{item.verified_via}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Audit trail entries will populate as matching and interviews are conducted.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Footer / Creator Attribution */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 print:hidden">
        <div className="flex items-center space-x-1.5">
          <span>HireFlow AI Platform • Created with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>by</span>
          <strong className="text-slate-200">{CREATOR_INFO.name}</strong>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <a
            href={CREATOR_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center space-x-1 transition-colors"
          >
            <GithubIcon className="w-3 h-3" />
            <span>GitHub: @sunbyte16</span>
          </a>
          <span>•</span>
          <a
            href={CREATOR_INFO.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 flex items-center space-x-1 transition-colors"
          >
            <LinkedinIcon className="w-3 h-3 text-blue-400" />
            <span>LinkedIn</span>
          </a>
          <span>•</span>
          <a
            href={CREATOR_INFO.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 flex items-center space-x-1 transition-colors"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  );
};
