import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";

const ALLOWED_STATUSES = ["ACTIVE", "CLOSED", "DRAFT"];

const toCompanyInternship = (doc, applicationsCountMap = new Map()) => ({
  _id: doc._id,
  id: doc._id,
  title: doc.title || "",
  recruiter: doc.recruiter_id
    ? {
        _id: doc.recruiter_id._id,
        name: doc.recruiter_id.name || "",
        email: doc.recruiter_id.email || "",
      }
    : null,
  workmode: doc.workmode || "",
  location: doc.location || "",
  stipend_min: doc.stipend_min ?? 0,
  stipend_max: doc.stipend_max ?? 0,
  openings: doc.openings ?? 0,
  duration: doc.duration ?? 0,
  employment_type: doc.employment_type || "",
  intern_status: doc.intern_status || "DRAFT",
  starting_date: doc.starting_date || null,
  deadline_at: doc.deadline_at || null,
  skill_req: Array.isArray(doc.skill_req) ? doc.skill_req : [],
  perks: Array.isArray(doc.perks) ? doc.perks : [],
  about_work: doc.about_work || "",
  who_can_apply: doc.who_can_apply || "",
  other_req: doc.other_req || "",
  createdAt: doc.createdAt || null,
  updatedAt: doc.updatedAt || null,
  applicationsCount: applicationsCountMap.get(String(doc._id)) || 0,
});

export const listCompanyInternships = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const internships = await Internship.find({ company_id: req.companyId })
      .populate("recruiter_id", "name email")
      .sort({ createdAt: -1 });

    if (!internships.length) {
      return res.status(200).json({
        success: true,
        internships: [],
      });
    }

    const internshipIds = internships.map((item) => item._id);
    const applicationCounts = await Student.aggregate([
      { $unwind: "$appliedInternships" },
      {
        $match: {
          "appliedInternships.internship": { $in: internshipIds },
        },
      },
      {
        $group: {
          _id: "$appliedInternships.internship",
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationsCountMap = new Map(
      applicationCounts.map((row) => [String(row._id), row.count || 0])
    );

    return res.status(200).json({
      success: true,
      internships: internships.map((item) =>
        toCompanyInternship(item, applicationsCountMap)
      ),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch company internships",
    });
  }
};

export const getCompanyInternshipById = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid internship id" });
    }

    const internship = await Internship.findOne({
      _id: id,
      company_id: req.companyId,
    }).populate("recruiter_id", "name email");

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    const applicationsCount = await Student.countDocuments({
      "appliedInternships.internship": internship._id,
    });

    return res.status(200).json({
      success: true,
      internship: toCompanyInternship(
        internship,
        new Map([[String(internship._id), applicationsCount]])
      ),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch internship",
    });
  }
};

export const updateCompanyInternship = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid internship id" });
    }

    const internship = await Internship.findOne({
      _id: id,
      company_id: req.companyId,
    });
    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    const updates = {};
    const fields = [
      "title",
      "employment_type",
      "workmode",
      "location",
      "duration",
      "openings",
      "stipend_min",
      "stipend_max",
      "starting_date",
      "deadline_at",
      "about_work",
      "who_can_apply",
      "other_req",
      "intern_status",
    ];

    for (const field of fields) {
      if (typeof req.body[field] !== "undefined") {
        updates[field] = req.body[field];
      }
    }

    if (Array.isArray(req.body.skill_req)) {
      updates.skill_req = req.body.skill_req;
    }
    if (Array.isArray(req.body.perks)) {
      updates.perks = req.body.perks;
    }

    if (
      typeof updates.stipend_min !== "undefined" &&
      typeof updates.stipend_max !== "undefined" &&
      Number(updates.stipend_min) > Number(updates.stipend_max)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stipend min cannot be greater than stipend max",
      });
    }

    if (
      typeof updates.intern_status !== "undefined" &&
      !ALLOWED_STATUSES.includes(updates.intern_status)
    ) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Internship.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("recruiter_id", "name email");

    return res.status(200).json({
      success: true,
      message: "Internship updated successfully",
      internship: toCompanyInternship(updated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update internship",
    });
  }
};

export const updateCompanyInternshipStatus = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { intern_status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid internship id" });
    }
    if (!ALLOWED_STATUSES.includes(intern_status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Internship.findOneAndUpdate(
      { _id: id, company_id: req.companyId },
      { intern_status },
      { new: true, runValidators: true }
    ).populate("recruiter_id", "name email");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Internship status updated successfully",
      internship: toCompanyInternship(updated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update internship status",
    });
  }
};
