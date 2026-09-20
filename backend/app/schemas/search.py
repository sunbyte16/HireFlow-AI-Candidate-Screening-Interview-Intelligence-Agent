from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.candidate import CandidateResponse
from app.schemas.matching import MatchAnalysisResponse
from app.schemas.interview import InterviewResponse, InterviewEvaluation

class SearchQuery(BaseModel):
    query: str
    job_id: Optional[str] = None

class SearchResultItem(BaseModel):
    candidate: CandidateResponse
    relevance_score: float
    matched_reason: str
    highlighted_evidence: List[str] = []

class SearchResponse(BaseModel):
    query: str
    results_count: int
    results: List[SearchResultItem]

class CandidateReportResponse(BaseModel):
    candidate: CandidateResponse
    job: Optional[dict] = None
    match_analysis: Optional[MatchAnalysisResponse] = None
    interview: Optional[InterviewResponse] = None
    evaluation: Optional[InterviewEvaluation] = None
    audit_trail: List[dict] = []
    generated_at: datetime
