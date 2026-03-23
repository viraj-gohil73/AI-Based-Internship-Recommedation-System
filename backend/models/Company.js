import mongoose from "mongoose";

const checkResultSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "PASS", "FAIL", "NEEDS_REVIEW"],
      default: "PENDING",
    },
    score: {
      type: Number,
      default: 0,
    },
    reasons: {
      type: [String],
      default: [],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    critical: {
      type: Boolean,
      default: false,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    attemptCount: {
      type: Number,
      default: 0,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
    decision: {
      type: String,
      enum: ["AUTO_APPROVED", "MANUAL_APPROVAL", "AUTO_RESUBMIT", "AUTO_REJECT", null],
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    lastEvaluatedAt: {
      type: Date,
      default: null,
    },
    resubmitBy: {
      type: Date,
      default: null,
    },
    criticalFlags: {
      type: [String],
      default: [],
    },
    checklist: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      default: null,
    },
    lastFailedChecks: {
      type: [String],
      default: [],
    },
    emailOtpVerified: {
      type: Boolean,
      default: false,
    },
    checks: {
      companyInfo: { type: checkResultSchema, default: () => ({}) },
      email: { type: checkResultSchema, default: () => ({}) },
      domain: { type: checkResultSchema, default: () => ({}) },
      gst: { type: checkResultSchema, default: () => ({}) },
      fraud: { type: checkResultSchema, default: () => ({}) },
    },
    history: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const Company = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    linkedInId: {
      type: String,
    },
    loginType: {
      type: String,
      enum: ["email", "google", "linkedin"],
      default: "email",
    },
    companyName: {
      type: String,
    },
    logo: {
      type: String,
    },
    tagline: {
      type: String,
    },
    industry: {
      type: String,
    },
    companySize: {
      type: Number,
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
    },
    about: {
      type: String,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: Number,
    },
    gst_no: {
      type: String,
    },
    secondaryEmail: {
      type: String,
    },
    mobile: {
      type: String,
    },
    reg_doc: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: [
        "DRAFT",
        "RESUBMISSION",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "PENDING_VERIFICATION",
        "AUTO_APPROVED",
        "MANUAL_APPROVAL",
        "AUTO_RESUBMIT",
        "AUTO_REJECT",
      ],
      default: "DRAFT",
    },
    verification: {
      type: verificationSchema,
      default: () => ({}),
    },
    isactive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", Company);
