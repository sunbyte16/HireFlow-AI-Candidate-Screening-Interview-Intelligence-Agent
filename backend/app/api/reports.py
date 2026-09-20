from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import CandidateModel, JobModel, MatchAnalysisModel, InterviewModel
from app.schemas.candidate import CandidateResponse
from app.schemas.matching import MatchAnalysisResponse
from app.schemas.interview import InterviewResponse, InterviewEvaluation
from app.schemas.search import CandidateReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/{candidate_id}/{job_id}", response_model=CandidateReportResponse)
def get_candidate_report(candidate_id: str, job_id: str, db: Session = Depends(get_db)):
    """Compiles the complete final candidate evaluation report with audit trails."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    match_analysis = db.query(MatchAnalysisModel).filter(
        MatchAnalysisModel.job_id == job_id,
        MatchAnalysisModel.candidate_id == candidate_id
    ).first()

    interview = db.query(InterviewModel).filter(
        InterviewModel.job_id == job_id,
        InterviewModel.candidate_id == candidate_id
    ).order_by(InterviewModel.created_at.desc()).first()

    # Build Audit Trail
    audit_trail = []
    if match_analysis:
        for item in (match_analysis.alignment_items or []):
            if item.get("status") in ["MATCHED", "PARTIAL"]:
                audit_trail.append({
                    "insight": f"{item.get('requirement')} — {item.get('status')}",
                    "evidence": item.get("evidence"),
                    "source": item.get("source"),
                    "category": item.get("category"),
                    "verified_via": "Candidate-provided Resume Profile"
                })

    if interview and interview.answers:
        for a in interview.answers:
            qid = a.get("question_id")
            q = next((q for q in (interview.questions or []) if q.get("id") == qid), None)
            if q and a.get("candidate_answer"):
                audit_trail.append({
                    "insight": f"Interview Validation: {q.get('target_requirement')}",
                    "evidence": f'Candidate response: "{a.get("candidate_answer")[:150]}..."',
                    "source": f"Live Interview Q&A → Question {qid}",
                    "category": q.get("category"),
                    "verified_via": "Interviewer Notes & Live Q&A"
                })

    eval_obj = None
    if interview and interview.evaluation:
        try:
            eval_obj = InterviewEvaluation(**interview.evaluation)
        except Exception:
            eval_obj = None

    match_resp = None
    if match_analysis:
        match_resp = MatchAnalysisResponse(
            id=match_analysis.id,
            job_id=match_analysis.job_id,
            candidate_id=match_analysis.candidate_id,
            candidate_name=candidate.name,
            job_title=job.title,
            overall_score=match_analysis.overall_score,
            strong_matches_count=match_analysis.strong_matches_count,
            partial_matches_count=match_analysis.partial_matches_count,
            missing_count=match_analysis.missing_count,
            alignment_items=match_analysis.alignment_items,
            disclaimer="AI-generated analysis based on available candidate evidence. Human review is required.",
            created_at=match_analysis.created_at
        )

    int_resp = None
    if interview:
        int_resp = InterviewResponse(
            id=interview.id,
            candidate_id=interview.candidate_id,
            job_id=interview.job_id,
            questions=interview.questions,
            answers=interview.answers,
            evaluation=eval_obj,
            status=interview.status,
            created_at=interview.created_at
        )

    job_dict = {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "experience": job.experience,
        "domain": job.domain
    }

    return CandidateReportResponse(
        candidate=CandidateResponse.model_validate(candidate),
        job=job_dict,
        match_analysis=match_resp,
        interview=int_resp,
        evaluation=eval_obj,
        audit_trail=audit_trail,
        generated_at=datetime.now(timezone.utc)
    )
