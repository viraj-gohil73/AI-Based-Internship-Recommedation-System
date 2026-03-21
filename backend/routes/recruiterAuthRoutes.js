import express from "express";
import mongoose from "mongoose";
import {
  loginRecruiter,
  getRecruiterById,
  getRecruiterApplicants,
  updateApplicationStatus,
  getStudentProfileForRecruiter,
  getRecruiterApplicantDetail,
  getRecruiterInterviews,
  createRecruiterInterview,
  updateRecruiterInterview,
} from "../controllers/recruiterAuthController.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";
import { getRecruiterCurrentSubscription } from "../controllers/subscriptionController.js";
//import { get } from "mongoose";
import Internship from "../models/Internship.js";
import {
  createNotification,
  runNotificationTask,
} from "../services/notificationService.js";
import { normalizeSkillArray } from "../utils/skillNormalization.js";

const router = express.Router();


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


router.post("/login", loginRecruiter);
router.get("/me", recruiterAuth, getRecruiterById);
router.get("/subscription/current", recruiterAuth, getRecruiterCurrentSubscription);
router.get("/applicants", recruiterAuth, getRecruiterApplicants);
router.get(
  "/applications/:internshipId/:studentId",
  recruiterAuth,
  getRecruiterApplicantDetail
);
router.get("/students/:studentId", recruiterAuth, getStudentProfileForRecruiter);
router.patch(
  "/applications/:internshipId/:studentId/status",
  recruiterAuth,
  updateApplicationStatus
);
router.get("/interviews", recruiterAuth, getRecruiterInterviews);
router.post("/interviews", recruiterAuth, createRecruiterInterview);
router.patch("/interviews/:id", recruiterAuth, updateRecruiterInterview);
router.get("/internships", recruiterAuth, async (req, res) => {
    
  try {
    const internships = await Internship.find({
      recruiter_id: req.recruiter._id,
    }).sort({ createdAt: -1 });
    console.log("req", req.recruiter._id, internships);
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/internships/:id", recruiterAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship id" });
    }

    const internship = await Internship.findOne({
      _id: id,
      recruiter_id: req.recruiter._id,
    });

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.status(200).json(internship);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/internships/:id", recruiterAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship id" });
    }

    const internship = await Internship.findOne({
      _id: id,
      recruiter_id: req.recruiter._id,
    });
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
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
      skill_req,
      perks,
      intern_status,
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
    if (typeof skill_req !== "undefined") {
      updates.skill_req = normalizeSkillArray(skill_req);
    }
    if (typeof perks !== "undefined") {
      updates.perks = normalizeStringArrayInput(perks);
    }
    if (typeof intern_status !== "undefined") updates.intern_status = intern_status;

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
      return res.status(400).json({ message: "Stipend min cannot be greater than stipend max" });
    }

    const updated = await Internship.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Internship updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/internships/:id/status", recruiterAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { intern_status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship id" });
    }

    if (!["ACTIVE", "CLOSED", "DRAFT"].includes(intern_status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Internship.findOneAndUpdate(
      { _id: id, recruiter_id: req.recruiter._id },
      { intern_status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Internship not found" });
    }

    await runNotificationTask("update-internship-status", async () => {
      const internshipTitle = updated.title || "Internship";

      await createNotification({
        recipientModel: "Recruiter",
        recipientId: req.recruiter._id,
        type: "INTERNSHIP_STATUS_UPDATED",
        title: "Internship status updated",
        message: `${internshipTitle} is now ${intern_status}.`,
        entityType: "Internship",
        entityId: updated._id,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Internship status updated",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});
export default router;
