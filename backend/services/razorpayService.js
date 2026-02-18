import crypto from "crypto";
import Razorpay from "razorpay";
import Plan from "../models/Plan.js";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const getProviderPlanKey = ({ planCode, billingCycle, extraSeats, totalAmount }) =>
  `${planCode}:${billingCycle}:${extraSeats}:${totalAmount}`;

export const createOrReuseProviderPlan = async ({
  plan,
  billingCycle,
  extraRecruiterSeats,
  totalAmount,
}) => {
  const planKey = getProviderPlanKey({
    planCode: plan.code,
    billingCycle,
    extraSeats: extraRecruiterSeats,
    totalAmount,
  });

  if (plan.providerPlanMap?.get(planKey)) {
    return {
      providerPlanId: plan.providerPlanMap.get(planKey),
      providerPlanKey: planKey,
      reused: true,
    };
  }

  const razorpay = getRazorpayClient();
  const createdPlan = await razorpay.plans.create({
    period: billingCycle === "yearly" ? "yearly" : "monthly",
    interval: 1,
    item: {
      name: `${plan.name} ${billingCycle}`,
      amount: Number(totalAmount) * 100,
      currency: plan.currency || "INR",
      description: `${plan.code} + ${extraRecruiterSeats} extra recruiter seats`,
    },
    notes: {
      planCode: plan.code,
      billingCycle,
      extraRecruiterSeats: String(extraRecruiterSeats || 0),
    },
  });

  const planDoc = await Plan.findById(plan._id);
  planDoc.providerPlanMap.set(planKey, createdPlan.id);
  await planDoc.save();

  return {
    providerPlanId: createdPlan.id,
    providerPlanKey: planKey,
    reused: false,
  };
};

export const createSubscriptionIntent = async ({
  plan,
  billingCycle,
  extraRecruiterSeats = 0,
  totalAmount,
  companyId,
}) => {
  const razorpay = getRazorpayClient();
  const { providerPlanId, providerPlanKey } = await createOrReuseProviderPlan({
    plan,
    billingCycle,
    extraRecruiterSeats,
    totalAmount,
  });

  const createdSubscription = await razorpay.subscriptions.create({
    plan_id: providerPlanId,
    customer_notify: 1,
    total_count: 120,
    notes: {
      companyId: String(companyId),
      planCode: plan.code,
      billingCycle,
      extraRecruiterSeats: String(extraRecruiterSeats || 0),
      providerPlanKey,
    },
  });

  return {
    razorpaySubscriptionId: createdSubscription.id,
    providerPlanId,
    providerPlanKey,
    currentStartUnix: createdSubscription.current_start,
    currentEndUnix: createdSubscription.current_end,
    shortUrl: createdSubscription.short_url || null,
  };
};

export const verifyCheckoutSignature = ({
  razorpay_payment_id,
  razorpay_subscription_id,
  razorpay_signature,
}) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Razorpay secret is not configured");

  const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === razorpay_signature;
};

export const verifyWebhookSignature = ({ rawBody, signature }) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Razorpay webhook secret is not configured");
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
};

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || "";
