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

    const normalizedEmail = email.trim().toLowerCase();

    if (role !== "student" && role !== "company") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const [existingStudent, existingCompany] = await Promise.all([
      Student.findOne({ email: normalizedEmail }),
      Company.findOne({ email: normalizedEmail }),
    ]);

    if (role === "student" && existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists. Please login.",
      });
    }

    if (role === "company" && existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists. Please login.",
      });
    }

    if (role === "student" && existingCompany) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as company. Use company login.",
      });
    }

    if (role === "company" && existingStudent) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as student. Use student login.",
      });
    }

    // ---------- Generate OTP ----------
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`OTP for ${normalizedEmail} (${role}):`, otp);

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

    const sent = await sendEmail(normalizedEmail, "Your OTP Code", emailContent);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email",
      });
    }

    // ---------- Store OTP (temporary) ----------
    global.tempOtps = global.tempOtps || {};
    global.tempOtps[normalizedEmail] = {
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
