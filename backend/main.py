from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database import engine, Base, get_db
import models
import schemas
import security
import assessment
import ingredient_engine
import product_engine
import progress_engine
import analytics_engine
from pydantic import BaseModel, Field

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://192.168.201.40:3000",
        "http://192.168.1.7:3000",
        "http://172.29.80.1:3000",
        "http://192.168.201.243:3000",
        "http://10.197.173.197:3000"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$",
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
# SKIN PROFILE ENDPOINTS
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
# DAILY TRACKER ENDPOINTS
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
# ASSESSMENT & ROUTINE ENDPOINTS
# ==========================================

@app.get("/assessment/score")
def get_skin_health_score(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
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
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Please create your Skin Profile first before generating a routine.")
        
    latest_log = db.query(models.DailyLog)\
                     .filter(models.DailyLog.user_id == current_user.id)\
                     .order_by(models.DailyLog.date_logged.desc())\
                     .first()

    return assessment.generate_personalized_routine(profile, latest_log)


@app.get("/assessment/recommendations")
def get_dermatologist_recommendations_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest_log = db.query(models.DailyLog)\
                     .filter(models.DailyLog.user_id == current_user.id)\
                     .order_by(models.DailyLog.date_logged.desc())\
                     .first()
                     
    return assessment.get_dermatologist_recommendations(profile, latest_log)


# ==========================================
# ANALYTICS & ADHERENCE ENDPOINTS
# ==========================================

@app.get("/analytics/adherence", response_model=schemas.AdherenceResponse)
def get_user_adherence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .all()
             
    metrics = assessment.calculate_routine_adherence(logs)
    return {
        "user_id": current_user.id,
        "adherence_percentage": metrics["adherence_percentage"],
        "streak_days": metrics["streak_days"],
        "hydration_score_avg": metrics["hydration_score_avg"],
        "sleep_score_avg": metrics["sleep_score_avg"],
        "status_message": metrics["status_message"],
        "consistency_grade": metrics["consistency_grade"],
        "ai_recommendation": metrics["ai_recommendation"],
        "engine_type": metrics["engine_type"]
    }


@app.get("/analytics/progress", response_model=schemas.ProgressDeltaResponse)
def get_skin_progress_delta(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .all()
             
    progress = assessment.calculate_progress_delta(profile, logs)
    return {
        "user_id": current_user.id,
        "current_score": progress["current_score"],
        "previous_score": progress["previous_score"],
        "score_delta": progress["score_delta"],
        "trend_direction": progress["trend_direction"],
        "projected_score_7d": progress["projected_score_7d"],
        "barrier_recovery_phase": progress["barrier_recovery_phase"],
        "velocity_rate": progress["velocity_rate"],
        "engine_type": progress["engine_type"]
    }


# ==========================================
# INGREDIENT INTELLIGENCE ENDPOINTS
# ==========================================

class IngredientAnalysisRequest(BaseModel):
    ingredients_text: str = Field(..., min_length=1, description="Ingredient list or cosmetic label text")
    product_name: str = ""

@app.post("/ingredients/analyze")
def analyze_ingredients_endpoint(
    payload: IngredientAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    results = ingredient_engine.analyze_ingredients_formula(payload.ingredients_text, profile)
    return {
        "product_name": payload.product_name or "Custom Product Formula",
        **results
    }


# ==========================================
# PRODUCT RECOMMENDATION ENDPOINTS (AI & ML)
# ==========================================

@app.get("/products/recommendations")
def get_recommended_products(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    
    skin_type = profile.skin_type if profile else "Normal"
    primary_concern = profile.primary_concern if profile else "General Care"
    is_sensitive = profile.is_sensitive if profile else False

    results = product_engine.get_product_recommendations(
        skin_type=skin_type,
        primary_concern=primary_concern,
        is_sensitive=is_sensitive,
        category_filter=category
    )
    return results


# ==========================================
# PROGRESS TRACKING & HABIT ANALYTICS (AI & ML)
# ==========================================

@app.get("/analytics/detailed-progress")
def get_user_detailed_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .all()

    progress_data = progress_engine.get_detailed_progress(profile, logs)
    return progress_data


# ==========================================
# SKINCARE ANALYTICS & SIMULATOR ENDPOINTS (AI & ML)
# ==========================================

class SimulationRequest(BaseModel):
    sleep_hours: float = Field(..., ge=0, le=24, description="Sleep hours between 0 and 24")
    water_glasses: int = Field(..., ge=0, le=50, description="Glasses of water between 0 and 50")
    stress_level: int = Field(..., ge=1, le=10, description="Stress level between 1 and 10")
    sun_exposure_hours: float = Field(1.0, ge=0, le=24, description="Sun exposure between 0 and 24")

@app.get("/analytics/skincare-insights")
def get_skincare_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .all()

    analytics_data = analytics_engine.get_skincare_analytics_payload(profile, logs)
    return analytics_data

@app.post("/analytics/simulate")
def simulate_skin_score_endpoint(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    results = analytics_engine.simulate_skin_score(
        sleep_hours=payload.sleep_hours,
        water_glasses=payload.water_glasses,
        stress_level=payload.stress_level,
        sun_exposure_hours=payload.sun_exposure_hours,
        skin_profile=profile
    )
    return results

@app.get("/analytics/executive-summary")
def get_executive_summary_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    summary_data = analytics_engine.get_executive_dashboard_payload(db)
    return summary_data


@app.get("/analytics/clinical-report")
def get_clinical_report_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    logs = db.query(models.DailyLog)\
             .filter(models.DailyLog.user_id == current_user.id)\
             .order_by(models.DailyLog.date_logged.desc())\
             .all()

    report_data = analytics_engine.get_clinical_report_payload(profile, logs, current_user)
    return report_data



