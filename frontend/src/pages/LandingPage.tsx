import React, { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, 
  Sparkles, FileSearch, Target, MessagesSquare, 
  Cpu, Award, Layers, Users, Zap, 
  Calculator, Check, X, Shield, Lock,
  ChevronRight, Play, Terminal, HelpCircle,
  FileCheck, ExternalLink, RefreshCw, BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CreatorFooter, CREATOR_INFO } from '../components/common/CreatorCredits';

interface Props {
  onStartScreening: () => void;
  onViewDemo: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<Props> = ({ 
  onStartScreening, 
  onViewDemo, 
  onOpenAuth 
}) => {
  const { user, isAuthenticated, isAdmin, logout, loginAsDemo } = useAuth();

  // Interactive Simulator Tab State
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<
    'jd' | 'resume' | 'match' | 'interview' | 'report'
  >('match');

  // ROI Calculator State
  const [candidatesPerMonth, setCandidatesPerMonth] = useState<number>(45);
  const [interviewHoursPerCandidate, setInterviewHoursPerCandidate] = useState<number>(3);

  // Interactive Simulator Live Test Answer
  const [testAnswer, setTestAnswer] = useState<string>("I trained a YOLOv8 model in PyTorch.");
  const [simulatedFollowUp, setSimulatedFollowUp] = useState<string | null>(
    "What loss function, learning rate scheduler, and optimizer did you select, and what trade-offs influenced that choice?"
  );

  // Calculate ROI
  const hoursSavedPerCandidate = 2.2;
  const totalHoursSavedMonth = Math.round(candidatesPerMonth * hoursSavedPerCandidate);
  const estimatedCostSaved = Math.round(totalHoursSavedMonth * 85 * 12).toLocaleString();

  const handleSimulateAnswer = () => {
    if (testAnswer.toLowerCase().includes("pytorch") || testAnswer.toLowerCase().includes("yolo")) {
      setSimulatedFollowUp(
        "What specific optimizer, learning rate schedule, and IoU threshold did you calibrate for small object recall?"
      );
    } else {
      setSimulatedFollowUp(
        "Can you share the benchmark latency and quantitative accuracy metrics achieved in production?"
      );
    }
  };

  const handleQuickDemoLogin = async (role: 'admin' | 'recruiter') => {
    try {
      await loginAsDemo(role);
      onStartScreening();
    } catch (err) {
      console.error('Fast login error:', err);
    }
  };

  return (
    <div className="min-h-full pb-20 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER WITH CORNER AUTH BUTTONS
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#090d16]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onStartScreening}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">HireFlow</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Screening &amp; Interview Intelligence</p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <a href="#simulator" className="hover:text-blue-400 transition-colors">Live Simulator</a>
            <a href="#roi" className="hover:text-blue-400 transition-colors">ROI Calculator</a>
            <a href="#compare" className="hover:text-blue-400 transition-colors">Enterprise Compare</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Key Capabilities</a>
          </nav>

          {/* Right Corner: Sign In / Sign Up Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* User Pill */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/40">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">{user.full_name}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Dashboard Shortcut */}
                <button
                  onClick={onStartScreening}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-750 text-xs font-semibold transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Recruiter Copilot • Hackathon MVP</span>
          </div>
          <a
            href={CREATOR_INFO.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm"
          >
            <span>Created with ❤️ by</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-bold">
              {CREATOR_INFO.name}
            </span>
          </a>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Evidence-Based Candidate Screening &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Interview Intelligence
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto mb-8 leading-relaxed">
          Replace arbitrary ATS percentage scores with verifiable citations. Match skills to exact resume sentences, generate tailored technical interviews, and conduct real-time adaptive probing.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <button
            onClick={onStartScreening}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Launch Recruiter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4 text-blue-400" />
            <span>Load Demo (ML Engineer Role)</span>
          </button>
        </div>

        {/* Fast-Fill Test Bar (Judge Friendly) */}
        {!isAuthenticated && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium px-2 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Test Login:</span>
            </span>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition-colors"
            >
              👑 Login as Admin
            </button>
            <button
              onClick={() => handleQuickDemoLogin('recruiter')}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition-colors"
            >
              💼 Login as Recruiter
            </button>
          </div>
        )}

        {/* 3 Value Pillars */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Verifiable Traceability</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Every skill status is backed by exact resume sentences &amp; section breadcrumbs.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Project-Grounded Q&amp;A</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Dynamically generates 10 questions targeting the candidate's actual projects &amp; gaps.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Human-in-the-Loop</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict ethical governance: AI acts as evidentiary copilot, never auto-hires or rejects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE 5-STAGE LIVE PIPELINE SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="simulator" className="py-14 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            See HireFlow AI in Action
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click through each pipeline stage to explore how the AI processes jobs, candidate resumes, and interviews.
          </p>
        </div>

        {/* Stage Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 mb-6 border-b border-slate-800 justify-start sm:justify-center">
          {[
            { id: 'jd', name: '1. JD Analysis', icon: FileSearch },
            { id: 'resume', name: '2. Multi-Format Parser', icon: Cpu },
            { id: 'match', name: '3. Evidence Matcher', icon: ShieldCheck },
            { id: 'interview', name: '4. AI Interview Cockpit', icon: MessagesSquare },
            { id: 'report', name: '5. Structured Report', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSimulatorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSimulatorTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-750 shadow-2xl shadow-black/60">
          {/* TAB 1: JD ANALYZER */}
          {activeSimulatorTab === 'jd' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Job Description Input</div>
                <div className="text-xs text-slate-300 font-mono space-y-1 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                  <p className="text-blue-400 font-bold">Machine Learning Engineer</p>
                  <p>Requirements:</p>
                  <p>- Python, PyTorch, SQL, NLP, Computer Vision</p>
                  <p>- 1+ years experience in neural network deployment</p>
                  <p>Preferred: Docker, AWS</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>Structured Entity Extraction</span>
                  <span className="text-emerald-400 text-[11px] font-semibold">Parsed by AI</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Required:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Python', 'PyTorch', 'SQL', 'NLP', 'Computer Vision'].map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-[11px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Preferred:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Docker', 'AWS'].map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-[11px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Normalized canonical schema mapped to vector &amp; heuristic match engines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESUME PARSER */}
          {activeSimulatorTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Multi-Format Ingestion Engine</h4>
                  <p className="text-xs text-slate-400">Processes .pdf, .docx, and .txt files with zero hallucinations</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  Zero Fabrication Rule Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Profile Entity</span>
                  <p className="text-xs font-bold text-white mt-1">Rahul Sharma</p>
                  <p className="text-[11px] text-slate-400">UC Berkeley • B.S. in Computer Science</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Project Architecture</span>
                  <p className="text-xs font-bold text-white mt-1">Real-Time YOLOv8 Detection</p>
                  <p className="text-[11px] text-slate-400">Achieved 48 FPS on edge inference</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Production Experience</span>
                  <p className="text-xs font-bold text-white mt-1">VisionScale AI Labs (1 yr 2 mos)</p>
                  <p className="text-[11px] text-slate-400">Serving 1.2M daily model queries</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE MATCHER */}
          {activeSimulatorTab === 'match' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">Rahul Sharma ↔ ML Engineer Alignment</h4>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-extrabold">
                      82% Fit Indicator
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Every requirement is checked against tangible resume proof.</p>
                </div>
                <div className="text-xs text-slate-400 italic">
                  *Human review required
                </div>
              </div>

              {/* Sample Alignment Rows */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-20 font-semibold text-white">Python</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">✓ MATCHED</span>
                  </div>
                  <div className="text-slate-300 italic text-[11px]">
                    "Constructed automated ETL and data-validation pipelines using Python &amp; PostgreSQL"
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Resume → Experience → VisionScale AI</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-20 font-semibold text-white">NLP</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">⚠ PARTIAL</span>
                  </div>
                  <div className="text-slate-300 italic text-[11px]">
                    "Built an exploratory sentiment classification model on IMDb reviews during university coursework"
                  </div>
                  <div className="text-[11px] text-amber-400/90">Lacks enterprise production deployment</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-20 font-semibold text-white">Docker</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[11px]">✕ NOT FOUND</span>
                  </div>
                  <div className="text-slate-400 italic text-[11px]">
                    No supporting deployment evidence found in candidate profile or projects.
                  </div>
                  <div className="text-[11px] text-slate-400">Target for interview validation</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI INTERVIEW COCKPIT & ADAPTIVE PROBING */}
          {activeSimulatorTab === 'interview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Personalized 3-Pane Interview Cockpit</h4>
                <p className="text-xs text-slate-400">10 questions tailored to candidate's projects with real-time adaptive follow-up probing.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Question 4 of 10 • Project-Based</span>
                  <span className="text-[11px] text-slate-400">Target: Real-Time YOLO Project</span>
                </div>
                <p className="text-xs text-white font-medium">
                  "In your project 'Real-Time Object Detection using YOLO', what architectural decisions did you make regarding PyTorch, and what alternative approaches did you benchmark?"
                </p>

                {/* Interactive Input Test */}
                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Simulate Candidate Answer:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testAnswer}
                      onChange={(e) => setTestAnswer(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSimulateAnswer}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Trigger Probing
                    </button>
                  </div>
                </div>

                {/* Adaptive Probe Output */}
                {simulatedFollowUp && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs">
                    <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px] mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Adaptive AI Follow-up Generated:</span>
                    </div>
                    <p className="text-slate-200">{simulatedFollowUp}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: STRUCTURED REPORT */}
          {activeSimulatorTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Post-Interview Evaluation &amp; Governance Matrix</h4>
                  <p className="text-xs text-slate-400">Synthesizes candidate responses into verifiable observations with zero auto-rejection.</p>
                </div>
                <button
                  onClick={onStartScreening}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <span>View in Workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase">Evidence-Backed Strengths</span>
                  <ul className="mt-1.5 space-y-1 text-slate-300 list-disc list-inside">
                    <li>Demonstrated mastery of TensorRT latency reduction down to 38ms.</li>
                    <li>Sound cross-validation hygiene preventing data leakage.</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Areas Requiring Human Validation</span>
                  <ul className="mt-1.5 space-y-1 text-slate-300 list-disc list-inside">
                    <li>Multi-node distributed training not directly exercised.</li>
                    <li>Verify enterprise CI/CD deployment familiarity.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE ROI & TIME-SAVED CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="roi" className="py-14 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Recruiter ROI Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calculate Your Time &amp; Cost Savings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            See how evidence-based screening shortens the hiring cycle for your engineering team.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-750 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Candidates Screened / Month</span>
                  <span className="text-blue-400 text-sm font-bold">{candidatesPerMonth} candidates</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={candidatesPerMonth}
                  onChange={(e) => setCandidatesPerMonth(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10 (Boutique)</span>
                  <span>100 (Growth)</span>
                  <span>200+ (Enterprise)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Technical Interview Hours / Candidate</span>
                  <span className="text-blue-400 text-sm font-bold">{interviewHoursPerCandidate} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={interviewHoursPerCandidate}
                  onChange={(e) => setInterviewHoursPerCandidate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 hour</span>
                  <span>3 hours (standard)</span>
                  <span>6 hours (multi-round)</span>
                </div>
              </div>
            </div>

            {/* Live Calculated Stats */}
            <div className="grid grid-cols-2 gap-3 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Recruiter Hours Saved</span>
                <p className="text-2xl font-black text-blue-400 mt-1">{totalHoursSavedMonth} hrs</p>
                <span className="text-[10px] text-slate-400">per month</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Screening Velocity</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">4.2x</p>
                <span className="text-[10px] text-slate-400">faster candidate turnaround</span>
              </div>

              <div className="col-span-2 p-3.5 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20">
                <span className="text-[11px] text-slate-300 font-medium">Estimated Annual Cost Savings</span>
                <p className="text-3xl font-black text-white mt-1">${estimatedCostSaved}</p>
                <span className="text-[10px] text-slate-400">Based on standard engineering team hourly billing ($85/hr)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ENTERPRISE COMPARISON GRID
      ───────────────────────────────────────────────────────────── */}
      <section id="compare" className="py-14 px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why HireFlow AI Outperforms Traditional ATS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            See how evidence-based candidate intelligence compares to legacy keyword filters.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse rounded-2xl overflow-hidden border border-slate-800">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <th className="p-3.5 font-semibold">Assessment Dimension</th>
                <th className="p-3.5 font-semibold text-slate-400">Legacy Keyword ATS</th>
                <th className="p-3.5 font-semibold text-slate-400">Black-Box AI Screening</th>
                <th className="p-3.5 font-bold text-blue-400 bg-blue-950/20">HireFlow AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              <tr>
                <td className="p-3.5 font-medium text-white">Skill Verification</td>
                <td className="p-3.5 text-slate-400">Keyword counts (easily gamed)</td>
                <td className="p-3.5 text-slate-400">Hidden vector score</td>
                <td className="p-3.5 font-semibold text-emerald-400 bg-blue-950/10">Exact sentence citations &amp; breadcrumbs</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-white">Interview Generation</td>
                <td className="p-3.5 text-slate-400">Static generic question templates</td>
                <td className="p-3.5 text-slate-400">Hallucinated prompt outputs</td>
                <td className="p-3.5 font-semibold text-emerald-400 bg-blue-950/10">10 questions grounded in actual candidate projects</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-white">Adaptive Probing</td>
                <td className="p-3.5 text-slate-400">None (Passive notes only)</td>
                <td className="p-3.5 text-slate-400">Static questionnaire</td>
                <td className="p-3.5 font-semibold text-emerald-400 bg-blue-950/10">Real-time follow-ups for incomplete answers</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-white">Decision Governance</td>
                <td className="p-3.5 text-slate-400">Unexplained filtering</td>
                <td className="p-3.5 text-rose-400">Autonomous hire/reject (Risky)</td>
                <td className="p-3.5 font-semibold text-emerald-400 bg-blue-950/10">Strict Human-in-the-Loop copilot model</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. BOTTOM CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center border-t border-slate-800/80">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
          Ready to Screen Candidates with Real Evidence?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
          Join recruiters and engineering hiring managers using HireFlow AI for high-velocity, unbiased technical recruitment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onStartScreening}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Enter Candidate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-sm font-semibold transition-all"
            >
              <span>Create Free Account</span>
            </button>
          )}
        </div>
      </section>

      {/* Professional Creator & Platform Footer */}
      <CreatorFooter />

    </div>
  );
};
