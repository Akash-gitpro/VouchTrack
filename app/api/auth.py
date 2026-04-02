from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import models, session
from ..core.security import get_password_hash, create_access_token, verify_password
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas.student import UserCreate 
from typing import List

# --- GOOGLE AUTH IMPORTS ---
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(tags=["Authentication"])

GOOGLE_CLIENT_ID = "31057810821-8fandlc9c7ijtt5ero1mhpgs7lmor1e8.apps.googleusercontent.com"

# --- ADMIN EMAIL LIST ---
# Inga neenga kudutha dummy mail-ah permanent-ah add pannittaen
ADMIN_EMAILS = ["mcsoftadmin7@gmail.com"]

# --- GOOGLE LOGIN ---
@router.post("/google-login")
def google_login(data: dict, db: Session = Depends(session.get_db)):
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is missing")

    try:
        # 1. Google Token Verification
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', email.split("@")[0])

        user = db.query(models.User).filter(models.User.email == email).first()

        if not user:
            # 2. Updated Role Logic:
            # Karunya professor mail or unga dummy mail rendume Admin-ah maarum
            if email in ADMIN_EMAILS or email.endswith("@karunya.edu"):
                role = "admin"
            else:
                role = "student"
            
            new_user = models.User(
                name=name,
                email=email,
                password_hash="google_sso_no_password", 
                role=role
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user

        # 3. Register Number Check (Only for students)
        needs_registration = True if user.role == "student" and not user.register_number else False

        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": user.role,
            "email": user.email,
            "needs_registration": needs_registration
        }

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google Token")

# --- UPDATE REGISTER NUMBER ---
@router.patch("/update-register-number")
def update_register_number(data: dict, db: Session = Depends(session.get_db)):
    email = data.get("email")
    reg_no = data.get("register_number")

    if not email or not reg_no:
        raise HTTPException(status_code=400, detail="Email and Register Number are required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_reg = db.query(models.User).filter(models.User.register_number == reg_no).first()
    if existing_reg:
        raise HTTPException(status_code=400, detail="This Register Number is already registered!")

    user.register_number = reg_no.upper()
    db.commit()
    return {"message": "Register number updated successfully"}

# --- GET ALL STUDENTS ---
@router.get("/students")
def get_all_students(db: Session = Depends(session.get_db)):
    # Admin-ku ippo students list register number-oda theriyum
    students = db.query(models.User).filter(models.User.role == "student").all()
    return students