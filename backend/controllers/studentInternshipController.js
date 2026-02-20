import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";

const DEFAULT_MONTHLY_APPLICATION_LIMIT = 5;
const MONTHLY_APPLICATION_LIMIT = Number.isFinite(Number(process.env.STUDENT_MONTHLY_APPLICATION_LIMIT))
  ? Math.max(1, Number(process.env.STUDENT_MONTHLY_APPLICATION_LIMIT))
  : DEFAULT_MONTHLY_APPLICATION_LIMIT;

const getMonthBounds = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
  const nextMonthStart = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { monthStart, nextMonthStart };
};

const getMonthlyAppliedCount = (entries = [], date = new Date()) => {
  const { monthStart, nextMonthStart } = getMonthBounds(date);

  return (entries || []).filter((entry) => {
    if (!entry?.appliedAt) return false;
    const appliedDate = new Date(entry.appliedAt);
    return appliedDate >= monthStart && appliedDate < nextMonthStart;
  }).length;
};

const toClientInternship = (internshipDoc) => {
  if (!internshipDoc) return null;

  const company = internshipDoc.company_id || null;
  const recruiter = internshipDoc.recruiter_id || null;

  return {
    _id: internshipDoc._id,
    id: internshipDoc._id,
    title: internshipDoc.title || "",
    company: company?.companyName || "Unknown Company",
    companyLogo: company?.logo || "",
    recruiterName: recruiter?.name || "",
    location: internshipDoc.location || "",
    workmode: internshipDoc.workmode || "",
    employment_type: internshipDoc.employment_type || "",
    duration: internshipDoc.duration || 0,
    openings: internshipDoc.openings || 0,
    stipend_min: internshipDoc.stipend_min || 0,
    stipend_max: internshipDoc.stipend_max || 0,
    skills: Array.isArray(internshipDoc.skill_req) ? internshipDoc.skill_req : [],
    perks: Array.isArray(internshipDoc.perks) ? internshipDoc.perks : [],
    about_work: internshipDoc.about_work || "",
    who_can_apply: internshipDoc.who_can_apply || "",
    deadline_at: internshipDoc.deadline_at || null,
    createdAt: internshipDoc.createdAt || null,
    intern_status: internshipDoc.intern_status || "",
    is_published: internshipDoc.is_published || "false",
  };
};

export const getStudentInternshipStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select(
      "savedInternships appliedInternships"
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const savedIds = (student.savedInternships || []).map((id) => String(id));
    const appliedIds = (student.appliedInternships || []).map((entry) =>
      String(entry.internship)
    );
    const appliedThisMonth = getMonthlyAppliedCount(student.appliedInternships || []);
    const remainingThisMonth = Math.max(0, MONTHLY_APPLICATION_LIMIT - appliedThisMonth);

    return res.status(200).json({
      success: true,
      savedIds,
      appliedIds,
      monthlyApplicationLimit: MONTHLY_APPLICATION_LIMIT,
      appliedThisMonth,
      remainingThisMonth,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedInternships = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("savedInternships")
      .populate({
        path: "savedInternships",
        populate: [
          { path: "company_id", select: "companyName logo" },
          { path: "recruiter_id", select: "name" },
        ],
      });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const savedInternships = (student.savedInternships || [])
      .filter(Boolean)
      .map(toClientInternship);

    return res.status(200).json({
      success: true,
      savedInternships,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppliedInternships = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("appliedInternships")
      .populate({
        path: "appliedInternships.internship",
        populate: [
          { path: "company_id", select: "companyName logo" },
          { path: "recruiter_id", select: "name" },
        ],
      });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const appliedInternships = (student.appliedInternships || [])
      .filter((entry) => entry?.internship)
      .map((entry) => ({
        ...toClientInternship(entry.internship),
        applicationStatus: entry.status || "APPLIED",
        appliedAt: entry.appliedAt || null,
      }));

    return res.status(200).json({
      success: true,
      appliedInternships,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ success: false, message: "Invalid internship ID" });
    }

    const internship = await Internship.findById(internshipId).select(
      "_id intern_status is_published"
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    if (internship.intern_status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Only active internships can be saved",
      });
    }

    const student = await Student.findById(req.studentId).select("savedInternships");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const alreadySaved = (student.savedInternships || []).some(
      (id) => String(id) === internshipId
    );

    if (!alreadySaved) {
      student.savedInternships = [...(student.savedInternships || []), internship._id];
      await student.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadySaved ? "Internship already saved" : "Internship saved",
      saved: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unsaveInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ success: false, message: "Invalid internship ID" });
    }

    const student = await Student.findById(req.studentId).select("savedInternships");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    student.savedInternships = (student.savedInternships || []).filter(
      (id) => String(id) !== internshipId
    );
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Internship removed from saved list",
      saved: false,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ success: false, message: "Invalid internship ID" });
    }

    const internship = await Internship.findById(internshipId).select(
      "_id intern_status"
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    if (internship.intern_status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this internship",
      });
    }

    const student = await Student.findById(req.studentId).select(
      "appliedInternships savedInternships"
    );
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const alreadyApplied = (student.appliedInternships || []).some(
      (entry) => String(entry.internship) === internshipId
    );

    if (alreadyApplied) {
      return res.status(200).json({
        success: true,
        message: "Already applied to this internship",
        applied: true,
      });
    }

    const appliedThisMonth = getMonthlyAppliedCount(student.appliedInternships || []);
    if (appliedThisMonth >= MONTHLY_APPLICATION_LIMIT) {
      return res.status(429).json({
        success: false,
        message: `Monthly application limit reached (${MONTHLY_APPLICATION_LIMIT}). Please try next month.`,
        monthlyApplicationLimit: MONTHLY_APPLICATION_LIMIT,
        appliedThisMonth,
      });
    }

    student.appliedInternships = [
      ...(student.appliedInternships || []),
      { internship: internship._id, status: "APPLIED", appliedAt: new Date() },
    ];

    const isSaved = (student.savedInternships || []).some(
      (id) => String(id) === internshipId
    );
    if (!isSaved) {
      student.savedInternships = [...(student.savedInternships || []), internship._id];
    }

    await student.save();

    return res.status(201).json({
      success: true,
      message: "Internship applied successfully",
      applied: true,
      monthlyApplicationLimit: MONTHLY_APPLICATION_LIMIT,
      appliedThisMonth: appliedThisMonth + 1,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { toClientInternship };
