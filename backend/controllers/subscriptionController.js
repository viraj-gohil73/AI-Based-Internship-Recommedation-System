import {
  getActivePlans,
  sanitizePlanForClient,
} from "../services/planService.js";
import {
  getSubscriptionSnapshot,
} from "../services/subscriptionService.js";

const toClientSubscription = (subscription) => ({
  _id: subscription._id,
  companyId: subscription.companyId,
  planId: subscription.planId?._id || subscription.planId,
  planCodeSnapshot: subscription.planCodeSnapshot,
  plan: subscription.planId?.code
    ? sanitizePlanForClient(subscription.planId)
    : null,
  status: subscription.status,
  billingCycle: subscription.billingCycle,
  trialStartsAt: subscription.trialStartsAt,
  trialEndsAt: subscription.trialEndsAt,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  extraRecruiterSeats: subscription.extraRecruiterSeats,
  totalRecruiterSeats: subscription.totalRecruiterSeats,
  maxActivePostings: subscription.maxActivePostings,
  baseAmount: subscription.baseAmount,
  addonAmount: subscription.addonAmount,
  totalAmount: subscription.totalAmount,
  currency: subscription.currency,
  provider: subscription.provider,
  providerPlanId: subscription.providerPlanId,
  providerSubscriptionId: subscription.providerSubscriptionId,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  cancelledAt: subscription.cancelledAt,
  createdAt: subscription.createdAt,
  updatedAt: subscription.updatedAt,
});

export const listSubscriptionPlans = async (req, res) => {
  try {
    const plans = await getActivePlans();
    return res.status(200).json({
      success: true,
      data: plans.map(sanitizePlanForClient),
    });
  } catch (error) {
    console.error("List plans error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

export const getCurrentCompanySubscription = async (req, res) => {
  try {
    const snapshot = await getSubscriptionSnapshot(req.companyId);
    return res.status(200).json({
      success: true,
      data: toClientSubscription(snapshot.subscription),
      entitlements: snapshot.entitlements,
      usage: snapshot.usage,
      verificationStatus: snapshot.company.verificationStatus,
    });
  } catch (error) {
    console.error("Current subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current subscription",
    });
  }
};

export const getRecruiterCurrentSubscription = async (req, res) => {
  try {
    const snapshot = await getSubscriptionSnapshot(req.recruiter.companyId);
    return res.status(200).json({
      success: true,
      data: toClientSubscription(snapshot.subscription),
      entitlements: snapshot.entitlements,
      usage: snapshot.usage,
      verificationStatus: snapshot.company.verificationStatus,
    });
  } catch (error) {
    console.error("Recruiter subscription fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    });
  }
};
