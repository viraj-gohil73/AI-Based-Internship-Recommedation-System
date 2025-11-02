import express from "express";
import { registerStudent } from "../controllers/authController.js";
import { sendOtp } from "../api/auth/sendotp.js";
import { verifyOtp } from "../api/auth/verify-otp.js";
const router = express.Router();

router.post("/register", registerStudent);
//router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;
