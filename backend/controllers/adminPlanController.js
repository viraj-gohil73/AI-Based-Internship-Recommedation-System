import Plan from "../models/Plan.js";
import { normalizePlanCode, sanitizePlanForClient } from "../services/planService.js";

const parseNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};

const parseRequiredNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const buildPlanPayload = (body, { partial = false } = {}) => {
  const payload = {};
  const assign = (key, value) => {
    if (value !== undefined) payload[key] = value;
  };

  if (!partial || body.code !== undefined) {
    const code = normalizePlanCode(body.code);
    if (!code) throw new Error("Invalid plan code");
    assign("code", code);
  }
  assign("name", body.name);
  assign("description", body.description);
  assign("isActive", body.isActive);
  assign("currency", "INR");
  if (!partial || body.monthlyBasePrice !== undefined) {
    const value = parseRequiredNumber(body.monthlyBasePrice);
    if (value === null || value < 0) throw new Error("Invalid monthly base price");
    assign("monthlyBasePrice", value);
  }
  if (!partial || body.yearlyBasePrice !== undefined) {
    const value = parseRequiredNumber(body.yearlyBasePrice);
    if (value === null || value < 0) throw new Error("Invalid yearly base price");
    assign("yearlyBasePrice", value);
  }
  if (!partial || body.includedRecruiterSeats !== undefined) {
    const value = parseRequiredNumber(body.includedRecruiterSeats);
    if (value === null || value < 0) throw new Error("Invalid included recruiter seats");
    assign("includedRecruiterSeats", value);
  }
  if (!partial || body.maxActivePostings !== undefined) {
    const value = parseNullableNumber(body.maxActivePostings);
    if (value !== null && value < 0) throw new Error("Invalid max active postings");
    assign("maxActivePostings", value);
  }
  if (!partial || body.addonRecruiterSeatMonthlyPrice !== undefined) {
    const value = parseRequiredNumber(body.addonRecruiterSeatMonthlyPrice);
    if (value === null || value < 0) throw new Error("Invalid monthly addon price");
    assign("addonRecruiterSeatMonthlyPrice", value);
  }
  if (!partial || body.addonRecruiterSeatYearlyPrice !== undefined) {
    const value = parseRequiredNumber(body.addonRecruiterSeatYearlyPrice);
    if (value === null || value < 0) throw new Error("Invalid yearly addon price");
    assign("addonRecruiterSeatYearlyPrice", value);
  }
  assign("displayOrder", body.displayOrder === undefined ? undefined : Number(body.displayOrder) || 0);
  return payload;
};

export const getAdminPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans.map(sanitizePlanForClient),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

export const createAdminPlan = async (req, res) => {
  try {
    const payload = buildPlanPayload(req.body, { partial: false });
    const exists = await Plan.findOne({ code: payload.code });
    if (exists) {
      return res.status(409).json({ success: false, message: "Plan code already exists" });
    }
    const plan = await Plan.create(payload);
    return res.status(201).json({
      success: true,
      message: "Plan created",
      data: sanitizePlanForClient(plan),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create plan",
    });
  }
};

export const updateAdminPlan = async (req, res) => {
  try {
    const payload = buildPlanPayload(req.body, { partial: true });
    const plan = await Plan.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Plan updated",
      data: sanitizePlanForClient(plan),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update plan",
    });
  }
};

export const updateAdminPlanStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be boolean" });
    }
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    return res.status(200).json({
      success: true,
      message: `Plan ${isActive ? "activated" : "deactivated"}`,
      data: sanitizePlanForClient(plan),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update plan status",
    });
  }
};

