import re
from typing import Dict, Any, List
from app.ai.llm_client import llm_client

JOB_ANALYSIS_PROMPT = """You are an expert technical recruiter and job analyst for HireFlow AI.
Analyze the following Job Description (JD) and extract structured requirements in JSON.

Extract these exact fields:
{
  "job_title": "string (e.g. Machine Learning Engineer)",
  "required_skills": ["list of strict required core technical skills"],
  "preferred_skills": ["list of nice-to-have or preferred skills"],
  "experience": "string (e.g. 1+ years experience in ML/Software)",
  "education": "string (e.g. Bachelor's in CS, Data Science or related)",
  "responsibilities": ["list of core job duties and responsibilities"],
  "domain": "string (e.g. Machine Learning / Computer Vision / NLP / Enterprise SaaS)",
  "tools": ["list of specific frameworks, libraries, tools, cloud platforms e.g. PyTorch, Docker, AWS, Git"]
}

Rules:
- Be strict: required_skills should be mandatory capabilities.
- Keep skills concise and canonical (e.g., 'Python', 'PyTorch', 'SQL', 'NLP').
- Do not invent requirements that are not stated in the JD.

Job Description:
{jd_text}
"""

def extract_skills_heuristic(text: str) -> List[str]:
    known_tech = [
        "Python", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "Machine Learning",
        "Deep Learning", "NLP", "Natural Language Processing", "Computer Vision",
        "SQL", "PostgreSQL", "MySQL", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
        "Git", "FastAPI", "Flask", "Django", "React", "TypeScript", "JavaScript",
        "C++", "Java", "Go", "Pandas", "NumPy", "OpenCV", "Transformers", "LLM",
        "Hugging Face", "MLOps", "Linux", "REST APIs", "CI/CD", "Spark"
    ]
    found = []
    text_lower = text.lower()
    for tech in known_tech:
        # Match word boundary
        pattern = r"\b" + re.escape(tech.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(tech)
    return found

def analyze_job_description(jd_text: str, title_hint: str = "") -> Dict[str, Any]:
    """Extracts structured requirements from JD text using LLM or robust heuristic fallback."""
    # 1. Try Live LLM
    if llm_client.is_live():
        prompt = JOB_ANALYSIS_PROMPT.format(jd_text=jd_text)
        result = llm_client.generate_json(prompt, system_prompt="You are HireFlow AI Job Extraction Engine.")
        if result and "job_title" in result and "required_skills" in result:
            if title_hint and (result["job_title"] == "Unknown" or not result["job_title"]):
                result["job_title"] = title_hint
            return result

    # 2. Heuristic Semantic Parser
    lines = [line.strip() for line in jd_text.splitlines() if line.strip()]
    
    # Determine title
    title = title_hint
    if not title and lines:
        first_line = lines[0]
        if len(first_line) < 60 and not first_line.lower().startswith(("requirement", "about", "we are")):
            title = first_line
        else:
            title = "Machine Learning Engineer"

    # Detect skills
    all_skills = extract_skills_heuristic(jd_text)
    
    # Split required vs preferred if explicit sections exist
    required_skills = []
    preferred_skills = []
    current_section = "required"
    
    for line in lines:
        line_l = line.lower()
        if any(term in line_l for term in ["preferred", "nice to have", "plus", "bonus"]):
            current_section = "preferred"
        elif any(term in line_l for term in ["require", "must have", "qualifications", "skills:"]):
            current_section = "required"
            
        line_skills = extract_skills_heuristic(line)
        if current_section == "preferred":
            for s in line_skills:
                if s not in preferred_skills:
                    preferred_skills.append(s)
        else:
            for s in line_skills:
                if s not in required_skills:
                    required_skills.append(s)
                    
    # Clean up overlap
    if not required_skills:
        required_skills = all_skills[:5] if all_skills else ["Python", "Machine Learning", "PyTorch", "SQL"]
    if not preferred_skills:
        preferred_skills = [s for s in all_skills if s not in required_skills]
        if not preferred_skills and "Docker" in all_skills:
            preferred_skills.append("Docker")

    # Extract experience
    exp_match = re.search(r"(\d+\+?\s*(?:to\s*\d+)?\s*(?:years?|yrs?)(?:\s+of\s+experience)?)", jd_text, re.IGNORECASE)
    experience = exp_match.group(1) if exp_match else "1+ years"

    # Responsibilities
    responsibilities = []
    for line in lines:
        if line.startswith(("-", "*", "•")) and len(line) > 15:
            cleaned = line.lstrip("-*• ").strip()
            if not any(k in cleaned.lower() for k in ["degree", "bachelor", "master", "years"]):
                responsibilities.append(cleaned)
    if not responsibilities:
        responsibilities = [
            "Develop, optimize, and deploy scalable machine learning models",
            "Collaborate with engineering team to integrate models into production pipelines",
            "Evaluate model performance, latency, and reliability metrics"
        ]

    # Domain
    domain = "Artificial Intelligence & Machine Learning"
    if "computer vision" in jd_text.lower():
        domain = "Computer Vision & Deep Learning"
    elif "nlp" in jd_text.lower():
        domain = "Natural Language Processing"

    return {
        "job_title": title if title else "Machine Learning Engineer",
        "required_skills": required_skills[:8],
        "preferred_skills": preferred_skills[:4],
        "experience": experience,
        "education": "Bachelor's or Master's in Computer Science, Data Science, or related STEM field",
        "responsibilities": responsibilities[:5],
        "domain": domain,
        "tools": [s for s in (required_skills + preferred_skills) if s in ["PyTorch", "TensorFlow", "Docker", "AWS", "Git", "SQL", "OpenCV"]]
    }
