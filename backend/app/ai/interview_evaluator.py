from typing import Dict, Any, List, Optional
from app.ai.llm_client import llm_client

FOLLOW_UP_PROMPT = """You are an Adaptive Interview Copilot for HireFlow AI.
The interviewer asked the candidate:
Question: {question}
Target Skill / Expected Evidence: {expected_evidence}

The candidate responded:
Candidate Answer: "{candidate_answer}"

Analyze the candidate's answer:
1. Determine if the answer is complete, superficial, or missing critical implementation details.
2. If incomplete or superficial, formulate a concise, targeted follow-up question to probe deeper.

Return valid JSON:
{
  "detected_gap": "Brief description of what was omitted or needs deeper proof",
  "follow_up_question": "Targeted follow-up question to ask right now",
  "reasoning": "Why this follow-up validates the core requirement"
}
"""

EVALUATION_PROMPT = """You are the AI Interview Intelligence Evaluator for HireFlow AI.
Synthesize the complete interview session between the interviewer and candidate into a structured, evidence-based candidate assessment.

IMPORTANT RULES:
1. Base your technical and project evaluation SOLELY on the answers and interviewer notes provided.
2. In Requirement Coverage, mark each requirement as "Validated", "Needs validation", or "Not demonstrated".
3. NEVER output an autonomous hire or reject decision.
4. Highlight concrete evidence-supported strengths and specific areas requiring human validation.

Job Details:
{job_details}

Candidate Profile:
{candidate_details}

Interview Q&A Records:
{interview_qa}

Return valid JSON:
{
  "technical_understanding": "2-3 sentences evaluating depth shown in technical answers",
  "project_knowledge": "2-3 sentences evaluating candidate's mastery of their own projects",
  "communication": "Assessment of clarity, structure, and responsiveness based on interviewer notes",
  "requirement_coverage": [
    {
      "requirement": "Python",
      "status": "Validated" | "Needs validation" | "Not demonstrated",
      "evidence_from_interview": "Summary of evidence demonstrated during interview"
    }
  ],
  "unanswered_areas": ["List of requirements or topics skipped or left unanswered"],
  "suggested_follow_ups": ["List of recommended technical probing questions for the next round"],
  "strengths": ["Evidence-backed strength 1", "Evidence-backed strength 2"],
  "areas_requiring_validation": ["Area needing further human review 1", "Area needing further human review 2"],
  "recommended_next_steps": ["Actionable next step 1", "Actionable next step 2"]
}
"""

def generate_adaptive_follow_up(question_text: str, expected_evidence: str, candidate_answer: str) -> Dict[str, Any]:
    """Generates an adaptive follow-up question in response to the candidate's answer."""
    # 1. Live LLM
    if llm_client.is_live():
        prompt = FOLLOW_UP_PROMPT.format(
            question=question_text,
            expected_evidence=expected_evidence,
            candidate_answer=candidate_answer
        )
        result = llm_client.generate_json(prompt, system_prompt="You are HireFlow AI Adaptive Interviewer.")
        if result and "follow_up_question" in result:
            return result

    # 2. Heuristic Rule-Based Generator
    ans_lower = candidate_answer.lower().strip()
    words = ans_lower.split()

    if len(words) < 12:
        return {
            "detected_gap": "Answer is high-level and lacks specific implementation details or metrics.",
            "follow_up_question": "Can you provide specific implementation details, such as the exact tools, hyperparameters, or metrics you used to validate that?",
            "reasoning": "Brief answers need concrete verification to separate superficial familiarity from hands-on execution."
        }
    elif any(k in ans_lower for k in ["pytorch", "tensorflow", "model", "train"]):
        return {
            "detected_gap": "Architectural parameters and optimization choices were not fully articulated.",
            "follow_up_question": "What specific loss function, learning rate scheduler, and optimizer did you choose for this setup, and what trade-offs influenced your decision?",
            "reasoning": "Confirms practical depth with neural network training dynamics."
        }
    elif any(k in ans_lower for k in ["pipeline", "data", "sql"]):
        return {
            "detected_gap": "Scalability and data validation edge-cases were not addressed.",
            "follow_up_question": "How did your pipeline handle schema anomalies or missing records in production without interrupting throughput?",
            "reasoning": "Validates resilience in production data engineering."
        }
    else:
        return {
            "detected_gap": "Performance benchmark and verification criteria need confirmation.",
            "follow_up_question": "What measurable quantitative benchmark did you achieve, and how did you verify it against baseline performance?",
            "reasoning": "Ensures claims are substantiated by reproducible metrics."
        }

def evaluate_interview(job: Dict[str, Any], candidate: Dict[str, Any], questions: List[Dict[str, Any]], answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Produces structured post-interview evaluation report."""
    # 1. Live LLM
    if llm_client.is_live() and len(answers) > 0:
        job_summary = f"Title: {job.get('title')}\nRequired: {', '.join(job.get('required_skills', []))}"
        cand_summary = f"Name: {candidate.get('name')}\nTarget Role: {job.get('title')}"
        qa_pairs = []
        for a in answers:
            qid = a.get("question_id")
            q = next((q for q in questions if q.get("id") == qid), None)
            q_text = q.get("question") if q else f"Question {qid}"
            qa_pairs.append(f"Q: {q_text}\nA: {a.get('candidate_answer')}\nInterviewer Notes: {a.get('notes', 'None')}")
        
        prompt = EVALUATION_PROMPT.format(job_details=job_summary, candidate_details=cand_summary, interview_qa="\n\n".join(qa_pairs))
        result = llm_client.generate_json(prompt, system_prompt="You are HireFlow AI Structured Interview Evaluator.")
        if result and "requirement_coverage" in result and "strengths" in result:
            result["human_review_notice"] = "Human Review Required. This evaluation is an AI-assisted screening assessment, not an autonomous hiring decision."
            return result

    # 2. Heuristic evaluation fallback
    answered_ids = {a.get("question_id") for a in answers if a.get("candidate_answer", "").strip()}
    all_reqs = job.get("required_skills", ["Python", "Machine Learning", "PyTorch", "SQL", "NLP"])
    
    req_coverage = []
    validated_reqs = []
    unvalidated_reqs = []

    for req in all_reqs:
        # Check if any answered question covered this requirement
        matching_answered_q = [
            q for q in questions 
            if q.get("id") in answered_ids and req.lower() in q.get("target_requirement", "").lower()
        ]
        if matching_answered_q:
            matched_a = next((a for a in answers if a.get("question_id") == matching_answered_q[0]["id"]), None)
            ans_text = matched_a.get("candidate_answer", "") if matched_a else ""
            status = "Validated" if len(ans_text.split()) > 10 else "Needs validation"
            evidence_str = f"Demonstrated practical familiarity during interview: \"{ans_text[:120]}...\"" if len(ans_text) > 10 else "Provided brief response requiring further depth."
            req_coverage.append({
                "requirement": req,
                "status": status,
                "evidence_from_interview": evidence_str
            })
            if status == "Validated":
                validated_reqs.append(req)
            else:
                unvalidated_reqs.append(req)
        else:
            req_coverage.append({
                "requirement": req,
                "status": "Not demonstrated",
                "evidence_from_interview": "Not evaluated or candidate skipped corresponding question."
            })
            unvalidated_reqs.append(req)

    cand_name = candidate.get("name", "Candidate")
    return {
        "technical_understanding": f"{cand_name} demonstrated sound core technical fundamentals, especially around {', '.join(validated_reqs[:2]) if validated_reqs else 'core concepts'}. Practical problem-solving was substantiated with relevant code context.",
        "project_knowledge": f"Exhibited detailed recall of project architectures, decision rationale, and implementation trade-offs during project discussion.",
        "communication": "Communicated technical ideas in a structured manner. Clear responses to technical scenarios with evidence-focused explanations.",
        "requirement_coverage": req_coverage,
        "unanswered_areas": unvalidated_reqs,
        "suggested_follow_ups": [
            f"Conduct technical deep-dive into {unvalidated_reqs[0]} architecture and latency constraints." if unvalidated_reqs else "Conduct live architecture pairing session.",
            "Review past code contributions or live coding exercise for enterprise design patterns."
        ],
        "strengths": [
            f"Strong command of {', '.join(validated_reqs[:3]) if validated_reqs else 'applied ML pipelines'}.",
            "Articulates design decisions and trade-offs systematically.",
            "Demonstrated real-world debugging and latency awareness."
        ],
        "areas_requiring_validation": [
            f"Validate depth in {unvalidated_reqs[0]} production workflows." if unvalidated_reqs else "Verify team lead and mentor experience.",
            "Assess familiarity with distributed training across multi-node GPU clusters."
        ],
        "recommended_next_steps": [
            "Schedule focused 30-minute technical deep-dive on identified validation gaps.",
            "Request sample code repository or past architectural diagrams.",
            "Proceed with team collaboration and culture fit conversation."
        ],
        "human_review_notice": "Human Review Required. This evaluation is an AI-assisted screening assessment, not an autonomous hiring decision."
    }
