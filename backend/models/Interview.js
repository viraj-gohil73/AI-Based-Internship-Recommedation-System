import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 480,
    },
    mode: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "PHONE"],
      default: "ONLINE",
    },
    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "SCHEDULED",
      index: true,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ recruiterId: 1, scheduledAt: -1 });
interviewSchema.index({ studentId: 1, internshipId: 1, scheduledAt: -1 });

export default mongoose.model("Interview", interviewSchema);
