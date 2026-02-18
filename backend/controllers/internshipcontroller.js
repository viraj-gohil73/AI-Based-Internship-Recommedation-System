import Internship from "../models/Internship.js";

export const createInternship = async (req, res) => {
  try {
    const {
      title,
      skill_req,
      stipend_min,
      stipend_max,
      starting_date,
      deadline_at,
      duration,
      location,
      workmode,
      employment_type,
      openings,
      about_work,
      who_can_apply,
      other_req,
      intern_status,
      is_published,
      perks,
      recruiter_id,
      company_id,
    } = req.body;

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
  workmode,
  location,
  duration,
  openings,

  /* TIMELINE */
  starting_date,
  deadline_at,

  /* STIPEND */
  stipend_min,
  stipend_max,

  /* SKILLS & PERKS */
  skill_req,
  perks,

  /* CONTENT */
  about_work,
  who_can_apply,
  other_req,

  /* STATUS */
  intern_status,
  is_published,

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
