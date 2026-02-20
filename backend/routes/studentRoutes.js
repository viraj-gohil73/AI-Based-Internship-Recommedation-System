import express from "express";
import {
  changeStudentPassword,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";
import { studentAuth } from "../middlewares/studentAuth.js";
import {
  applyInternship,
  getAppliedInternships,
  getSavedInternships,
  getStudentInternshipStatus,
  saveInternship,
  unsaveInternship,
} from "../controllers/studentInternshipController.js";

const router = express.Router();

router.get("/profile", studentAuth, getStudentProfile);
router.put("/profile", studentAuth, updateStudentProfile);
router.post("/change-password", studentAuth, changeStudentPassword);
router.get("/internships/status", studentAuth, getStudentInternshipStatus);
router.get("/internships/saved", studentAuth, getSavedInternships);
router.get("/internships/applied", studentAuth, getAppliedInternships);
router.post("/internships/:internshipId/save", studentAuth, saveInternship);
router.delete("/internships/:internshipId/save", studentAuth, unsaveInternship);
router.post("/internships/:internshipId/apply", studentAuth, applyInternship);

export default router;
