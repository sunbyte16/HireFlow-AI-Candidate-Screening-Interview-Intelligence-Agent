import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db, Base, engine
from app.database.models import JobModel, CandidateModel, MatchAnalysisModel, InterviewModel, UserModel
from app.ai.matcher import analyze_match
from app.ai.interview_generator import generate_interview_questions
from app.core.config import settings
from app.core.security import hash_password

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_JOB = {
    "title": "Machine Learning Engineer",
    "description": """Machine Learning Engineer

Department: AI Research & Core Systems
Location: Remote / Hybrid (San Francisco, CA)
Experience: 1+ years experience

About the Role:
We are looking for a Machine Learning Engineer to design, train, and deploy real-time ML systems into our production pipelines. You will collaborate with research engineers and full-stack developers to optimize neural architectures, validate models on benchmark datasets, and maintain reliable MLOps pipelines.

Key Requirements:
- Strong proficiency in Python and object-oriented software engineering
- Solid foundations in Machine Learning, statistical modeling, and data pipelines
- Practical hands-on experience training deep neural networks with PyTorch or TensorFlow
- Relational database querying, schema design, and data extraction using SQL
- Familiarity with Natural Language Processing (NLP) or Computer Vision architectures
- 1+ years of practical experience developing or deploying ML models

Preferred Qualifications:
- Containerization and orchestration experience using Docker and Kubernetes
- Cloud deployment and MLOps on AWS (SageMaker, S3, EC2) or GCP
- Experience with real-time inference latency optimization (ONNX, TensorRT)
- Bachelor's or Master's degree in Computer Science, Data Science, or related STEM discipline
""",
    "department": "Core AI Engineering",
    "location": "Remote / Hybrid (San Francisco, CA)",
    "required_skills": ["Python", "Machine Learning", "PyTorch", "SQL", "NLP", "Computer Vision"],
    "preferred_skills": ["Docker", "AWS"],
    "experience": "1+ years",
    "education": "Bachelor's or Master's in Computer Science or related STEM field",
    "responsibilities": [
        "Architect and train deep learning models for production inference pipelines",
        "Engineer scalable data preprocessing, feature stores, and automated validation tests",
        "Profile and minimize model inference latency on GPU/CPU edge and cloud servers",
        "Partner with cross-functional engineering teams to evaluate model performance metrics"
    ],
    "domain": "Machine Learning & Computer Vision",
    "tools": ["PyTorch", "Python", "SQL", "Docker", "AWS", "Git"]
}

DEMO_CANDIDATES = [
    {
        "name": "Rahul Sharma",
        "email": "rahul.sharma.ml@gmail.com",
        "phone": "+1 (415) 890-4321",
        "location": "San Francisco, CA",
        "resume_filename": "rahul_sharma_resume.pdf",
        "summary": "Applied Machine Learning Engineer with 2 years of hands-on experience building computer vision and deep learning models in PyTorch. Proven track record optimizing real-time object detection systems and engineering automated data pipelines in Python and SQL.",
        "education": [
            {
                "degree": "B.S. in Computer Science (Honors)",
                "institution": "University of California, Berkeley",
                "graduation_year": "2023"
            }
        ],
        "skills": {
            "programming_languages": ["Python", "C++", "SQL", "Bash"],
            "frameworks": ["PyTorch", "TorchVision", "FastAPI", "Scikit-Learn", "OpenCV"],
            "ml_ai": ["Deep Learning", "Computer Vision", "Object Detection", "YOLO", "CNNs", "Transfer Learning"],
            "databases": ["PostgreSQL", "SQLite"],
            "cloud": ["AWS (S3, EC2)", "Docker (Basics)"],
            "tools": ["Git", "Linux", "Jupyter", "Weights & Biases", "TensorBoard"]
        },
        "experience": [
            {
                "company": "VisionScale AI Labs",
                "role": "Machine Learning Engineer",
                "duration": "Jul 2023 – Present (1 yr 2 mos)",
                "responsibilities": [
                    "Engineered end-to-end PyTorch deep learning pipelines for image classification and real-time detection, serving over 1.2M daily inference requests.",
                    "Constructed automated ETL and data-validation pipelines using Python and PostgreSQL, reducing dirty data rates by 34%.",
                    "Benchmarked model inference using TensorRT and ONNX, reducing p95 latency from 140ms down to 38ms."
                ]
            },
            {
                "company": "DataPoint Innovations",
                "role": "Machine Learning Intern",
                "duration": "Jan 2023 – Jun 2023 (6 mos)",
                "responsibilities": [
                    "Developed Python scripts for automated dataset curation, augmentation, and hyperparameter tuning sweeps.",
                    "Wrote complex SQL queries to aggregate customer usage logs and evaluate predictive churn models."
                ]
            }
        ],
        "projects": [
            {
                "name": "Real-Time Object Detection using YOLO",
                "technologies": ["Python", "PyTorch", "YOLOv8", "OpenCV", "FastAPI"],
                "description": "Implemented a real-time edge object detection pipeline achieving 48 FPS on edge devices. Fine-tuned YOLOv8 on custom warehouse inventory dataset with 89.4% mAP50.",
                "relevant_skills": ["Computer Vision", "PyTorch", "Python", "Object Detection"]
            },
            {
                "name": "Predictive Analytics & Forecasting System",
                "technologies": ["Python", "Scikit-Learn", "PostgreSQL", "Pandas"],
                "description": "Developed an automated regression and gradient boosting pipeline for time-series demand forecasting with custom cross-validation.",
                "relevant_skills": ["Machine Learning", "Python", "SQL"]
            },
            {
                "name": "Academic NLP Sentiment Classifier",
                "technologies": ["Python", "Transformers", "Hugging Face"],
                "description": "Built an exploratory sentiment classification model on IMDb reviews during university coursework using DistilBERT.",
                "relevant_skills": ["NLP", "Deep Learning"]
            }
        ],
        "certifications": [
            {
                "name": "Deep Learning Specialization",
                "issuer": "DeepLearning.AI",
                "year": "2023"
            }
        ]
    },
    {
        "name": "Priya Patel",
        "email": "priya.patel.ds@outlook.com",
        "phone": "+1 (206) 555-0198",
        "location": "Seattle, WA",
        "resume_filename": "priya_patel_resume.pdf",
        "summary": "Data Scientist and NLP Specialist with strong background in statistical modeling, enterprise SQL warehousing, and transformer-based text analytics. Experienced in production sentiment analysis and customer intent classification.",
        "education": [
            {
                "degree": "M.S. in Data Science",
                "institution": "University of Washington",
                "graduation_year": "2023"
            }
        ],
        "skills": {
            "programming_languages": ["Python", "SQL", "R", "Scala"],
            "frameworks": ["Scikit-Learn", "Hugging Face", "PyTorch (Basics)", "Pandas", "NumPy"],
            "ml_ai": ["NLP", "Transformers", "BERT", "Text Summarization", "Topic Modeling", "Machine Learning"],
            "databases": ["PostgreSQL", "Snowflake", "BigQuery"],
            "cloud": ["AWS (Redshift, S3)"],
            "tools": ["Git", "Tableau", "Airflow", "Jupyter"]
        },
        "experience": [
            {
                "company": "CloudAnalytics Corp",
                "role": "Data Scientist - NLP",
                "duration": "Aug 2023 – Present (1 yr 1 mo)",
                "responsibilities": [
                    "Trained and deployed transformer models (RoBERTa) for multi-class customer support ticket classification with 93% F1 score.",
                    "Designed large-scale data transformation workflows in PostgreSQL and Snowflake handling 5M+ records weekly.",
                    "Conducted A/B testing on model-driven routing, cutting average resolution time by 28%."
                ]
            }
        ],
        "projects": [
            {
                "name": "Enterprise NLP Sentiment & Intent Pipeline",
                "technologies": ["Python", "Hugging Face", "PyTorch", "SQL", "FastAPI"],
                "description": "Architected an end-to-end NLP pipeline analyzing streaming customer feedback and categorizing urgency levels in real time.",
                "relevant_skills": ["NLP", "Python", "SQL", "Transformers"]
            },
            {
                "name": "Predictive Customer Churn Engine",
                "technologies": ["Python", "Scikit-Learn", "SQL", "Pandas"],
                "description": "Constructed churn prediction model using LightGBM and Random Forests with SHAP interpretability values.",
                "relevant_skills": ["Machine Learning", "Python", "SQL"]
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Machine Learning – Specialty",
                "issuer": "Amazon Web Services",
                "year": "2024"
            }
        ]
    },
    {
        "name": "Arjun Mehta",
        "email": "arjun.mehta.cv@gmail.com",
        "phone": "+1 (512) 440-9281",
        "location": "Austin, TX",
        "resume_filename": "arjun_mehta_resume.pdf",
        "summary": "Computer Vision & Deep Learning Specialist focused on autonomous systems, convolutional neural networks, and OpenCV video analytics pipelines. Skilled in high-throughput video processing and model quantization.",
        "education": [
            {
                "degree": "B.Tech in Electronics & Computer Science",
                "institution": "Georgia Tech",
                "graduation_year": "2022"
            }
        ],
        "skills": {
            "programming_languages": ["Python", "C++", "CUDA", "SQL (Basics)"],
            "frameworks": ["PyTorch", "TensorFlow", "OpenCV", "CUDA", "TensorRT"],
            "ml_ai": ["Computer Vision", "Deep Learning", "CNNs", "Semantic Segmentation", "Lane Tracking", "Pose Estimation"],
            "databases": ["SQLite", "Redis"],
            "cloud": ["Docker", "Linux Edge Systems"],
            "tools": ["Git", "CMake", "GStreamer", "ROS"]
        },
        "experience": [
            {
                "company": "RoboVision Dynamics",
                "role": "Computer Vision Engineer",
                "duration": "Sep 2022 – Present (2 yrs)",
                "responsibilities": [
                    "Designed semantic segmentation models in PyTorch for obstacle detection deployed to embedded robotics hardware.",
                    "Implemented C++ and OpenCV multi-threaded video stream decoders achieving 60 FPS under constrained compute budgets.",
                    "Containerized inference environments using Docker for reproducible deployment across edge fleets."
                ]
            }
        ],
        "projects": [
            {
                "name": "Autonomous Lane Navigation & Tracking",
                "technologies": ["Python", "PyTorch", "OpenCV", "Docker"],
                "description": "Built lane detection and steering angle prediction model trained on real-world driving footage with custom temporal smoothing.",
                "relevant_skills": ["Computer Vision", "PyTorch", "Docker"]
            },
            {
                "name": "Real-Time Facial Landmark & Pose Estimation",
                "technologies": ["Python", "OpenCV", "PyTorch", "TensorRT"],
                "description": "Optimized 68-point facial landmark regressor running at sub-15ms latency per frame on low-power Jetson hardware.",
                "relevant_skills": ["Computer Vision", "PyTorch", "Deep Learning"]
            }
        ],
        "certifications": [
            {
                "name": "NVIDIA Certified Deep Learning Developer",
                "issuer": "NVIDIA Deep Learning Institute",
                "year": "2023"
            }
        ]
    }
]

def seed_sample_resume_files():
    """Generates plain text and sample files in the data directory for testing file uploads."""
    os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
    for c in DEMO_CANDIDATES:
        txt_path = os.path.join(settings.SAMPLE_DATA_DIR, c["resume_filename"].replace(".pdf", ".txt"))
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(f"{c['name']}\n")
            f.write(f"Email: {c['email']} | Phone: {c['phone']} | Location: {c['location']}\n\n")
            f.write(f"SUMMARY:\n{c['summary']}\n\n")
            f.write("EDUCATION:\n")
            for edu in c["education"]:
                f.write(f"- {edu['degree']} at {edu['institution']} ({edu['graduation_year']})\n")
            f.write("\nSKILLS:\n")
            for cat, items in c["skills"].items():
                f.write(f"- {cat.replace('_', ' ').title()}: {', '.join(items)}\n")
            f.write("\nEXPERIENCE:\n")
            for exp in c["experience"]:
                f.write(f"- {exp['role']} at {exp['company']} ({exp['duration']})\n")
                for r in exp["responsibilities"]:
                    f.write(f"  * {r}\n")
            f.write("\nPROJECTS:\n")
            for proj in c["projects"]:
                f.write(f"- {proj['name']}: {proj['description']} (Tech: {', '.join(proj['technologies'])})\n")
            f.write("\nCERTIFICATIONS:\n")
            for cert in c["certifications"]:
                f.write(f"- {cert['name']} ({cert['issuer']}, {cert['year']})\n")

@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """Seeds the database with Demo Job, 3 Candidates, Match Analyses, and an initial interview session."""
    # Ensure sample resume files exist
    seed_sample_resume_files()

    # Clear existing demo data or re-create
    existing_job = db.query(JobModel).filter(JobModel.title == DEMO_JOB["title"]).first()
    if not existing_job:
        job = JobModel(**DEMO_JOB)
        db.add(job)
        db.commit()
        db.refresh(job)
    else:
        job = existing_job

    candidates = []
    for c_data in DEMO_CANDIDATES:
        existing_c = db.query(CandidateModel).filter(CandidateModel.email == c_data["email"]).first()
        if not existing_c:
            cand = CandidateModel(
                name=c_data["name"],
                email=c_data["email"],
                phone=c_data["phone"],
                location=c_data["location"],
                resume_filename=c_data["resume_filename"],
                raw_text=c_data["summary"],
                summary=c_data["summary"],
                education=c_data["education"],
                skills=c_data["skills"],
                experience=c_data["experience"],
                projects=c_data["projects"],
                certifications=c_data["certifications"]
            )
            db.add(cand)
            db.commit()
            db.refresh(cand)
            candidates.append(cand)
        else:
            candidates.append(existing_c)

    # Compute matches for all 3 demo candidates
    job_dict = {
        "title": job.title,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills
    }

    match_analyses = []
    for cand in candidates:
        cand_dict = {
            "name": cand.name,
            "skills": cand.skills,
            "projects": cand.projects,
            "experience": cand.experience,
            "certifications": cand.certifications
        }
        match_res = analyze_match(cand_dict, job_dict)
        
        existing_match = db.query(MatchAnalysisModel).filter(
            MatchAnalysisModel.job_id == job.id,
            MatchAnalysisModel.candidate_id == cand.id
        ).first()

        if existing_match:
            existing_match.overall_score = match_res["overall_score"]
            existing_match.strong_matches_count = match_res["strong_matches_count"]
            existing_match.partial_matches_count = match_res["partial_matches_count"]
            existing_match.missing_count = match_res["missing_count"]
            existing_match.alignment_items = match_res["alignment_items"]
            db.commit()
            match_analyses.append(existing_match)
        else:
            m = MatchAnalysisModel(
                job_id=job.id,
                candidate_id=cand.id,
                overall_score=match_res["overall_score"],
                strong_matches_count=match_res["strong_matches_count"],
                partial_matches_count=match_res["partial_matches_count"],
                missing_count=match_res["missing_count"],
                alignment_items=match_res["alignment_items"]
            )
            db.add(m)
            db.commit()
            match_analyses.append(m)

    # Seed an active demo interview for Candidate A (Rahul Sharma)
    cand_a = candidates[0]
    existing_interview = db.query(InterviewModel).filter(
        InterviewModel.job_id == job.id,
        InterviewModel.candidate_id == cand_a.id
    ).first()

    if not existing_interview:
        q_list = generate_interview_questions(
            {"name": cand_a.name, "skills": cand_a.skills, "projects": cand_a.projects, "experience": cand_a.experience},
            job_dict,
            {"strong_matches_count": 5, "missing_count": 1, "alignment_items": match_analyses[0].alignment_items}
        )
        sample_interview = InterviewModel(
            candidate_id=cand_a.id,
            job_id=job.id,
            questions=q_list,
            answers=[
                {
                    "question_id": 1,
                    "candidate_answer": "In our training pipeline, we apply transforms and normalizations strictly inside the dataset loader with train-split parameters to prevent data leakage.",
                    "notes": "Good grasp of feature hygiene and data partitioning.",
                    "follow_up_generated": "How do you handle distribution drift when serving streaming features?",
                    "follow_up_answer": "We track KS-statistic drift and trigger retraining alarms."
                },
                {
                    "question_id": 4,
                    "candidate_answer": "For the YOLO project, we selected YOLOv8 due to its anchor-free head and reduced latency on edge devices. We benchmarked Faster R-CNN, but its 2-stage latency was too high for 30 FPS.",
                    "notes": "Excellent practical trade-off rationale between two-stage and single-stage detectors.",
                    "follow_up_generated": "What loss function weights did you use for bounding box regression vs classification?",
                    "follow_up_answer": "We tuned CIoU loss alongside BCE with focal loss weights for small object recall."
                }
            ],
            evaluation={},
            status="in_progress"
        )
        db.add(sample_interview)
        db.commit()

    # Seed default platform users (Administrator and Recruiter)
    admin_email = "admin@hireflow.ai"
    if not db.query(UserModel).filter(UserModel.email == admin_email).first():
        admin_user = UserModel(
            email=admin_email,
            hashed_password=hash_password("AdminPassword123!"),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)

    recruiter_email = "recruiter@hireflow.ai"
    if not db.query(UserModel).filter(UserModel.email == recruiter_email).first():
        recruiter_user = UserModel(
            email=recruiter_email,
            hashed_password=hash_password("RecruiterPassword123!"),
            full_name="Sarah Jenkins (Recruiter)",
            role="recruiter",
            is_active=True
        )
        db.add(recruiter_user)

    db.commit()

    return {
        "message": "Demo data successfully seeded!",
        "job_id": job.id,
        "job_title": job.title,
        "candidates_count": len(candidates),
        "candidates": [{"id": c.id, "name": c.name} for c in candidates]
    }
