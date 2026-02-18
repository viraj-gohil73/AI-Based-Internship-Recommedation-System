import express from "express";
import { loginRecruiter,getRecruiterById } from "../controllers/recruiterAuthController.js";
import { recruiterAuth } from "../middlewares/recruiterAuth.js";
import { getRecruiterCurrentSubscription } from "../controllers/subscriptionController.js";
//import { get } from "mongoose";
import Internship from "../models/Internship.js";

const router = express.Router();


router.post("/login", loginRecruiter);
router.get("/me", recruiterAuth, getRecruiterById);
router.get("/subscription/current", recruiterAuth, getRecruiterCurrentSubscription);
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
export default router;
