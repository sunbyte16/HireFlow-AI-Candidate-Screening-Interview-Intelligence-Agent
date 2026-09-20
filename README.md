# HireFlow AI 🚀
### AI-Powered Candidate Screening & Interview Intelligence Platform

> **Evidence-based talent assessment:** Connect candidate skills directly to verifiable resume citations, generate personalized technical interviews, adapt follow-ups in real time, and produce structured evaluation reports with human-in-the-loop governance.

---

## 1. Problem & Solution

### The Problem
* **Black-Box Resume Screening:** Traditional ATS platforms assign arbitrary percentage scores without explaining *why* a candidate was matched or rejected.
* **Generic Interview Questionnaires:** Interviewers waste time asking boilerplate questions rather than probing the candidate's actual projects, architectural decisions, and specific resume claims.
* **Superficial Candidate Claims:** Unverified keyword stuffing often goes undetected until late-stage interview rounds.
* **Autonomous Decision Bias:** Many AI tools inappropriately attempt to make automated "hire/no-hire" decisions without human accountability.

### The Solution: HireFlow AI
* **Evidence-Based Matching:** Every single skill is tagged as `MATCHED`, `PARTIAL`, `NOT FOUND`, or `UNCLEAR` with exact resume citations and section breadcrumbs (e.g. `Resume → Projects → Smart Prediction System`).
* **Personalized 3-Pane Interview Workspace:** Dynamically generates 10 tailored questions (Technical, Project-Specific, Behavioral, Skill Validation, Deep-Dive) grounded in the candidate's actual project technologies.
* **Real-Time Adaptive Follow-Ups:** Detects vague or high-level candidate answers during the interview and generates immediate targeted probes.
* **Verifiable Audit Trail:** Complete traceability showing why each insight was generated.
* **Strict Human-in-the-Loop Governance:** AI serves strictly as an evidentiary screening copilot; human recruiters make all hiring decisions.

---

## 2. Core MVP Workflow

```text
Recruiter Command Center
          ↓
Create / Paste Job Description (JD Analyzer)
          ↓
Upload Candidate Resumes (PDF, DOCX, TXT)
          ↓
AI Resume Entity Parser (Zero Hallucinations)
          ↓
Candidate ↔ JD Requirement Mapping
          ↓
Evidence-Based Match Analysis (Traceable Quotes)
          ↓
Personalized 3-Pane Interview Workspace
          ↓
Capture Candidate Answers & Adaptive Follow-Ups
          ↓
Post-Interview Evaluation & Coverage Matrix
          ↓
Final Candidate Report & Markdown/PDF Export
```

---

## 3. Key MVP Features

| Feature | Description |
| :--- | :--- |
| **Recruiter Dashboard** | KPI metrics, active job banner, candidate cards with quick skill verifications, and match scores. |
| **Job Description Analyzer** | Extracts strict required skills, preferred skills, experience limits, education, and domain tags with JSON preview. |
| **Multi-Format Resume Parser** | Ingests `.pdf`, `.docx`, and `.txt` files; extracts personal info, grouped skills, project architectures, and work history. |
| **Evidence-Based Matching** | Requirement-by-requirement verification with exact quote snippets, confidence levels, and context gaps. |
| **Candidate Profile** | Deep-dive profile with skills grouped by domain, interactive project cards, and experience timelines. |
| **3-Pane Interview Workspace** | **Left:** Candidate snapshot & gaps • **Center:** Active question, answer capture & adaptive follow-up • **Right:** AI interview insights & expected evidence. |
| **Adaptive Follow-Up Engine** | Analyzes candidate answers on the fly; generates targeted technical follow-ups when details are omitted. |
| **Structured Interview Evaluation**| Evaluates technical understanding, project depth, and requirement coverage (`Validated`, `Needs validation`, `Not demonstrated`). |
| **Natural Language Search** | Recruiter search engine (e.g. *"Show candidates with computer vision and YOLO projects"*) with relevance scoring and evidence quotes. |
| **Traceable Audit Trail** | Explains the origin of every AI observation across resume, projects, and interview records. |
| **Dual-Mode AI Resilience** | Seamlessly runs with live Google Gemini / OpenAI models or high-fidelity deterministic offline engine for 100% demo stability. |

---

## 4. Technical Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + TypeScript UI                    │
│   Tailwind CSS • Lucide Icons • Recharts • Dark SaaS Theme  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend (Python)                 │
│         SQLAlchemy ORM • SQLite / PostgreSQL Engine         │
└───────┬─────────────────────────────────────────────┬───────┘
        │                                             │
┌───────▼────────────────────────┐    ┌───────────────▼───────┐
│     AI Intelligence Layer      │    │    Data & Storage     │
│ • Resume Parser (pypdf, docx)  │    │ • SQLite Database     │
│ • JD Extractor                 │    │ • /uploads directory  │
│ • Evidence-Based Matcher       │    │ • Sample Resumes      │
│ • Personalized Interview Gen   │    └───────────────────────┘
│ • Adaptive Follow-Up Engine    │
│ • Interview Evaluator          │
└───────┬────────────────────────┘
        │
┌───────▼─────────────────────────────────────────────────────┐
│                     AI Provider Gateway                     │
│  [Google Gemini 2.5]  or  [OpenAI GPT-4o]  or  [Deterministic Engine] │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts
* **Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy
* **Document Parsing:** `pypdf`, `python-docx`
* **AI Providers:** Google GenAI SDK (`google-genai`), OpenAI SDK (`openai`), deterministic rule-based fallback
* **Testing:** Pytest, HTTPX, FastAPI TestClient

---

## 6. Getting Started & Running Locally

### Prerequisites
* **Python:** 3.10 or higher
* **Node.js:** v18 or higher (v20+ recommended)
* **npm:** v9 or higher

---

### Method A — Windows 1-Click Launch (Recommended)

Simply double-click the root batch script:
```cmd
start_all.bat
```
This automatically starts both the FastAPI backend (port 8000) and the Vite frontend (port 5173) in separate command windows.

---

### Method B — Manual Startup

#### 1. Start Backend
```bash
cd backend
python -m venv .venv

# Activate venv:
# Windows (cmd):
.venv\Scripts\activate.bat
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt reportlab

# Start FastAPI server:
python -m uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000`. Test endpoint: `http://127.0.0.1:8000/api/health`

#### 2. Start Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

### Method C — Docker Compose
```bash
docker-compose up --build
```

---

## 7. Hackathon 3–5 Minute Live Demo Flow

Follow this exact flow during your presentation for maximum impact:

1. **Start on Landing Page (`/`):**
   * Highlight the core proposition: *"Evidence-Based Candidate Screening & Interview Intelligence"*.
   * Click **"View Hackathon Demo (ML Role)"** to enter the recruiter command center.

2. **Dashboard Overview:**
   * Showcase active role: **Machine Learning Engineer**.
   * Show 3 pre-loaded candidates:
     * **Rahul Sharma** (ML & PyTorch Specialist) → **~82% Match**
     * **Priya Patel** (Data Science & NLP) → **~74% Match**
     * **Arjun Mehta** (Computer Vision & Embedded) → **~68% Match**

3. **Job Description Analyzer:**
   * Navigate to **Job Descriptions**.
   * Click **"Analyze JD with AI"** or toggle between Visual UI and JSON Schema to demonstrate structured entity extraction.

4. **Candidate Pool & Resume Upload:**
   * Navigate to **Candidate Pool**.
   * Drag-and-drop a sample resume from `data/sample_resumes/rahul_sharma_resume.pdf`.
   * Show instant extraction of skills, education, and project cards.

5. **Evidence-Based Matching:**
   * Click on **Rahul Sharma** to open Candidate Profile & Match Analysis.
   * Point out the **AI Match Indicator (82%)** and immediately emphasize the **Human Review Required** badge.
   * Review the **Requirement Alignment Matrix**:
     * `Python` → `MATCHED` with project snippet citation.
     * `PyTorch` → `MATCHED` with edge object detection quote.
     * `NLP` → `PARTIAL` with note: *"Coursework cited; lack of enterprise production exposure."*
     * `Docker` → `NOT FOUND` with note: *"No supporting evidence found in profile."*

6. **3-Pane AI Interview Workspace:**
   * Click **"Generate Personalized Interview"**.
   * Highlight that questions are customized:
     * Note Question 4 directly referencing candidate's **"Real-Time Object Detection using YOLO"** project.
     * Note Questions 8 and 9 explicitly probing candidate's identified skill gaps (`NLP` and `Docker`).

7. **Adaptive Follow-Up in Action:**
   * In Question 1, enter a brief answer: *"I used PyTorch for model training."*
   * Click **"Save Answer & Check Follow-up"**.
   * Observe the live amber banner: AI detects implementation details are missing and formulates a targeted probe:
     > *"What specific loss function, learning rate scheduler, and optimizer did you choose for this setup?"*

8. **Structured Final Report & Audit Trail:**
   * Click **"Complete & Generate Report"**.
   * Review Technical Understanding, Project Knowledge, and the **Requirement Coverage Matrix**.
   * Switch to the **Traceable Audit Trail** tab to show judges exact proof behind every AI conclusion.
   * Click **"Print Report"** or **"Export Markdown"**.

9. **Natural Language Candidate Search:**
   * Navigate to **AI Search**.
   * Query: *"Find candidates whose projects involve YOLO"*.
   * See Rahul Sharma returned with relevance ranking and highlighted evidence quotes.

---

## 8. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & AI provider status |
| `/api/demo/seed` | `POST` | Seeds demo ML job, 3 candidates & matches |
| `/api/jobs` | `GET`, `POST` | List and create jobs |
| `/api/jobs/analyze` | `POST` | Parses raw JD into structured JSON |
| `/api/candidates` | `GET` | Lists all candidates |
| `/api/candidates/upload` | `POST` | Multi-file resume upload (`.pdf`, `.docx`, `.txt`) |
| `/api/matching/analyze` | `POST` | Generates evidence-based matching report |
| `/api/matching/job/{id}`| `GET` | Fetches match analyses for all candidates against a job |
| `/api/interviews/generate` | `POST` | Generates personalized 10-question interview |
| `/api/interviews/{id}/answer` | `POST` | Saves candidate answer & interviewer notes |
| `/api/interviews/{id}/follow-up` | `POST` | Generates adaptive real-time follow-up |
| `/api/interviews/{id}/evaluate` | `POST` | Produces structured post-interview evaluation |
| `/api/reports/{candidate_id}/{job_id}` | `GET` | Compiles candidate evaluation & audit trail |
| `/api/search` | `POST` | Natural language candidate query search |

---

## 9. Responsible AI & Safety Standards

* **No Autonomous Hiring Decisions:** HireFlow AI explicitly refuses to generate automated "Hire" or "Reject" determinations. All reports state *"Human Review Required"*.
* **Evidence-Grounded Only:** Never fabricates or infers skills without tangible resume, project, or interview citations.
* **Strict Anti-Bias Safeguards:** Candidate evaluation models exclude race, religion, gender, health, age, or sensitive personal attributes from scoring formulas.

---

## 10. Team & Hackathon Information

* **Project Name:** HireFlow AI
* **MVP Version:** 1.0.0
* **Event:** Hackathon MVP Presentation
* **License:** MIT
