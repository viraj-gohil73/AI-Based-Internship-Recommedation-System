import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";
import { normalizeSkillArray } from "../utils/skillNormalization.js";

const ALLOWED_STATUSES = ["ACTIVE", "CLOSED", "DRAFT"];


const normalizeStringArrayInput = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

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
  is_published: doc.is_published || "false",
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
    const {
      title,
      employment_type,
      workmode,
      mode,
      location,
      duration,
      duration_months,
      openings,
      stipend_min,
      stipend_max,
      starting_date,
      start_date,
      deadline_at,
      apply_by_date,
      about_work,
      who_can_apply,
      other_req,
      other_requirements,
      intern_status,
      skill_req,
      perks,
    } = req.body;

    if (typeof title !== "undefined") updates.title = title;
    if (typeof employment_type !== "undefined") updates.employment_type = employment_type;
    if (typeof workmode !== "undefined" || typeof mode !== "undefined") {
      updates.workmode = typeof workmode !== "undefined" ? workmode : mode;
    }
    if (typeof location !== "undefined") updates.location = location;
    if (typeof duration !== "undefined" || typeof duration_months !== "undefined") {
      updates.duration = typeof duration !== "undefined" ? duration : duration_months;
    }
    if (typeof openings !== "undefined") updates.openings = openings;
    if (typeof stipend_min !== "undefined") updates.stipend_min = stipend_min;
    if (typeof stipend_max !== "undefined") updates.stipend_max = stipend_max;
    if (typeof starting_date !== "undefined" || typeof start_date !== "undefined") {
      updates.starting_date =
        typeof starting_date !== "undefined" ? starting_date : start_date;
    }
    if (typeof deadline_at !== "undefined" || typeof apply_by_date !== "undefined") {
      updates.deadline_at =
        typeof deadline_at !== "undefined" ? deadline_at : apply_by_date;
    }
    if (typeof about_work !== "undefined") updates.about_work = about_work;
    if (typeof who_can_apply !== "undefined") updates.who_can_apply = who_can_apply;
    if (typeof other_req !== "undefined" || typeof other_requirements !== "undefined") {
      updates.other_req =
        typeof other_req !== "undefined" ? other_req : other_requirements;
    }
    if (typeof intern_status !== "undefined") updates.intern_status = intern_status;
    if (typeof skill_req !== "undefined") {
      updates.skill_req = normalizeSkillArray(skill_req);
    }
    if (typeof perks !== "undefined") {
      updates.perks = normalizeStringArrayInput(perks);
    }

    const nextStipendMin =
      typeof updates.stipend_min !== "undefined"
        ? Number(updates.stipend_min)
        : Number(internship.stipend_min || 0);
    const nextStipendMax =
      typeof updates.stipend_max !== "undefined"
        ? Number(updates.stipend_max)
        : Number(internship.stipend_max || 0);

    if (
      Number.isFinite(nextStipendMin) &&
      Number.isFinite(nextStipendMax) &&
      nextStipendMin > nextStipendMax
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
