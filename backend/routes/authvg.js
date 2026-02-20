import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendOtp } from "../api/auth/sendotp.js";
import { verifyOtp } from "../api/auth/verify-otp.js";
import { registerCompany } from "../controllers/companyController.js";
import { companyLogin } from "../api/auth/companyLogin.js";
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js";
import { loginStudent } from "../controllers/studentController.js";
import { registerStudent } from "../controllers/authController.js";


const router = express.Router();

router.post("/company/register", registerCompany);
router.post("/student/register", registerStudent);
router.post("/company/login", companyLogin);
router.post("/student/login", loginStudent);
router.get(
  "/google/student",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login-student" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/login-student");
    }

    const token = jwt.sign(
      { id: req.user._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.redirect(
      `http://localhost:5173/company/google-success?token=${token}&role=student`
    );
  }
);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
