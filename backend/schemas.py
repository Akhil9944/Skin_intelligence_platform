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
    
    # Environmental Exposure Fields
    sun_exposure_hours: float = Field(0.0, ge=0, le=24, description="Hours spent in direct sunlight")
    weather_condition: str = Field("Normal", description="Current weather (e.g., Normal, Humid, Dry, Cold)")
    pollution_exposure: str = Field("Low", description="Level of dust/pollution exposure (Low, Moderate, High)")

class DailyTrackerResponse(BaseModel):
    id: int  # Updated from str to int for SQL primary keys
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