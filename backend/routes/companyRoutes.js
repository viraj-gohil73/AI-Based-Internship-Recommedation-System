import express from "express";
import passport from "passport";
import { companyAuth } from "../middlewares/companyAuth.js";
import { getMyCompany, submitVerification } from "../controllers/company.js";
import { sendOtp } from "../api/auth/sendotpCompany.js";
import { updateCompany, updateCompanyLogo, getApprovalCompanies } from "../controllers/companyController.js";
import { createRecruiter } from "../controllers/recruitercontroller.js";
import { getRecruiters } from "../controllers/recruitercontroller.js";
import { updateRecruiter, getRecruiterById, updateRecruiterstatus } from "../controllers/recruitercontroller.js";
import { requireSubscriptionFeature } from "../middlewares/requireSubscriptionFeature.js";
import {
  listSubscriptionPlans,
  getCurrentCompanySubscription,
  getCompanySubscriptionPayments,
  createCheckoutIntent,
  confirmSubscriptionPayment,
} from "../controllers/subscriptionController.js";
const router = express.Router();

/* ================= OTP ================= */
router.post("/auth/send-otp", sendOtp);

router.get("/me", companyAuth, getMyCompany);
/* ========== COMPANY GOOGLE ========== */
router.get(
  "/google/company",
  passport.authenticate("google-company", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.patch("/update",companyAuth, updateCompany);
router.put("/update-logo", companyAuth, updateCompanyLogo);

router.post(
  "/submit-verification",
  companyAuth,
  submitVerification
);

router.post(
  "/recruiter/add",
  companyAuth,
  requireSubscriptionFeature("RECRUITER_CREATE"),
  createRecruiter
);
router.get("/recruiters",companyAuth, getRecruiters);
router.put("/recruiter/:id", companyAuth, updateRecruiter);
router.patch("/recruiter/:id/status", companyAuth, updateRecruiterstatus);
router.get("/recruiter/:id", companyAuth, getRecruiterById);

router.get("/subscription/plans", companyAuth, listSubscriptionPlans);
router.get("/subscription/current", companyAuth, getCurrentCompanySubscription);
router.get("/subscription/payments", companyAuth, getCompanySubscriptionPayments);
router.post("/subscription/checkout-intent", companyAuth, createCheckoutIntent);
router.post("/subscription/confirm", companyAuth, confirmSubscriptionPayment);

router.get(
  "/google/company/callback",
  passport.authenticate("google-company", { session: false }),
  (req, res) => {
    const { token } = req.user;
    console.log("token",req.user);
    //res.redirect(`http://localhost:5173/company/dashboard/profile?token=${token}&role=company`);
    res.redirect(
  `http://localhost:5173/company/google-success?token=${token}&role=company`
);
  }
);

export default router;
