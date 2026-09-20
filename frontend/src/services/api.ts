import type { 
  Job, Candidate, MatchAnalysis, Interview, 
  InterviewEvaluation, SearchResultItem, CandidateReport,
  User, AuthResponse
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('hireflow_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('hireflow_token', token);
  } else {
    localStorage.removeItem('hireflow_token');
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // System & Demo
  async getHealth(): Promise<{ status: string; version: string; llm_live: boolean; provider: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async seedDemoData(): Promise<{ message: string; job_id: string; job_title: string; candidates: Array<{ id: string; name: string }> }> {
    const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
    return handleResponse(res);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/jobs`);
    return handleResponse(res);
  },

  async getJob(id: string): Promise<Job> {
    const res = await fetch(`${API_BASE}/jobs/${id}`);
    return handleResponse(res);
  },

  async createJob(payload: { title: string; description: string; department?: string; location?: string }): Promise<Job> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async analyzeJD(payload: { title?: string; description: string }): Promise<Partial<Job>> {
    const res = await fetch(`${API_BASE}/jobs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${API_BASE}/candidates`);
    return handleResponse(res);
  },

  async getCandidate(id: string): Promise<Candidate> {
    const res = await fetch(`${API_BASE}/candidates/${id}`);
    return handleResponse(res);
  },

  async uploadResumes(files: File[]): Promise<Candidate[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${API_BASE}/candidates/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  async deleteCandidate(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/candidates/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Matching
  async getJobMatches(jobId: string): Promise<MatchAnalysis[]> {
    const res = await fetch(`${API_BASE}/matching/job/${jobId}`);
    return handleResponse(res);
  },

  async analyzeMatch(jobId: string, candidateId: string): Promise<MatchAnalysis> {
    const res = await fetch(`${API_BASE}/matching/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, candidate_id: candidateId })
    });
    return handleResponse(res);
  },

  async getMatch(jobId: string, candidateId: string): Promise<MatchAnalysis> {
    const res = await fetch(`${API_BASE}/matching/${jobId}/${candidateId}`);
    return handleResponse(res);
  },

  // Interviews
  async generateInterview(jobId: string, candidateId: string): Promise<Interview> {
    const res = await fetch(`${API_BASE}/interviews/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, candidate_id: candidateId })
    });
    return handleResponse(res);
  },

  async getInterview(id: string): Promise<Interview> {
    const res = await fetch(`${API_BASE}/interviews/${id}`);
    return handleResponse(res);
  },

  async saveAnswer(interviewId: string, questionId: number, answer: string, notes?: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, answer, notes: notes || '' })
    });
    return handleResponse(res);
  },

  async getFollowUp(interviewId: string, questionId: number, candidateAnswer: string): Promise<{
    question_id: number;
    detected_gap: string;
    follow_up_question: string;
    reasoning: string;
  }> {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, candidate_answer: candidateAnswer })
    });
    return handleResponse(res);
  },

  async evaluateInterview(interviewId: string): Promise<Interview> {
    const res = await fetch(`${API_BASE}/interviews/${interviewId}/evaluate`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // Reports
  async getReport(candidateId: string, jobId: string): Promise<CandidateReport> {
    const res = await fetch(`${API_BASE}/reports/${candidateId}/${jobId}`);
    return handleResponse(res);
  },

  // Search
  async searchCandidates(query: string): Promise<{ query: string; results_count: number; results: SearchResultItem[] }> {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query })
    });
    return handleResponse(res);
  },

  // Authentication
  async register(payload: { email: string; password: string; full_name: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse<AuthResponse>(res);
    if (data && data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse<AuthResponse>(res);
    if (data && data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
