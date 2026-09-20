from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import JobModel
from app.schemas.job import JobCreate, JobAnalyzeRequest, JobResponse
from app.ai.job_analyzer import analyze_job_description

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("", response_model=JobResponse)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Creates a new job role, automatically extracting requirements if needed."""
    analyzed = analyze_job_description(job_in.description, title_hint=job_in.title)
    
    db_job = JobModel(
        title=job_in.title or analyzed.get("job_title", "Machine Learning Engineer"),
        description=job_in.description,
        department=job_in.department,
        location=job_in.location,
        required_skills=analyzed.get("required_skills", []),
        preferred_skills=analyzed.get("preferred_skills", []),
        experience=analyzed.get("experience", "1+ years"),
        education=analyzed.get("education", "Bachelor's degree"),
        responsibilities=analyzed.get("responsibilities", []),
        domain=analyzed.get("domain", "Technology"),
        tools=analyzed.get("tools", [])
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.post("/analyze")
def analyze_jd(req: JobAnalyzeRequest):
    """Parses and previews structured requirements from raw JD text without saving."""
    analyzed = analyze_job_description(req.description, title_hint=req.title or "")
    return analyzed

@router.get("", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    """Lists all available job postings."""
    return db.query(JobModel).order_by(JobModel.created_at.desc()).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Fetches a specific job posting by ID."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    """Deletes a job posting."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
