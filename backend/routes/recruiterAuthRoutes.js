import express from "express";
import { loginRecruiter,getRecruiterById } from "../controllers/recruiterAuthController.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";
import { get } from "mongoose";
const router = express.Router();


router.post("/login", loginRecruiter);
router.get("/me", recruiterAuth, getRecruiterById);
export default router;