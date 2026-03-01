import Company from "../models/Company.js";
import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import { ensureTrialSubscription } from "../services/subscriptionService.js";
import {
  createNotification,
  notifyAdmins,
  runNotificationTask,
} from "../services/notificationService.js";
// ✅ REGISTER COMPANY
export const registerCompany = async (req, res) => {
  try {
    let { companyName, email, password } = req.body;
    // Check all fields
    if (!email || !password || !companyName)
      return res.status(400).json({ message: "All fields are required" });
    const normalizedEmail = email.trim().toLowerCase();

    // Ensure one email can only belong to one account type
    const [existingCompany, existingStudent] = await Promise.all([
      Company.findOne({ email: normalizedEmail }),
      Student.findOne({ email: normalizedEmail }),
    ]);

    if (existingCompany)
      return res.status(400).json({ message: "Email already registered" });
    if (existingStudent)
      return res.status(400).json({
        message: "This email is already registered as student. Use student login.",
      });

    password = await bcrypt.hash(password, 10);

    // Create company
    const newCompany = await Company.create({
      email: normalizedEmail,
      password,
      companyName,
    });
    await ensureTrialSubscription(newCompany._id);
    await runNotificationTask("company-register", async () => {
      await createNotification({
        recipientModel: "Company",
        recipientId: newCompany._id,
        type: "COMPANY_REGISTERED",
        title: "Registration successful",
        message: "Your company account has been created successfully.",
        entityType: "Company",
        entityId: newCompany._id,
      });

      await notifyAdmins({
        type: "COMPANY_REGISTERED",
        title: "New company registered",
        message: `${newCompany.companyName || newCompany.email} registered on the platform.`,
        entityType: "Company",
        entityId: newCompany._id,
      });
    });
    // Create JWT Token
    const token = jwt.sign(
      { id: newCompany._id, role: "company" },
      process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.status(201).json({
        success: true,
        message: "Company registered successfully",
        token,
        company: {
            id: newCompany._id,
            email: newCompany.email,
            
        },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * PUT /api/company/update
 */
export const updateCompany = async (req, res) => {
  try {
    const companyId = req.companyId; // string id from token

    const company = await Company.findByIdAndUpdate(
      companyId,              // ✅ string id allowed
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




const getUUID = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  return parts[3]; // ucarecdn.com/UUID/
};

export const updateCompanyLogo = async (req, res) => {
  try {
    const { newLogo, oldLogo } = req.body;
    const companyId = req.companyId;

    // delete old file from uploadcare
    const oldUUID = getUUID(oldLogo);

    if (oldUUID) {
      await fetch(`https://api.uploadcare.com/files/${oldUUID}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
          Accept: "application/vnd.uploadcare-v0.7+json",
        },
      });
    }

    // save new logo in DB
    await Company.findByIdAndUpdate(companyId, { logo: newLogo });

    res.json({ success: true, logo: newLogo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logo update failed" });
  }
};

/* SUBMITTED + RESUBMISSION */

export const getApprovalCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      verificationStatus: {
        $in: ["SUBMITTED", "RESUBMISSION"],
      },
    }).sort({ createdAt: -1 });
    console.log("hit req")

    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
