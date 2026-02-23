import mongoose from "mongoose";

const internshipFeedbackSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
  },
  { timestamps: true }
);

internshipFeedbackSchema.index(
  { internshipId: 1, studentId: 1 },
  { unique: true }
);
internshipFeedbackSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.model("InternshipFeedback", internshipFeedbackSchema);
