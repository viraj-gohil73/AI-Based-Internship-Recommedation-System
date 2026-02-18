import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planCodeSnapshot: {
      type: String,
      enum: ["Starter", "Pro", "Edge"],
      default: "Starter",
    },
    status: {
      type: String,
      enum: ["TRIAL", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED"],
      default: "TRIAL",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    trialStartsAt: {
      type: Date,
      default: Date.now,
    },
    trialEndsAt: {
      type: Date,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    extraRecruiterSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRecruiterSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    maxActivePostings: {
      type: Number,
      default: null,
      min: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    addonAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },
    billingEmail: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },
    providerPlanId: {
      type: String,
      default: null,
    },
    providerSubscriptionId: {
      type: String,
      default: null,
    },
    providerCustomerId: {
      type: String,
      default: null,
    },
    lastPaymentId: {
      type: String,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ companyId: 1, status: 1 });
subscriptionSchema.index({ providerSubscriptionId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Subscription", subscriptionSchema);
