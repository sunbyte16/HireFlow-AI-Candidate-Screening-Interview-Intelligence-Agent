import os
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_seed_demo():
    res = client.post("/api/demo/seed")
    assert res.status_code == 200
    data = res.json()
    assert data["candidates_count"] >= 3
    assert "job_id" in data

def test_list_jobs():
    res = client.get("/api/jobs")
    assert res.status_code == 200
    jobs = res.json()
    assert len(jobs) >= 1
    assert "Machine Learning Engineer" in jobs[0]["title"]

def test_analyze_jd():
    res = client.post("/api/jobs/analyze", json={
        "title": "Computer Vision Engineer",
        "description": "Looking for Computer Vision Engineer with PyTorch, OpenCV, Docker, and 2+ years experience."
    })
    assert res.status_code == 200
    data = res.json()
    assert "PyTorch" in data["required_skills"] or "OpenCV" in data["required_skills"]
    assert "Docker" in data["tools"] or "Docker" in data["preferred_skills"]

def test_list_candidates():
    res = client.get("/api/candidates")
    assert res.status_code == 200
    cands = res.json()
    assert len(cands) >= 3
    names = [c["name"] for c in cands]
    assert "Rahul Sharma" in names

def test_upload_pdf_resume():
    pdf_path = "./data/sample_resumes/rahul_sharma_resume.pdf"
    assert os.path.exists(pdf_path), f"PDF file not found at {pdf_path}"
    with open(pdf_path, "rb") as f:
        res = client.post(
            "/api/candidates/upload",
            files=[("files", ("test_rahul.pdf", f, "application/pdf"))]
        )
    assert res.status_code == 200
    uploaded = res.json()
    assert len(uploaded) == 1
    assert uploaded[0]["name"] == "Rahul Sharma"
    assert "Python" in uploaded[0]["skills"]["programming_languages"]

def test_matching():
    jobs = client.get("/api/jobs").json()
    cands = client.get("/api/candidates").json()
    job_id = jobs[0]["id"]
    cand_id = cands[0]["id"]

    res = client.post("/api/matching/analyze", json={
        "job_id": job_id,
        "candidate_id": cand_id
    })
    assert res.status_code == 200
    match = res.json()
    assert match["overall_score"] > 50
    assert len(match["alignment_items"]) > 0
    # Check evidence trail
    for item in match["alignment_items"]:
        assert "requirement" in item
        assert "status" in item
        assert "evidence" in item
        assert "source" in item

def test_interview_flow():
    jobs = client.get("/api/jobs").json()
    cands = client.get("/api/candidates").json()
    job_id = jobs[0]["id"]
    cand_id = cands[0]["id"]

    # Generate interview
    gen_res = client.post("/api/interviews/generate", json={
        "job_id": job_id,
        "candidate_id": cand_id
    })
    assert gen_res.status_code == 200
    interview = gen_res.json()
    int_id = interview["id"]
    assert len(interview["questions"]) == 10

    # Answer question 1
    ans_res = client.post(f"/api/interviews/{int_id}/answer", json={
        "question_id": 1,
        "answer": "We partition datasets using stratified cross-validation and compute scalar transforms solely on train folds to prevent leakage.",
        "notes": "Good answer on data hygiene"
    })
    assert ans_res.status_code == 200

    # Follow-up test
    fu_res = client.post(f"/api/interviews/{int_id}/follow-up", json={
        "question_id": 1,
        "candidate_answer": "I used PyTorch for training models."
    })
    assert fu_res.status_code == 200
    fu_data = fu_res.json()
    assert "follow_up_question" in fu_data
    assert "detected_gap" in fu_data

    # Complete and evaluate
    eval_res = client.post(f"/api/interviews/{int_id}/evaluate")
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["status"] == "completed"
    assert eval_data["evaluation"] is not None
    assert "human_review_notice" in eval_data["evaluation"]

def test_report_endpoint():
    jobs = client.get("/api/jobs").json()
    cands = client.get("/api/candidates").json()
    res = client.get(f"/api/reports/{cands[0]['id']}/{jobs[0]['id']}")
    assert res.status_code == 200
    rep = res.json()
    assert "candidate" in rep
    assert "job" in rep
    assert "audit_trail" in rep
    assert len(rep["audit_trail"]) > 0

def test_search():
    res = client.post("/api/search", json={
        "query": "Show candidates with computer vision and YOLO projects"
    })
    assert res.status_code == 200
    search_res = res.json()
    assert search_res["results_count"] > 0
    assert "Rahul Sharma" in [r["candidate"]["name"] for r in search_res["results"]]

def test_auth_flow():
    # 1. Test Login with seeded admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@hireflow.ai",
        "password": "AdminPassword123!"
    })
    assert admin_login.status_code == 200
    data = admin_login.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    admin_token = data["access_token"]

    # 2. Test Get Me with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@hireflow.ai"

    # 3. Test Register new user (auto-login)
    new_email = f"test.{uuid.uuid4().hex[:8]}@hireflow.ai"
    reg_res = client.post("/api/auth/register", json={
        "email": new_email,
        "password": "TestPassword123!",
        "full_name": "Test Recruiter",
        "role": "recruiter"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == new_email
    assert reg_data["user"]["role"] == "recruiter"

    # 4. Test duplicate registration error
    dup_res = client.post("/api/auth/register", json={
        "email": new_email,
        "password": "TestPassword123!",
        "full_name": "Duplicate User",
        "role": "recruiter"
    })
    assert dup_res.status_code == 400

    # 5. Test invalid password error
    bad_login = client.post("/api/auth/login", json={
        "email": new_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

