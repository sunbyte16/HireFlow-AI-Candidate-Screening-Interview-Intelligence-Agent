import React, { useState } from 'react';
import { 
  Briefcase, Sparkles, Plus, CheckCircle2, 
  Code, Eye, Layers, Trash2, ArrowRight
} from 'lucide-react';
import type { Job } from '../types';
import { api } from '../services/api';

interface Props {
  jobs: Job[];
  activeJob: Job | null;
  onSelectJob: (job: Job) => void;
  onJobCreated: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

const SAMPLE_JD = `Machine Learning Engineer

Department: Core AI Platform
Location: Remote / Hybrid (San Francisco, CA)
Experience: 1+ years experience

Requirements:
- Python
- Machine Learning
- PyTorch or TensorFlow
- SQL
- NLP
- Computer Vision
- 1+ years practical experience

Preferred Qualifications:
- Docker & Containerization
- AWS (S3, EC2, SageMaker)
- Real-time inference latency optimization (ONNX / TensorRT)
- Bachelor's in Computer Science or related STEM field

Responsibilities:
- Build and evaluate scalable deep learning models in PyTorch
- Create data transformation and ETL pipelines with Python and SQL
- Profile and optimize model latency for real-time serving`;

export const JobsPage: React.FC<Props> = ({
  jobs,
  activeJob,
  onSelectJob,
  onJobCreated,
  onDeleteJob
}) => {
  const [title, setTitle] = useState('Machine Learning Engineer');
  const [description, setDescription] = useState(SAMPLE_JD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Job> | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage('');
    try {
      const parsed = await api.analyzeJD({ title, description });
      setExtractedData(parsed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveJob = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    try {
      const created = await api.createJob({
        title: title || 'Machine Learning Engineer',
        description,
        department: 'Core AI Platform',
        location: 'Remote / Hybrid'
      });
      onJobCreated(created);
      setExtractedData(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save job');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setTitle('Machine Learning Engineer');
    setDescription(SAMPLE_JD);
    setExtractedData(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Job Description Analyzer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extract structured requirements, skills, experience, and domain constraints from raw text with AI.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            Insert Sample ML JD
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor on Left, Extracted Requirements on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Input Job Description</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Raw Text</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Machine Learning Engineer"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Description Content</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={14}
              placeholder="Paste job description text here..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500/60 resize-none leading-relaxed"
            />
          </div>

          {errorMessage && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description.trim()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-blue-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Extracting Requirements...' : 'Analyze JD with AI'}</span>
            </button>

            <button
              onClick={handleSaveJob}
              disabled={isAnalyzing || !description.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <span>Save &amp; Set as Active Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Extracted Structured Requirements View */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Extracted Structured Requirements</h3>
            </div>
            <button
              onClick={() => setShowJson(!showJson)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center space-x-1"
            >
              <Code className="w-3 h-3 text-blue-400" />
              <span>{showJson ? 'Visual UI' : 'JSON Schema'}</span>
            </button>
          </div>

          {/* If not analyzed yet and activeJob exists, use activeJob as default */}
          {(() => {
            const data = extractedData || activeJob;
            if (!data) {
              return (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                  <Briefcase className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No job description analyzed yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Click "Analyze JD with AI" to extract structured skills and responsibilities.</p>
                </div>
              );
            }

            if (showJson) {
              return (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[500px]">
                  <pre className="text-[11px] font-mono text-blue-300 leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Title & Domain Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Extracted Role</span>
                    <h4 className="text-base font-bold text-white">{data.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{data.domain || 'Machine Learning'} • {data.experience || '1+ years'}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Validated
                  </span>
                </div>

                {/* Required Skills */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Strict Required Skills ({data.required_skills?.length || 0})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.required_skills || []).map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Preferred / Nice-to-Have Skills ({data.preferred_skills?.length || 0})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.preferred_skills || []).map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tools & Frameworks */}
                {data.tools && data.tools.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Target Frameworks &amp; Tools
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {data.tools.map((tool: string) => (
                        <span key={tool} className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsibilities */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Key Job Responsibilities
                  </label>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {(data.responsibilities || []).map((resp: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 py-0.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
