import mongoose from "mongoose";

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    providerEventId: {
      type: String,
      default: null,
    },
    providerPaymentId: {
      type: String,
      default: null,
    },
    providerOrderId: {
      type: String,
      default: null,
    },
    providerInvoiceId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },
    status: {
      type: String,
      default: "CREATED",
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

subscriptionPaymentSchema.index({ providerPaymentId: 1 }, { unique: true, sparse: true });
subscriptionPaymentSchema.index({ providerEventId: 1 }, { unique: true, sparse: true });

export default mongoose.models.SubscriptionPayment ||
  mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
