import sqlite3
from datetime import datetime

# Database connection
conn = sqlite3.connect('vouchtrack.db')
cursor = conn.cursor()

print("🌱 Seeding data into VouchTrack...")

# 1. Create Dummy Students (10 members)
# Note: Password hash logic illama direct-ah "password123" nu dummy-ah podurom testing-kaga
students = [
    ('Akash M', 'akash@admin.com', 'admin_hash', 'admin'),
    ('Vijay', 'vijay@student.com', 'pwd_hash', 'student'),
    ('Suriya', 'suriya@student.com', 'pwd_hash', 'student'),
    ('Ajith', 'ajith@student.com', 'pwd_hash', 'student'),
    ('Vikram', 'vikram@student.com', 'pwd_hash', 'student'),
    ('Dhanush', 'dhanush@student.com', 'pwd_hash', 'student'),
    ('Simbu', 'simbu@student.com', 'pwd_hash', 'student'),
    ('Sivakarthikeyan', 'sk@student.com', 'pwd_hash', 'student'),
    ('Karthi', 'karthi@student.com', 'pwd_hash', 'student'),
    ('Jayam Ravi', 'ravi@student.com', 'pwd_hash', 'student')
]

cursor.executemany("INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", students)

# 2. Create Dummy Vouchers (15 vouchers)
vouchers = [
    (f"MS-AZ900-{i:03d}", "AZ-900 Microsoft Azure Fundamentals", 0) for i in range(1, 11)
] + [
    (f"MS-AI900-{i:03d}", "AI-900 Azure AI Fundamentals", 0) for i in range(11, 16)
]

cursor.executemany("INSERT OR IGNORE INTO vouchers (voucher_code, course_name, is_used) VALUES (?, ?, ?)", vouchers)

# 3. Create some Sample Assignments (Assigning 3 students)
# Ippo student IDs 2, 3, 4-ku vouchers assign panrom
assignments = [
    (2, 1, 1, 'pass', datetime.now()),  # Student 2, Voucher 1, Visible=True, Status=Pass
    (3, 2, 0, 'pending', datetime.now()), # Student 3, Voucher 2, Visible=False, Status=Pending
    (4, 3, 1, 'fail', datetime.now())    # Student 4, Voucher 3, Visible=True, Status=Fail
]

cursor.executemany("INSERT OR IGNORE INTO assignments (student_id, voucher_id, is_visible, exam_status, assigned_at) VALUES (?, ?, ?, ?, ?)", assignments)

conn.commit()
conn.close()

print("✅ Success! 10 Students, 15 Vouchers, and 3 Assignments added.")
print("🚀 Ippo '/vouchers/report/daily' check panni paarunga, data neat-ah varum!")