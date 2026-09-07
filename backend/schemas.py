from pydantic import BaseModel, Field
from typing import Optional

# ==========================================
# USER & AUTHENTICATION SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "User"

class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ==========================================
# SKIN PROFILE SCHEMAS
# ==========================================
class SkinProfileCreate(BaseModel):
    skin_type: str
    primary_concern: str
    is_sensitive: bool = False

class SkinProfileResponse(BaseModel):
    id: int
    user_id: int
    skin_type: str
    primary_concern: str
    is_sensitive: bool

    class Config:
        from_attributes = True

# ==========================================
# DAILY TRACKER SCHEMAS
# ==========================================
class DailyTrackerCreate(BaseModel):
    date_logged: str 
    sleep_hours: float = Field(..., ge=0, le=24, description="Hours of sleep")
    water_glasses: int = Field(..., ge=0, description="Glasses of water drank")
    stress_level: int = Field(..., ge=1, le=10, description="Stress level from 1 to 10")
    
    sun_exposure_hours: float = Field(0.0, ge=0, le=24, description="Hours spent in direct sunlight")
    weather_condition: str = Field("Normal", description="Current weather")
    pollution_exposure: str = Field("Low", description="Level of pollution exposure")

class DailyTrackerResponse(BaseModel):
    id: int 
    user_id: int
    date_logged: str 
    sleep_hours: float
    water_glasses: int
    stress_level: int
    
    sun_exposure_hours: Optional[float] = 0.0
    weather_condition: Optional[str] = "Not recorded"
    pollution_exposure: Optional[str] = "Not recorded"

    class Config:
        from_attributes = True

# ==========================================
# ANALYTICS & ADHERENCE SCHEMAS
# ==========================================
class AdherenceResponse(BaseModel):
    user_id: int
    adherence_percentage: float
    streak_days: int
    hydration_score_avg: float
    sleep_score_avg: float
    status_message: str
    consistency_grade: Optional[str] = "Optimal"
    ai_recommendation: Optional[str] = "Maintain consistent hydration and sleep cycles."
    engine_type: Optional[str] = "Random Forest Adherence Regressor"

    class Config:
        from_attributes = True

class ProgressDeltaResponse(BaseModel):
    user_id: int
    current_score: float
    previous_score: float
    score_delta: float
    trend_direction: str
    projected_score_7d: float
    barrier_recovery_phase: Optional[str] = "Barrier Stabilization"
    velocity_rate: Optional[float] = 0.0
    engine_type: Optional[str] = "Time-Series Predictive ML Forecaster"

    class Config:
        from_attributes = True