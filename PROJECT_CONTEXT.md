# PROJECT CONTEXT

This repository is a fullstack internship platform with three role-based experiences: Student, Recruiter/Company, and Admin.

## Stack
- Frontend: React 19 + Vite + TailwindCSS (frontend/)
- Backend: Node.js + Express (ESM) + MongoDB/Mongoose (backend/)
- Auth: JWT, OTP, Google OAuth (and some LinkedIn wiring)
- File and third-party integrations seen in code: Uploadcare, Supabase (resume/media utility), Nodemailer

## Repository Layout
- frontend/: Vite React app, route-heavy SPA with role-specific dashboards
- backend/: Express API, Mongoose models, controllers, middlewares, route modules
- README.md: minimal historical note only (not a full setup guide)

## Runtime Entry Points
- Backend entry: backend/server.js
- Frontend entry: frontend/src/main.jsx
- Frontend routes: frontend/src/App.jsx

## Local Run Commands
From backend/:
- npm install
- npm start (runs nodemon server.js)

From frontend/:
- npm install
- npm run dev

Default local ports in code:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Backend Overview
Main API route mounts in backend/server.js:
- /api/auth
- /api/company
- /api/admin
- /api/recruiter
- /api/internships
- /api/student
- /api/notifications

Important backend folders:
- controllers/: request handlers and business logic
- routes/: API route definitions
- models/: Mongoose models
- middlewares/: auth and feature gating
- services/: subscription, plan, and notification service helpers

Boot behavior:
- Connects MongoDB via MONGO_URI
- Seeds admin and subscription system at startup (seedAdmin, seedSubscriptionSystem)

## Frontend Overview
- Single-page app with react-router-dom
- Role flows present for:
  - Student (/student/...)
  - Recruiter (/recruiter/...)
  - Company (/company/dashboard/...)
  - Admin (/admin/...)
- Route guards in frontend/src/guards/ (notably admin and student-profile gating)
- Shared state in frontend/src/context/

## Environment Variables (Observed in Code)
Backend env keys used:
- PORT
- MONGO_URI
- JWT_SECRET
- SESSION_SECRET
- RESET_PASSWORD_SECRET
- FRONTEND_URL
- BACKEND_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- LINKEDIN_CLIENT_ID
- LINKEDIN_CLIENT_SECRET
- EMAIL_USER
- EMAIL_PASS
- UPLOADCARE_PUBLIC_KEY
- UPLOADCARE_SECRET_KEY
- STUDENT_MONTHLY_APPLICATION_LIMIT

Frontend env keys used:
- VITE_API_BASE_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_RESUME_BUCKET
- VITE_UPLOADCARE_PUBLIC_KEY

## Current Conventions and Caveats
- Many frontend API calls are hardcoded to http://localhost:5000 rather than using a centralized API client.
- Backend currently allows CORS from http://localhost:5173 with credentials.
- backend/config/db.js exists but server.js currently connects directly with Mongoose.
- The repo includes checked-in node_modules under backend/.

## Suggested AI Onboarding Path
1. Read backend/server.js and frontend/src/App.jsx first.
2. For backend changes, inspect the matching route file, then controller, then model and middleware.
3. For frontend issues, trace by route in App.jsx, then page component, then related context and hooks.
4. If changing API URLs, standardize around VITE_API_BASE_URL.

## Non-Goals for Initial Edits
- Do not assume tests exist (none configured in package scripts).
- Do not refactor all hardcoded endpoints in one pass unless explicitly requested.
