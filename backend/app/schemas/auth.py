from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: str = Field(..., min_length=2, description="User full name")
    role: Optional[str] = Field("recruiter", description="User role: 'recruiter' or 'admin'")

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if "@" not in cleaned or "." not in cleaned:
            raise ValueError("Please provide a valid email address.")
        return cleaned

    @field_validator("role")
    @classmethod
    def clean_role(cls, v: Optional[str]) -> str:
        if not v or v.lower().strip() not in ["admin", "recruiter"]:
            return "recruiter"
        return v.lower().strip()

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Password")

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
