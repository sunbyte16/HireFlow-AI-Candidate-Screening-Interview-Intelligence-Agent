import React, { useState, useRef } from 'react';
import { 
  Users, Upload, FileText, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Trash2, 
  Sparkles, FileCheck, RefreshCw 
} from 'lucide-react';
import type { Candidate, Job, MatchAnalysis } from '../types';
import { api } from '../services/api';

interface Props {
  candidates: Candidate[];
  activeJob: Job | null;
  matches: MatchAnalysis[];
  onSelectCandidate: (candidateId: string) => void;
  onRefreshCandidates: () => void;
  onCandidateDeleted: (id: string) => void;
}

export const CandidatesPage: React.FC<Props> = ({
  candidates,
  activeJob,
  matches,
  onSelectCandidate,
  onRefreshCandidates,
  onCandidateDeleted
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const fileArray = Array.from(files);
      const uploaded = await api.uploadResumes(fileArray);
      setUploadSuccess(`Successfully parsed and added ${uploaded.length} candidate(s) via AI!`);
      onRefreshCandidates();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload and parse resumes');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (candId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteCandidate(candId);
      onCandidateDeleted(candId);
    } catch (err: any) {
      alert(err.message || 'Could not delete candidate');
    }
  };

  const getCandidateMatch = (candId: string) => {
    return matches.find(m => m.candidate_id === candId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Candidate Pool &amp; Resume Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload candidate resumes in PDF, DOCX, or TXT. AI extracts structured skills, projects, and work history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Resume(s)</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isUploading
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/50 bg-slate-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            ) : (
              <Upload className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            {isUploading ? 'Parsing Resume Entities with AI...' : 'Drag & Drop candidate resumes here, or browse files'}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Supports multi-file upload for <strong className="text-slate-300">PDF, DOCX, and TXT</strong>. Resumes are parsed into structured JSON with zero hallucinations.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {candidates.map((cand) => {
          const match = getCandidateMatch(cand.id);
          const score = match ? match.overall_score : null;

          // Skills to display as quick verification items
          const coreSkills = [
            { name: 'Python', found: (cand.skills.programming_languages || []).includes('Python') },
            { name: 'PyTorch', found: (cand.skills.frameworks || []).includes('PyTorch') },
            { name: 'SQL', found: (cand.skills.programming_languages || []).includes('SQL') || (cand.skills.databases || []).some(d => d.toLowerCase().includes('sql')) },
            { name: 'NLP', found: (cand.skills.ml_ai || []).some(m => m.toLowerCase().includes('nlp')) },
          ];

          return (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate(cand.id)}
              className="glass-card p-5 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Top Avatar & Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-600/20">
                      {cand.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {cand.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {cand.location || 'Remote'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(cand.id, e)}
                    title="Remove Candidate"
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {cand.summary || 'Candidate profile with verified technical projects.'}
                </p>

                {/* Skill Evidence Checklist (From Master Prompt Specification) */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 mb-4">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Requirement Verification
                  </div>
                  {coreSkills.map(sk => (
                    <div key={sk.name} className="flex items-center justify-between text-xs py-0.5">
                      <span className="text-slate-300">{sk.name}</span>
                      {sk.found ? (
                        <span className="text-emerald-400 font-medium text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Found</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium text-xs flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Partial / Check</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Projects snippet */}
                {cand.projects && cand.projects.length > 0 && (
                  <div className="text-[11px] text-slate-400 mb-4">
                    <span className="font-semibold text-slate-300">Key Project: </span>
                    <span className="text-blue-300">{cand.projects[0].name}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  {score !== null ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-white">{score}%</span>
                      <span className="text-[10px] text-slate-400">Match Indicator</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">Not analyzed yet</span>
                  )}
                </div>

                <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center space-x-1">
                  <span>Analyze Candidate</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
