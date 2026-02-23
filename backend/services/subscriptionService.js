import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import Recruiter from "../models/Recruiter.js";
import Subscription from "../models/Subscription.js";
import { calculateHybridPricing, getDefaultPlan } from "./planService.js";

export const SUBSCRIPTION_STATUSES = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

const TRIAL_DURATION_DAYS = 14;

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addCycle = (date, cycle) => {
  const next = new Date(date);
  if (cycle === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
};

export const getCompanySubscription = async (companyId) =>
  Subscription.findOne({ companyId })
    .populate("planId")
    .sort({ createdAt: -1 });

export const ensureTrialSubscription = async (companyId) => {
  const existing = await getCompanySubscription(companyId);
  if (existing) {
    return refreshSubscriptionStatus(existing);
  }

  const [company, defaultPlan] = await Promise.all([
    Company.findById(companyId),
    getDefaultPlan(),
  ]);

  if (!company) throw new Error("Company not found");
  if (!defaultPlan) throw new Error("No plans configured");

  const trialStartsAt = company.createdAt || new Date();
  const trialEndsAt = addDays(trialStartsAt, TRIAL_DURATION_DAYS);
  const status =
    new Date() <= trialEndsAt
      ? SUBSCRIPTION_STATUSES.TRIAL
      : SUBSCRIPTION_STATUSES.EXPIRED;

  const subscription = await Subscription.create({
    companyId,
    planId: defaultPlan._id,
    planCodeSnapshot: defaultPlan.code,
    status,
    billingCycle: "monthly",
    trialStartsAt,
    trialEndsAt,
    currentPeriodStart: trialStartsAt,
    currentPeriodEnd: trialEndsAt,
    extraRecruiterSeats: 0,
    totalRecruiterSeats: defaultPlan.includedRecruiterSeats,
    maxActivePostings: defaultPlan.maxActivePostings,
    baseAmount: 0,
    addonAmount: 0,
    totalAmount: 0,
    currency: defaultPlan.currency || "INR",
    provider: "manual",
    meta: { source: "trial-bootstrap" },
  });

  return Subscription.findById(subscription._id).populate("planId");
};

export const refreshSubscriptionStatus = async (subscription) => {
  if (!subscription) return subscription;

  const now = new Date();
  let nextStatus = subscription.status;
  const isTerminal = [
    SUBSCRIPTION_STATUSES.CANCELLED,
    SUBSCRIPTION_STATUSES.PAST_DUE,
    SUBSCRIPTION_STATUSES.EXPIRED,
  ].includes(subscription.status);

  if (!isTerminal && subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
    if (subscription.trialEndsAt && now > subscription.trialEndsAt) {
      nextStatus = SUBSCRIPTION_STATUSES.EXPIRED;
    }
  }

  if (!isTerminal && subscription.status === SUBSCRIPTION_STATUSES.ACTIVE) {
    if (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd) {
      nextStatus = SUBSCRIPTION_STATUSES.EXPIRED;
    }
  }

  if (nextStatus !== subscription.status) {
    subscription.status = nextStatus;
    await subscription.save();
  }

  return subscription;
};

export const getCompanyUsage = async (companyId) => {
  const [recruitersCount, activePostingsCount] = await Promise.all([
    Recruiter.countDocuments({ companyId }),
    Internship.countDocuments({
      company_id: companyId,
      intern_status: "ACTIVE",
      is_published: "true",
    }),
  ]);

  return {
    recruitersCount,
    activePostingsCount,
  };
};

export const computeEntitlements = ({ company, subscription }) => {
  const now = new Date();
  const approved = company?.verificationStatus === "APPROVED";
  const hasPayStatus = [
    SUBSCRIPTION_STATUSES.TRIAL,
    SUBSCRIPTION_STATUSES.ACTIVE,
  ].includes(subscription?.status);

  let effectiveEndDate = null;
  if (subscription?.status === SUBSCRIPTION_STATUSES.TRIAL) {
    effectiveEndDate = subscription.trialEndsAt || null;
  } else if (subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE) {
    effectiveEndDate = subscription.currentPeriodEnd || null;
  }

  const notExpired = effectiveEndDate ? now <= effectiveEndDate : hasPayStatus;
  const accessAllowed = Boolean(approved && hasPayStatus && notExpired);

  return {
    approved,
    hasPayStatus,
    notExpired,
    accessAllowed,
    status: subscription?.status || null,
    effectiveEndDate,
    limits: {
      totalRecruiterSeats: subscription?.totalRecruiterSeats ?? 0,
      maxActivePostings:
        subscription?.maxActivePostings === undefined
          ? null
          : subscription?.maxActivePostings,
    },
  };
};

export const getSubscriptionSnapshot = async (companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");

  const subscription = await ensureTrialSubscription(companyId);
  const refreshed = await refreshSubscriptionStatus(subscription);
  await refreshed.populate("planId");
  const usage = await getCompanyUsage(companyId);
  const entitlements = computeEntitlements({ company, subscription: refreshed });

  return {
    company,
    subscription: refreshed,
    usage,
    entitlements,
  };
};

const makeForbidden = (code, message, details = {}) => ({
  allowed: false,
  code,
  message,
  details,
});

export const canUseFeature = async ({ companyId, feature }) => {
  const snapshot = await getSubscriptionSnapshot(companyId);
  const { company, subscription, usage, entitlements } = snapshot;

  if (!entitlements.accessAllowed) {
    const code =
      subscription.status === SUBSCRIPTION_STATUSES.EXPIRED ||
      subscription.status === SUBSCRIPTION_STATUSES.CANCELLED ||
      subscription.status === SUBSCRIPTION_STATUSES.PAST_DUE
        ? "SUBSCRIPTION_EXPIRED"
        : "SUBSCRIPTION_REQUIRED";
    const message = !entitlements.approved
      ? "Company verification approval is required."
      : "Active subscription is required for this feature.";
    return {
      ...snapshot,
      ...makeForbidden(code, message, {
        status: subscription.status,
        verificationStatus: company.verificationStatus,
      }),
    };
  }

  if (feature === "RECRUITER_CREATE") {
    const limit = entitlements.limits.totalRecruiterSeats;
    if (limit !== null && usage.recruitersCount >= limit) {
      return {
        ...snapshot,
        ...makeForbidden("FEATURE_LIMIT_REACHED", "Recruiter seat limit reached.", {
          feature,
          used: usage.recruitersCount,
          limit,
        }),
      };
    }
  }

  if (feature === "INTERNSHIP_CREATE") {
    const limit = entitlements.limits.maxActivePostings;
    if (limit !== null && usage.activePostingsCount >= limit) {
      return {
        ...snapshot,
        ...makeForbidden("FEATURE_LIMIT_REACHED", "Active posting limit reached.", {
          feature,
          used: usage.activePostingsCount,
          limit,
        }),
      };
    }
  }

  return {
    ...snapshot,
    allowed: true,
    code: null,
    message: null,
    details: null,
  };
};

export const applyPaidCycleToSubscription = async ({
  subscription,
  plan,
  billingCycle,
  extraRecruiterSeats = 0,
  paymentId = null,
}) => {
  const pricing = calculateHybridPricing({
    plan,
    billingCycle,
    extraRecruiterSeats,
  });
  const now = new Date();
  const periodEnd = addCycle(now, pricing.billingCycle);

  subscription.planId = plan._id;
  subscription.planCodeSnapshot = plan.code;
  subscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
  subscription.billingCycle = pricing.billingCycle;
  subscription.currentPeriodStart = now;
  subscription.currentPeriodEnd = periodEnd;
  subscription.extraRecruiterSeats = pricing.extraRecruiterSeats;
  subscription.totalRecruiterSeats = pricing.totalRecruiterSeats;
  subscription.maxActivePostings = pricing.maxActivePostings;
  subscription.baseAmount = pricing.baseAmount;
  subscription.addonAmount = pricing.addonAmount;
  subscription.totalAmount = pricing.totalAmount;
  subscription.currency = pricing.currency;
  subscription.lastPaymentId = paymentId || subscription.lastPaymentId;
  subscription.cancelAtPeriodEnd = false;
  subscription.cancelledAt = null;
  await subscription.save();

  return subscription;
};
