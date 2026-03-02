# InternVision Project Documentation

## 1. Project Overview
InternVision is a fullstack internship platform with four role experiences:
- Student: profile, explore internships, save/apply, resume management, feedback.
- Company: company profile/verification, subscription visibility, recruiter management, internship management, reviews.
- Recruiter: login, create/manage internships, review applicants, update statuses, schedule interviews.
- Admin: approvals, platform moderation, plans/subscriptions, reports, audit logs, admin user management.

## 2. Tech Stack
- Frontend: React 19, Vite 7, React Router, TailwindCSS 4, Framer Motion
- Backend: Node.js, Express 5 (ESM), Mongoose 8, JWT, Passport (Google), Nodemailer
- Database: MongoDB
- File/Storage Integrations: Uploadcare, Supabase (resume/doc storage in frontend)

## 3. Repository Structure
- `frontend/`: React SPA
- `backend/`: Express API + Mongo models/controllers
- `PROJECT_CONTEXT.md`: prior project context note
- `README.md`: minimal starter note

Important entry points:
- Backend: `backend/server.js`
- Frontend: `frontend/src/main.jsx`
- Frontend routes: `frontend/src/App.jsx`

## 4. System Architecture
- Frontend and backend run as separate services.
- Frontend uses Bearer tokens stored in `localStorage`.
- Backend validates JWT and role-specific middleware for protected endpoints.
- MongoDB stores users, internships, subscriptions, interviews, notifications, and audit logs.
- Notification events are created by business actions (registration, verification changes, applications, interviews, etc.).

### 4.1 Auth Token Keys in Frontend
- Student/Company token: `localStorage.token`
- Recruiter token: `localStorage.recruiterToken`
- Admin token: `localStorage.adminToken`

### 4.2 Main Backend Route Mounts
- `/api/auth`
- `/api/company`
- `/api/admin`
- `/api/recruiter`
- `/api/internships`
- `/api/student`
- `/api/notifications`

## 5. Local Development Setup

### 5.1 Prerequisites
- Node.js 18+
- npm
- MongoDB instance (local or cloud)

### 5.2 Install
Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 5.3 Run
Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

Default local URLs used by code:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 6. Environment Variables

### 6.1 Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=
JWT_SECRET=
SESSION_SECRET=
RESET_PASSWORD_SECRET=
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

EMAIL_USER=
EMAIL_PASS=

UPLOADCARE_PUBLIC_KEY=
UPLOADCARE_SECRET_KEY=

STUDENT_MONTHLY_APPLICATION_LIMIT=5
```

### 6.2 Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_RESUME_BUCKET=resumes
VITE_SUPABASE_COMPANY_DOC_BUCKET=
VITE_UPLOADCARE_PUBLIC_KEY=
```

## 7. Startup Seed Behavior
On backend start:
- `seedAdmin()` creates default admin if missing.
- `seedSubscriptionSystem()` ensures default plans and subscription records.

### 7.1 Default Admin Seed (if absent)
- Email: `admin@gmail.com`
- Password: `Admin@123`

### 7.2 Default Plan Seeds
- Starter
- Pro
- Edge

## 8. API Overview

### 8.1 Auth (`/api/auth`)
- `POST /student/register`
- `POST /student/login`
- `POST /company/register`
- `POST /company/login`
- `POST /send-otp`
- `POST /verify-otp`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /google/student`
- `GET /google/callback`

### 8.2 Company (`/api/company`)
- `GET /me` (companyAuth)
- `PATCH /update` (companyAuth)
- `PUT /update-logo` (companyAuth)
- `POST /submit-verification` (companyAuth)
- `POST /recruiter/add` (companyAuth + subscription feature check)
- `GET /recruiters`
- `GET /recruiter/:id`
- `PUT /recruiter/:id`
- `PATCH /recruiter/:id/status`
- `GET /internships`
- `GET /internships/:id`
- `PATCH /internships/:id`
- `PATCH /internships/:id/status`
- `GET /reviews`
- `GET /subscription/plans`
- `GET /subscription/current`
- `GET /google/company`
- `GET /google/company/callback`

### 8.3 Recruiter (`/api/recruiter`)
- `POST /login`
- `GET /me`
- `GET /subscription/current`
- `GET /internships`
- `GET /internships/:id`
- `PATCH /internships/:id`
- `PATCH /internships/:id/status`
- `GET /applicants`
- `GET /applications/:internshipId/:studentId`
- `PATCH /applications/:internshipId/:studentId/status`
- `GET /students/:studentId`
- `GET /interviews`
- `POST /interviews`
- `PATCH /interviews/:id`

### 8.4 Internship Public/Create (`/api/internships`)
- `GET /explore` (student explore list)
- `POST /` (recruiterAuth + subscription feature check)

### 8.5 Student (`/api/student`)
- `GET /profile`
- `PUT /profile`
- `POST /change-password`
- `GET /internships/status`
- `GET /internships/saved`
- `GET /internships/applied`
- `POST /internships/:internshipId/save`
- `DELETE /internships/:internshipId/save`
- `POST /internships/:internshipId/apply`
- `POST /internships/:internshipId/feedback`

### 8.6 Notifications (`/api/notifications`)
- `GET /`
- `GET /unread-count`
- `PATCH /:notificationId/read`
- `PATCH /read-all`
- `DELETE /clear-all`

### 8.7 Admin (`/api/admin`)
- Public: `POST /login`
- Protected (adminAuth):
  - company approvals/responses/list/details/block
  - recruiters list/details/block
  - internships list/disable
  - students list/details/block
  - subscriptions list/cancel
  - plans list/create/update/status
  - admins list/create/status
  - reports summary
  - audit logs

## 9. Role Workflows

### 9.1 Student
1. Register (OTP) or login (email/password or Google).
2. Complete profile (guarded by `StudentProfileRequiredRoute`).
3. Explore active internships.
4. Save or apply internship.
5. Monthly apply limits are enforced.
6. Recruiter updates status through hiring pipeline.
7. Student can submit feedback after selected + internship completion.

### 9.2 Company
1. Register/login.
2. Complete profile + upload docs.
3. Submit verification.
4. Admin approves/rejects/resubmission.
5. Manage recruiters and internships (subject to subscription and limits).

### 9.3 Recruiter
1. Login with recruiter credentials created by company.
2. Create/post/manage internships.
3. View applicants and applicant detail.
4. Update application status.
5. Schedule and manage interviews.

### 9.4 Admin
1. Login.
2. Moderate companies/recruiters/students/internships.
3. Manage subscription plans and subscriptions.
4. View reports and audit logs.
5. Manage additional admin users.

## 10. Subscription and Usage Logic
- Trial is auto-created for each company (`14` days by default).
- Access depends on:
  - Company verification is `APPROVED`
  - Subscription status is valid (`TRIAL`/`ACTIVE`)
  - Not expired by date
- Feature gate middleware: `requireSubscriptionFeature(feature)`.
- Features currently checked:
  - `RECRUITER_CREATE`
  - `INTERNSHIP_CREATE`

## 11. Key Limits and Rules
- Student monthly application limit from `STUDENT_MONTHLY_APPLICATION_LIMIT` (default fallback 5).
- Recruiter-side internship creation also checks monthly per-company posting cap in controller.
- Re-apply cooldown exists for same company after rejection (1 month logic in student apply flow).
- Company recruiter creation has both:
  - hardcoded controller cap (`MAX_RECRUITERS_PER_COMPANY = 2`)
  - subscription feature check seat limit

## 12. Data Model Summary
- `Student`: profile, education/projects/certificates, saved/applied internships, resumes
- `Company`: profile + verification state
- `Recruiter`: belongs to company, auth + profile
- `Internship`: posting details + status/publish flags + company/recruiter refs
- `Interview`: recruiter-company-student-internship schedule records
- `InternshipFeedback`: student feedback per internship/company
- `Plan`: subscription plan definitions
- `Subscription`: company plan state, cycle, seats, pricing, status
- `Notification`: role-targeted notification entries
- `AuditLog`: admin/system event logging
- `Admin`: admin credentials and state

## 13. Frontend Route Map (High-Level)
- Public: home, role selectors, OTP, forgot/reset password
- Student: profile, explore/details, applied, saved/watchlist, resume, settings, AI recommend
- Company auth: register/login
- Company dashboard: overview/profile/settings/subscription/internships/recruiters/analytics/reviews
- Recruiter auth + dashboard: internships/create/post/edit/view, applicants/detail, interviews, analytics, settings
- Admin: dashboard, approvals, companies/details, recruiters, internships, students, subscriptions, plans, admins, reports, audit logs, settings

## 14. Integrations
- Google OAuth for student and company flows.
- LinkedIn wiring exists in code paths but active routing may be partial.
- Email via Nodemailer Gmail transport (OTP + password reset).
- Uploadcare used for file/logo related flows.
- Supabase client present in frontend for resume/doc buckets.

## 15. Known Caveats / Technical Debt
- Many frontend calls are hardcoded to `http://localhost:5000` instead of centralized `VITE_API_BASE_URL` usage.
- Backend CORS origin is hardcoded to `http://localhost:5173`.
- Repo includes `backend/node_modules` checked in.
- Legacy auth route files exist (`auth.js`, `authRoutes.js`) but active server mounting uses `authvg.js`.
- Some legacy/duplicate controller exports exist across auth/student modules.
- Default seeded admin credentials should be changed immediately in real deployments.

## 16. Production Readiness Checklist
- Move all API URLs to env-driven base URL.
- Restrict CORS to deployment domains.
- Remove checked-in `node_modules` and lock dependency management.
- Rotate/remove default seed credentials.
- Add rate limiting, request validation, and structured logging.
- Add automated tests for auth, role authorization, and subscription gates.
- Add CI for lint/build/test and secure secret management.

## 17. Quick Troubleshooting
- `401 Unauthorized`: verify correct token key (`token` vs `recruiterToken` vs `adminToken`).
- `403 Access denied`: verify role in JWT and route middleware.
- OTP failures: confirm email credentials and OTP timing (10-minute window).
- Company feature blocked: verify company approval + active/trial subscription.
- Reset password issues: use backend route `POST /api/auth/reset-password/:token` and match role.

## 18. No-Test Status
No automated tests are configured in package scripts in current repository state.
