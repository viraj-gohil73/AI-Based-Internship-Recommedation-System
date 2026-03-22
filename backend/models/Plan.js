import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },
    monthlyBasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    yearlyBasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    includedRecruiterSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    maxActivePostings: {
      type: Number,
      default: null,
      min: 0,
    },
    addonRecruiterSeatMonthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    addonRecruiterSeatYearlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    providerPlanMap: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

planSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
