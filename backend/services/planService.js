import Plan from "../models/Plan.js";

export const PLAN_CODES = ["Starter", "Pro", "Edge"];
export const BILLING_CYCLES = ["monthly", "yearly"];

export const normalizePlanCode = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();
  if (lower === "free") return "Starter";
  if (lower === "growth") return "Pro";
  if (lower === "scale") return "Edge";

  const cleaned = raw.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "";

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
};

export const validateBillingCycle = (value) => {
  if (!value) return "monthly";
  const normalized = String(value).trim().toLowerCase();
  return BILLING_CYCLES.includes(normalized) ? normalized : null;
};

export const getActivePlans = async () =>
  Plan.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });

export const getPlanByCode = async (planCode, { activeOnly = true } = {}) => {
  const code = normalizePlanCode(planCode);
  if (!code) return null;
  const query = { code };
  if (activeOnly) query.isActive = true;
  return Plan.findOne(query);
};

export const getDefaultPlan = async () => {
  const plan =
    (await Plan.findOne({ code: "Starter" })) ||
    (await Plan.findOne().sort({ displayOrder: 1, createdAt: 1 }));
  return plan;
};

export const calculateHybridPricing = ({
  plan,
  billingCycle,
  extraRecruiterSeats = 0,
}) => {
  if (!plan) throw new Error("Plan is required");

  const safeExtraSeats = Math.max(0, Number(extraRecruiterSeats) || 0);
  const cycle = validateBillingCycle(billingCycle);

  if (!cycle) throw new Error("Invalid billing cycle");

  const baseAmount =
    cycle === "yearly" ? plan.yearlyBasePrice : plan.monthlyBasePrice;
  const addonRate =
    cycle === "yearly"
      ? plan.addonRecruiterSeatYearlyPrice
      : plan.addonRecruiterSeatMonthlyPrice;
  const addonAmount = addonRate * safeExtraSeats;
  const totalAmount = baseAmount + addonAmount;
  const totalRecruiterSeats = (plan.includedRecruiterSeats || 0) + safeExtraSeats;

  return {
    billingCycle: cycle,
    currency: plan.currency || "INR",
    baseAmount,
    addonAmount,
    totalAmount,
    extraRecruiterSeats: safeExtraSeats,
    includedRecruiterSeats: plan.includedRecruiterSeats || 0,
    totalRecruiterSeats,
    maxActivePostings:
      plan.maxActivePostings === null || plan.maxActivePostings === undefined
        ? null
        : Number(plan.maxActivePostings),
  };
};

export const sanitizePlanForClient = (plan) => ({
  _id: plan._id,
  code: plan.code,
  name: plan.name,
  description: plan.description || "",
  isActive: Boolean(plan.isActive),
  currency: plan.currency || "INR",
  monthlyBasePrice: plan.monthlyBasePrice,
  yearlyBasePrice: plan.yearlyBasePrice,
  includedRecruiterSeats: plan.includedRecruiterSeats,
  maxActivePostings: plan.maxActivePostings,
  addonRecruiterSeatMonthlyPrice: plan.addonRecruiterSeatMonthlyPrice,
  addonRecruiterSeatYearlyPrice: plan.addonRecruiterSeatYearlyPrice,
  displayOrder: plan.displayOrder ?? 0,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
});

