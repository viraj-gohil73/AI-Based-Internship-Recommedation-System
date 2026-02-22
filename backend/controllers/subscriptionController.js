import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import {
  calculateHybridPricing,
  getActivePlans,
  getPlanByCode,
  sanitizePlanForClient,
  validateBillingCycle,
} from "../services/planService.js";
import {
  applyPaidCycleToSubscription,
  getSubscriptionSnapshot,
} from "../services/subscriptionService.js";
import {
  createSubscriptionIntent,
  getRazorpayKeyId,
  verifyCheckoutSignature,
} from "../services/razorpayService.js";
import Company from "../models/Company.js";
import {
  createNotification,
  notifyAdmins,
  runNotificationTask,
} from "../services/notificationService.js";

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

export const getCompanySubscriptionPayments = async (req, res) => {
  try {
    const payments = await SubscriptionPayment.find({ companyId: req.companyId })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Subscription payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription payments",
    });
  }
};

export const createCheckoutIntent = async (req, res) => {
  try {
    const { planCode, billingCycle, extraRecruiterSeats = 0 } = req.body;
    const cycle = validateBillingCycle(billingCycle);

    if (!cycle) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle",
      });
    }

    const extraSeats = Number(extraRecruiterSeats);
    if (!Number.isFinite(extraSeats) || extraSeats < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid extra recruiter seats",
      });
    }

    const company = await Company.findById(req.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (company.verificationStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "Company must be approved before upgrading plan.",
      });
    }

    const plan = await getPlanByCode(planCode, { activeOnly: true });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const pricing = calculateHybridPricing({
      plan,
      billingCycle: cycle,
      extraRecruiterSeats: extraSeats,
    });

    const snapshot = await getSubscriptionSnapshot(req.companyId);
    const intent = await createSubscriptionIntent({
      plan,
      billingCycle: cycle,
      extraRecruiterSeats: extraSeats,
      totalAmount: pricing.totalAmount,
      companyId: req.companyId,
    });

    const subscription = snapshot.subscription;
    subscription.provider = "razorpay";
    subscription.providerPlanId = intent.providerPlanId;
    subscription.providerSubscriptionId = intent.razorpaySubscriptionId;
    subscription.meta = {
      ...(subscription.meta || {}),
      pendingCheckout: {
        planCode: plan.code,
        billingCycle: cycle,
        extraRecruiterSeats: extraSeats,
        baseAmount: pricing.baseAmount,
        addonAmount: pricing.addonAmount,
        totalAmount: pricing.totalAmount,
        providerPlanKey: intent.providerPlanKey,
        createdAt: new Date().toISOString(),
      },
    };
    await subscription.save();

    return res.status(200).json({
      success: true,
      data: {
        keyId: getRazorpayKeyId(),
        razorpaySubscriptionId: intent.razorpaySubscriptionId,
        amountSummary: pricing,
        currentSubscriptionStatus: snapshot.subscription.status,
      },
    });
  } catch (error) {
    console.error("Checkout intent error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create checkout intent",
    });
  }
};

export const confirmSubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment confirmation payload is incomplete",
      });
    }

    const isValid = verifyCheckoutSignature({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const subscription = await Subscription.findOne({
      companyId: req.companyId,
      providerSubscriptionId: razorpay_subscription_id,
    }).populate("planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found for this payment",
      });
    }

    const pending = subscription.meta?.pendingCheckout;
    if (!pending?.planCode) {
      return res.status(409).json({
        success: false,
        message: "No pending checkout found for this subscription",
      });
    }

    const plan = await getPlanByCode(pending.planCode, { activeOnly: false });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Mapped plan not found",
      });
    }

    subscription.provider = "razorpay";
    subscription.lastPaymentId = razorpay_payment_id;
    await applyPaidCycleToSubscription({
      subscription,
      plan,
      billingCycle: pending.billingCycle,
      extraRecruiterSeats: pending.extraRecruiterSeats,
      paymentId: razorpay_payment_id,
    });
    subscription.meta = {
      ...(subscription.meta || {}),
      pendingCheckout: null,
      lastConfirmSource: "client-confirm",
    };
    await subscription.save();

    await SubscriptionPayment.updateOne(
      { providerPaymentId: razorpay_payment_id },
      {
        $setOnInsert: {
          subscriptionId: subscription._id,
          companyId: subscription.companyId,
          providerPaymentId: razorpay_payment_id,
          amount: subscription.totalAmount,
          currency: subscription.currency,
          status: "CAPTURED",
          paidAt: new Date(),
          rawPayload: req.body,
        },
      },
      { upsert: true }
    );

    await runNotificationTask("confirm-subscription-payment", async () => {
      await createNotification({
        recipientModel: "Company",
        recipientId: req.companyId,
        type: "SUBSCRIPTION_ACTIVATED",
        title: "Subscription activated",
        message: `Your ${plan.name} subscription is active now.`,
        entityType: "Subscription",
        entityId: subscription._id,
        metadata: {
          planCode: plan.code,
          billingCycle: pending.billingCycle,
          paymentId: razorpay_payment_id,
        },
      });

      await notifyAdmins({
        type: "SUBSCRIPTION_ACTIVATED",
        title: "Company subscription activated",
        message: `Plan ${plan.code} activated for company ${req.companyId}.`,
        entityType: "Subscription",
        entityId: subscription._id,
        metadata: {
          companyId: req.companyId,
          planCode: plan.code,
          paymentId: razorpay_payment_id,
        },
      });
    });

    const refreshedSnapshot = await getSubscriptionSnapshot(req.companyId);
    return res.status(200).json({
      success: true,
      message: "Subscription activated",
      data: toClientSubscription(refreshedSnapshot.subscription),
      entitlements: refreshedSnapshot.entitlements,
      usage: refreshedSnapshot.usage,
    });
  } catch (error) {
    console.error("Confirm subscription error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
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
