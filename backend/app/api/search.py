from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import CandidateModel
from app.schemas.search import SearchQuery, SearchResponse, SearchResultItem
from app.schemas.candidate import CandidateResponse
from app.ai.search_service import search_candidates_natural_language

router = APIRouter(prefix="/search", tags=["search"])

@router.post("", response_model=SearchResponse)
def search_candidates(query: SearchQuery, db: Session = Depends(get_db)):
    """Natural language recruiter query search across candidate profiles and projects."""
    db_candidates = db.query(CandidateModel).all()
    candidates_data = []
    
    for c in db_candidates:
        candidates_data.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "location": c.location,
            "resume_filename": c.resume_filename,
            "summary": c.summary,
            "education": c.education,
            "skills": c.skills,
            "experience": c.experience,
            "projects": c.projects,
            "certifications": c.certifications,
            "created_at": c.created_at
        })

    results = search_candidates_natural_language(query.query, candidates_data)

    output_items = []
    for r in results:
        cand_dict = r["candidate"]
        # Convert to CandidateResponse
        cand_resp = CandidateResponse(**cand_dict)
        output_items.append(SearchResultItem(
            candidate=cand_resp,
            relevance_score=r["relevance_score"],
            matched_reason=r["matched_reason"],
            highlighted_evidence=r["highlighted_evidence"]
        ))

    return SearchResponse(
        query=query.query,
        results_count=len(output_items),
        results=output_items
    )
