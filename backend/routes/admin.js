import express from "express";
import {
  getSubmittedCompanies,
  respondToCompany,
  getCompanyDetails,
  getApprovedCompanies,
  toggleCompanyActive
} from "../controllers/admincontrol.js";
import {adminLogin} from  "../controllers/adminAuthController.js"

const router = express.Router();

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

router.post("/login", adminLogin);

export default router;
