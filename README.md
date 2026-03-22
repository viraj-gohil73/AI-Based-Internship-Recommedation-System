# InternVision

InternVision is a full-stack internship management and recommendation platform with role-based portals for Student, Recruiter, Company, and Admin.

This repository contains:
- `frontend/` - React + Vite client
- `backend/` - Node.js + Express API
- `ml-service/` - FastAPI ranking service scaffold for recommendation scoring

## Documentation
- Full project report (submission-ready): `PROJECT_DOCUMENTATION.md`
- Project context notes: `PROJECT_CONTEXT.md`

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. (Optional) ML Service
```bash
cd ml-service
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Default Local URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML Service: `http://localhost:8000`

## Notes
- Configure environment variables before production use.
- Default seeded admin credentials are documented in `PROJECT_DOCUMENTATION.md` and should be changed immediately.
