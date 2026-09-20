from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database.session import get_db
from app.database.models import UserModel
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Dependency to authenticate request via Bearer token.
    Raises HTTP 401 if missing, invalid, or expired.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Format must be 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = parts[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = db.query(UserModel).filter(UserModel.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer active or not found.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user

def require_admin(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Dependency verifying the caller has the 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Administrator role required."
        )
    return current_user

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user account (Recruiter or Admin).
    Automatically issues an access token so the user is signed in immediately with zero friction.
    """
    normalized_email = req.email.strip().lower()
    existing_user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )
    
    new_user = UserModel(
        email=normalized_email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name.strip(),
        role=req.role.strip().lower(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "name": new_user.full_name
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user and returns an access token and user profile.
    """
    normalized_email = req.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email == normalized_email).first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials and try again."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact an administrator."
        )

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: UserModel = Depends(get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return UserResponse.model_validate(current_user)

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: UserModel = Depends(require_admin)
):
    """Admin-only endpoint listing all registered platform users."""
    users = db.query(UserModel).order_by(UserModel.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]
