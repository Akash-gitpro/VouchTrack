# VouchTrack

VouchTrack is an automated portal to manage exam vouchers, student assignments, and slot bookings.

## Features
- **Google OAuth Login:** Secure authentication for students and admins.
- **Bulk Upload:** Admin can upload 300+ vouchers via Excel/CSV.
- **Auto-Mapping:** Vouchers are automatically assigned to students based on register numbers.
- **Responsive UI:** Built with React for seamless mobile and desktop experience.

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL (AWS RDS)
- **Frontend:** React.js, Tailwind CSS
- **Deployment:** AWS EC2 (Backend), AWS Amplify (Frontend)

## Structure
- `/app`: Backend FastAPI code and Database models.
- `/frontend`: React frontend source code.