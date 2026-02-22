import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { verifyWebhookSignature } from "../services/razorpayService.js";
import { SUBSCRIPTION_STATUSES } from "../services/subscriptionService.js";
import {
  createNotification,
  notifyAdmins,
  runNotificationTask,
} from "../services/notificationService.js";

const fromUnixSeconds = (value) => {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Date(n * 1000);
};

const resolveStatusFromEvent = (event) => {
  if (
    event === "subscription.charged" ||
    event === "subscription.activated" ||
    event === "subscription.authenticated"
  ) {
    return SUBSCRIPTION_STATUSES.ACTIVE;
  }
  if (event === "subscription.halted" || event === "payment.failed") {
    return SUBSCRIPTION_STATUSES.PAST_DUE;
  }
  if (event === "subscription.cancelled") {
    return SUBSCRIPTION_STATUSES.CANCELLED;
  }
  if (event === "subscription.completed" || event === "subscription.expired") {
    return SUBSCRIPTION_STATUSES.EXPIRED;
  }
  return null;
};

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const eventId = req.headers["x-razorpay-event-id"] || null;
    const rawBody = req.body;

    const valid = verifyWebhookSignature({
      rawBody: rawBody.toString("utf8"),
      signature,
    });

    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const event = payload.event;
    const subscriptionEntity = payload?.payload?.subscription?.entity || null;
    const paymentEntity = payload?.payload?.payment?.entity || null;
    const providerSubscriptionId = subscriptionEntity?.id || paymentEntity?.subscription_id;

    if (!providerSubscriptionId) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const subscription = await Subscription.findOne({
      providerSubscriptionId,
    }).populate("planId");

    if (!subscription) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const nextStatus = resolveStatusFromEvent(event);
    if (nextStatus) {
      subscription.status = nextStatus;
    }

    if (subscriptionEntity?.plan_id) {
      subscription.providerPlanId = subscriptionEntity.plan_id;
    }

    const periodStart =
      fromUnixSeconds(subscriptionEntity?.current_start) ||
      fromUnixSeconds(subscriptionEntity?.start_at);
    const periodEnd =
      fromUnixSeconds(subscriptionEntity?.current_end) ||
      fromUnixSeconds(subscriptionEntity?.end_at);

    if (periodStart) subscription.currentPeriodStart = periodStart;
    if (periodEnd) subscription.currentPeriodEnd = periodEnd;

    if (event === "subscription.cancelled") {
      subscription.cancelledAt = new Date();
      subscription.cancelAtPeriodEnd = false;
    }

    if (paymentEntity?.id) {
      subscription.lastPaymentId = paymentEntity.id;
    }

    subscription.meta = {
      ...(subscription.meta || {}),
      lastWebhookEvent: event,
      lastWebhookAt: new Date().toISOString(),
    };
    await subscription.save();

    await runNotificationTask("razorpay-webhook", async () => {
      await createNotification({
        recipientModel: "Company",
        recipientId: subscription.companyId,
        type: "SUBSCRIPTION_WEBHOOK_EVENT",
        title: "Subscription update",
        message: `Subscription event received: ${event}. Current status: ${subscription.status}.`,
        entityType: "Subscription",
        entityId: subscription._id,
        metadata: {
          event,
          providerSubscriptionId,
          paymentId: paymentEntity?.id || null,
        },
      });

      await notifyAdmins({
        type: "SUBSCRIPTION_WEBHOOK_EVENT",
        title: "Subscription webhook processed",
        message: `Event ${event} processed for subscription ${providerSubscriptionId}.`,
        entityType: "Subscription",
        entityId: subscription._id,
        metadata: {
          event,
          companyId: subscription.companyId,
          paymentId: paymentEntity?.id || null,
        },
      });
    });

    if (paymentEntity?.id) {
      await SubscriptionPayment.updateOne(
        {
          providerPaymentId: paymentEntity.id,
        },
        {
          $setOnInsert: {
            subscriptionId: subscription._id,
            companyId: subscription.companyId,
            providerEventId: eventId,
            providerPaymentId: paymentEntity.id,
            providerOrderId: paymentEntity.order_id || null,
            providerInvoiceId: paymentEntity.invoice_id || null,
            amount: (paymentEntity.amount || 0) / 100,
            currency: paymentEntity.currency || "INR",
            status: paymentEntity.status || event,
            paidAt: paymentEntity.captured_at
              ? new Date(Number(paymentEntity.captured_at) * 1000)
              : new Date(),
            rawPayload: payload,
          },
          $set: {
            providerEventId: eventId,
          },
        },
        { upsert: true }
      );
    } else if (eventId) {
      await SubscriptionPayment.updateOne(
        { providerEventId: eventId },
        {
          $setOnInsert: {
            subscriptionId: subscription._id,
            companyId: subscription.companyId,
            providerEventId: eventId,
            amount: subscription.totalAmount,
            currency: subscription.currency || "INR",
            status: event,
            paidAt: null,
            rawPayload: payload,
          },
        },
        { upsert: true }
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({ success: false, message: "Webhook failed" });
  }
};
