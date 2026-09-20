from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class EducationItem(BaseModel):
    degree: str = "Not specified"
    institution: str = "Not specified"
    graduation_year: str = "Not specified"

class ExperienceItem(BaseModel):
    company: str = "Not specified"
    role: str = "Not specified"
    duration: str = "Not specified"
    responsibilities: List[str] = []

class ProjectItem(BaseModel):
    name: str = "Not specified"
    technologies: List[str] = []
    description: str = "Not specified"
    relevant_skills: List[str] = []

class CertificationItem(BaseModel):
    name: str = "Not specified"
    issuer: str = "Not specified"
    year: Optional[str] = "Not specified"

class SkillsGroup(BaseModel):
    programming_languages: List[str] = []
    frameworks: List[str] = []
    ml_ai: List[str] = []
    databases: List[str] = []
    cloud: List[str] = []
    tools: List[str] = []

class CandidateBase(BaseModel):
    name: str
    email: str = "Not specified"
    phone: str = "Not specified"
    location: str = "Not specified"
    summary: str = "Not specified"
    education: List[EducationItem] = []
    skills: Dict[str, List[str]] = {}
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []

class CandidateResponse(CandidateBase):
    id: str
    resume_filename: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
