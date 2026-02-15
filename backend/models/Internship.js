import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
     // required: true,
    },

    recruiter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      //required: true,
    },

    /* ================= BASIC INFO ================= */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    skill_req: {
      type: [String],
      default: [],
    },
    perks:{
        type: [String],
        default: [],
    },
    employment_type: {
      type: String,
      enum: ["Full Time", "Part Time"],
    },
    workmode: {
      type: String,
      enum: ["Remote", "Onsite", "Hybrid"],
    },

    location: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number, // months
    },

    openings: {
      type: Number,
      default: 1,
    },

    /* ================= DATES ================= */
        starting_date: {
        type: Date,
        },

        deadline_at: {
        type: Date,
        },

    /* ================= STIPEND ================= */
    stipend_min: {
      type: Number,
      default: 0,
    },

    stipend_max: {
      type: Number,
      default: 0,
    },

    

    /* ================= TYPE / PREFERENCES ================= */
    intern_status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "DRAFT"],
      default: "DRAFT",
    },

    is_published: {
      type: String,
      enum: ["true", "false"],
      default: "false",
    },

    /* ================= CONTENT ================= */
    about_work: {
      type: String,
    },

    who_can_apply: {
      type: String,
    },

    other_req: {
      type: String,
    },

    /* ================= META ================= */
    views_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES (IMPORTANT) ================= */
internshipSchema.index({ company_id: 1 });
internshipSchema.index({ recruiter_id: 1 });
internshipSchema.index({ intern_status: 1 });
internshipSchema.index({ is_published: 1 });

export default mongoose.model("Internship", internshipSchema);
