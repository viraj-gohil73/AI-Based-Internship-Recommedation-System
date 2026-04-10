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

## Realistic Internship Data (Sample)

Use realistic internship records with role-specific stacks and clear eligibility.

Required fields used in this project:
- `title` (internship role name)
- `about_work` (description of responsibilities)
- `who_can_apply` (eligibility criteria)
- `skill_req` (array of required skills)

Example role-wise records:

```json
[
  {
    "title": "Backend Developer (Python) Intern",
    "about_work": "Build and maintain backend APIs using Python (FastAPI/Django), optimize database queries, and support production debugging.",
    "who_can_apply": "B.E./B.Tech/BCA/MCA students with Python backend project experience and strong API fundamentals.",
    "skill_req": ["Python", "FastAPI", "Django", "PostgreSQL", "REST API"]
  },
  {
    "title": "Backend Developer (Node.js) Intern",
    "about_work": "Develop scalable Node.js APIs, implement authentication, and work with MongoDB-based service modules.",
    "who_can_apply": "Students with backend fundamentals in JavaScript/Node.js and hands-on API development experience.",
    "skill_req": ["Node.js", "Express", "MongoDB", "REST API", "JWT"]
  },
  {
    "title": "Frontend Developer Intern",
    "about_work": "Create responsive React components, integrate APIs, and improve dashboard UX performance.",
    "who_can_apply": "Students from CS/IT background with HTML/CSS/JS and React project work.",
    "skill_req": ["React", "JavaScript", "TypeScript", "HTML", "CSS"]
  }
]
```
