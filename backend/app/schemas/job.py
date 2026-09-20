from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    description: str
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Remote / Hybrid"

class JobAnalyzeRequest(BaseModel):
    title: Optional[str] = None
    description: str

class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    department: str
    location: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience: str = "1+ years"
    education: str = "Bachelor's degree"
    responsibilities: List[str] = []
    domain: str = "Technology"
    tools: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
