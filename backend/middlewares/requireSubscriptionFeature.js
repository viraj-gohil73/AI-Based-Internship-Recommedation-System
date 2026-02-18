import { canUseFeature } from "../services/subscriptionService.js";

const extractCompanyId = (req) => {
  if (req.companyId) return req.companyId;
  if (req.recruiter?.companyId) return req.recruiter.companyId;
  return null;
};

export const requireSubscriptionFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const companyId = extractCompanyId(req);
      if (!companyId) {
        return res.status(401).json({
          success: false,
          code: "SUBSCRIPTION_REQUIRED",
          message: "Unable to resolve company context for subscription checks.",
        });
      }

      const result = await canUseFeature({ companyId, feature });
      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          code: result.code,
          message: result.message,
          details: result.details,
          entitlements: result.entitlements,
          usage: result.usage,
          subscription: {
            status: result.subscription?.status || null,
            planCode: result.subscription?.planCodeSnapshot || null,
            trialEndsAt: result.subscription?.trialEndsAt || null,
            currentPeriodEnd: result.subscription?.currentPeriodEnd || null,
          },
        });
      }

      req.subscriptionSnapshot = result;
      return next();
    } catch (error) {
      console.error("Subscription feature check error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify subscription entitlement",
      });
    }
  };
};

