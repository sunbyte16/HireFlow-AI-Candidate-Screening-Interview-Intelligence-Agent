import React, { useState, useEffect } from 'react';
import { 
  MessagesSquare, ArrowLeft, ArrowRight, CheckCircle2, 
  Sparkles, ShieldAlert, Target, Lightbulb, Save,
  RotateCcw, Play, Check, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import type { Interview, Candidate, Job, MatchAnalysis, InterviewQuestion } from '../types';
import { api } from '../services/api';

interface Props {
  interview: Interview | null;
  candidate: Candidate | null;
  job: Job | null;
  match: MatchAnalysis | null;
  onBack: () => void;
  onCompleteAndEvaluate: (interviewId: string) => void;
}

export const InterviewWorkspacePage: React.FC<Props> = ({
  interview,
  candidate,
  job,
  match,
  onBack,
  onCompleteAndEvaluate
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [interviewerNotes, setInterviewerNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [followUpData, setFollowUpData] = useState<{
    detected_gap: string;
    follow_up_question: string;
    reasoning: string;
  } | null>(null);
  const [isProbingFollowUp, setIsProbingFollowUp] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const questions: InterviewQuestion[] = interview?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Load existing answer if previously saved
  useEffect(() => {
    if (interview && currentQuestion) {
      const existing = (interview.answers || []).find(a => a.question_id === currentQuestion.id);
      if (existing) {
        setCandidateAnswer(existing.candidate_answer || '');
        setInterviewerNotes(existing.notes || '');
        if (existing.follow_up_generated) {
          setFollowUpData({
            detected_gap: "Context depth requires verification",
            follow_up_question: existing.follow_up_generated,
            reasoning: "Generated based on previous candidate response"
          });
        } else {
          setFollowUpData(null);
        }
      } else {
        setCandidateAnswer('');
        setInterviewerNotes('');
        setFollowUpData(null);
      }
    }
  }, [currentQuestionIndex, interview]);

  if (!interview || !candidate || !currentQuestion) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
        <MessagesSquare className="w-10 h-10 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-white">No active interview session</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Select a candidate from the pool and click "Generate Personalized Interview" to launch the workspace.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          Return to Candidate Pool
        </button>
      </div>
    );
  }

  const handleSaveAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await api.saveAnswer(interview.id, currentQuestion.id, candidateAnswer, interviewerNotes);
      setSaveMessage('Answer notes recorded!');
      setTimeout(() => setSaveMessage(''), 2500);

      // Auto check adaptive follow-up
      setIsProbingFollowUp(true);
      const fu = await api.getFollowUp(interview.id, currentQuestion.id, candidateAnswer);
      setFollowUpData(fu);
    } catch (err: any) {
      alert(err.message || 'Failed to save answer');
    } finally {
      setIsSaving(false);
      setIsProbingFollowUp(false);
    }
  };

  const handleApplyFollowUpToNotes = () => {
    if (followUpData) {
      const appended = `${candidateAnswer}\n\n[Follow-Up Asked]: ${followUpData.follow_up_question}\n[Candidate Follow-Up Response]: `;
      setCandidateAnswer(appended);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      await onCompleteAndEvaluate(interview.id);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Identify candidate skill gaps from match analysis
  const identifiedGaps = (match?.alignment_items || [])
    .filter(i => i.status === 'PARTIAL' || i.status === 'NOT FOUND')
    .map(i => i.requirement);

  return (
    <div className="space-y-4 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Profile</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">
            Interview Progress: <strong className="text-white">{currentQuestionIndex + 1} / {questions.length}</strong> Questions
          </span>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isEvaluating ? 'Evaluating...' : 'Complete & Generate Report'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* ================= LEFT PANE (3 cols): Candidate Profile & Identified Gaps ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{candidate.name}</h3>
                <p className="text-[11px] text-slate-400">{job?.title || 'ML Engineer'}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Match Indicator</span>
                <span className="font-bold text-blue-400">{match?.overall_score || 82}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Strong Matches</span>
                <span className="font-semibold text-emerald-400">{match?.strong_matches_count || 5}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Missing/Unclear</span>
                <span className="font-semibold text-rose-400">{match?.missing_count || 1}</span>
              </div>
            </div>

            {/* Identified Skill Gaps to probe */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                Identified Skill Gaps (Probe in Interview)
              </span>
              <div className="space-y-1">
                {identifiedGaps.length > 0 ? (
                  identifiedGaps.map(gap => (
                    <div key={gap} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                      <span>{gap}</span>
                      <span className="text-[10px] font-mono">Needs Proof</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No major gaps identified.</p>
                )}
              </div>
            </div>

            {/* Candidate Projects */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Referenced Projects
              </span>
              <div className="space-y-1.5">
                {(candidate.projects || []).map((p, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900/60 text-xs">
                    <p className="font-medium text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.technologies.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER PANE (6 cols): Active Question & Answer Capture ================= */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between space-y-4">
            {/* Header of Active Question */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-blue-400">
                  Question {currentQuestion.id} of {questions.length}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                  {currentQuestion.category}
                </span>
              </div>

              {/* The Question */}
              <h3 className="text-base font-bold text-white leading-relaxed pt-1">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Input Areas */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Candidate Answer / Response Transcript
                </label>
                <textarea
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  rows={5}
                  placeholder="Enter candidate's answer or paste response transcript here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-blue-500/60 leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Interviewer Private Notes &amp; Observations
                </label>
                <input
                  type="text"
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  placeholder="e.g., Confident on data partitioning; hesitated slightly on latency optimization"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>

            {/* Adaptive Follow-up Box */}
            {followUpData && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-300 font-semibold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Adaptive AI Follow-Up Probe</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">Real-Time</span>
                </div>
                <p className="text-amber-200 font-medium">
                  "{followUpData.follow_up_question}"
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Gap: {followUpData.detected_gap}
                  </span>
                  <button
                    onClick={handleApplyFollowUpToNotes}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                  >
                    Insert to Answer Notes
                  </button>
                </div>
              </div>
            )}

            {/* Actions & Question Navigation */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveAnswer}
                  disabled={isSaving || !candidateAnswer.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Answer & Check Follow-up'}</span>
                </button>
                {saveMessage && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{saveMessage}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Jumper Pills */}
          <div className="flex items-center justify-center space-x-1.5 py-1">
            {questions.map((q, idx) => {
              const isAnswered = (interview.answers || []).some(a => a.question_id === q.id && a.candidate_answer);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT PANE (3 cols): AI Interview Insights ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white pb-2 border-b border-slate-800">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>AI Interview Insights</span>
            </div>

            {/* Requirement Being Tested */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Requirement Being Tested
              </span>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-300">
                {currentQuestion.target_requirement}
              </div>
            </div>

            {/* Expected Evidence / Listen For */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Expected Evidence (Listen For)
              </span>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {currentQuestion.expected_evidence}
              </div>
            </div>

            {/* Validation Objective */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Interviewer Validation Goal
              </span>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Confirm depth of practical implementation versus superficial theoretical exposure.
              </div>
            </div>

            {/* Suggested Follow-up */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Suggested Follow-Up Angle
              </span>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                {currentQuestion.follow_up_suggestion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
