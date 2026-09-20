from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str  # "Technical", "Project-Based", "Behavioral", "Skill Validation", "Deep-Dive"
    target_requirement: str
    expected_evidence: str
    follow_up_suggestion: str

class InterviewAnswerRequest(BaseModel):
    question_id: int
    answer: str
    notes: Optional[str] = ""

class FollowUpRequest(BaseModel):
    question_id: int
    candidate_answer: str

class FollowUpResponse(BaseModel):
    question_id: int
    detected_gap: str
    follow_up_question: str
    reasoning: str

class AnswerItem(BaseModel):
    question_id: int
    candidate_answer: str
    notes: Optional[str] = ""
    follow_up_generated: Optional[str] = None
    follow_up_answer: Optional[str] = None

class RequirementCoverageItem(BaseModel):
    requirement: str
    status: str  # "Validated", "Needs validation", "Not demonstrated"
    evidence_from_interview: str

class InterviewEvaluation(BaseModel):
    technical_understanding: str
    project_knowledge: str
    communication: str
    requirement_coverage: List[RequirementCoverageItem] = []
    unanswered_areas: List[str] = []
    suggested_follow_ups: List[str] = []
    strengths: List[str] = []
    areas_requiring_validation: List[str] = []
    recommended_next_steps: List[str] = []
    human_review_notice: str = "Human Review Required. This evaluation is an AI-assisted screening assessment, not an autonomous hiring decision."

class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    questions: List[InterviewQuestion] = []
    answers: List[AnswerItem] = []
    evaluation: Optional[InterviewEvaluation] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewGenerateRequest(BaseModel):
    candidate_id: str
    job_id: str
