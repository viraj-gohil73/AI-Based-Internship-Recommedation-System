import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";

export const createRecruiter = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      dp = "",
      name,
      email,
      password,
      role,
      gender,
      mobile,
      canpost,
    } = req.body;

    if (!name || !email || !password || !mobile || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Recruiter.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({
      dp,
      name,
      email,
      password: hashedPassword,
      role,
      gender,
      mobile,
      canpost,
      companyId: req.companyId,
    });

    return res.status(201).json({
      success: true,
      message: "Recruiter created successfully",
      recruiter,
    });

  } catch (err) {
    console.error("Create recruiter error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getRecruiters = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      console.log("Unauthorized access attempt to get recruiters");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const recruiters = await Recruiter.find({
      companyId: req.companyId,
    }).select("-password");

    return res.status(200).json({
      success: true,
      recruiters,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const getRecruiterById = async (req, res) => {
  try {
    const recruiterId = req.params.id;

    // 🔐 Auth check
    if (!req.user || !req.companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔎 Find recruiter of same company
    const recruiter = await Recruiter.findOne({
      _id: recruiterId,
      companyId: req.companyId,
    }).select("-password");

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    return res.status(200).json({
      success: true,
      recruiter,
    });
  } catch (err) {
    console.error("Get recruiter error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateRecruiter = async (req, res) => {
  try {
    const recruiterId = req.params.id;
    console.log("Updating recruiter with ID:", recruiterId);

    if (!req.user || !req.companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const recruiter = await Recruiter.findOne({
      _id: recruiterId,
      companyId: req.companyId,
    });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const {
      dp,
      name,
      email,
      password,
      role,
      gender,
      mobile,
      isactive,
      canpost,
    } = req.body;

    recruiter.dp = dp ?? recruiter.dp;
    recruiter.name = name ?? recruiter.name;
    recruiter.email = email ?? recruiter.email;
    recruiter.password = password ?? recruiter.password;
    recruiter.role = role ?? recruiter.role;
    recruiter.gender = gender ?? recruiter.gender;
    recruiter.mobile = mobile ?? recruiter.mobile;
    recruiter.isactive = isactive ?? recruiter.isactive;
    recruiter.canpost = canpost ?? recruiter.canpost;

    await recruiter.save();

    return res.status(200).json({
      success: true,
      message: "Recruiter updated successfully",
      recruiter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateRecruiterstatus = async (req, res) => {
  try {
    const recruiterId = req.params.id;
    if (!req.user || !req.companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const recruiter = await Recruiter.findOne({
      _id: recruiterId,
      companyId: req.companyId,
    });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const { isactive } = req.body;
    recruiter.isactive = isactive ?? recruiter.isactive;
    await recruiter.save();
    return res.status(200).json({
      success: true,
      message: "Recruiter status updated successfully",
      recruiter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

