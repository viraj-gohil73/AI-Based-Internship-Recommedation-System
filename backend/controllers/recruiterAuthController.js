import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";
import Interview from "../models/Interview.js";
import {
  createNotification,
  runNotificationTask,
} from "../services/notificationService.js";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];
const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const INTERVIEW_MODES = ["ONLINE", "OFFLINE", "PHONE"];

const resolveRecruiterApplicationContext = async (recruiterId, internshipId, studentId) => {
  if (
    !mongoose.Types.ObjectId.isValid(internshipId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return { error: { code: 400, message: "Invalid id provided" } };
  }

  const internship = await Internship.findOne({
    _id: internshipId,
    recruiter_id: recruiterId,
  }).select("_id title company_id");

  if (!internship) {
    return { error: { code: 404, message: "Internship not found" } };
  }

  const student = await Student.findOne(
    {
      _id: studentId,
      "appliedInternships.internship": internshipId,
    },
    {
      fname: 1,
      lname: 1,
      email: 1,
      profilePic: 1,
      phone_no: 1,
      city: 1,
      state: 1,
      address: 1,
      dob: 1,
      gender: 1,
      currentCourse: 1,
      cgpa: 1,
      skills: 1,
      preferredLocation: 1,
      languages: 1,
      hobbies: 1,
      projects: 1,
      educations: 1,
      certificates: 1,
      socialLinks: 1,
      resume: 1,
      resumes: 1,
      createdAt: 1,
      appliedInternships: 1,
    }
  ).lean();

  if (!student) {
    return { error: { code: 404, message: "Application not found" } };
  }

  const application = (student.appliedInternships || []).find(
    (entry) => String(entry.internship) === String(internshipId)
  );

  if (!application) {
    return { error: { code: 404, message: "Application not found" } };
  }

  return { internship, student, application };
};

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

    if (recruiter.isactive === false || recruiter.status === "BLOCKED") {
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

    const loginAt = new Date();
    await Recruiter.updateOne(
      { _id: recruiter._id },
      { $set: { last_login: loginAt } }
    );

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
        last_login: loginAt,
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
        dob: 1,
        gender: 1,
        currentCourse: 1,
        cgpa: 1,
        skills: 1,
        profilePic: 1,
        resume: 1,
        resumes: 1,
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
            dob: student.dob || null,
            gender: student.gender || "",
            currentCourse: student.currentCourse || "",
            cgpa: student.cgpa || "",
            resume: entry?.resumeUrl || student.resume || "",
            resumeName: entry?.resumeName || "",
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
    }).select("_id title company_id");

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const applicationUpdate = { "appliedInternships.$.status": status };

    if (status === "REJECTED") {
      applicationUpdate["appliedInternships.$.rejectedAt"] = new Date();
    } else {
      applicationUpdate["appliedInternships.$.rejectedAt"] = null;
    }

    const updateResult = await Student.updateOne(
      { _id: studentId, "appliedInternships.internship": internshipId },
      { $set: applicationUpdate }
    );

    if (!updateResult.matchedCount) {
      return res.status(404).json({ message: "Application not found" });
    }

    await runNotificationTask("update-application-status", async () => {
      const internshipTitle = internship.title || "Internship";

      await createNotification({
        recipientModel: "Student",
        recipientId: studentId,
        type: "APPLICATION_STATUS_UPDATED",
        title: "Application status updated",
        message: `Your application for ${internshipTitle} is now ${status}.`,
        entityType: "Internship",
        entityId: internship._id,
        metadata: { status, recruiterId: req.recruiter?._id || null },
      });

      await createNotification({
        recipientModel: "Recruiter",
        recipientId: req.recruiter?._id,
        type: "APPLICATION_STATUS_UPDATED",
        title: "Application status updated",
        message: `You updated ${internshipTitle} application status to ${status}.`,
        entityType: "Internship",
        entityId: internship._id,
        metadata: { status, studentId },
      });
    });

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
      dob: 1,
      gender: 1,
      currentCourse: 1,
      cgpa: 1,
      skills: 1,
      preferredLocation: 1,
      languages: 1,
      hobbies: 1,
      projects: 1,
      educations: 1,
      certificates: 1,
      socialLinks: 1,
      resume: 1,
      resumes: 1,
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

export const getRecruiterApplicantDetail = async (req, res) => {
  try {
    const { internshipId, studentId } = req.params;
    const context = await resolveRecruiterApplicationContext(
      req.recruiter?._id,
      internshipId,
      studentId
    );

    if (context.error) {
      return res.status(context.error.code).json({ message: context.error.message });
    }

    const { internship, student, application } = context;
    const interviews = await Interview.find({
      recruiterId: req.recruiter?._id,
      internshipId,
      studentId,
    })
      .sort({ scheduledAt: -1 })
      .lean();

    return res.status(200).json({
      internship: {
        _id: internship._id,
        title: internship.title || "Internship",
      },
      application: {
        internshipId: String(internship._id),
        studentId: String(student._id),
        status: application.status || "APPLIED",
        appliedAt: application.appliedAt || null,
        resumeUrl: application.resumeUrl || student.resume || "",
        resumeName: application.resumeName || "",
      },
      student: {
        ...student,
        appliedInternships: undefined,
      },
      interviews,
    });
  } catch (error) {
    console.error("Get recruiter applicant detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRecruiterInterviews = async (req, res) => {
  try {
    const { status, internshipId } = req.query;
    const filter = { recruiterId: req.recruiter?._id };

    if (status) {
      if (!INTERVIEW_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid interview status" });
      }
      filter.status = status;
    }

    if (internshipId) {
      if (!mongoose.Types.ObjectId.isValid(internshipId)) {
        return res.status(400).json({ message: "Invalid internship id" });
      }
      filter.internshipId = internshipId;
    }

    const interviews = await Interview.find(filter)
      .sort({ scheduledAt: 1 })
      .populate("internshipId", "title")
      .populate("studentId", "fname lname email profilePic phone_no")
      .lean();

    return res.status(200).json({ interviews });
  } catch (error) {
    console.error("Get recruiter interviews error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createRecruiterInterview = async (req, res) => {
  try {
    const {
      internshipId,
      studentId,
      scheduledAt,
      durationMinutes,
      mode = "ONLINE",
      meetingLink = "",
      location = "",
      notes = "",
    } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required" });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledAt value" });
    }

    if (!INTERVIEW_MODES.includes(mode)) {
      return res.status(400).json({ message: "Invalid interview mode" });
    }

    const context = await resolveRecruiterApplicationContext(
      req.recruiter?._id,
      internshipId,
      studentId
    );
    if (context.error) {
      return res.status(context.error.code).json({ message: context.error.message });
    }

    const { internship } = context;
    const interview = await Interview.create({
      recruiterId: req.recruiter?._id,
      companyId: internship.company_id || req.recruiter?.companyId || null,
      internshipId,
      studentId,
      scheduledAt: scheduledDate,
      durationMinutes:
        Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0
          ? Number(durationMinutes)
          : 30,
      mode,
      meetingLink: `${meetingLink || ""}`.trim(),
      location: `${location || ""}`.trim(),
      notes: `${notes || ""}`.trim(),
      status: "SCHEDULED",
    });

    await Student.updateOne(
      { _id: studentId, "appliedInternships.internship": internshipId },
      {
        $set: {
          "appliedInternships.$.status": "INTERVIEW",
          "appliedInternships.$.rejectedAt": null,
        },
      }
    );

    await runNotificationTask("schedule-interview", async () => {
      await createNotification({
        recipientModel: "Recruiter",
        recipientId: req.recruiter?._id,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview scheduled",
        message: `Interview scheduled for ${internship.title || "an application"}.`,
        entityType: "Internship",
        entityId: internship._id,
        metadata: {
          interviewId: interview._id,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
          studentId,
        },
      });

      await createNotification({
        recipientModel: "Student",
        recipientId: studentId,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview scheduled",
        message: `Interview scheduled for ${internship.title || "your application"}.`,
        entityType: "Internship",
        entityId: internship._id,
        metadata: {
          interviewId: interview._id,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
        },
      });
    });

    return res.status(201).json({
      message: "Interview scheduled",
      interview,
    });
  } catch (error) {
    console.error("Create recruiter interview error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateRecruiterInterview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid interview id" });
    }

    const interview = await Interview.findOne({ _id: id, recruiterId: req.recruiter?._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const updates = {};
    const { scheduledAt, durationMinutes, mode, meetingLink, location, notes, status } = req.body;

    if (typeof scheduledAt !== "undefined") {
      const parsed = new Date(scheduledAt);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ message: "Invalid scheduledAt value" });
      }
      updates.scheduledAt = parsed;
    }

    if (typeof durationMinutes !== "undefined") {
      const parsedDuration = Number(durationMinutes);
      if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
        return res.status(400).json({ message: "Invalid durationMinutes value" });
      }
      updates.durationMinutes = parsedDuration;
    }

    if (typeof mode !== "undefined") {
      if (!INTERVIEW_MODES.includes(mode)) {
        return res.status(400).json({ message: "Invalid interview mode" });
      }
      updates.mode = mode;
    }

    if (typeof status !== "undefined") {
      if (!INTERVIEW_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid interview status" });
      }
      updates.status = status;
    }

    if (typeof meetingLink !== "undefined") updates.meetingLink = `${meetingLink || ""}`.trim();
    if (typeof location !== "undefined") updates.location = `${location || ""}`.trim();
    if (typeof notes !== "undefined") updates.notes = `${notes || ""}`.trim();

    const updated = await Interview.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Interview updated",
      interview: updated,
    });
  } catch (error) {
    console.error("Update recruiter interview error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

