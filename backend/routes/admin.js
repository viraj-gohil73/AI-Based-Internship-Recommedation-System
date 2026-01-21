import express from "express";
import {
  getSubmittedCompanies,
  respondToCompany,
  getCompanyDetails,
} from "../controllers/admincontrol.js";


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

/* =========================================
   VIEW SINGLE COMPANY DETAILS
========================================= */
router.get(
  "/company/:id",
  getCompanyDetails
);

export default router;
