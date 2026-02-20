import Internship from "../models/Internship.js";

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

export const createInternship = async (req, res) => {
  try {
    const {
      title,
      skill_req,
      stipend_min,
      stipend_max,
      starting_date,
      start_date,
      deadline_at,
      apply_by_date,
      duration,
      duration_months,
      location,
      workmode,
      mode,
      employment_type,
      openings,
      about_work,
      who_can_apply,
      other_req,
      other_requirements,
      intern_status,
      is_published,
      publish,
      perks,
    } = req.body;

    const normalizedStartDate = starting_date || start_date || null;
    const normalizedDeadline = deadline_at || apply_by_date || null;
    const normalizedDuration = duration || duration_months || 0;
    const normalizedWorkmode = workmode || mode || "";
    const normalizedOtherReq = other_req || other_requirements || "";
    const normalizedIsPublished =
      typeof is_published !== "undefined"
        ? String(is_published)
        : typeof publish !== "undefined"
        ? String(publish)
        : "false";

    /* ===== BASIC VALIDATION ===== */
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (stipend_min && stipend_max && stipend_min > stipend_max) {
      return res
        .status(400)
        .json({ message: "Stipend min cannot be greater than max" });
    }

    /* ===== CREATE DOCUMENT ===== */
    const internship = await Internship.create({
      /* BASIC INFO */
      title,
      employment_type,
      workmode: normalizedWorkmode,
      location,
      duration: normalizedDuration,
      openings,

      /* TIMELINE */
      starting_date: normalizedStartDate,
      deadline_at: normalizedDeadline,

      /* STIPEND */
      stipend_min,
      stipend_max,

      /* SKILLS & PERKS */
      skill_req,
      perks,

      /* CONTENT */
      about_work,
      who_can_apply,
      other_req: normalizedOtherReq,

      /* STATUS */
      intern_status,
      is_published: normalizedIsPublished,

      recruiter_id: req.recruiter._id,
      company_id: req.recruiter.companyId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Internship created successfully",
      data: internship,
    });
  } catch (error) {
    console.error("Create Internship Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getExploreInternships = async (req, res) => {
  try {
    const internships = await Internship.find({
      intern_status: "ACTIVE",
    })
      .populate("company_id", "companyName logo")
      .populate("recruiter_id", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      internships: internships.map(toClientInternship),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch internships",
    });
  }
};
