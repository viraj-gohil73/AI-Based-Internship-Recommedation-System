import Company from "../models/Company.js";
import Recruiter from "../models/Recruiter.js";
import Student from "../models/Student.js";
import Admin from "../models/Admin.js";
import Subscription from "../models/Subscription.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import Internship from "../models/Internship.js";
import {
  createNotification,
  notifyAdmins,
  runNotificationTask,
} from "../services/notificationService.js";

const getActor = (req) =>
  req.headers["x-admin-email"] || "admin@system.com";

const logAdminAction = async ({
  action,
  actor,
  target,
  type = "SYSTEM",
  severity = "LOW",
  meta,
}) => {
  try {
    await AuditLog.create({
      action,
      actor,
      target,
      type,
      severity,
      meta,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

/* =====================================================
   GET कंपनियां जिनका approval pending है
   (SUBMITTED + RESUBMISSION)
===================================================== */

export const getSubmittedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      verificationStatus: { $in: ["SUBMITTED"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submitted companies",
    });
  }
};

/* =====================================================
   ADMIN RESPONSE: APPROVE / REJECT / RESUBMIT
===================================================== */

export const respondToCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // allowed admin actions
    const allowedActions = [
      "APPROVED",
      "REJECTED",
      "RESUBMISSION",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin action",
      });
    }

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Only allow response if company is submitted or resubmitted
    if (
      !["SUBMITTED", "RESUBMISSION"].includes(
        company.verificationStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company is not in approval state",
      });
    }

    company.verificationStatus = action;
    await company.save();
    await runNotificationTask("admin-respond-company", async () => {
      await createNotification({
        recipientModel: "Company",
        recipientId: company._id,
        type: "COMPANY_VERIFICATION_UPDATED",
        title: "Verification status updated",
        message: `Your company verification status is now ${action}.`,
        entityType: "Company",
        entityId: company._id,
      });

      await notifyAdmins({
        type: "COMPANY_VERIFICATION_UPDATED",
        title: "Company verification updated",
        message: `${company.companyName || company.email} marked as ${action}.`,
        entityType: "Company",
        entityId: company._id,
        metadata: { action, actor: getActor(req) },
      });
    });
    await logAdminAction({
      action: `Company ${action.toLowerCase()}`,
      actor: getActor(req),
      target: company.companyName || company.email,
      type: "COMPANY",
      severity: action === "REJECTED" ? "HIGH" : "MEDIUM",
      meta: { companyId: company._id, status: action },
    });

    return res.status(200).json({
      success: true,
      message: `Company ${action.toLowerCase()} successfully`,
      data: {
        companyId: company._id,
        verificationStatus: company.verificationStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update company status",
    });
  }
};

/* =====================================================
   SINGLE COMPANY DETAILS (VIEW)
===================================================== */

export const getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password -__v");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const [recruiterCount, internshipCount] = await Promise.all([
      Recruiter.countDocuments({ companyId: company._id }),
      Internship.countDocuments({ company_id: company._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...company.toObject(),
        recruiterCount,
        internshipCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details",
    });
  }
};


export const getApprovedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      verificationStatus: "APPROVED",
    }).sort({ createdAt: -1 });

    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved companies",
    });
  }
};


/* ================= BLOCK / UNBLOCK COMPANY ================= */
export const toggleCompanyActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isactive = isActive;
    await company.save();
    await logAdminAction({
      action: company.isactive ? "Company unblocked" : "Company blocked",
      actor: getActor(req),
      target: company.companyName || company.email,
      type: "COMPANY",
      severity: "MEDIUM",
      meta: { companyId: company._id, isactive: company.isactive },
    });

    res.status(200).json({
      message: company.isactive ? "Company unblocked" : "Company blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

/* ================= RECRUITERS ================= */
export const getRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find()
      .select("-password")
      .populate("companyId", "companyName")
      .sort({ createdAt: -1 });

    const normalized = recruiters.map((r) => ({
      ...r.toObject(),
      companyName: r.companyId?.companyName || null,
    }));

    return res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiters",
    });
  }
};

export const getInternships = async (req, res) => {
  try {
    const [internships, applicationCounts] = await Promise.all([
      Internship.find()
        .populate("company_id", "companyName email")
        .populate("recruiter_id", "name email")
        .sort({ createdAt: -1 }),
      Student.aggregate([
        { $unwind: "$appliedInternships" },
        {
          $group: {
            _id: "$appliedInternships.internship",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countMap = new Map(
      applicationCounts.map((row) => [String(row._id), Number(row.count || 0)])
    );

    const data = internships.map((item) => ({
      ...item.toObject(),
      companyName: item.company_id?.companyName || "",
      companyEmail: item.company_id?.email || "",
      recruiterName: item.recruiter_id?.name || "",
      recruiterEmail: item.recruiter_id?.email || "",
      applicationsCount: countMap.get(String(item._id)) || 0,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
    });
  }
};

export const disableInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (internship.intern_status === "CLOSED") {
      return res.status(200).json({
        success: true,
        message: "Internship already disabled",
        data: internship,
      });
    }

    internship.intern_status = "CLOSED";
    internship.is_published = "false";
    await internship.save();

    await logAdminAction({
      action: "Internship disabled",
      actor: getActor(req),
      target: internship.title || String(internship._id),
      type: "INTERNSHIP",
      severity: "MEDIUM",
      meta: {
        internshipId: internship._id,
        intern_status: internship.intern_status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Internship disabled",
      data: internship,
    });
  } catch (error) {
    return res.status(500).json({ message: "Action failed" });
  }
};

export const getRecruiterDetails = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id)
      .select("-password -__v")
      .populate(
      "companyId",
      "companyName email mobile website industry city state address1 address2 pincode logo verificationStatus"
    );

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    const assignedInternshipsCount = await Internship.countDocuments({
      recruiter_id: recruiter._id,
    });

    const payload = {
      ...recruiter.toObject(),
      companyName: recruiter.companyId?.companyName || null,
      companyEmail: recruiter.companyId?.email || null,
      company: recruiter.companyId || null,
      assignedInternshipsCount,
    };

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter details",
    });
  }
};

export const toggleRecruiterActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const recruiter = await Recruiter.findById(id);

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    recruiter.isactive = isActive;
    await recruiter.save();
    await logAdminAction({
      action: recruiter.isactive ? "Recruiter unblocked" : "Recruiter blocked",
      actor: getActor(req),
      target: recruiter.name || recruiter.email,
      type: "RECRUITER",
      severity: "MEDIUM",
      meta: { recruiterId: recruiter._id, isactive: recruiter.isactive },
    });

    res.status(200).json({
      message: recruiter.isactive ? "Recruiter unblocked" : "Recruiter blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

/* ================= STUDENTS ================= */
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select("-password -__v")
      .populate("savedInternships", "title company_id")
      .populate("appliedInternships.internship", "title company_id intern_status");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
    });
  }
};

export const toggleStudentActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.isactive = isActive;
    await student.save();
    await logAdminAction({
      action: student.isactive ? "Student unblocked" : "Student blocked",
      actor: getActor(req),
      target: student.email,
      type: "STUDENT",
      severity: "MEDIUM",
      meta: { studentId: student._id, isactive: student.isactive },
    });

    res.status(200).json({
      message: student.isactive ? "Student unblocked" : "Student blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

/* ================= ADMIN USERS ================= */
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const tempPassword =
      password ||
      Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-4).toUpperCase();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const admin = await Admin.create({
      name,
      email,
      role: role || "ADMIN",
      password: hashed,
      active: true,
    });

    await logAdminAction({
      action: "Admin created",
      actor: getActor(req),
      target: admin.email,
      type: "ADMIN",
      severity: "LOW",
      meta: { adminId: admin._id, role: admin.role },
    });

    return res.status(201).json({
      success: true,
      message: "Admin created",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        active: admin.active,
        createdAt: admin.createdAt,
      },
      tempPassword: password ? null : tempPassword,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

export const toggleAdminActive = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.active = active;
    await admin.save();

    await logAdminAction({
      action: admin.active ? "Admin unblocked" : "Admin blocked",
      actor: getActor(req),
      target: admin.email,
      type: "ADMIN",
      severity: "MEDIUM",
      meta: { adminId: admin._id, active: admin.active },
    });

    res.status(200).json({
      message: admin.active ? "Admin unblocked" : "Admin blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

/* ================= SUBSCRIPTIONS ================= */
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("companyId", "companyName email verificationStatus")
      .populate("planId", "code name")
      .sort({ createdAt: -1 });

    const normalized = subscriptions.map((s) => ({
      ...s.toObject(),
      planCode: s.planCodeSnapshot || s.planId?.code || null,
      planName: s.planId?.name || s.planCodeSnapshot || null,
      companyName: s.companyId?.companyName || null,
      companyEmail: s.companyId?.email || s.billingEmail || null,
      companyVerificationStatus: s.companyId?.verificationStatus || null,
      periodEnd: s.currentPeriodEnd || s.trialEndsAt || null,
      seats: s.totalRecruiterSeats || 0,
      amount: s.totalAmount || 0,
    }));

    return res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    });
  }
};

export const cancelSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const subscription = await Subscription.findById(id).populate(
      "companyId",
      "companyName email"
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "CANCELLED";
    subscription.cancelledAt = new Date();
    subscription.cancelAtPeriodEnd = false;
    subscription.currentPeriodEnd = new Date();
    await subscription.save();
    await runNotificationTask("admin-cancel-subscription", async () => {
      if (subscription.companyId?._id) {
        await createNotification({
          recipientModel: "Company",
          recipientId: subscription.companyId._id,
          type: "SUBSCRIPTION_CANCELLED",
          title: "Subscription cancelled",
          message: "Your subscription has been cancelled by admin.",
          entityType: "Subscription",
          entityId: subscription._id,
        });
      }

      await notifyAdmins({
        type: "SUBSCRIPTION_CANCELLED",
        title: "Subscription cancelled",
        message: `${subscription.companyId?.companyName || subscription.billingEmail} subscription cancelled.`,
        entityType: "Subscription",
        entityId: subscription._id,
        metadata: { actor: getActor(req) },
      });
    });

    await logAdminAction({
      action: "Subscription cancelled",
      actor: getActor(req),
      target:
        subscription.companyId?.companyName || subscription.billingEmail,
      type: "SUBSCRIPTION",
      severity: "HIGH",
      meta: { subscriptionId: subscription._id },
    });

    res.status(200).json({
      message: "Subscription cancelled",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};

/* ================= REPORTS ================= */
export const getReportsSummary = async (req, res) => {
  try {
    const rangeDays = Number(req.query.range || 30);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - rangeDays);

    const [studentsTotal, companiesTotal, recruitersTotal, internshipsTotal] =
      await Promise.all([
        Student.countDocuments(),
        Company.countDocuments(),
        Recruiter.countDocuments(),
        Internship.countDocuments(),
      ]);

    const [studentsActive, companiesActive, recruitersActive, internshipsOpen] =
      await Promise.all([
        Student.countDocuments({
          $or: [{ isactive: true }, { isactive: { $exists: false } }],
        }),
        Company.countDocuments({
          $or: [{ isactive: true }, { isactive: { $exists: false } }],
        }),
        Recruiter.countDocuments({
          $or: [{ isactive: true }, { isactive: { $exists: false } }],
        }),
        Internship.countDocuments({
          intern_status: "ACTIVE",
          is_published: "true",
        }),
      ]);

    const [newStudents, newCompanies, newRecruiters, newInternships] =
      await Promise.all([
        Student.countDocuments({ createdAt: { $gte: start } }),
        Company.countDocuments({ createdAt: { $gte: start } }),
        Recruiter.countDocuments({ createdAt: { $gte: start } }),
        Internship.countDocuments({ createdAt: { $gte: start } }),
      ]);

    const percentage = (value, total) =>
      total === 0 ? 0 : Math.round((value / total) * 100);

    return res.status(200).json({
      success: true,
      rangeDays,
      metrics: [
        { label: "Active students", value: studentsActive },
        { label: "Active companies", value: companiesActive },
        { label: "Open internships", value: internshipsOpen },
        { label: "Active recruiters", value: recruitersActive },
      ],
      trends: [
        { label: "New students", value: percentage(newStudents, studentsTotal) },
        { label: "New companies", value: percentage(newCompanies, companiesTotal) },
        { label: "New recruiters", value: percentage(newRecruiters, recruitersTotal) },
        { label: "New internships", value: percentage(newInternships, internshipsTotal) },
      ],
      highlights: [
        {
          title: "New student signups",
          detail: `${newStudents} in the last ${rangeDays} days`,
        },
        {
          title: "New company registrations",
          detail: `${newCompanies} in the last ${rangeDays} days`,
        },
        {
          title: "Internships published",
          detail: `${newInternships} added recently`,
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

/* ================= AUDIT LOGS ================= */
export const getAuditLogs = async (req, res) => {
  try {
    const { type, severity, search } = req.query;

    const query = {};
    if (type && type !== "ALL") query.type = type;
    if (severity && severity !== "ALL") query.severity = severity;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { actor: { $regex: search, $options: "i" } },
        { target: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(500);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
};
