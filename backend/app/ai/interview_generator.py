from typing import Dict, Any, List
from app.ai.llm_client import llm_client

INTERVIEW_GEN_PROMPT = """You are the AI Interview Intelligence Generator for HireFlow AI.
Generate a structured, personalized 10-question interview plan for the candidate applying for the job.

CRITICAL REQUIREMENTS:
- You must generate EXACTLY 10 questions:
  * 3 Technical Questions (deep technical fundamentals and code architecture)
  * 2 Project-Based Questions (grounded directly in the candidate's actual listed projects)
  * 2 Behavioral Questions (engineering trade-offs, team collaboration, handling ambiguous requirements)
  * 2 Skill-Validation Questions (probing candidate's identified skill gaps or partial matches)
  * 1 Candidate-Specific Deep-Dive Question (system architecture, edge cases, or performance bottlenecks)
- Personalize heavily: refer to the candidate's actual projects, technologies, and resume details.
- Avoid generic questions whenever candidate-specific evidence exists.

Job Requirements:
{job_details}

Candidate Profile:
{candidate_details}

Identified Match Status / Gaps:
{match_summary}

Return valid JSON with:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "category": "Technical" | "Project-Based" | "Behavioral" | "Skill Validation" | "Deep-Dive",
      "target_requirement": "Skill or requirement being evaluated",
      "expected_evidence": "What specific proof or technical depth the interviewer should listen for",
      "follow_up_suggestion": "Recommended follow-up angle if candidate answer is superficial"
    }
  ]
}
"""

def heuristic_interview_generator(candidate: Dict[str, Any], job: Dict[str, Any], match_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates 10 high-fidelity, personalized interview questions grounded in candidate data."""
    cand_name = candidate.get("name", "the candidate")
    projects = candidate.get("projects", [])
    p1 = projects[0].get("name") if len(projects) > 0 else "Machine Learning Project"
    p1_tech = ", ".join(projects[0].get("technologies", ["Python"])) if len(projects) > 0 else "Python"
    p2 = projects[1].get("name") if len(projects) > 1 else "Predictive Pipeline"
    p2_tech = ", ".join(projects[1].get("technologies", ["PyTorch"])) if len(projects) > 1 else "PyTorch"
    
    # Identify gaps
    alignment = match_data.get("alignment_items", [])
    gaps = [item["requirement"] for item in alignment if item.get("status") in ["PARTIAL", "NOT FOUND"]]
    gap1 = gaps[0] if len(gaps) > 0 else "Production Deployment"
    gap2 = gaps[1] if len(gaps) > 1 else "Docker & CI/CD"

    req_skills = job.get("required_skills", ["Python", "PyTorch", "Machine Learning"])
    tech1 = req_skills[0] if len(req_skills) > 0 else "Python"
    tech2 = req_skills[1] if len(req_skills) > 1 else "PyTorch"
    tech3 = req_skills[2] if len(req_skills) > 2 else "Model Optimization"

    return [
        # 1. Technical
        {
            "id": 1,
            "question": f"In your experience working with {tech1}, how do you structure your data pipeline to prevent data leakage between training, validation, and test splits?",
            "category": "Technical",
            "target_requirement": tech1,
            "expected_evidence": "Candidate should articulate feature scaling inside cross-validation loops and temporal consistency.",
            "follow_up_suggestion": "Ask how they handle target encoding or imputations without leaking future state."
        },
        {
            "id": 2,
            "question": f"When training deep models in {tech2}, how do you diagnose and resolve vanishing or exploding gradients during backpropagation?",
            "category": "Technical",
            "target_requirement": tech2,
            "expected_evidence": "Look for practical familiarity with gradient clipping, residual connections, learning rate warmups, and weight initialization (He/Xavier).",
            "follow_up_suggestion": "Ask what optimizer and scheduler they default to (e.g. AdamW with cosine annealing)."
        },
        {
            "id": 3,
            "question": f"Explain your approach to {tech3} when reducing inference latency for real-time applications without substantial degradation in accuracy.",
            "category": "Technical",
            "target_requirement": tech3,
            "expected_evidence": "References to model pruning, post-training quantization (INT8), batching strategies, or ONNX/TensorRT compilation.",
            "follow_up_suggestion": "Inquire about trade-offs between memory footprint and latency throughput."
        },
        # 2. Project-Based
        {
            "id": 4,
            "question": f"In your project '{p1}', what architectural decisions did you make regarding {p1_tech}, and what alternative approaches did you benchmark?",
            "category": "Project-Based",
            "target_requirement": f"Project Execution: {p1}",
            "expected_evidence": "Concrete metrics, baseline comparisons, and honest appraisal of architectural trade-offs.",
            "follow_up_suggestion": "If the model struggled on edge cases, what data augmentation or loss weighting was used?"
        },
        {
            "id": 5,
            "question": f"Walk me through the pipeline design of '{p2}'. How did you validate that your predictions remained reliable against distribution shift?",
            "category": "Project-Based",
            "target_requirement": f"Practical Application: {p2}",
            "expected_evidence": "Mentions of monitoring drift (KS test, PSI), out-of-distribution validation splits, or automated retraining triggers.",
            "follow_up_suggestion": "Ask how model degradation was flagged to end users or monitoring dashboards."
        },
        # 3. Behavioral
        {
            "id": 6,
            "question": "Describe a scenario where a machine learning model achieved strong benchmark metrics on validation sets but failed to deliver expected business value when evaluated. How did you handle this?",
            "category": "Behavioral",
            "target_requirement": "Stakeholder Communication & Business Alignment",
            "expected_evidence": "Focus on understanding business KPIs over raw loss, proactive communication with stakeholders, and iterative re-framing.",
            "follow_up_suggestion": "Probe whether they pushed back or adapted the metric to match user experience."
        },
        {
            "id": 7,
            "question": "Tell me about a time you had a technical disagreement with a colleague or mentor regarding model architecture or implementation choices. How did you resolve it?",
            "category": "Behavioral",
            "target_requirement": "Engineering Collaboration",
            "expected_evidence": "Data-driven resolution (A/B testing, empirical ablation studies) rather than emotional arguments.",
            "follow_up_suggestion": "Ask what they learned from the outcome."
        },
        # 4. Skill Validation
        {
            "id": 8,
            "question": f"Our role emphasizes practical experience with {gap1}. Can you describe your hands-on exposure to {gap1} and how you would ramp up to production standard?",
            "category": "Skill Validation",
            "target_requirement": gap1,
            "expected_evidence": "Honest self-awareness of current depth combined with demonstrated ability to learn and apply modern tools rapidly.",
            "follow_up_suggestion": "Ask if they have experimented with standard open-source tools or personal POCs in this domain."
        },
        {
            "id": 9,
            "question": f"We noted that your resume shows limited evidence for {gap2}. How have you handled containerization, microservice architecture, or cloud deployment in previous workflows?",
            "category": "Skill Validation",
            "target_requirement": gap2,
            "expected_evidence": "Familiarity with Dockerfile creation, multi-stage builds, environment isolation, or cloud VM usage.",
            "follow_up_suggestion": "Ask how they ensure reproducibility when moving code from local development to servers."
        },
        # 5. Deep-Dive
        {
            "id": 10,
            "question": f"Deep Dive: Suppose our production inference endpoint experiences a 5x traffic spike and latency degrades from 80ms to 900ms. Walk through your step-by-step diagnostic and remediation strategy.",
            "category": "Deep-Dive",
            "target_requirement": "Production ML Reliability & Troubleshooting",
            "expected_evidence": "Methodical profiling: CPU/GPU memory saturation, thread starvation, network I/O vs compute bottleneck, auto-scaling, dynamic batching.",
            "follow_up_suggestion": "Ask whether they would prioritize horizontal pod autoscaling or reducing batch timeouts first."
        }
    ]

def generate_interview_questions(candidate: Dict[str, Any], job: Dict[str, Any], match_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generates personalized 10-question interview plan via LLM or deterministic engine."""
    # 1. Live LLM
    if llm_client.is_live():
        job_summary = f"Title: {job.get('title')}\nRequired: {', '.join(job.get('required_skills', []))}"
        cand_summary = f"Name: {candidate.get('name')}\nProjects: {candidate.get('projects')}\nExperience: {candidate.get('experience')}"
        match_summary = f"Strong Matches: {match_data.get('strong_matches_count')}, Missing: {match_data.get('missing_count')}"
        prompt = INTERVIEW_GEN_PROMPT.format(job_details=job_summary, candidate_details=cand_summary, match_summary=match_summary)
        result = llm_client.generate_json(prompt, system_prompt="You are HireFlow AI Interview Question Generator.")
        if result and "questions" in result and len(result["questions"]) >= 5:
            # Ensure id sequence
            for idx, q in enumerate(result["questions"], start=1):
                q["id"] = idx
            return result["questions"]

    # 2. Heuristic fallback
    return heuristic_interview_generator(candidate, job, match_data)
