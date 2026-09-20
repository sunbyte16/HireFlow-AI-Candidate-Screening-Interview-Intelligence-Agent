from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import CandidateModel, JobModel, MatchAnalysisModel, InterviewModel
from app.schemas.interview import (
    InterviewGenerateRequest, InterviewResponse, InterviewAnswerRequest,
    FollowUpRequest, FollowUpResponse, InterviewEvaluation
)
from app.ai.interview_generator import generate_interview_questions
from app.ai.interview_evaluator import generate_adaptive_follow_up, evaluate_interview
from app.ai.matcher import analyze_match

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/generate", response_model=InterviewResponse)
def generate_interview(req: InterviewGenerateRequest, db: Session = Depends(get_db)):
    """Generates a personalized 10-question interview workspace targeting projects and skill gaps."""
    candidate = db.query(CandidateModel).filter(CandidateModel.id == req.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(JobModel).filter(JobModel.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get or generate match data to know exact gaps
    analysis = db.query(MatchAnalysisModel).filter(
        MatchAnalysisModel.job_id == req.job_id,
        MatchAnalysisModel.candidate_id == req.candidate_id
    ).first()

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

    if not analysis:
        match_data = analyze_match(cand_dict, job_dict)
    else:
        match_data = {
            "overall_score": analysis.overall_score,
            "strong_matches_count": analysis.strong_matches_count,
            "partial_matches_count": analysis.partial_matches_count,
            "missing_count": analysis.missing_count,
            "alignment_items": analysis.alignment_items
        }

    # Generate personalized questions
    questions = generate_interview_questions(cand_dict, job_dict, match_data)

    interview = InterviewModel(
        candidate_id=req.candidate_id,
        job_id=req.job_id,
        questions=questions,
        answers=[],
        evaluation={},
        status="in_progress"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return InterviewResponse(
        id=interview.id,
        candidate_id=interview.candidate_id,
        job_id=interview.job_id,
        questions=interview.questions,
        answers=interview.answers,
        evaluation=None,
        status=interview.status,
        created_at=interview.created_at
    )

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    """Retrieves an existing interview session."""
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    eval_obj = None
    if interview.evaluation:
        try:
            eval_obj = InterviewEvaluation(**interview.evaluation)
        except Exception:
            eval_obj = None

    return InterviewResponse(
        id=interview.id,
        candidate_id=interview.candidate_id,
        job_id=interview.job_id,
        questions=interview.questions,
        answers=interview.answers,
        evaluation=eval_obj,
        status=interview.status,
        created_at=interview.created_at
    )

@router.post("/{interview_id}/answer")
def save_answer(interview_id: str, req: InterviewAnswerRequest, db: Session = Depends(get_db)):
    """Saves interviewer notes and candidate answer for a specific question."""
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    answers = list(interview.answers or [])
    # Update or add
    existing_idx = next((i for i, a in enumerate(answers) if a.get("question_id") == req.question_id), None)
    
    if existing_idx is not None:
        answers[existing_idx]["candidate_answer"] = req.answer
        answers[existing_idx]["notes"] = req.notes
    else:
        answers.append({
            "question_id": req.question_id,
            "candidate_answer": req.answer,
            "notes": req.notes,
            "follow_up_generated": None,
            "follow_up_answer": None
        })

    interview.answers = answers
    interview.status = "in_progress"
    db.commit()
    return {"message": "Answer recorded successfully", "answers": answers}

@router.post("/{interview_id}/follow-up", response_model=FollowUpResponse)
def get_follow_up(interview_id: str, req: FollowUpRequest, db: Session = Depends(get_db)):
    """Generates an adaptive follow-up question based on the candidate's answer."""
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = interview.questions or []
    question = next((q for q in questions if q.get("id") == req.question_id), None)
    
    q_text = question.get("question", "") if question else "Technical question"
    expected = question.get("expected_evidence", "") if question else "Technical depth"

    follow_up = generate_adaptive_follow_up(q_text, expected, req.candidate_answer)

    # Attach to answers record
    answers = list(interview.answers or [])
    for a in answers:
        if a.get("question_id") == req.question_id:
            a["follow_up_generated"] = follow_up.get("follow_up_question")
    interview.answers = answers
    db.commit()

    return FollowUpResponse(
        question_id=req.question_id,
        detected_gap=follow_up.get("detected_gap", "Need deeper validation"),
        follow_up_question=follow_up.get("follow_up_question", "Can you explain your benchmark results?"),
        reasoning=follow_up.get("reasoning", "Validates practical implementation depth")
    )

@router.post("/{interview_id}/evaluate", response_model=InterviewResponse)
def complete_and_evaluate(interview_id: str, db: Session = Depends(get_db)):
    """Synthesizes interview answers into a structured evaluation and next steps."""
    interview = db.query(InterviewModel).filter(InterviewModel.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    candidate = db.query(CandidateModel).filter(CandidateModel.id == interview.candidate_id).first()
    job = db.query(JobModel).filter(JobModel.id == interview.job_id).first()

    cand_dict = {
        "name": candidate.name if candidate else "Candidate",
        "skills": candidate.skills if candidate else {},
        "projects": candidate.projects if candidate else [],
        "experience": candidate.experience if candidate else []
    }
    job_dict = {
        "title": job.title if job else "Role",
        "required_skills": job.required_skills if job else []
    }

    eval_result = evaluate_interview(job_dict, cand_dict, interview.questions or [], interview.answers or [])
    
    interview.evaluation = eval_result
    interview.status = "completed"
    db.commit()
    db.refresh(interview)

    return InterviewResponse(
        id=interview.id,
        candidate_id=interview.candidate_id,
        job_id=interview.job_id,
        questions=interview.questions,
        answers=interview.answers,
        evaluation=InterviewEvaluation(**eval_result),
        status=interview.status,
        created_at=interview.created_at
    )
