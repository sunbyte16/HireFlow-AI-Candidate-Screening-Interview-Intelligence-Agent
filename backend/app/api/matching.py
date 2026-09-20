from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import CandidateModel, JobModel, MatchAnalysisModel
from app.schemas.matching import MatchAnalysisRequest, MatchAnalysisResponse, BulkMatchResponse
from app.ai.matcher import analyze_match

router = APIRouter(prefix="/matching", tags=["matching"])

@router.post("/analyze", response_model=MatchAnalysisResponse)
def analyze_candidate_match(req: MatchAnalysisRequest, db: Session = Depends(get_db)):
    """Runs evidence-based matching between a specific candidate and job."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == req.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(JobModel).filter(JobModel.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cand_dict = {
        "name": candidate.name,
        "skills": candidate.skills,
        "projects": candidate.projects,
        "experience": candidate.experience,
        "certifications": candidate.certifications
    }
    job_dict = {
        "title": job.title,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills
    }

    match_result = analyze_match(cand_dict, job_dict)

    # Check if analysis already exists
    existing = db.query(MatchAnalysisModel).filter(
        MatchAnalysisModel.job_id == req.job_id,
        MatchAnalysisModel.candidate_id == req.candidate_id
    ).first()

    if existing:
        existing.overall_score = match_result["overall_score"]
        existing.strong_matches_count = match_result["strong_matches_count"]
        existing.partial_matches_count = match_result["partial_matches_count"]
        existing.missing_count = match_result["missing_count"]
        existing.alignment_items = match_result["alignment_items"]
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = MatchAnalysisModel(
            job_id=req.job_id,
            candidate_id=req.candidate_id,
            overall_score=match_result["overall_score"],
            strong_matches_count=match_result["strong_matches_count"],
            partial_matches_count=match_result["partial_matches_count"],
            missing_count=match_result["missing_count"],
            alignment_items=match_result["alignment_items"]
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    return MatchAnalysisResponse(
        id=target.id,
        job_id=target.job_id,
        candidate_id=target.candidate_id,
        candidate_name=candidate.name,
        job_title=job.title,
        overall_score=target.overall_score,
        strong_matches_count=target.strong_matches_count,
        partial_matches_count=target.partial_matches_count,
        missing_count=target.missing_count,
        alignment_items=target.alignment_items,
        disclaimer=match_result.get("disclaimer", "AI-generated analysis based on available candidate evidence. Human review is required."),
        created_at=target.created_at
    )

@router.get("/{job_id}/{candidate_id}", response_model=MatchAnalysisResponse)
def get_match_analysis(job_id: str, candidate_id: str, db: Session = Depends(get_db)):
    """Fetches existing match analysis, or computes it on the fly if not cached."""
    analysis = db.query(MatchAnalysisModel).filter(
        MatchAnalysisModel.job_id == job_id,
        MatchAnalysisModel.candidate_id == candidate_id
    ).first()

    if not analysis:
        # Compute on the fly
        return analyze_candidate_match(MatchAnalysisRequest(job_id=job_id, candidate_id=candidate_id), db)

    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    job = db.query(JobModel).filter(JobModel.id == job_id).first()

    return MatchAnalysisResponse(
        id=analysis.id,
        job_id=analysis.job_id,
        candidate_id=analysis.candidate_id,
        candidate_name=candidate.name if candidate else "Candidate",
        job_title=job.title if job else "Role",
        overall_score=analysis.overall_score,
        strong_matches_count=analysis.strong_matches_count,
        partial_matches_count=analysis.partial_matches_count,
        missing_count=analysis.missing_count,
        alignment_items=analysis.alignment_items,
        disclaimer="AI-generated analysis based on available candidate evidence. Human review is required.",
        created_at=analysis.created_at
    )

@router.get("/job/{job_id}", response_model=List[MatchAnalysisResponse])
def get_job_matches(job_id: str, db: Session = Depends(get_db)):
    """Fetches all match analyses for a given job."""
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = db.query(CandidateModel).all()
    results = []
    
    for cand in candidates:
        analysis = db.query(MatchAnalysisModel).filter(
            MatchAnalysisModel.job_id == job_id,
            MatchAnalysisModel.candidate_id == cand.id
        ).first()

        if not analysis:
            # Generate analysis
            cand_dict = {
                "name": cand.name,
                "skills": cand.skills,
                "projects": cand.projects,
                "experience": cand.experience,
                "certifications": cand.certifications
            }
            job_dict = {
                "title": job.title,
                "required_skills": job.required_skills,
                "preferred_skills": job.preferred_skills
            }
            match_res = analyze_match(cand_dict, job_dict)
            analysis = MatchAnalysisModel(
                job_id=job_id,
                candidate_id=cand.id,
                overall_score=match_res["overall_score"],
                strong_matches_count=match_res["strong_matches_count"],
                partial_matches_count=match_res["partial_matches_count"],
                missing_count=match_res["missing_count"],
                alignment_items=match_res["alignment_items"]
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)

        results.append(MatchAnalysisResponse(
            id=analysis.id,
            job_id=analysis.job_id,
            candidate_id=analysis.candidate_id,
            candidate_name=cand.name,
            job_title=job.title,
            overall_score=analysis.overall_score,
            strong_matches_count=analysis.strong_matches_count,
            partial_matches_count=analysis.partial_matches_count,
            missing_count=analysis.missing_count,
            alignment_items=analysis.alignment_items,
            disclaimer="AI-generated analysis based on available candidate evidence. Human review is required.",
            created_at=analysis.created_at
        ))

    return results
