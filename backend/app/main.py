import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.database.models import JobModel, UserModel
from app.api.jobs import router as jobs_router
from app.api.candidates import router as candidates_router
from app.api.matching import router as matching_router
from app.api.interviews import router as interviews_router
from app.api.reports import router as reports_router
from app.api.search import router as search_router
from app.api.demo import router as demo_router, seed_demo_data
from app.api.auth import router as auth_router

# Ensure tables are created
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if database is populated, otherwise seed initial demo data
    db = SessionLocal()
    try:
        job_count = db.query(JobModel).count()
        user_count = db.query(UserModel).count()
        if job_count == 0 or user_count == 0:
            print("Database empty or unseeded. Auto-seeding initial Demo data...")
            seed_demo_data(db)
            print("Demo data seeded successfully.")
    except Exception as e:
        print(f"Error checking/seeding database: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Candidate Screening & Interview Intelligence Platform",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(candidates_router, prefix=settings.API_V1_STR)
app.include_router(matching_router, prefix=settings.API_V1_STR)
app.include_router(interviews_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)

# Serve uploaded files if needed
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/data/sample_resumes", StaticFiles(directory=settings.SAMPLE_DATA_DIR), name="samples")

@app.get("/api/health")
def health_check():
    from app.ai.llm_client import llm_client
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "llm_live": llm_client.is_live(),
        "provider": settings.DEFAULT_LLM_PROVIDER if llm_client.is_live() else "Deterministic Mock Engine (Active)"
    }
