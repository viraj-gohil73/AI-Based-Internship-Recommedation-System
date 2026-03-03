import mongoose from "mongoose";

const recommendationSnapshotSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    limit: {
      type: Number,
      required: true,
      default: 3,
    },
    candidateCount: {
      type: Number,
      required: true,
      default: 0,
    },
    items: [
      {
        internshipId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Internship",
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        reasons: {
          type: [
            {
              type: String,
              enum: [
                "SKILL_MATCH",
                "LOCATION_MATCH",
                "RECENT_POST",
                "POPULAR_ROLE",
                "EDUCATION_MATCH",
                "PROJECT_RELEVANCE",
                "CGPA_ELIGIBLE",
              ],
            },
          ],
          default: [],
        },
        matchedSkills: {
          type: [String],
          default: [],
        },
        missingSkills: {
          type: [String],
          default: [],
        },
        educationMatch: {
          type: Boolean,
          default: null,
        },
        projectRelevance: {
          type: Number,
          min: 0,
          max: 1,
          default: 0,
        },
        cgpaEligible: {
          type: Boolean,
          default: null,
        },
        explanation: {
          type: String,
          default: "",
        },
        internship: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    source: {
      type: String,
      enum: ["ml", "fallback", "rule"],
      default: "rule",
      required: true,
    },
    modelVersion: {
      type: String,
      default: "rule-hybrid-v1",
      required: true,
    },
    latencyMs: {
      type: Number,
      default: 0,
      required: true,
    },
    candidateFingerprint: {
      type: String,
      default: "",
      required: true,
    },
  },
  { timestamps: true }
);

recommendationSnapshotSchema.index({ studentId: 1, limit: 1, createdAt: -1 });
recommendationSnapshotSchema.index({ studentId: 1, limit: 1 });

export default mongoose.model("RecommendationSnapshot", recommendationSnapshotSchema);
