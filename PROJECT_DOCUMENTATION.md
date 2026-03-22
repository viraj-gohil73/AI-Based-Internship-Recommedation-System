# InternVision - Full Project Documentation (College Submission)

## 1. Abstract
InternVision is a role-based internship platform that connects students with internship opportunities and provides operational dashboards for recruiters, companies, and administrators. The system supports authentication, profile management, internship posting and application workflows, verification pipelines, subscription-based feature access, notifications, and recommendation-assisted internship discovery.

## 2. Problem Statement
Students often struggle to find relevant internships, while companies and recruiters need structured workflows to publish opportunities, manage applicants, and monitor outcomes. InternVision solves this by providing a single platform with:
- structured student profiles
- recruiter/company hiring workflows
- administrative moderation and reporting
- recommendation-assisted discovery

## 3. Objectives
- Build a full-stack web application for internship lifecycle management.
- Support multiple user roles with role-specific dashboards.
- Provide secure authentication and authorization.
- Enable internship recommendation using hybrid rule-based + ML-assisted architecture.
- Add platform governance with admin approvals, audit logs, and subscription controls.

## 4. Scope of the Project
The project includes:
- Student portal for profile, resume, explore/save/apply, recommendations
- Recruiter portal for internship and applicant management
- Company portal for verification, recruiters, internships, subscription
- Admin portal for approvals, moderation, reports, and plans
- Backend API for role-specific operations
- Optional ML ranking service integrated through HTTP

## 5. Technology Stack

### 5.1 Frontend
- React 19
- Vite 7
- React Router
- TailwindCSS 4
- Framer Motion
- Supabase client integration

### 5.2 Backend
- Node.js
- Express 5 (ESM)
- Mongoose 8
- JWT auth
- Passport (Google OAuth)
- Nodemailer

### 5.3 Database
- MongoDB

### 5.4 Optional ML Service
- FastAPI
- Sentence-transformers based ranking pipeline scaffold

## 6. High-Level Architecture
- `frontend` is a SPA consumed by users.
- `backend` exposes REST APIs for all role workflows.
- `backend` stores data in MongoDB and applies auth/role middlewares.
- `ml-service` exposes `/rank` and `/health` and is called from backend recommendation service when enabled.
- A rule-based fallback ranking runs even when ML service is unavailable.

## 7. Repository Structure
- `frontend/` - user interface and route-based role portals
- `backend/` - API server, business logic, models, middlewares
- `ml-service/` - recommendation ranking microservice scaffold
- `PROJECT_DOCUMENTATION.md` - complete technical documentation
- `PROJECT_CONTEXT.md` - concise architecture context

## 8. Core Features by Role

### 8.1 Student
- Registration and login (email/password + OTP + Google OAuth)
- Profile management (education, projects, certificates, skills)
- Resume management and uploads
- Explore active internships
- Save/unsave internships
- Apply to internships
- View application statuses
- Receive personalized recommendations

### 8.2 Recruiter
- Recruiter login
- View own profile and current subscription status
- Create and manage internships
- View applicants and detailed application information
- Update applicant status
- Schedule and update interviews

### 8.3 Company
- Company registration/login
- Company profile and logo updates
- Verification submission
- Manage recruiters (add/edit/status)
- Manage company internships
- View reviews and current subscription
- Google OAuth flow for company

### 8.4 Admin
- Admin login
- Company approval pipeline (submitted/resubmission/approved/rejected)
- Block/unblock companies, recruiters, students
- View and disable internships
- Manage subscriptions and plans
- Manage admin users
- View reports and audit logs

## 9. Backend API Modules

Base route mounts in `backend/server.js`:
- `/api/auth`
- `/api/company`
- `/api/admin`
- `/api/recruiter`
- `/api/internships`
- `/api/student`
- `/api/notifications`

### 9.1 Auth (`/api/auth`)
- `POST /company/register`
- `POST /student/register`
- `POST /company/login`
- `POST /student/login`
- `POST /send-otp`
- `POST /verify-otp`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /google/student`
- `GET /google/callback`

### 9.2 Company (`/api/company`)
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `GET /me`
- `PATCH /update`
- `PUT /update-logo`
- `POST /submit-verification`
- `POST /recruiter/add`
- `GET /recruiters`
- `PUT /recruiter/:id`
- `PATCH /recruiter/:id/status`
- `GET /recruiter/:id`
- `GET /internships`
- `GET /internships/:id`
- `PATCH /internships/:id`
- `PATCH /internships/:id/status`
- `GET /reviews`
- `GET /subscription/plans`
- `GET /subscription/current`
- `GET /google/company`
- `GET /google/company/callback`

### 9.3 Recruiter (`/api/recruiter`)
- `POST /login`
- `GET /me`
- `GET /subscription/current`
- `GET /applicants`
- `GET /applications/:internshipId/:studentId`
- `GET /students/:studentId`
- `PATCH /applications/:internshipId/:studentId/status`
- `GET /interviews`
- `POST /interviews`
- `PATCH /interviews/:id`
- `GET /internships`
- `GET /internships/:id`
- `PATCH /internships/:id`
- `PATCH /internships/:id/status`

### 9.4 Internships (`/api/internships`)
- `GET /explore` (public/student listing)
- `POST /` (create internship, recruiter-auth + subscription gate)

### 9.5 Student (`/api/student`)
- `GET /profile`
- `PUT /profile`
- `POST /change-password`
- `GET /recommendations`
- `GET /internships/status`
- `GET /internships/saved`
- `GET /internships/applied`
- `POST /internships/:internshipId/save`
- `DELETE /internships/:internshipId/save`
- `POST /internships/:internshipId/apply`
- `POST /internships/:internshipId/feedback`

### 9.6 Notifications (`/api/notifications`)
- `GET /`
- `GET /unread-count`
- `DELETE /clear-all`
- `PATCH /read-all`
- `PATCH /:notificationId/read`

### 9.7 Admin (`/api/admin`)
- `POST /login`
- `GET /companies/approvals`
- `PATCH /company/:id/respond`
- `GET /companies`
- `PATCH /company/:id/block`
- `GET /company/:id`
- `GET /recruiters`
- `GET /internships`
- `PATCH /internship/:id/disable`
- `GET /recruiter/:id`
- `PATCH /recruiter/:id/block`
- `GET /students`
- `GET /student/:id`
- `PATCH /student/:id/block`
- `GET /subscriptions`
- `PATCH /subscription/:id/cancel`
- `GET /plans`
- `POST /plans`
- `PATCH /plans/:id`
- `PATCH /plans/:id/status`
- `GET /admins`
- `POST /admins`
- `PATCH /admin/:id/status`
- `GET /reports/summary`
- `GET /audit-logs`

## 10. Frontend Route Summary
Main routing is in `frontend/src/App.jsx`.

### 10.1 Public
- `/`
- `/choose-register`
- `/choose-login`
- `/otp`
- `/forgot-password`
- `/reset-password`

### 10.2 Student
- `/register-student`
- `/login-student`
- `/student/watchlist`
- `/student/explore`
- `/student/explore/:id`
- `/student/applied`
- `/student/resume`
- `/student/profile`
- `/student/settings`
- `/student/ai-recommend`

### 10.3 Company
- `/auth/company/register`
- `/auth/company/login`
- `/company/dashboard/*` (overview, profile, settings, subscription, internships, recruiters, analytics, reviews)

### 10.4 Recruiter
- `/auth/recruiter/login`
- `/recruiter/*` (dashboard, internships, applicants, interviews, analytics, settings)

### 10.5 Admin
- `/login-admin`
- `/admin/*` (dashboard, approvals, companies, recruiters, internships, students, subscriptions, plans, admins, reports, audit-logs, settings)

## 11. Authentication and Authorization
- JWT-based authentication is used for protected routes.
- Role-specific middleware:
  - `studentAuth`
  - `recruiterAuth`
  - `companyAuth`
  - `adminAuth`
  - `notificationAuth`
- Subscription gates are enforced through `requireSubscriptionFeature(feature)`.

Token usage in frontend local storage:
- Student/Company: `token`
- Recruiter: `recruiterToken`
- Admin: `adminToken`

## 12. Database Model Summary
Key MongoDB models:
- `Student`
- `Company`
- `Recruiter`
- `Internship`
- `Interview`
- `InternshipFeedback`
- `Plan`
- `Subscription`
- `Notification`
- `RecommendationSnapshot`
- `AuditLog`
- `Admin`

## 13. Recommendation System (AI/ML)
The student recommendation endpoint (`GET /api/student/recommendations`) supports:
- candidate filtering from active published internships
- scoring using rule-hybrid logic
- optional ML probe call to external ranker (`ML_RANKER_URL`)
- cached snapshots in `RecommendationSnapshot`
- optional LLM explanation generation using OpenAI Responses API

### 13.1 Rule-Based Signals
- skill overlap
- project relevance
- certificate relevance
- education match
- CGPA/eligibility checks
- location compatibility
- popularity + recency

### 13.2 Optional ML Service
`ml-service` exposes:
- `GET /health`
- `POST /rank`

Ranking endpoint accepts student text + candidate texts and returns scored internship IDs.

## 14. Environment Variables

### 14.1 Backend (`backend/.env`)
Required/used in code:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `SESSION_SECRET`
- `RESET_PASSWORD_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `UPLOADCARE_PUBLIC_KEY`
- `UPLOADCARE_SECRET_KEY`
- `STUDENT_MONTHLY_APPLICATION_LIMIT`
- `ML_RANKER_URL`
- `ML_RANKER_TIMEOUT_MS`
- `RECOMMENDATION_ENABLED`
- `RECOMMENDATION_MAX_CANDIDATES`
- `RECOMMENDATION_CACHE_TTL_MIN`
- `RECOMMENDATION_USE_ML_PROBE`
- `RECOMMENDATION_ENABLE_LLM_EXPLANATION`
- `RECOMMENDATION_LLM_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_RESPONSES_URL`
- `RECOMMENDATION_CGPA_NEUTRAL_SCORE`
- `RECOMMENDATION_CGPA_UNKNOWN_SCORE`
- `RECOMMENDATION_EDUCATION_NEUTRAL_SCORE`
- `RECOMMENDATION_LOCATION_UNKNOWN_SCORE`
- `RECOMMENDATION_ELIGIBILITY_NEUTRAL_SCORE`

### 14.2 Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_RESUME_BUCKET`
- `VITE_SUPABASE_COMPANY_DOC_BUCKET`
- `VITE_UPLOADCARE_PUBLIC_KEY`

## 15. Local Setup and Execution

### 15.1 Prerequisites
- Node.js 18+
- npm
- MongoDB connection
- Python 3.10+ (for optional ML service)

### 15.2 Backend
```bash
cd backend
npm install
npm start
```

### 15.3 Frontend
```bash
cd frontend
npm install
npm run dev
```

### 15.4 ML Service (Optional)
```bash
cd ml-service
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 16. Seed and Boot Behavior
On backend startup:
- MongoDB connection initializes.
- `seedAdmin()` runs.
- `seedSubscriptionSystem()` runs.

Current default seeded admin (if absent):
- Email: `admin@gmail.com`
- Password: `Admin@123`

For deployment or submission demo safety, this credential must be changed.

## 17. Important Business Rules
- Student monthly apply cap is enforced (`STUDENT_MONTHLY_APPLICATION_LIMIT`).
- Company recruiter creation is subscription-gated (`RECRUITER_CREATE`).
- Internship creation is subscription-gated (`INTERNSHIP_CREATE`).
- Student recommendation endpoint excludes already-applied internships.
- Notifications are generated for key workflow events.

## 18. Security and Validation Notes
- JWT token verification is present for all protected domains.
- Password reset flow uses signed reset token and role checks.
- Company and student OTP flows exist for verification.
- CORS is currently hardcoded to localhost for development.

## 19. Known Limitations / Technical Debt
- Some API URLs in frontend are hardcoded to localhost instead of centralized client usage.
- CORS origin is static in backend (`http://localhost:5173`).
- Repository currently includes `backend/node_modules`.
- Some legacy route/controller files exist in codebase but are not main mounted flow.
- Automated tests are not configured in package scripts.

## 20. Suggested Future Enhancements
- Centralize frontend API client with strict env-based base URL.
- Add request schema validation for all major endpoints.
- Add comprehensive unit and integration tests.
- Introduce CI pipeline for lint/test/build.
- Harden security with rate limiting and stronger audit trails.
- Add deployment scripts and production environment templates.

## 21. Commands Reference

### Backend scripts
- `npm start`
- `npm run seed:internships`
- `npm run rewrite:internship-info`
- `npm run cleanup:internships-company`
- `npm run rebuild:internships-realistic`
- `npm run normalize:skills`

### Frontend scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## 22. Conclusion
InternVision demonstrates a complete multi-role internship platform with practical workflow coverage from onboarding to hiring operations, with extensible recommendation capabilities and admin governance. It is suitable as a final-year or capstone-style project submission due to its real-world architecture, role separation, and end-to-end product scope.
