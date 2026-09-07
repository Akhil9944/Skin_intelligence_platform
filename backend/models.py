from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="User")
    
    # This links the User to their SkinProfile
    skin_profile = relationship("SkinProfile", back_populates="owner", uselist=False)
    
    # NEW: This links the User to all their daily logs
    daily_logs = relationship("DailyLog", back_populates="owner")


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    skin_type = Column(String, index=True) 
    primary_concern = Column(String)       
    is_sensitive = Column(Boolean, default=False)
    
    # This links the SkinProfile back to the User
    owner = relationship("User", back_populates="skin_profile")


# ==========================================
# NEW: The Daily Tracker Table
# ==========================================
class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True) 
    
    # Core Tracker Data
    date_logged = Column(String, index=True) # Storing as YYYY-MM-DD
    sleep_hours = Column(Float)
    water_glasses = Column(Integer)
    stress_level = Column(Integer)
    
    # Environmental Data
    sun_exposure_hours = Column(Float)
    weather_condition = Column(String)
    pollution_exposure = Column(String)
    
    # This links the DailyLog back to the User
    owner = relationship("User", back_populates="daily_logs")