import jwt from "jsonwebtoken";
import Recruiter from "../models/Recruiter.js";

export const recruiterAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const recruiter = await Recruiter.findById(decoded.id).select("-password");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    req.recruiter = recruiter;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
