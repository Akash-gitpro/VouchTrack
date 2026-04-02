from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 1. Import pannanum
from .db import models
from .db.session import engine
from .api import vouchers, auth

# Database Tables-ah Create Pandrom
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="VouchTrack - Microsoft Lab Management")

# --- 2. CORS SETTINGS (Frontend connection-ku idhu dhaan hero) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://mcsoft.vercel.app"], # React run aagura port
    allow_credentials=True,
    allow_methods=["*"], # GET, POST, PATCH, DELETE ellathaiyum allow pannuvom
    allow_headers=["*"], # Authentication tokens-ah allow panna
)
# -----------------------------------------------------------

# Router-ah Include Pandrom
app.include_router(auth.router)
app.include_router(vouchers.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to VouchTrack API",
        "status": "Running",
        "admin_control": "Enabled"
    }

@app.get("/test-db")
def test_db():
    return {"message": "Database Tables Created Successfully!"}