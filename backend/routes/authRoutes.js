import express from "express";
import { registerStudent } from "../controllers/authController.js";
import { sendOtp } from "../api/auth/sendotp.js";
import { verifyOtp } from "../api/auth/verify-otp.js";
import { registerCompany } from "../controllers/companyController.js";
import passport from "passport";
import { googleCallback } from "../controllers/authGoogleController.js";
const router = express.Router();
import "../api/auth/googleLogin.js";

//router.post("/register", registerStudent);
//router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/student/register", registerStudent);
router.post("/company/register", registerCompany);

// 🟩 Google Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleCallback);

export default router;