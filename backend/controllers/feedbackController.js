import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Student from "../models/Student.js";
import InternshipFeedback from "../models/InternshipFeedback.js";
import {
  createNotification,
  runNotificationTask,
} from "../services/notificationService.js";

const isInternshipCompleted = (internshipDoc) => {
  if (!internshipDoc) return false;
  if (internshipDoc.intern_status === "CLOSED") return true;

  const now = new Date();

  if (internshipDoc.deadline_at) {
    const deadline = new Date(internshipDoc.deadline_at);
    if (!Number.isNaN(deadline.getTime()) && deadline < now) return true;
  }

  if (internshipDoc.starting_date && Number(internshipDoc.duration) > 0) {
    const endDate = new Date(internshipDoc.starting_date);
    if (!Number.isNaN(endDate.getTime())) {
      endDate.setMonth(endDate.getMonth() + Number(internshipDoc.duration));
      if (endDate < now) return true;
    }
  }

  return false;
};

const toCompanyReview = (row) => {
  const student = row.studentId || {};
  const internship = row.internshipId || {};
  const first = student.fname || "";
  const last = student.lname || "";
  const fullName = `${first} ${last}`.trim();

  return {
    _id: row._id,
    id: row._id,
    internshipId: internship._id || null,
    internshipTitle: internship.title || "Internship",
    studentId: student._id || null,
    studentName: fullName || student.email || "Student",
    rating: Number(row.rating || 0),
    comment: row.comment || "",
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null,
  };
};

export const submitInternshipFeedback = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const ratingNum = Number(req.body?.rating);
    const comment = `${req.body?.comment || ""}`.trim();

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ success: false, message: "Invalid internship id" });
    }

    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ success: false, message: "Feedback comment is required" });
    }

    const student = await Student.findById(req.studentId).select(
      "fname lname appliedInternships"
    );
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const application = (student.appliedInternships || []).find(
      (entry) => String(entry?.internship) === String(internshipId)
    );

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "You can only review internships you applied for",
      });
    }

    if (application.status !== "SELECTED") {
      return res.status(403).json({
        success: false,
        message: "Feedback is available only after your internship is completed",
      });
    }

    const internship = await Internship.findById(internshipId).select(
      "_id title company_id recruiter_id intern_status deadline_at starting_date duration"
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    if (!isInternshipCompleted(internship)) {
      return res.status(403).json({
        success: false,
        message: "Feedback can be submitted only after internship completion",
      });
    }

    const roundedRating = Math.round(ratingNum * 10) / 10;
    const feedback = await InternshipFeedback.findOneAndUpdate(
      { internshipId: internship._id, studentId: student._id },
      {
        internshipId: internship._id,
        companyId: internship.company_id,
        recruiterId: internship.recruiter_id || null,
        studentId: student._id,
        rating: roundedRating,
        comment,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    await runNotificationTask("student-submit-feedback", async () => {
      if (internship.company_id) {
        const studentName = `${student.fname || ""} ${student.lname || ""}`.trim() || "A student";
        await createNotification({
          recipientModel: "Company",
          recipientId: internship.company_id,
          type: "NEW_FEEDBACK",
          title: "New internship feedback",
          message: `${studentName} submitted feedback for ${internship.title || "an internship"}.`,
          entityType: "Internship",
          entityId: internship._id,
          metadata: { feedbackId: feedback._id, rating: roundedRating },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: {
        _id: feedback._id,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit feedback",
    });
  }
};

export const listCompanyReviews = async (req, res) => {
  try {
    if (!req.user || !req.companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const reviews = await InternshipFeedback.find({ companyId: req.companyId })
      .sort({ createdAt: -1 })
      .populate("studentId", "fname lname email")
      .populate("internshipId", "title")
      .lean();

    return res.status(200).json({
      success: true,
      reviews: reviews.map(toCompanyReview),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

export { isInternshipCompleted };
