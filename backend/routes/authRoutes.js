import express from "express";
import passport from "passport";

import { registerStudent } from "../controllers/authController.js";
import { registerCompany } from "../controllers/companyController.js";
import { sendOtp } from "../api/auth/sendotp.js";
import { verifyOtp } from "../api/auth/verify-otp.js";
import { googleCallback } from "../controllers/authGoogleController.js";
import { googleCallbackCompany } from "../controllers/authGoogleCompany.js";
import { createCompany } from "../controllers/company.js";

import { getMyCompany } from "../controllers/company.js";
import { companyAuth } from "../middlewares/companyAuth.js";

 // passport init

const router = express.Router();

/* ================= OTP ================= */
//router.post("auth/send-otp", sendOtp);
//router.post("auth/verify-otp", verifyOtp);

/* ================= NORMAL REGISTER ================= */
router.post("/student/register", registerStudent);
router.post("/company/register", registerCompany);

/* ================= STUDENT GOOGLE ================= */
router.get(
  "/google/student",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/student/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  googleCallback
);

/* ================= COMPANY GOOGLE ================= */
router.get(
  "/google/company",
  passport.authenticate("google-company", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* GOOGLE CALLBACK */
router.get(
  "/google/company/callback",
  passport.authenticate("google-company", {
    session: false,
  }),
  (req, res) => {
    const token = req.user?.token;

    if (!token) {
      return res.send("Token missing ❌");
    }

    res.redirect(
      `http://localhost:5173/company/dashboard/profile?token=${token}`
    );
  }
);

/* ================= COMPANY NORMAL SAVE ================= */
router.post("/company", createCompany);
// backend
router.get("/company/me", companyAuth, getMyCompany);


export default router;
