from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class AlignmentItem(BaseModel):
    requirement: str
    category: str = "Required"  # "Required" or "Preferred"
    status: str  # "MATCHED", "PARTIAL", "NOT FOUND", "UNCLEAR"
    evidence: str
    source: str  # e.g., "Resume → Projects → Smart Prediction System"
    missing_context: Optional[str] = None
    confidence: Optional[float] = 1.0

class MatchAnalysisRequest(BaseModel):
    job_id: str
    candidate_id: str

class MatchAnalysisResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    overall_score: float  # Percentage, e.g. 82.0
    strong_matches_count: int
    partial_matches_count: int
    missing_count: int
    alignment_items: List[AlignmentItem] = []
    disclaimer: str = "AI-generated analysis based on available candidate evidence. Human review is required."
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BulkMatchResponse(BaseModel):
    job_id: str
    matches: List[MatchAnalysisResponse]
