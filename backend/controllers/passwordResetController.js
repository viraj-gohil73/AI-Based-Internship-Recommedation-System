import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import Recruiter from "../models/Recruiter.js";
import Admin from "../models/Admin.js";
import { sendEmail } from "../utils/sendEmail.js";

const ROLE_MODEL_MAP = {
  student: Student,
  company: Company,
  recruiter: Recruiter,
  admin: Admin,
};

const ALLOWED_ROLES = Object.keys(ROLE_MODEL_MAP);
const RESET_EXPIRES_IN = "20m";

const getResetSecret = () => process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET;

const resolveFrontendBaseUrl = () =>
  process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";

const normalizeRole = (value) => String(value || "").trim().toLowerCase();

const getModelByRole = (role) => ROLE_MODEL_MAP[normalizeRole(role)] || null;

const sanitizeEmail = (value) => String(value || "").trim().toLowerCase();

const validatePassword = (password) => {
  const str = String(password || "");
  if (str.length < 6) {
    return "Password must be at least 6 characters";
  }
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!strongPassword.test(str)) {
    return "Password must contain uppercase, lowercase, and a number";
  }
  return null;
};

const findUserAcrossRoles = async (email) => {
  const checks = await Promise.all(
    ALLOWED_ROLES.map(async (role) => {
      const model = ROLE_MODEL_MAP[role];
      const user = await model.findOne({ email });
      return user ? { role, user } : null;
    })
  );
  return checks.filter(Boolean);
};

export const forgotPassword = async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const requestedRole = normalizeRole(req.body.role);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let targetRole = null;
    let targetUser = null;

    if (requestedRole) {
      const model = getModelByRole(requestedRole);
      if (!model) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }
      targetRole = requestedRole;
      targetUser = await model.findOne({ email });
    } else {
      const matches = await findUserAcrossRoles(email);
      if (matches.length === 1) {
        targetRole = matches[0].role;
        targetUser = matches[0].user;
      } else if (matches.length > 1) {
        return res.status(409).json({
          success: false,
          message: "Multiple accounts found with this email. Please select a role.",
        });
      }
    }

    if (!targetUser) {
      // Keep response generic to avoid account enumeration
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent to your email.",
      });
    }

    const token = jwt.sign(
      {
        id: targetUser._id,
        email,
        role: targetRole,
        purpose: "password-reset",
      },
      getResetSecret(),
      { expiresIn: RESET_EXPIRES_IN }
    );

    const resetLink = `${resolveFrontendBaseUrl()}/reset-password/${token}?role=${targetRole}`;
    const subject = "Reset your password";
    const text = `Hi,\n\nWe received a request to reset your password.\n\nReset link: ${resetLink}\n\nThis link expires in 20 minutes.\nIf you did not request this, please ignore this email.\n`;

    const sent = await sendEmail(email, subject, text);
    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists, a reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, role } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getResetSecret());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const tokenRole = normalizeRole(decoded.role);
    const bodyRole = normalizeRole(role);
    if (bodyRole && bodyRole !== tokenRole) {
      return res.status(400).json({
        success: false,
        message: "Role mismatch for reset request",
      });
    }

    const model = getModelByRole(tokenRole);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid role in token",
      });
    }

    const user = await model.findById(decoded.id);
    if (!user || sanitizeEmail(user.email) !== sanitizeEmail(decoded.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

