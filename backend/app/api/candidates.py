import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import CandidateModel
from app.schemas.candidate import CandidateResponse
from app.ai.resume_parser import parse_resume
from app.core.config import settings

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.post("/upload", response_model=List[CandidateResponse])
async def upload_resumes(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Uploads and parses one or multiple candidate resumes (PDF, DOCX, TXT)."""
    saved_candidates = []
    
    for file in files:
        # Validate extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".doc", ".txt"]:
            continue

        # Save to disk
        unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Parse resume with AI
        parsed = parse_resume(file_path, file.filename)

        candidate = CandidateModel(
            name=parsed.get("name", "Candidate"),
            email=parsed.get("email", "Not specified"),
            phone=parsed.get("phone", "Not specified"),
            location=parsed.get("location", "Not specified"),
            resume_filename=file.filename,
            raw_text=parsed.get("raw_text", ""),
            summary=parsed.get("summary", ""),
            education=parsed.get("education", []),
            skills=parsed.get("skills", {}),
            experience=parsed.get("experience", []),
            projects=parsed.get("projects", []),
            certifications=parsed.get("certifications", [])
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        saved_candidates.append(candidate)

    if not saved_candidates:
        raise HTTPException(
            status_code=400,
            detail="No valid resumes uploaded. Supported formats: .pdf, .docx, .txt"
        )

    return saved_candidates

@router.get("", response_model=List[CandidateResponse])
def list_candidates(db: Session = Depends(get_db)):
    """Retrieves all candidates."""
    return db.query(CandidateModel).order_by(CandidateModel.created_at.desc()).all()

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Retrieves a single candidate profile."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Deletes a candidate profile."""
    cand = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(cand)
    db.commit()
    return {"message": "Candidate removed successfully"}
