import { sendEmail } from "../../utils/sendEmail.js";
import Student from "../../models/Student.js";
import Company from "../../models/Company.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_SUBJECT = "Your OTP Code";
const ALLOWED_ROLES = new Set(["student", "company"]);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const getRecipientName = (email) => normalizeEmail(email).split("@")[0] || "User";
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildOtpEmailContent = ({ recipientName, otp }) => `
Hi ${recipientName},

Thank you for registering with Internship Finder.

Your One-Time Password (OTP): ${otp}

This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.
Do not share this OTP with anyone.

If you did not request this, please ignore this email.

Best regards,
Internship Finder Team
`;

const buildOtpEmailHtml = ({ recipientName, otp }) => {
  const safeName = escapeHtml(recipientName);
  const safeOtp = escapeHtml(otp);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin:0; padding:0; background:#f3f6ff; font-family:Arial, Helvetica, sans-serif; color:#0f172a; }
      .wrap { max-width:620px; margin:24px auto; background:#ffffff; border:1px solid #dbeafe; border-radius:14px; overflow:hidden; }
      .head { background:linear-gradient(135deg,#1d4ed8,#4f46e5); color:#fff; padding:24px; }
      .title { margin:0; font-size:22px; font-weight:800; letter-spacing:.3px; }
      .body { padding:24px; }
      .otp-box { margin:20px 0; padding:16px; border:2px dashed #1d4ed8; border-radius:12px; background:#eff6ff; text-align:center; }
      .otp { font-size:34px; font-weight:900; letter-spacing:8px; color:#1e3a8a; }
      .muted { color:#475569; font-size:14px; line-height:1.6; }
      .footer { border-top:1px solid #e2e8f0; padding:16px 24px; font-size:12px; color:#64748b; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <h1 class="title">Internship Finder</h1>
      </div>
      <div class="body">
        <p>Hi ${safeName},</p>
        <p>Use the OTP below to continue your registration. This code is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <div class="otp-box"><div class="otp">${safeOtp}</div></div>
        <p class="muted">Do not share this OTP with anyone. If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">This is an automated message from Internship Finder.</div>
    </div>
  </body>
</html>`;
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const sendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
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

    const otp = generateOtp();
    console.log(`OTP for ${normalizedEmail} (${role}):`, otp);

    const recipientName = getRecipientName(normalizedEmail);
    const sent = await sendEmail(
      normalizedEmail,
      OTP_SUBJECT,
      buildOtpEmailContent({ recipientName, otp }),
      buildOtpEmailHtml({ recipientName, otp: String(otp) })
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email",
      });
    }

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
    console.error("sendOtp error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
