import express from "express";
import {
  createInternship,
  getExploreInternships,
} from "../controllers/internshipcontroller.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";
import { requireSubscriptionFeature } from "../middlewares/requireSubscriptionFeature.js";

const router = express.Router();

/* GET: Public list for student explore page */
router.get("/explore", getExploreInternships);

/* POST: Create Internship */
router.post(
  "/",
  recruiterAuth,
  requireSubscriptionFeature("INTERNSHIP_CREATE"),
  createInternship
);

export default router;
