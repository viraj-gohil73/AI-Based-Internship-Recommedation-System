import { sendEmail } from "../../utils/sendEmail.js";
import Company from "../../models/Company.js";
import Student from "../../models/Student.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_SUBJECT = "Your OTP Code";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const getRecipientName = (email, cname) => String(cname || "").trim() || normalizeEmail(email).split("@")[0] || "User";
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildCompanyOtpEmailContent = ({ recipientName, otp }) => `
Hi ${recipientName},

Thank you for using Internship Finder.

Your One-Time Password (OTP) for email verification: ${otp}

Please enter this code within ${OTP_EXPIRY_MINUTES} minutes to complete verification.
Do not share this code with anyone.

If you did not request this, you can safely ignore this message.
`;

const buildCompanyOtpEmailHtml = ({ recipientName, otp }) => {
  const safeName = escapeHtml(recipientName);
  const safeOtp = escapeHtml(otp);

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin:0; padding:0; background:#f8fafc; font-family:Arial, Helvetica, sans-serif; color:#111827; }
      .card { max-width:620px; margin:24px auto; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; background:#fff; }
      .header { background:linear-gradient(135deg,#0f766e,#0ea5a4); color:#fff; padding:24px; }
      .header h1 { margin:0; font-size:22px; font-weight:800; }
      .content { padding:24px; }
      .otp-wrap { margin:20px 0; background:#ecfeff; border:2px solid #14b8a6; border-radius:12px; text-align:center; padding:16px; }
      .otp { font-size:34px; font-weight:900; letter-spacing:8px; color:#134e4a; }
      .note { color:#475569; font-size:14px; line-height:1.6; }
      .footer { border-top:1px solid #e5e7eb; padding:14px 24px; color:#64748b; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header"><h1>Internship Finder - Company Verification</h1></div>
      <div class="content">
        <p>Hi ${safeName},</p>
        <p>Use this OTP to verify your company email. It expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <div class="otp-wrap"><div class="otp">${safeOtp}</div></div>
        <p class="note">Never share this OTP with anyone. If this was not requested by you, ignore this email.</p>
      </div>
      <div class="footer">Automated email from Internship Finder.</div>
    </div>
  </body>
</html>`;
};

export const sendOtp = async (req, res) => {
  try {
    const { cname, email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!cname) {
      return res.status(400).json({ success: false, message: "Company name is required" });
    }

    const [existingCompany, existingStudent] = await Promise.all([
      Company.findOne({ email: normalizedEmail }),
      Student.findOne({ email: normalizedEmail }),
    ]);

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists. Please login.",
      });
    }

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as student. Use student login.",
      });
    }

    const otp = generateOtp();
    console.log(`OTP for ${normalizedEmail} (company):`, otp);

    const recipientName = getRecipientName(normalizedEmail, cname);
    const sent = await sendEmail(
      normalizedEmail,
      OTP_SUBJECT,
      buildCompanyOtpEmailContent({ recipientName, otp }),
      buildCompanyOtpEmailHtml({ recipientName, otp: String(otp) })
    );

    if (!sent) {
      return res.status(500).json({
        success: false,
        exist: false,
        message: "Cannot send email",
      });
    }

    // Keep shared verify-otp compatibility.
    global.tempOtps = global.tempOtps || {};
    global.tempOtps[normalizedEmail] = {
      otp,
      role: "company",
      createdAt: Date.now(),
    };

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtpCompany error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
