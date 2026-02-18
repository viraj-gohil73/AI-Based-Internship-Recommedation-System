import express from "express";
import { createInternship } from "../controllers/internshipcontroller.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";

const router = express.Router();

/* POST: Create Internship */
router.post(
  "/",
recruiterAuth,
  createInternship
);

export default router;
