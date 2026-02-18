import express from "express";
import { createInternship } from "../controllers/internshipcontroller.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";
import { requireSubscriptionFeature } from "../middlewares/requireSubscriptionFeature.js";

const router = express.Router();

/* POST: Create Internship */
router.post(
  "/",
  recruiterAuth,
  requireSubscriptionFeature("INTERNSHIP_CREATE"),
  createInternship
);

export default router;
