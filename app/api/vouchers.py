from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
from datetime import datetime
from ..db import models, session
from typing import List

router = APIRouter(prefix="/vouchers", tags=["Vouchers"])

# ================= SLOTS LOGIC (SLOT CONTROL & BOOKING) =================

# --- ADMIN: CREATE A SLOT ---
@router.post("/create-slot")
def create_slot(data: dict, db: Session = Depends(session.get_db)):
    new_slot = models.Slot(
        slot_name=data.get('slot_name'),
        date=data.get('date'),
        time_range=data.get('time_range'),
        student_limit=data.get('student_limit'),
        booked_count=0,
        is_active=True
    )
    db.add(new_slot)
    db.commit()
    return {"message": f"Slot {new_slot.slot_name} on {new_slot.date} created successfully!"}

# --- GET SLOTS (Students-ku capacity ulla active slots mattum theriyum) ---
@router.get("/slots")
def get_all_slots(db: Session = Depends(session.get_db)):
    return db.query(models.Slot).filter(
        models.Slot.is_active == True,
        models.Slot.booked_count < models.Slot.student_limit
    ).all()

# --- ADMIN: GET ALL SLOTS (Management Table-kaga) ---
@router.get("/admin-slots")
def admin_get_slots(db: Session = Depends(session.get_db)):
    return db.query(models.Slot).all()

# --- ADMIN: CANCEL/DELETE SLOT (Full Slot Reset) ---
@router.delete("/cancel-slot/{slot_id}")
def cancel_slot(slot_id: int, db: Session = Depends(session.get_db)):
    slot = db.query(models.Slot).filter(models.Slot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    students = db.query(models.User).filter(models.User.slot_id == slot_id).all()
    for s in students:
        s.slot_id = None
        db.query(models.Assignment).filter(models.Assignment.student_id == s.id).delete()
    
    db.delete(slot)
    db.commit()
    return {"message": "Slot cancelled and students reset successfully."}

# --- STUDENT: BOOK A SLOT (ONLY URK/REGISTER NUMBER CHECK) ---
@router.post("/book-slot")
def book_slot(data: dict, db: Session = Depends(session.get_db)):
    email = data.get("email")
    slot_id = data.get("slot_id")
    reg_no = str(data.get("register_number")).strip().upper()
    full_name = str(data.get("name")).strip().upper()

    # 1. ELIGIBILITY CHECK (Only URK Check - Flexibility for Name changes)
    is_eligible = db.query(models.PreApprovedStudent).filter(
        models.PreApprovedStudent.register_number == reg_no
    ).first()

    if not is_eligible:
        raise HTTPException(
            status_code=403, 
            detail="Sorry, you haven't registered for the Microsoft exam!"
        )

    # 2. Normal Booking Logic
    user = db.query(models.User).filter(models.User.email == email).first()
    slot = db.query(models.Slot).filter(models.Slot.id == slot_id).first()

    if not user or not slot:
        raise HTTPException(status_code=404, detail="User or Slot not found")
    
    if user.slot_id:
        raise HTTPException(status_code=400, detail="You have already booked the slot")

    if slot.booked_count >= slot.student_limit:
        raise HTTPException(status_code=400, detail="THIS SLOT IS FULL RIGHT NOW!")

    user.register_number = reg_no
    user.name = full_name
    user.slot_id = slot.id
    slot.booked_count += 1
    db.commit()
    
    return {"message": f"Registration successful for {full_name}!"}

# --- ADMIN: REMOVE STUDENT / EMERGENCY RESET ---
@router.delete("/remove-student/{student_id}")
def remove_student_assignment(student_id: int, db: Session = Depends(session.get_db)):
    user = db.query(models.User).filter(models.User.id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    assignment = db.query(models.Assignment).filter(models.Assignment.student_id == student_id).first()
    if assignment:
        voucher = db.query(models.Voucher).filter(models.Voucher.id == assignment.voucher_id).first()
        if voucher:
            voucher.is_used = False 
        db.delete(assignment)

    if user.slot:
        user.slot.booked_count -= 1
    
    user.slot_id = None
    db.commit()
    return {"message": "Student reset successfully."}

# ================= VOUCHERS LOGIC =================

@router.get("/available")
def get_available_vouchers(db: Session = Depends(session.get_db)):
    vouchers = db.query(models.Voucher).filter(models.Voucher.is_used == False).all()
    return vouchers

@router.get("/stats")
def get_voucher_stats(db: Session = Depends(session.get_db)):
    total = db.query(models.Voucher).count()
    assigned = db.query(models.Voucher).filter(models.Voucher.is_used == True).count()
    return {
        "total_vouchers": total,
        "assigned_vouchers": assigned,
        "available_vouchers": total - assigned
    }

@router.get("/students")
def get_students(db: Session = Depends(session.get_db)):
    results = db.query(
        models.User.id,
        models.User.name,
        models.User.register_number,
        models.Slot.slot_name.label("booked_slot_name")
    ).join(models.Slot, models.User.slot_id == models.Slot.id)\
     .filter(models.User.role == "student")\
     .filter(~models.User.assignments.any())\
     .all()
    
    return [
        {
            "id": row.id, 
            "name": row.name, 
            "register_number": row.register_number, 
            "booked_slot_name": row.booked_slot_name
        } for row in results
    ]

@router.post("/assign")
def assign_voucher(student_id: int, voucher_id: int, db: Session = Depends(session.get_db)):
    student = db.query(models.User).filter(models.User.id == student_id).first()
    voucher = db.query(models.Voucher).filter(models.Voucher.id == voucher_id).first()
    
    if not student or not voucher:
        raise HTTPException(status_code=404, detail="Data not found")
    
    if voucher.is_used:
        raise HTTPException(status_code=400, detail="Voucher already used")

    new_assignment = models.Assignment(
        student_id=student_id,
        voucher_id=voucher_id,
        is_visible=False,
        exam_status="pending"
    )
    
    voucher.is_used = True 
    db.add(new_assignment)
    db.commit()
    return {"message": f"Voucher assigned to {student.name}"}

@router.post("/bulk-upload")
async def bulk_upload_vouchers(file: UploadFile = File(...), db: Session = Depends(session.get_db)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="File format not supported!")

    v_count = 0
    s_count = 0
    for _, row in df.iterrows():
        v_code = str(row['voucher_code']).strip()
        s_name = str(row['name']).strip().upper()
        s_reg = str(row['register_number']).strip().upper()

        existing_v = db.query(models.Voucher).filter(models.Voucher.voucher_code == v_code).first()
        if not existing_v:
            new_v = models.Voucher(voucher_code=v_code, course_name=str(row['course_name']).strip(), is_used=False)
            db.add(new_v)
            v_count += 1

        existing_s = db.query(models.PreApprovedStudent).filter(models.PreApprovedStudent.register_number == s_reg).first()
        if not existing_s:
            new_s = models.PreApprovedStudent(name=s_name, register_number=s_reg)
            db.add(new_s)
            s_count += 1
            
    db.commit()
    return {"message": f"Successfully uploaded {v_count} vouchers and approved {s_count} students!"}

@router.get("/all-assignments")
def get_all_assignments(db: Session = Depends(session.get_db)):
    results = db.query(
        models.Assignment.id,
        models.User.register_number.label("std_reg_no"),
        models.User.name.label("student_name"),
        models.Voucher.course_name,
        models.Voucher.voucher_code,
        models.Assignment.is_visible,
        models.Assignment.exam_status,
        models.User.id.label("student_db_id"),
        models.Slot.date.label("exam_date")
    ).join(models.User, models.User.id == models.Assignment.student_id)\
     .join(models.Voucher, models.Voucher.id == models.Assignment.voucher_id)\
     .join(models.Slot, models.Slot.id == models.User.slot_id).all()
    
    return [row._asdict() for row in results]

@router.patch("/toggle-visibility/{assignment_id}")
def toggle_voucher_visibility(assignment_id: int, visible: bool, db: Session = Depends(session.get_db)):
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if assignment:
        assignment.is_visible = visible
        db.commit()
    return {"message": "Updated"}

@router.patch("/update-result/{assignment_id}")
def update_exam_result(assignment_id: int, result: str, db: Session = Depends(session.get_db)):
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if assignment:
        assignment.exam_status = result.lower()
        assignment.is_visible = False
        db.commit()
    return {"message": "Result updated"}

@router.get("/my-vouchers")
def get_my_vouchers(email: str, db: Session = Depends(session.get_db)):
    results = db.query(
        models.Voucher.course_name,
        models.Voucher.voucher_code,
        models.Assignment.exam_status,
        models.Assignment.is_visible,
        models.User.name.label("student_name"),
        models.User.register_number.label("reg_no"),
        models.Slot.slot_name.label("booked_slot_name")
    ).join(models.User, models.User.id == models.Assignment.student_id)\
     .join(models.Voucher, models.Voucher.id == models.Assignment.voucher_id)\
     .join(models.Slot, models.Slot.id == models.User.slot_id, isouter=True)\
     .filter(models.User.email == email).all()
    
    if not results:
        user_data = db.query(models.User.name, models.User.register_number, models.Slot.slot_name).join(models.Slot, isouter=True).filter(models.User.email == email).first()
        if user_data:
            return [{"booked_slot_name": user_data[2], "student_name": user_data[0], "reg_no": user_data[1], "voucher_code": None, "is_visible": False}]

    return [row._asdict() for row in results]

@router.get("/report/daily")
def get_daily_report(db: Session = Depends(session.get_db)):
    query_result = db.query(
        models.User.register_number.label("Register_No"),
        models.User.name.label("Student_Name"),
        models.Voucher.course_name.label("Course"),
        models.Voucher.voucher_code.label("Voucher_Code"),
        models.Assignment.exam_status.label("Status"),
        models.Slot.date.label("Exam_Date")
    ).join(models.Assignment, models.User.id == models.Assignment.student_id)\
     .join(models.Voucher, models.Voucher.id == models.Assignment.voucher_id)\
     .join(models.Slot, models.Slot.id == models.User.slot_id).all()

    if not query_result:
        return {"message": "No data"}

    df = pd.DataFrame([row._asdict() for row in query_result])
    df.insert(0, 'S_No', range(1, 1 + len(df)))
    
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    return StreamingResponse(iter([stream.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=VouchTrack_Report.csv"})