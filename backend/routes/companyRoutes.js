import express from "express";
import passport from "passport";
import { companyAuth } from "../middlewares/companyAuth.js";
import { getMyCompany } from "../controllers/company.js";
import { sendOtp } from "../api/auth/sendotpCompany.js";
import { updateCompany, updateCompanyLogo } from "../controllers/companyController.js";
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

router.put("/update",companyAuth, updateCompany);
router.put("/update-logo", companyAuth, updateCompanyLogo);

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
