# InternVision Test Cases (Manual)

This document provides ready-to-show manual test cases for the InternVision project.

## 1. Test Environment
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Database: MongoDB (configured via `MONGO_URI`)

## 2. Test Accounts
- Admin (seed): `admin@gmail.com / Admin@123`
- Student: create via registration flow
- Company: create via registration flow
- Recruiter: created from company dashboard

## 3. Test Case Format
- `ID`: Unique test case ID
- `Module`: Feature area
- `Precondition`: What must exist before testing
- `Steps`: Actions to perform
- `Expected Result`: Correct behavior

## 4. Functional Test Cases

### Auth and Access Control

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-001 | Student Register (OTP) | Email service configured | Open student register, submit valid details, verify OTP | Student account created and login allowed |
| TC-002 | Student Login | Registered student exists | Login with correct email/password | Login success, redirected to student area |
| TC-003 | Student Login Invalid | Registered student exists | Login with wrong password | Error shown, login blocked |
| TC-004 | Forgot Password | Registered user exists | Use forgot password, open reset link/token, set new password | Password updated, new password works |
| TC-005 | Protected Student Route | Not logged in | Open `/student/profile` directly | Redirected to login / unauthorized access blocked |
| TC-006 | Admin Login | Seed admin exists | Login with admin credentials | Admin dashboard opens |
| TC-007 | Role Isolation | Logged in as student | Open `/admin/dashboard` | Access denied or redirected |

### Student Workflow

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-008 | Profile Completion Guard | New student login | Try opening explore page without full profile | Redirected to complete profile first |
| TC-009 | Update Student Profile | Student logged in | Edit profile fields and save | Profile persists after refresh |
| TC-010 | Explore Internships | Active internship exists | Open student explore page | Active internships list visible |
| TC-011 | Save Internship | Student logged in | Click save on an internship, open saved list | Internship appears in saved list |
| TC-012 | Unsave Internship | Internship already saved | Remove saved internship | Internship removed from saved list |
| TC-013 | Apply Internship Success | Student profile complete, active internship exists | Apply to internship | Application created and shown in applied list |
| TC-014 | Duplicate Apply Prevention | Already applied to same internship | Apply again | Duplicate apply blocked with message |
| TC-015 | Monthly Application Limit | Limit reached | Apply one more internship | Apply blocked with limit message |

### Company Workflow

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-016 | Company Register/Login | None | Register company, then login | Company dashboard access granted |
| TC-017 | Submit Verification | Company logged in | Upload required company docs, submit verification | Status changes to pending review |
| TC-018 | Recruiter Add (Allowed) | Company approved + active/trial subscription | Add recruiter from dashboard | Recruiter created successfully |
| TC-019 | Recruiter Add (Feature Blocked) | Company not approved or no valid subscription | Try adding recruiter | Request blocked with subscription/approval error |
| TC-020 | Company Internship List | Company has internships | Open company internships page | Only company internships shown |

### Recruiter Workflow

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-021 | Recruiter Login | Recruiter account exists | Login with recruiter credentials | Recruiter dashboard opens |
| TC-022 | Create Internship | Recruiter authorized and feature enabled | Create internship with valid fields | Internship created and listed |
| TC-023 | Update Internship Status | Internship exists | Change internship status (e.g., draft/active/closed) | Updated status reflected in listings |
| TC-024 | View Applicants | Internship has applications | Open applicants page | Applicant list displays correctly |
| TC-025 | Update Application Status | Applicant exists | Change status to shortlisted/rejected/selected | Status saved and visible to student side |
| TC-026 | Schedule Interview | Applicant shortlisted | Create interview entry with date/time | Interview record appears in recruiter interviews |

### Admin Workflow

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-027 | Company Approval | Company verification pending | Admin approves company | Company status becomes approved |
| TC-028 | Company Rejection | Company verification pending | Admin rejects with reason | Company status becomes rejected with reason |
| TC-029 | Block User | Existing student/recruiter/company | Admin blocks account | Blocked account cannot login/use protected actions |
| TC-030 | Manage Plans | Admin logged in | Create/update plan and change status | Plan changes saved and reflected in subscription pages |
| TC-031 | Reports/Audit Logs | Admin logged in | Open reports and audit logs pages | Data loads without authorization errors |

### Notifications

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-032 | Notification List | User has notification events | Open notifications | Notification items are visible |
| TC-033 | Mark Single as Read | Unread notification exists | Mark one notification as read | Unread count decreases by 1 |
| TC-034 | Mark All Read | Multiple unread notifications exist | Use read-all action | Unread count becomes 0 |
| TC-035 | Clear All | Notifications exist | Use clear-all action | Notification list becomes empty |

## 5. API/Negative Test Cases

| ID | Module | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| TC-036 | Missing Token | None | Call protected API without token | `401 Unauthorized` |
| TC-037 | Wrong Role Token | Student token used on admin API | Call admin endpoint with student token | `403 Forbidden` / access denied |
| TC-038 | Invalid Input Validation | API endpoint with required fields | Send empty/invalid payload | Validation error returned, no bad data saved |
| TC-039 | Expired/Invalid JWT | Tampered/expired token | Call protected endpoint | Request denied with auth error |
| TC-040 | Invalid Internship ID | None | Fetch internship with bad ID format | Graceful error response (4xx), no server crash |

## 6. Submission Notes (For Teacher)
- This project currently has no automated test scripts configured.
- The above are manual test cases covering:
  - Authentication and authorization
  - Core workflows for Student/Company/Recruiter/Admin
  - Notifications and API negative scenarios
- Recommended next step: convert these cases into automated tests (Jest + Supertest for backend, Playwright/Cypress for frontend).
