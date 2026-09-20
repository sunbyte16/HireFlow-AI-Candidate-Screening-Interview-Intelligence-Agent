export const TYPES_VERSION = '1.0.0';

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  required_skills: string[];
  preferred_skills: string[];
  experience: string;
  education: string;
  responsibilities: string[];
  domain: string;
  tools: string[];
  created_at: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduation_year: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
}

export interface ProjectItem {
  name: string;
  technologies: string[];
  description: string;
  relevant_skills: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  resume_filename: string;
  summary: string;
  education: EducationItem[];
  skills: Record<string, string[]>;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  created_at: string;
}

export interface AlignmentItem {
  requirement: string;
  category: 'Required' | 'Preferred' | string;
  status: 'MATCHED' | 'PARTIAL' | 'NOT FOUND' | 'UNCLEAR';
  evidence: string;
  source: string;
  missing_context?: string | null;
  confidence?: number;
}

export interface MatchAnalysis {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate_name?: string;
  job_title?: string;
  overall_score: number;
  strong_matches_count: number;
  partial_matches_count: number;
  missing_count: number;
  alignment_items: AlignmentItem[];
  disclaimer: string;
  created_at: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: 'Technical' | 'Project-Based' | 'Behavioral' | 'Skill Validation' | 'Deep-Dive' | string;
  target_requirement: string;
  expected_evidence: string;
  follow_up_suggestion: string;
}

export interface AnswerItem {
  question_id: number;
  candidate_answer: string;
  notes?: string;
  follow_up_generated?: string | null;
  follow_up_answer?: string | null;
}

export interface RequirementCoverageItem {
  requirement: string;
  status: 'Validated' | 'Needs validation' | 'Not demonstrated' | string;
  evidence_from_interview: string;
}

export interface InterviewEvaluation {
  technical_understanding: string;
  project_knowledge: string;
  communication: string;
  requirement_coverage: RequirementCoverageItem[];
  unanswered_areas: string[];
  suggested_follow_ups: string[];
  strengths: string[];
  areas_requiring_validation: string[];
  recommended_next_steps: string[];
  human_review_notice: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  questions: InterviewQuestion[];
  answers: AnswerItem[];
  evaluation?: InterviewEvaluation | null;
  status: 'pending' | 'in_progress' | 'completed' | string;
  created_at: string;
}

export interface SearchResultItem {
  candidate: Candidate;
  relevance_score: number;
  matched_reason: string;
  highlighted_evidence: string[];
}

export interface AuditTrailItem {
  insight: string;
  evidence: string;
  source: string;
  category?: string;
  verified_via: string;
}

export interface CandidateReport {
  candidate: Candidate;
  job?: Job;
  match_analysis?: MatchAnalysis | null;
  interview?: Interview | null;
  evaluation?: InterviewEvaluation | null;
  audit_trail: AuditTrailItem[];
  generated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'recruiter';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type NavigationTab = 
  | 'landing'
  | 'dashboard'
  | 'jobs'
  | 'candidates'
  | 'matching'
  | 'interview'
  | 'report'
  | 'search'
  | 'settings';
