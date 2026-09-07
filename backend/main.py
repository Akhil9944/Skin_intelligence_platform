from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database import engine, Base, get_db
import models
import schemas
import security
import assessment  # Imported our new Milestone 2 engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence API")

# Allow your Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://192.168.1.7:3000",
        "http://172.29.80.1:3000",
        "http://192.168.201.243:3000"  # Added your current local network client origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Skin Intelligence API"}

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    hashed_pwd = security.get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    
    if not user or not security.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ==========================================
# SKIN PROFILE ENDPOINTS (SQL)
# ==========================================

@app.post("/profile", response_model=schemas.SkinProfileResponse)
def create_or_update_skin_profile(
    profile_data: schemas.SkinProfileCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    existing_profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    
    if existing_profile:
        existing_profile.skin_type = profile_data.skin_type
        existing_profile.primary_concern = profile_data.primary_concern
        existing_profile.is_sensitive = profile_data.is_sensitive
        db.commit()
        db.refresh(existing_profile)
        return existing_profile
    else:
        new_profile = models.SkinProfile(
            user_id=current_user.id,
            skin_type=profile_data.skin_type,
            primary_concern=profile_data.primary_concern,
            is_sensitive=profile_data.is_sensitive
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile

@app.get("/profile", response_model=schemas.SkinProfileResponse)
def get_skin_profile(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


# ==========================================
# DAILY TRACKER ENDPOINTS (SQL)
# ==========================================

@app.post("/tracker/daily", response_model=schemas.DailyTrackerResponse)
def log_daily_habits(
    tracker_data: schemas.DailyTrackerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    new_log = models.DailyLog(
        user_id=current_user.id,
        date_logged=tracker_data.date_logged,
        sleep_hours=tracker_data.sleep_hours,
        water_glasses=tracker_data.water_glasses,
        stress_level=tracker_data.stress_level,
        sun_exposure_hours=tracker_data.sun_exposure_hours,
        weather_condition=tracker_data.weather_condition,
        pollution_exposure=tracker_data.pollution_exposure
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log


@app.get("/tracker/history", response_model=List[schemas.DailyTrackerResponse])
def get_daily_habits_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .limit(100)\
             .all()
             
    return logs


# ==========================================
# MILESTONE 2: ASSESSMENT & ROUTINE ENDPOINTS
# ==========================================

@app.get("/assessment/score")
def get_skin_health_score(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Calculates the weighted Skin Health Score based on user profile and latest habits log."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest_log = db.query(models.DailyLog)\
                     .filter(models.DailyLog.user_id == current_user.id)\
                     .order_by(models.DailyLog.date_logged.desc())\
                     .first()
    
    score = assessment.calculate_skin_health_score(profile, latest_log)
    return {
        "user_id": current_user.id,
        "skin_health_score": score,
        "status": "Optimal" if score >= 80 else ("Moderate" if score >= 60 else "Needs Attention")
    }


@app.get("/routine/generate")
def get_personalized_routine(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Generates personalized morning, evening, and weekly routines tailored to the user profile."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Please create your Skin Profile first before generating a routine.")
        
    routine_plan = assessment.generate_personalized_routine(profile)
    return routine_plan


@app.get("/assessment/recommendations")
def get_dermatologist_recommendations_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Provides score-backed AI clinical recommendations for the Dermatologist page."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest_log = db.query(models.DailyLog)\
                     .filter(models.DailyLog.user_id == current_user.id)\
                     .order_by(models.DailyLog.date_logged.desc())\
                     .first()
                     
    return assessment.get_dermatologist_recommendations(profile, latest_log)