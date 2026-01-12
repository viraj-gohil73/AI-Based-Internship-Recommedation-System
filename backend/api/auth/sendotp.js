import { sendEmail } from "../../utils/sendEmail.js";
import Student from "../../models/Student.js";
import Company from "../../models/Company.js";
//import Recruiter from "../../models/Recruiter.js";

export const sendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    // ---------- Basic validation ----------
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // ---------- Select model based on role ----------
    let Model;

    if (role === "student") Model = Student;
    else if (role === "company") Model = Company;
    //else if (role === "recruiter") Model = Recruiter;
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // ---------- Check existing user ----------
    const existingUser = await Model.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    // ---------- Generate OTP ----------
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`OTP for ${email} (${role}):`, otp);

    // ---------- Email content ----------
    const emailContent = `
Hi ${email.split("@")[0]}, 👋

Thank you for registering with us!

Your One-Time Password (OTP) is:

🔐 OTP: ${otp}

This OTP is valid for 10 minutes.

⚠️ Do not share this OTP with anyone.

If you didn't request this, please ignore this email.

Best regards,
Internship Finder Team
© ${new Date().getFullYear()}
`;

    const sent = await sendEmail(email, "Your OTP Code", emailContent);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email",
      });
    }

    // ---------- Store OTP (temporary) ----------
    global.tempOtps = global.tempOtps || {};
    global.tempOtps[email] = {
      otp,
      role,
      createdAt: Date.now(),
    };

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
