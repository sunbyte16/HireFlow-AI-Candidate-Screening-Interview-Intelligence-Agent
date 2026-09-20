import re
from typing import Dict, Any, List
from app.ai.llm_client import llm_client

MATCH_PROMPT = """You are the Evidence-Based Candidate Matching Engine for HireFlow AI.
Compare the Candidate's Resume Profile against the Job Requirements.

CRITICAL RULES:
1. For every requirement, you must evaluate if tangible evidence exists in the candidate profile.
2. Status MUST be one of:
   - "MATCHED": Direct evidence found in professional experience or substantive projects.
   - "PARTIAL": Mentioned only in academic context, coursework, or limited exposure without professional depth.
   - "NOT FOUND": No supporting evidence found in resume.
   - "UNCLEAR": Vague mention without verifiable context.
3. Every MATCHED or PARTIAL status MUST include an exact quote or evidence snippet and the source location (e.g. "Resume → Projects → YOLO Detection").
4. If NOT FOUND, evidence must state: "No supporting evidence found in candidate profile."
5. Never hallucinate skills.

Job Requirements:
{job_requirements}

Candidate Profile:
{candidate_profile}

Return valid JSON with:
{
  "alignment_items": [
    {
      "requirement": "Requirement name",
      "category": "Required" or "Preferred",
      "status": "MATCHED" | "PARTIAL" | "NOT FOUND" | "UNCLEAR",
      "evidence": "Exact evidence snippet or description",
      "source": "Resume → Section → Subsection",
      "missing_context": "What is missing, if status is PARTIAL or NOT FOUND",
      "confidence": 0.95
    }
  ]
}
"""

def heuristic_matcher(candidate: Dict[str, Any], job: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Deterministic evidence-based matching engine scanning resume sections for verifiable evidence."""
    required_skills = job.get("required_skills", [])
    preferred_skills = job.get("preferred_skills", [])
    
    projects = candidate.get("projects", [])
    experience = candidate.get("experience", [])
    certifications = candidate.get("certifications", [])
    skills_dict = candidate.get("skills", {})
    all_skills_flat = [s.lower() for cat in skills_dict.values() for s in cat]
    
    alignment_items = []
    
    def evaluate_item(req: str, category: str) -> Dict[str, Any]:
        req_lower = req.lower()
        
        # 1. Search Experience (Strongest evidence)
        for exp in experience:
            company = exp.get("company", "Company")
            role = exp.get("role", "Role")
            responsibilities = exp.get("responsibilities", [])
            for resp in responsibilities:
                if req_lower in resp.lower():
                    return {
                        "requirement": req,
                        "category": category,
                        "status": "MATCHED",
                        "evidence": f'"{resp.strip()}"',
                        "source": f"Resume → Experience → {company} ({role})",
                        "missing_context": None,
                        "confidence": 0.95
                    }

        # 2. Search Projects
        for proj in projects:
            p_name = proj.get("name", "Project")
            p_desc = proj.get("description", "")
            p_tech = [t.lower() for t in proj.get("technologies", [])]
            p_rel = [r.lower() for r in proj.get("relevant_skills", [])]
            
            if req_lower in p_desc.lower() or any(req_lower in t for t in p_tech + p_rel):
                # Check if it's production or academic/demo
                is_academic = any(k in p_name.lower() or k in p_desc.lower() for k in ["coursework", "academic", "sentiment", "tutorial"])
                status = "PARTIAL" if (is_academic and req_lower in ["nlp", "docker", "kubernetes", "aws"]) else "MATCHED"
                missing = "Demonstrated in project; lack of multi-year enterprise production exposure." if status == "PARTIAL" else None
                
                return {
                    "requirement": req,
                    "category": category,
                    "status": status,
                    "evidence": f'"{p_desc.strip()}"',
                    "source": f"Resume → Projects → {p_name}",
                    "missing_context": missing,
                    "confidence": 0.90 if status == "MATCHED" else 0.75
                }

        # 3. Search Certifications
        for cert in certifications:
            c_name = cert.get("name", "")
            c_issuer = cert.get("issuer", "")
            if req_lower in c_name.lower():
                return {
                    "requirement": req,
                    "category": category,
                    "status": "PARTIAL",
                    "evidence": f"Holds certification: {c_name} issued by {c_issuer}.",
                    "source": f"Resume → Certifications → {c_name}",
                    "missing_context": "Theoretical knowledge certified; practical project evidence needed.",
                    "confidence": 0.70
                }

        # 4. Search Skills list alone
        if any(req_lower == s or req_lower in s for s in all_skills_flat):
            return {
                "requirement": req,
                "category": category,
                "status": "PARTIAL",
                "evidence": f"Listed '{req}' under candidate skills overview.",
                "source": "Resume → Skills Overview",
                "missing_context": f"Skill listed in keyword summary, but lacking specific project or employment description.",
                "confidence": 0.60
            }

        # 5. Not found
        return {
            "requirement": req,
            "category": category,
            "status": "NOT FOUND",
            "evidence": "No supporting evidence found in candidate profile or resume text.",
            "source": "Resume → Not Found",
            "missing_context": f"Candidate profile does not indicate direct experience with {req}.",
            "confidence": 1.0
        }

    for r in required_skills:
        alignment_items.append(evaluate_item(r, "Required"))
    for p in preferred_skills:
        alignment_items.append(evaluate_item(p, "Preferred"))

    return alignment_items

def analyze_match(candidate: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
    """Generates complete evidence-based match analysis with score and breakdown."""
    alignment_items = []
    
    # 1. Live LLM
    if llm_client.is_live():
        job_summary = f"Title: {job.get('title')}\nRequired: {', '.join(job.get('required_skills', []))}\nPreferred: {', '.join(job.get('preferred_skills', []))}"
        cand_summary = f"Name: {candidate.get('name')}\nSkills: {candidate.get('skills')}\nProjects: {candidate.get('projects')}\nExperience: {candidate.get('experience')}"
        prompt = MATCH_PROMPT.format(job_requirements=job_summary, candidate_profile=cand_summary)
        result = llm_client.generate_json(prompt, system_prompt="You are HireFlow AI Evidence-Based Candidate Matcher.")
        if result and "alignment_items" in result and len(result["alignment_items"]) > 0:
            alignment_items = result["alignment_items"]

    # 2. Heuristic fallback if LLM offline or empty
    if not alignment_items:
        alignment_items = heuristic_matcher(candidate, job)

    # Calculate overall match score indicator
    total_weight = 0.0
    earned_weight = 0.0
    strong_count = 0
    partial_count = 0
    missing_count = 0

    for item in alignment_items:
        weight = 1.0 if item.get("category") == "Required" else 0.5
        total_weight += weight
        st = item.get("status", "NOT FOUND")
        if st == "MATCHED":
            earned_weight += 1.0 * weight
            strong_count += 1
        elif st == "PARTIAL":
            earned_weight += 0.5 * weight
            partial_count += 1
        else:
            missing_count += 1

    overall_score = round((earned_weight / total_weight * 100.0), 1) if total_weight > 0 else 0.0

    return {
        "overall_score": overall_score,
        "strong_matches_count": strong_count,
        "partial_matches_count": partial_count,
        "missing_count": missing_count,
        "alignment_items": alignment_items,
        "disclaimer": "AI-generated analysis based on available candidate evidence. Human review is required."
    }
