import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "HireFlow AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # LLM Settings
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "gemini"  # "gemini" or "openai"
    
    # Database
    DATABASE_URL: str = "sqlite:///./hireflow.db"
    
    # Storage
    UPLOAD_DIR: str = "./uploads"
    SAMPLE_DATA_DIR: str = "./data/sample_resumes"
    
    # Demo Mode
    DEMO_MODE: bool = True
    
    # Auth Security
    SECRET_KEY: str = "hireflow_jwt_secret_key_hackathon_secure_2026_super_safe"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
