import sys
import os

# Current directory-ah Python path-la add panrom
sys.path.append(os.getcwd())

from app.db.session import engine, Base
# Models-ah import panna dhaan SQLAlchemy-ku tables pathi theriyum
from app.db.models import User, Voucher, Assignment

print("Connecting to AWS RDS...")

try:
    # 1. Resetting Database: Indha line dummy data-va moththama thookidum
    # print("Resetting Database... Removing all dummy data.")
    # Base.metadata.drop_all(bind=engine)
    
    # 2. Re-creating Tables: Fresh-ana empty tables create aagum
    Base.metadata.create_all(bind=engine)
    
    print("✅ Success: Database is now EMPTY and Ready for Real Vouchers!")

except Exception as e:
    print(f"❌ Error during database reset: {e}")