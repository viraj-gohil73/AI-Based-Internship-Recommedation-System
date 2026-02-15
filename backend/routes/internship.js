import express from "express";
import { createInternship } from "../controllers/internshipcontroller.js";


const router = express.Router();

/* POST: Create Internship */
router.post(
  "/",
  createInternship
);

export default router;
