import express from "express";
import { sendOtp } from "../api/auth/sendotp.js";
import { verifyOtp } from "../api/auth/verify-otp.js";
import { registerCompany } from "../controllers/companyController.js";
import { companyLogin } from "../api/auth/companyLogin.js";


const router = express.Router();

router.post("/company/register", registerCompany);
router.post("/company/login", companyLogin);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;