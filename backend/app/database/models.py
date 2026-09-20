import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON, Boolean
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="recruiter")  # "admin" or "recruiter"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String(255), default="Engineering")
    location = Column(String(255), default="Remote / Hybrid")
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    experience = Column(String(100), default="1+ years")
    education = Column(String(255), default="Bachelor's in Computer Science or related field")
    responsibilities = Column(JSON, default=list)
    domain = Column(String(255), default="Artificial Intelligence")
    tools = Column(JSON, default=list)
    created_at = Column(DateTime, default=get_utc_now)

class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), default="Not specified")
    phone = Column(String(100), default="Not specified")
    location = Column(String(255), default="Not specified")
    resume_filename = Column(String(255), default="uploaded_resume.txt")
    raw_text = Column(Text, default="")
    summary = Column(Text, default="")
    education = Column(JSON, default=list)
    skills = Column(JSON, default=dict)
    experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    created_at = Column(DateTime, default=get_utc_now)

class MatchAnalysisModel(Base):
    __tablename__ = "match_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, nullable=False, index=True)
    candidate_id = Column(String, nullable=False, index=True)
    overall_score = Column(Float, default=0.0)
    strong_matches_count = Column(Integer, default=0)
    partial_matches_count = Column(Integer, default=0)
    missing_count = Column(Integer, default=0)
    alignment_items = Column(JSON, default=list)
    created_at = Column(DateTime, default=get_utc_now)

class InterviewModel(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    candidate_id = Column(String, nullable=False, index=True)
    job_id = Column(String, nullable=False, index=True)
    questions = Column(JSON, default=list)
    answers = Column(JSON, default=list)
    evaluation = Column(JSON, default=dict)
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=get_utc_now)
