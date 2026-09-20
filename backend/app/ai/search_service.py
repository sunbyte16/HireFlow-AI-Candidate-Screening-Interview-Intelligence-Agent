import re
from typing import List, Dict, Any
from app.ai.llm_client import llm_client

SEARCH_QUERY_PROMPT = """You are the Natural Language Recruiter Search Interpreter for HireFlow AI.
Analyze the recruiter's search query and extract key matching criteria.

Query: "{query}"

Return JSON:
{
  "keywords": ["list of exact keywords or technologies mentioned, e.g. Python, YOLO"],
  "domain_intent": "ML / CV / NLP / Cloud / etc.",
  "project_requirements": ["any specific project types or tools mentioned"]
}
"""

def search_candidates_natural_language(query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Performs semantic and heuristic keyword search across candidate profiles and evidence."""
    query_lower = query.lower()
    
    # Extract query tokens
    stop_words = {"show", "find", "candidates", "candidate", "with", "whose", "who", "have", "experience", "projects", "project", "in", "and", "or", "the", "a", "an", "which"}
    raw_tokens = re.findall(r"\b\w+\b", query_lower)
    search_terms = [t for t in raw_tokens if t not in stop_words and len(t) > 1]
    
    scored_candidates = []
    
    for cand in candidates:
        cand_name = cand.get("name", "Candidate")
        skills_dict = cand.get("skills", {})
        all_skills = [s.lower() for cat in skills_dict.values() for s in cat]
        projects = cand.get("projects", [])
        experience = cand.get("experience", [])
        summary = cand.get("summary", "").lower()
        
        matches_found = []
        highlighted_evidence = []
        score = 0.0

        for term in search_terms:
            # 1. Match in skills
            for s in all_skills:
                if term in s or s in term:
                    score += 2.0
                    if s not in matches_found:
                        matches_found.append(s)

            # 2. Match in projects
            for p in projects:
                p_name = p.get("name", "")
                p_desc = p.get("description", "")
                p_tech = [t.lower() for t in p.get("technologies", [])]
                
                if term in p_name.lower() or term in p_desc.lower() or any(term in t for t in p_tech):
                    score += 3.0
                    snippet = f"Project '{p_name}': {p_desc}"
                    if snippet not in highlighted_evidence:
                        highlighted_evidence.append(snippet)
                    if term not in matches_found:
                        matches_found.append(term)

            # 3. Match in experience
            for exp in experience:
                company = exp.get("company", "")
                role = exp.get("role", "")
                resps = exp.get("responsibilities", [])
                for r in resps:
                    if term in r.lower():
                        score += 2.5
                        snippet = f"Experience at {company}: \"{r}\""
                        if snippet not in highlighted_evidence:
                            highlighted_evidence.append(snippet)
                        if term not in matches_found:
                            matches_found.append(term)

        # Base relevance
        if score > 0:
            rel_score = min(round((score / (len(search_terms) * 4.0)) * 100.0, 1), 98.0)
            reason = f"Matches criteria: {', '.join(set(matches_found)).capitalize()} across projects and technical background."
            scored_candidates.append({
                "candidate": cand,
                "relevance_score": rel_score,
                "matched_reason": reason,
                "highlighted_evidence": highlighted_evidence[:3]
            })

    # Sort descending by relevance score
    scored_candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored_candidates
