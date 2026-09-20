import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { InterviewWorkspacePage } from './pages/InterviewWorkspacePage';
import { ReportPage } from './pages/ReportPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import type { 
  Job, Candidate, MatchAnalysis, Interview, 
  CandidateReport, NavigationTab 
} from './types';
import { api } from './services/api';

export function App() {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchAnalysis[]>([]);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [activeReport, setActiveReport] = useState<CandidateReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  // Initial Load
  const loadData = async () => {
    try {
      // First ensure database has jobs and candidates
      let jobsList = await api.getJobs();
      let candList = await api.getCandidates();
      if (jobsList.length === 0 || candList.length === 0) {
        // Auto seed demo data
        await api.seedDemoData();
        jobsList = await api.getJobs();
        candList = await api.getCandidates();
      }
      setJobs(jobsList);
      setCandidates(candList);

      if (jobsList.length > 0) {
        setActiveJob(jobsList[0]);
        try {
          const matchesList = await api.getJobMatches(jobsList[0].id);
          setMatches(matchesList);
        } catch (matchErr) {
          console.warn('Matches loading notice:', matchErr);
        }
      }

      if (candList.length > 0) {
        setActiveCandidateId(candList[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update matches when activeJob changes
  useEffect(() => {
    if (activeJob) {
      api.getJobMatches(activeJob.id)
        .then(setMatches)
        .catch(err => console.error('Error fetching matches:', err));
    }
  }, [activeJob]);

  // Demo Reset Handler
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.seedDemoData();
      await loadData();
      alert('Demo data successfully re-seeded!');
    } catch (err: any) {
      alert(err.message || 'Failed to seed demo data');
    } finally {
      setIsResetting(false);
    }
  };

  // Candidate Selection Handler (Opens Evidence Match Analysis & Profile)
  const handleSelectCandidate = async (candidateId: string) => {
    setActiveCandidateId(candidateId);
    setActiveTab('matching');
  };

  // Interview Generation / Launch Handler
  const handleStartInterview = async (candidateId: string) => {
    if (!activeJob) return;
    setIsGeneratingInterview(true);
    try {
      const interview = await api.generateInterview(activeJob.id, candidateId);
      setActiveInterview(interview);
      setActiveCandidateId(candidateId);
      setActiveTab('interview');
    } catch (err: any) {
      alert(err.message || 'Failed to generate interview');
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  // Complete Interview and Evaluate
  const handleCompleteAndEvaluate = async (interviewId: string) => {
    try {
      const completed = await api.evaluateInterview(interviewId);
      setActiveInterview(completed);

      // Now compile and open full report
      if (activeCandidateId && activeJob) {
        const report = await api.getReport(activeCandidateId, activeJob.id);
        setActiveReport(report);
        setActiveTab('report');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate interview');
    }
  };

  // Quick action from landing page
  const handleLandingViewDemo = async () => {
    if (!isAuthenticated) {
      try {
        await loginAsDemo('recruiter');
      } catch (err) {
        console.warn('Demo login notice:', err);
      }
    }
    if (candidates.length > 0) {
      setActiveCandidateId(candidates[0].id);
      setActiveTab('matching');
    } else {
      await handleResetDemo();
      setActiveTab('dashboard');
    }
  };

  const handleStartScreening = () => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    } else {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  // Redirect to landing page when user logs out
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'landing') {
      setActiveTab('landing');
    }
  }, [isAuthenticated]);

  // Global search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setActiveTab('search');
    }
  };

  // Candidate being actively viewed
  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || candidates[0] || null;
  const activeCandidateMatch = matches.find(m => m.candidate_id === activeCandidate?.id) || null;

  // 1. Standalone Public Homepage View (No Sidebar, No Dashboard Frame)
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 overflow-y-auto selection:bg-blue-600 selection:text-white">
        <LandingPage
          onStartScreening={handleStartScreening}
          onViewDemo={handleLandingViewDemo}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
        />

        {/* Role-Based Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // 2. Authenticated Recruiter Workspace View (Dashboard, Sidebar, Navbar)
  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidateCount={candidates.length}
        jobCount={jobs.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">

          {activeTab === 'dashboard' && (
            <DashboardPage
              jobs={jobs}
              candidates={candidates}
              matches={matches}
              activeJob={activeJob}
              onSelectCandidate={handleSelectCandidate}
              onStartInterview={handleStartInterview}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsPage
              jobs={jobs}
              activeJob={activeJob}
              onSelectJob={setActiveJob}
              onJobCreated={(newJob) => {
                setJobs([newJob, ...jobs]);
                setActiveJob(newJob);
              }}
              onDeleteJob={(jobId) => {
                setJobs(jobs.filter(j => j.id !== jobId));
                if (activeJob?.id === jobId) setActiveJob(jobs[0] || null);
              }}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesPage
              candidates={candidates}
              activeJob={activeJob}
              matches={matches}
              onSelectCandidate={handleSelectCandidate}
              onRefreshCandidates={loadData}
              onCandidateDeleted={(id) => setCandidates(candidates.filter(c => c.id !== id))}
            />
          )}

          {activeTab === 'matching' && activeCandidate && (
            <CandidateDetailPage
              candidate={activeCandidate}
              job={activeJob}
              match={activeCandidateMatch}
              onBack={() => setActiveTab('candidates')}
              onGenerateInterview={handleStartInterview}
              onRefreshMatch={() => {
                if (activeJob && activeCandidate) {
                  api.analyzeMatch(activeJob.id, activeCandidate.id)
                    .then(loadData);
                }
              }}
              isGeneratingInterview={isGeneratingInterview}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewWorkspacePage
              interview={activeInterview}
              candidate={activeCandidate}
              job={activeJob}
              match={activeCandidateMatch}
              onBack={() => setActiveTab('matching')}
              onCompleteAndEvaluate={handleCompleteAndEvaluate}
            />
          )}

          {activeTab === 'report' && (
            <ReportPage
              report={activeReport}
              onBack={() => setActiveTab('matching')}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'search' && (
            <SearchPage
              initialQuery={searchQuery}
              onSelectCandidate={handleSelectCandidate}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onResetDemo={handleResetDemo}
              isResetting={isResetting}
            />
          )}
        </main>
      </div>

      {/* Role-Based Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
