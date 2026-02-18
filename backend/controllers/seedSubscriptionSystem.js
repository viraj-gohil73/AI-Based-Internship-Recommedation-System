import Company from "../models/Company.js";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import { calculateHybridPricing, normalizePlanCode } from "../services/planService.js";
import { SUBSCRIPTION_STATUSES } from "../services/subscriptionService.js";

const TRIAL_DAYS = 14;

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const defaultPlans = [
  {
    code: "Starter",
    name: "Starter",
    description: "Best for early stage hiring teams",
    isActive: true,
    currency: "INR",
    monthlyBasePrice: 1499,
    yearlyBasePrice: 13999,
    includedRecruiterSeats: 2,
    maxActivePostings: 3,
    addonRecruiterSeatMonthlyPrice: 499,
    addonRecruiterSeatYearlyPrice: 4499,
    displayOrder: 1,
  },
  {
    code: "Pro",
    name: "Pro",
    description: "Best for growing hiring teams",
    isActive: true,
    currency: "INR",
    monthlyBasePrice: 3999,
    yearlyBasePrice: 37999,
    includedRecruiterSeats: 10,
    maxActivePostings: null,
    addonRecruiterSeatMonthlyPrice: 399,
    addonRecruiterSeatYearlyPrice: 3499,
    displayOrder: 2,
  },
  {
    code: "Edge",
    name: "Edge",
    description: "Enterprise scale hiring",
    isActive: true,
    currency: "INR",
    monthlyBasePrice: 8999,
    yearlyBasePrice: 85999,
    includedRecruiterSeats: 25,
    maxActivePostings: null,
    addonRecruiterSeatMonthlyPrice: 299,
    addonRecruiterSeatYearlyPrice: 2799,
    displayOrder: 3,
  },
];

const legacyStatusToNew = (status) => {
  const value = String(status || "").trim().toLowerCase();
  if (value === "active") return SUBSCRIPTION_STATUSES.ACTIVE;
  if (value === "trial") return SUBSCRIPTION_STATUSES.TRIAL;
  if (value === "past due") return SUBSCRIPTION_STATUSES.PAST_DUE;
  if (value === "cancelled") return SUBSCRIPTION_STATUSES.CANCELLED;
  if (value === "expired") return SUBSCRIPTION_STATUSES.EXPIRED;
  if (Object.values(SUBSCRIPTION_STATUSES).includes(status)) return status;
  return SUBSCRIPTION_STATUSES.TRIAL;
};

const inferLegacyPlanCode = (subscription) => {
  const rawPlan =
    subscription.planCodeSnapshot ||
    subscription.get?.("planCodeSnapshot") ||
    subscription.get?.("plan") ||
    subscription.plan;
  const normalized = normalizePlanCode(rawPlan);
  return normalized || "Starter";
};

const ensureDefaultsForSubscription = (subscription, plan) => {
  const updates = {};
  const now = new Date();

  updates.planId = plan._id;
  updates.planCodeSnapshot = inferLegacyPlanCode(subscription);

  const normalizedStatus = legacyStatusToNew(subscription.status);
  updates.status = normalizedStatus;

  updates.billingCycle = subscription.billingCycle || "monthly";
  updates.trialStartsAt = subscription.trialStartsAt || subscription.createdAt || now;
  updates.trialEndsAt =
    subscription.trialEndsAt || addDays(updates.trialStartsAt, TRIAL_DAYS);

  if (!subscription.currentPeriodStart) {
    updates.currentPeriodStart = subscription.currentPeriodStart || updates.trialStartsAt;
  }
  if (!subscription.currentPeriodEnd) {
    const legacyRenewsOn = subscription.get?.("renewsOn") || null;
    updates.currentPeriodEnd = legacyRenewsOn || updates.trialEndsAt;
  }

  const legacySeats = Number(subscription.get?.("seats"));
  const extraSeats = Number.isFinite(legacySeats)
    ? Math.max(0, legacySeats - plan.includedRecruiterSeats)
    : Number(subscription.extraRecruiterSeats || 0);

  const pricing = calculateHybridPricing({
    plan,
    billingCycle: updates.billingCycle,
    extraRecruiterSeats: extraSeats,
  });

  updates.extraRecruiterSeats = extraSeats;
  updates.totalRecruiterSeats = pricing.totalRecruiterSeats;
  updates.maxActivePostings = plan.maxActivePostings;
  updates.currency = "INR";
  updates.baseAmount =
    subscription.baseAmount ??
    Number(subscription.get?.("amount")) ??
    pricing.baseAmount;
  updates.addonAmount = subscription.addonAmount ?? pricing.addonAmount;
  updates.totalAmount =
    subscription.totalAmount ??
    Number(subscription.get?.("amount")) ??
    pricing.totalAmount;
  updates.provider = subscription.provider || "razorpay";
  updates.meta = subscription.meta || {};

  if (
    updates.status === SUBSCRIPTION_STATUSES.TRIAL &&
    new Date() > new Date(updates.trialEndsAt)
  ) {
    updates.status = SUBSCRIPTION_STATUSES.EXPIRED;
  }

  Object.assign(subscription, updates);
};

export const seedSubscriptionSystem = async () => {
  const planMap = {};

  for (const defaults of defaultPlans) {
    const plan = await Plan.findOneAndUpdate(
      { code: defaults.code },
      { $setOnInsert: defaults },
      { upsert: true, new: true }
    );
    planMap[defaults.code] = plan;
  }

  const subscriptions = await Subscription.find();
  for (const subscription of subscriptions) {
    const planCode = inferLegacyPlanCode(subscription);
    const plan = planMap[planCode] || planMap.Starter;
    ensureDefaultsForSubscription(subscription, plan);
    await subscription.save();
  }

  const companies = await Company.find().select("_id createdAt");
  for (const company of companies) {
    const existing = await Subscription.findOne({ companyId: company._id });
    if (existing) continue;

    const plan = planMap.Starter;
    const trialStartsAt = company.createdAt || new Date();
    const trialEndsAt = addDays(trialStartsAt, TRIAL_DAYS);
    const status =
      new Date() <= trialEndsAt
        ? SUBSCRIPTION_STATUSES.TRIAL
        : SUBSCRIPTION_STATUSES.EXPIRED;

    await Subscription.create({
      companyId: company._id,
      planId: plan._id,
      planCodeSnapshot: plan.code,
      status,
      billingCycle: "monthly",
      trialStartsAt,
      trialEndsAt,
      currentPeriodStart: trialStartsAt,
      currentPeriodEnd: trialEndsAt,
      extraRecruiterSeats: 0,
      totalRecruiterSeats: plan.includedRecruiterSeats,
      maxActivePostings: plan.maxActivePostings,
      baseAmount: 0,
      addonAmount: 0,
      totalAmount: 0,
      currency: "INR",
      provider: "razorpay",
      meta: { source: "startup-migration" },
    });
  }

  console.log("Subscription system initialized");
};

