import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];

export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const recruiter = await Recruiter.findOne({ email }).select("+password");

    if (!recruiter) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (recruiter.status === "BLOCKED") {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: recruiter._id, role: "RECRUITER" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
      data: req.recruiter,
    });
  } catch (error) {
    console.error("Get recruiter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRecruiterApplicants = async (req, res) => {
  try {
    const internships = await Internship.find(
      { recruiter_id: req.recruiter?._id },
      { _id: 1, title: 1 }
    ).lean();

    if (!internships.length) {
      return res.status(200).json({ applicants: [] });
    }

    const internshipTitleMap = new Map(
      internships.map((item) => [String(item._id), item.title])
    );

    const students = await Student.find(
      {
        "appliedInternships.internship": { $in: internships.map((item) => item._id) },
      },
      {
        fname: 1,
        lname: 1,
        email: 1,
        phone_no: 1,
        city: 1,
        state: 1,
        skills: 1,
        profilePic: 1,
        resume: 1,
        appliedInternships: 1,
      }
    ).lean();

    const applicants = [];

    students.forEach((student) => {
      const studentName = `${student.fname || ""} ${student.lname || ""}`.trim();

      (student.appliedInternships || []).forEach((entry) => {
        const internshipId = String(entry?.internship || "");
        if (!internshipTitleMap.has(internshipId)) return;

        applicants.push({
          applicationId: `${student._id}:${internshipId}`,
          studentId: student._id,
          internshipId,
          internshipTitle: internshipTitleMap.get(internshipId) || "Internship",
          status: entry?.status || "APPLIED",
          appliedAt: entry?.appliedAt || null,
          student: {
            name: studentName || "Unnamed Student",
            email: student.email || "",
            phone: student.phone_no || "",
            city: student.city || "",
            state: student.state || "",
            skills: Array.isArray(student.skills) ? student.skills : [],
            profilePic: student.profilePic || "",
            resume: student.resume || "",
          },
        });
      });
    });

    applicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    return res.status(200).json({ applicants });
  } catch (error) {
    console.error("Recruiter applicants error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { internshipId, studentId } = req.params;
    const { status } = req.body;

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(internshipId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({ message: "Invalid id provided" });
    }

    const internship = await Internship.findOne({
      _id: internshipId,
      recruiter_id: req.recruiter?._id,
    }).select("_id");

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const updateResult = await Student.updateOne(
      { _id: studentId, "appliedInternships.internship": internshipId },
      { $set: { "appliedInternships.$.status": status } }
    );

    if (!updateResult.matchedCount) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({
      message: "Application status updated",
      status,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentProfileForRecruiter = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const recruiterInternships = await Internship.find(
      { recruiter_id: req.recruiter?._id },
      { _id: 1 }
    ).lean();

    if (!recruiterInternships.length) {
      return res.status(403).json({ message: "No access to this student profile" });
    }

    const hasAccess = await Student.exists({
      _id: studentId,
      "appliedInternships.internship": {
        $in: recruiterInternships.map((item) => item._id),
      },
    });

    if (!hasAccess) {
      return res.status(403).json({ message: "No access to this student profile" });
    }

    const student = await Student.findById(studentId, {
      fname: 1,
      lname: 1,
      email: 1,
      profilePic: 1,
      phone_no: 1,
      city: 1,
      state: 1,
      address: 1,
      skills: 1,
      preferredLocation: 1,
      languages: 1,
      hobbies: 1,
      projects: 1,
      educations: 1,
      certificates: 1,
      socialLinks: 1,
      resume: 1,
      createdAt: 1,
    }).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ student });
  } catch (error) {
    console.error("Get student profile for recruiter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
