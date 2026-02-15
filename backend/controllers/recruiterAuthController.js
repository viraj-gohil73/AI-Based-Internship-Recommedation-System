import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find recruiter
    const recruiter = await Recruiter.findOne({ email }).select("+password");

    if (!recruiter) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Check status
    if (recruiter.status === "BLOCKED") {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5️⃣ Generate token ✅ FIXED
    const token = jwt.sign(
      { id: recruiter._id, role: "RECRUITER" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Success response
    return res.status(200).json({
      message: "Login successful",
      token,
      recruiter: {
        _id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        companyId: recruiter.companyId,
      },
    });

  } catch (error) {
    console.error("Recruiter login error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const getRecruiterById = async (req, res) => {
  try {
    return res.status(200).json({
      data: req.recruiter, // ✅ already fetched
    });
  } catch (error) {
    console.error("Get recruiter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
