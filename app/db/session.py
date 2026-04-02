import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- DATABASE CONFIGURATION ---

# PostgreSQL URL Format (Placeholders vatchurukkaen)
# Namma RDS Endpoint kidaichathum 'YOUR_PASSWORD' and 'YOUR_RDS_ENDPOINT' replace pannuvom.
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/postgres"

# Engine create panrom. 
# Note: PostgreSQL-ku 'connect_args' thevaiyillai, so adhai remove pannittom.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()