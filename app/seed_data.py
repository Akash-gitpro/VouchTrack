import sys
import os
from datetime import datetime

# Path set panrom
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.db.models import User

def seed_data():
    db = SessionLocal()
    print("🚀 Preparing Database for Production Handover...")

    try:
        # 1. Setup Initial Admin ONLY
        # Inga unga real admin email-ah matum add panrom
        admin_email = "microsoftadmin7@karunya.edu.in"
        
        exists = db.query(User).filter(User.email == admin_email).first()
        
        if not exists:
            new_admin = User(
                name='System Admin', 
                email=admin_email, 
                password_hash='admin_login_required', # Real hash login apo create aagum
                role='admin'
            )
            db.add(new_admin)
            print(f"✅ Admin account ({admin_email}) configured.")
        else:
            print("ℹ️ Admin already exists. No changes made.")

        db.commit()
        print("✨ Database is now ready for Admin to upload real vouchers!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()