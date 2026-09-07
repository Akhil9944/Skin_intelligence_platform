from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Replace mysecretpassword123 with your actual Supabase password
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:harsha123@localhost:5432/skincare_db"# Create the PostgreSQL engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create the session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the Base class for our models
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()