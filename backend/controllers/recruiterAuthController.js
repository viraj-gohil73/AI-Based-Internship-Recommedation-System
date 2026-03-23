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
import { normalizeSkillArray } from "../utils/skillNormalization.js";
import { scoreStudentForInternship } from "../services/recommendationService.js";

const APPLICATION_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];
const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const INTERVIEW_MODES = ["ONLINE", "OFFLINE", "PHONE"];

const normalizeInternshipForScoring = (internship = {}, applicationsCount = 0) => ({
  id: String(internship?._id || internship?.id || ""),
  _id: internship?._id || internship?.id || "",
  title: internship?.title || "",
  skills: normalizeSkillArray(
    Array.isArray(internship?.skill_req)
      ? internship.skill_req
      : Array.isArray(internship?.skills)
        ? internship.skills
        : []
  ),
  skill_req: normalizeSkillArray(
    Array.isArray(internship?.skill_req)
      ? internship.skill_req
      : Array.isArray(internship?.skills)
        ? internship.skills
        : []
  ),
  about_work: internship?.about_work || "",
  who_can_apply: internship?.who_can_apply || "",
  other_req: internship?.other_req || "",
  location: internship?.location || "",
  workmode: internship?.workmode || internship?.mode || "",
  mode: internship?.mode || internship?.workmode || "",
  createdAt: internship?.createdAt || null,
  applicationsCount: Number(applicationsCount || 0),
});

const rankComparator = (a, b) => {
  const scoreDiff = Number(b?.aiScore || 0) - Number(a?.aiScore || 0);
  if (scoreDiff !== 0) return scoreDiff;

  const eligibilityWeight = (value) => (value === true ? 1 : value === false ? 0 : 0.5);
  const eligibilityDiff =
    eligibilityWeight(b?.scoreMeta?.eligibilityMatch) - eligibilityWeight(a?.scoreMeta?.eligibilityMatch);
  if (eligibilityDiff !== 0) return eligibilityDiff;

  return new Date(b?.appliedAt || 0).getTime() - new Date(a?.appliedAt || 0).getTime();
};

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
      {
        _id: 1,
        title: 1,
        skill_req: 1,
        about_work: 1,
        who_can_apply: 1,
        other_req: 1,
        location: 1,
        workmode: 1,
        mode: 1,
        createdAt: 1,
      }
    ).lean();

    if (!internships.length) {
      return res.status(200).json({ applicants: [] });
    }

    const internshipIds = internships.map((item) => item._id);
    const internshipTitleMap = new Map(internships.map((item) => [String(item._id), item.title || "Internship"]));

    const students = await Student.find(
      {
        "appliedInternships.internship": { $in: internshipIds },
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
        preferredLocation: 1,
        projects: 1,
        certificates: 1,
        educations: 1,
        profilePic: 1,
        resume: 1,
        resumes: 1,
        appliedInternships: 1,
      }
    ).lean();

    const applicationsCountMap = new Map();
    students.forEach((student) => {
      (student.appliedInternships || []).forEach((entry) => {
        const internshipId = String(entry?.internship || "");
        if (!internshipTitleMap.has(internshipId)) return;
        applicationsCountMap.set(internshipId, Number(applicationsCountMap.get(internshipId) || 0) + 1);
      });
    });

    const internshipScoreMap = new Map(
      internships.map((internship) => {
        const internshipId = String(internship._id);
        return [
          internshipId,
          normalizeInternshipForScoring(internship, applicationsCountMap.get(internshipId) || 0),
        ];
      })
    );

    const applicants = [];

    for (const student of students) {
      const studentName = `${student.fname || ""} ${student.lname || ""}`.trim();

      for (const entry of student.appliedInternships || []) {
        const internshipId = String(entry?.internship || "");
        if (!internshipTitleMap.has(internshipId)) continue;

        const internshipForScore = internshipScoreMap.get(internshipId);
        let aiScore = 0;
        let scoreBreakdown = {};
        let scoreMeta = { eligibilityMatch: null };

        if (internshipForScore) {
          try {
            const ranked = await scoreStudentForInternship(student, internshipForScore);
            aiScore = Number(ranked?.score || 0);
            scoreBreakdown = ranked?.scoreBreakdown || {};
            scoreMeta = {
              eligibilityMatch: ranked?.eligibilityMatch ?? null,
            };
          } catch {
            aiScore = 0;
            scoreBreakdown = {};
            scoreMeta = { eligibilityMatch: null };
          }
        }

        applicants.push({
          applicationId: `${student._id}:${internshipId}`,
          studentId: student._id,
          internshipId,
          internshipTitle: internshipTitleMap.get(internshipId) || "Internship",
          status: entry?.status || "APPLIED",
          appliedAt: entry?.appliedAt || null,
          statusUpdatedAt: entry?.statusUpdatedAt || null,
          shortlistedAt: entry?.shortlistedAt || null,
          interviewAt: entry?.interviewAt || null,
          selectedAt: entry?.selectedAt || null,
          rejectedAt: entry?.rejectedAt || null,
          statusHistory: Array.isArray(entry?.statusHistory) ? entry.statusHistory : [],
          aiScore: Number.isFinite(aiScore) ? Number(aiScore.toFixed(2)) : 0,
          rank: null,
          scoreBreakdown,
          scoreMeta,
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
      }
    }

    const grouped = new Map();
    applicants.forEach((applicant) => {
      const internshipId = String(applicant.internshipId || "");
      if (!grouped.has(internshipId)) grouped.set(internshipId, []);
      grouped.get(internshipId).push(applicant);
    });

    grouped.forEach((group) => {
      group.sort(rankComparator);
      group.forEach((item, index) => {
        item.rank = index + 1;
      });
    });

    applicants.sort((a, b) => {
      if (String(a.internshipId) === String(b.internshipId)) {
        return Number(a?.rank || Number.MAX_SAFE_INTEGER) - Number(b?.rank || Number.MAX_SAFE_INTEGER);
      }
      return new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime();
    });

    const sanitizedApplicants = applicants.map((item) => {
      const { scoreMeta: _scoreMeta, ...rest } = item;
      return rest;
    });

    return res.status(200).json({ applicants: sanitizedApplicants });
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

    const now = new Date();
    const applicationUpdate = {
      "appliedInternships.$.status": status,
      "appliedInternships.$.statusUpdatedAt": now,
    };

    if (status === "SHORTLISTED") {
      applicationUpdate["appliedInternships.$.shortlistedAt"] = now;
    }
    if (status === "INTERVIEW") {
      applicationUpdate["appliedInternships.$.interviewAt"] = now;
    }
    if (status === "SELECTED") {
      applicationUpdate["appliedInternships.$.selectedAt"] = now;
    }
    if (status === "REJECTED") {
      applicationUpdate["appliedInternships.$.rejectedAt"] = now;
    }

    const updateResult = await Student.updateOne(
      { _id: studentId, "appliedInternships.internship": internshipId },
      {
        $set: applicationUpdate,
        $push: {
          "appliedInternships.$.statusHistory": {
            status,
            changedAt: now,
            changedByRecruiter: req.recruiter?._id || null,
          },
        },
      }
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

    const now = new Date();
    await Student.updateOne(
      { _id: studentId, "appliedInternships.internship": internshipId },
      {
        $set: {
          "appliedInternships.$.status": "INTERVIEW",
          "appliedInternships.$.statusUpdatedAt": now,
          "appliedInternships.$.interviewAt": now,
        },
        $push: {
          "appliedInternships.$.statusHistory": {
            status: "INTERVIEW",
            changedAt: now,
            changedByRecruiter: req.recruiter?._id || null,
          },
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









