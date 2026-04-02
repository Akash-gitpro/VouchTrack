from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- DATABASE CONFIGURATION ---

# OLD SQLITE (Idhai ippo enable pannirukkom - Local testing-kaga)
SQLALCHEMY_DATABASE_URL = "sqlite:///./vouchtrack.db"

# NEW POSTGRESQL (Idhai temporary-ah comment pannittom - AWS setup appo use pannuvom)
# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/vouchtrack_db"

# Engine create panrom. 
# Note: SQLite use pannumbodhu mattum 'connect_args' venum.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()