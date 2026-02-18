import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: String, default: "system" },
    target: { type: String },
    type: {
      type: String,
      enum: ["COMPANY", "RECRUITER", "STUDENT", "SUBSCRIPTION", "ADMIN", "SYSTEM"],
      default: "SYSTEM",
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    meta: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
