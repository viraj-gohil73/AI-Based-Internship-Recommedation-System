import express from "express";
import {
  getSubmittedCompanies,
  respondToCompany,
  getCompanyDetails,
  getApprovedCompanies,
  toggleCompanyActive,
  getRecruiters,
  toggleRecruiterActive,
  getStudents,
  toggleStudentActive,
  getSubscriptions,
  cancelSubscription,
  getAdmins,
  createAdmin,
  toggleAdminActive,
  getReportsSummary,
  getAuditLogs
} from "../controllers/admincontrol.js";
import {adminLogin} from  "../controllers/adminAuthController.js"
import adminAuth from "../middlewares/adminAuth.js";
import {
  createAdminPlan,
  getAdminPlans,
  updateAdminPlan,
  updateAdminPlanStatus,
} from "../controllers/adminPlanController.js";

const router = express.Router();
router.post("/login", adminLogin);
router.use(adminAuth);

/* =========================================
   GET approval companies
   (SUBMITTED + RESUBMISSION)
========================================= */
router.get("/companies/approvals", getSubmittedCompanies);


/* =========================================
   ADMIN RESPONSE
   APPROVED | REJECTED | RESUBMISSION
========================================= */
router.patch(
  "/company/:id/respond",
  respondToCompany
);
router.get(
  "/companies",
  getApprovedCompanies
);

router.patch(
  "/company/:id/block",
  toggleCompanyActive
);
/* =========================================
   VIEW SINGLE COMPANY DETAILS
========================================= */
router.get(
  "/company/:id",
  getCompanyDetails
);

/* =========================================
   RECRUITERS (ADMIN)
========================================= */
router.get("/recruiters", getRecruiters);
router.patch("/recruiter/:id/block", toggleRecruiterActive);

/* =========================================
   STUDENTS (ADMIN)
========================================= */
router.get("/students", getStudents);
router.patch("/student/:id/block", toggleStudentActive);

/* =========================================
   SUBSCRIPTIONS (ADMIN)
========================================= */
router.get("/subscriptions", getSubscriptions);
router.patch("/subscription/:id/cancel", cancelSubscription);
router.get("/plans", getAdminPlans);
router.post("/plans", createAdminPlan);
router.patch("/plans/:id", updateAdminPlan);
router.patch("/plans/:id/status", updateAdminPlanStatus);

/* =========================================
   ADMINS (ADMIN)
========================================= */
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.patch("/admin/:id/status", toggleAdminActive);

/* =========================================
   REPORTS & AUDIT LOGS (ADMIN)
========================================= */
router.get("/reports/summary", getReportsSummary);
router.get("/audit-logs", getAuditLogs);

export default router;
