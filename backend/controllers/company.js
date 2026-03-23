import Company from "../models/Company.js";
import { ensureTrialSubscription } from "../services/subscriptionService.js";
import {
  createNotification,
  notifyAdmins,
  runNotificationTask,
} from "../services/notificationService.js";
import { startVerificationRun } from "../services/companyVerificationService.js";

export const createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    await ensureTrialSubscription(company._id);

    res.status(201).json({
      success: true,
      message: "Company saved successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCompany = async (req, res) => {
  const company = await Company.findById(req.companyId);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Invalid Crediatials",
    });
  }

  res.json({
    success: true,
    data: company,
  });
};

const requiredCompanyProfileFields = ["companyName", "email", "reg_doc", "gst_no"];

const hasRequiredProfile = (company) =>
  requiredCompanyProfileFields.every((field) => String(company[field] || "").trim().length > 0);

const validateCompanyOwnership = (req, companyId) =>
  String(req.companyId) === String(companyId);

const kickoffVerificationAndNotify = async ({ company, source, onlyFailedChecks = false }) => {
  await startVerificationRun({
    company,
    source,
    onlyFailedChecks,
  });

  await runNotificationTask(`company-verification-${source.toLowerCase()}`, async () => {
    await createNotification({
      recipientModel: "Company",
      recipientId: company._id,
      type: "COMPANY_VERIFICATION_SUBMITTED",
      title: "Verification in progress",
      message: "Your company profile is being verified automatically.",
      entityType: "Company",
      entityId: company._id,
      metadata: { source },
    });

    await notifyAdmins({
      type: "COMPANY_VERIFICATION_SUBMITTED",
      title: "Company verification requested",
      message: `${company.companyName || company.email} entered automated verification pipeline.`,
      entityType: "Company",
      entityId: company._id,
      metadata: { source },
    });
  });
};

export const submitCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (["APPROVED", "AUTO_APPROVED"].includes(company.verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Company already approved",
      });
    }

    const updates = {
      ...req.body,
      email: company.email,
    };
    if (typeof req.body?.emailOtpVerified === "boolean") {
      updates.verification = {
        ...(company.verification || {}),
        emailOtpVerified: req.body.emailOtpVerified,
      };
    }

    Object.keys(updates).forEach((key) => {
      if (key !== "verification") {
        company[key] = updates[key];
      }
    });

    if (updates.verification) {
      company.verification = {
        ...(company.verification || {}),
        ...updates.verification,
      };
    }

    if (!hasRequiredProfile(company)) {
      return res.status(400).json({
        success: false,
        message: "Please complete required fields: companyName, reg_doc, gst_no.",
      });
    }

    await kickoffVerificationAndNotify({
      company,
      source: "PROFILE_SUBMIT",
      onlyFailedChecks: false,
    });

    return res.status(202).json({
      success: true,
      message: "Profile submitted and verification started",
      data: {
        companyId: company._id,
        verificationStatus: company.verificationStatus,
        verification: company.verification,
      },
    });
  } catch (error) {
    console.error("Submit company profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const submitVerification = async (req, res) => {
  req.body = req.body || {};
  return submitCompanyProfile(req, res);
};

export const getCompanyVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateCompanyOwnership(req, id)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own verification status",
      });
    }

    const company = await Company.findById(id).select(
      "companyName email verificationStatus verification updatedAt"
    );

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        companyId: company._id,
        companyName: company.companyName,
        email: company.email,
        verificationStatus: company.verificationStatus,
        verification: company.verification,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get company verification status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resubmitCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateCompanyOwnership(req, id)) {
      return res.status(403).json({
        success: false,
        message: "You can only resubmit your own company profile",
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (!["AUTO_RESUBMIT", "RESUBMISSION"].includes(company.verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Resubmission is only allowed for auto-resubmit companies",
      });
    }

    Object.keys(req.body || {}).forEach((key) => {
      company[key] = req.body[key];
    });

    if (!hasRequiredProfile(company)) {
      return res.status(400).json({
        success: false,
        message: "Please complete required fields: companyName, reg_doc, gst_no.",
      });
    }

    await kickoffVerificationAndNotify({
      company,
      source: "RESUBMIT",
      onlyFailedChecks: true,
    });

    return res.status(202).json({
      success: true,
      message: "Resubmission accepted and failed checks are being re-evaluated",
      data: {
        companyId: company._id,
        verificationStatus: company.verificationStatus,
        verification: company.verification,
      },
    });
  } catch (error) {
    console.error("Resubmit company profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
