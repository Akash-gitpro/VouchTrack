from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .session import Base

# ================= ACCESS CONTROL TABLE =================
class PreApprovedStudent(Base):
    __tablename__ = "pre_approved_students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    register_number = Column(String(50), unique=True, index=True)

# ================= USER TABLE =================
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    register_number = Column(String(50), unique=True, index=True, nullable=True) 
    password_hash = Column(String(255))
    role = Column(String(20), default="student") # "admin" or "student"
    
    # Slot Relation
    slot_id = Column(Integer, ForeignKey("slots.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    assignments = relationship("Assignment", back_populates="student", cascade="all, delete-orphan")
    slot = relationship("Slot", back_populates="students")

# ================= SLOTS TABLE =================
class Slot(Base):
    __tablename__ = "slots"
    
    id = Column(Integer, primary_key=True, index=True)
    slot_name = Column(String(50)) 
    date = Column(String(50)) 
    time_range = Column(String(100)) 
    student_limit = Column(Integer) 
    booked_count = Column(Integer, default=0) 
    is_active = Column(Boolean, default=True) 

    students = relationship("User", back_populates="slot")

# ================= VOUCHERS TABLE =================
class Voucher(Base):
    __tablename__ = "vouchers"
    
    id = Column(Integer, primary_key=True, index=True)
    voucher_code = Column(String(50), unique=True)
    course_name = Column(String(100)) 
    is_used = Column(Boolean, default=False)
    
    assignment = relationship("Assignment", back_populates="voucher", uselist=False, cascade="all, delete-orphan")

# ================= ASSIGNMENTS TABLE =================
class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    voucher_id = Column(Integer, ForeignKey("vouchers.id", ondelete="CASCADE"))
    
    is_visible = Column(Boolean, default=False) 
    exam_status = Column(String(20), default="pending") 
    assigned_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="assignments")
    voucher = relationship("Voucher", back_populates="assignment")