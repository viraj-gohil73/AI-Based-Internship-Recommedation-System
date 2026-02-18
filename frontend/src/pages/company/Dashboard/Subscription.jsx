import { useMemo, useState } from "react";
import { CreditCard, Lock, Receipt, Users, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext";
import { useSubscription } from "../../../context/SubscriptionContext";

const STATUS_BADGE = {
  TRIAL: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  EXPIRED: "bg-rose-100 text-rose-700",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const formatCurrency = (amount) =>
  `INR ${new Intl.NumberFormat("en-IN").format(Number(amount || 0))}`;

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const daysLeft = (date) => {
  if (!date) return null;
  const end = new Date(date).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
};

export default function Subscription() {
  const { company } = useCompany();
  const {
    plans,
    current,
    entitlements,
    usage,
    payments,
    loading,
    refreshAll,
    createCheckoutIntent,
    confirmCheckout,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlanCode, setSelectedPlanCode] = useState("Starter");
  const [extraSeats, setExtraSeats] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode) || null,
    [plans, selectedPlanCode]
  );

  const amountPreview = useMemo(() => {
    if (!selectedPlan) return { base: 0, addon: 0, total: 0 };
    const base =
      billingCycle === "yearly"
        ? selectedPlan.yearlyBasePrice
        : selectedPlan.monthlyBasePrice;
    const addonRate =
      billingCycle === "yearly"
        ? selectedPlan.addonRecruiterSeatYearlyPrice
        : selectedPlan.addonRecruiterSeatMonthlyPrice;
    const addon = addonRate * Number(extraSeats || 0);
    return { base, addon, total: base + addon };
  }, [selectedPlan, billingCycle, extraSeats]);

  const isApproved = company?.verificationStatus === "APPROVED";
  const isBlockedStatus = ["PAST_DUE", "CANCELLED", "EXPIRED"].includes(
    current?.status
  );
  const isAccessLocked = !isApproved || !entitlements?.accessAllowed;
  const trialLeft = current?.status === "TRIAL" ? daysLeft(current?.trialEndsAt) : null;

  const startCheckout = async () => {
    try {
      setCheckingOut(true);
      if (!selectedPlan) throw new Error("Please select a plan");
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error("Razorpay SDK failed to load");

      const intent = await createCheckoutIntent({
        planCode: selectedPlan.code,
        billingCycle,
        extraRecruiterSeats: Number(extraSeats || 0),
      });

      if (!intent?.keyId || !intent?.razorpaySubscriptionId) {
        throw new Error("Invalid checkout response");
      }

      const razorpay = new window.Razorpay({
        key: intent.keyId,
        subscription_id: intent.razorpaySubscriptionId,
        name: "Internship Portal",
        description: `${selectedPlan.name} (${billingCycle})`,
        prefill: {
          email: company?.email || "",
        },
        theme: { color: "#1d4ed8" },
        handler: async (response) => {
          await confirmCheckout(response);
          toast.success("Subscription activated");
          await refreshAll();
        },
      });

      razorpay.on("payment.failed", (resp) => {
        const message =
          resp?.error?.description ||
          resp?.error?.reason ||
          "Payment failed, please retry";
        toast.error(message);
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.message || "Unable to start checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">Subscription</h1>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">
            Approval + active trial/plan required for recruiter and posting actions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[current?.status] || "bg-white/20 text-white"}`}>
              Status: {current?.status || "NA"}
            </span>
            {trialLeft !== null && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                Trial left: {trialLeft} day(s)
              </span>
            )}
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              Current plan: {current?.planCodeSnapshot || "Starter"}
            </span>
          </div>
        </section>

        {!isApproved && (
          <UnderReviewAlert
            message="Your company profile is under admin review."
            subMessage="Payment and premium access are available after approval."
          />
        )}

        {isBlockedStatus && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Subscription is {current?.status}. Protected features are blocked until successful renewal.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UsageCard icon={Users} label="Recruiters" value={`${usage?.recruitersCount || 0} / ${current?.totalRecruiterSeats ?? 0}`} />
          <UsageCard
            icon={Briefcase}
            label="Active Postings"
            value={
              current?.maxActivePostings === null
                ? `${usage?.activePostingsCount || 0} / Unlimited`
                : `${usage?.activePostingsCount || 0} / ${current?.maxActivePostings || 0}`
            }
          />
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Upgrade Plan</h2>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${billingCycle === "monthly" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${billingCycle === "yearly" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`}
              >
                Yearly
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading plans...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedPlanCode === plan.code;
                const price =
                  billingCycle === "yearly" ? plan.yearlyBasePrice : plan.monthlyBasePrice;
                return (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-blue-500 shadow-md bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.description}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(price)}</p>
                    <p className="text-xs text-slate-500">
                      Includes {plan.includedRecruiterSeats} seats,{" "}
                      {plan.maxActivePostings === null
                        ? "unlimited postings"
                        : `${plan.maxActivePostings} active postings`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-slate-700">
              Extra recruiter seats
              <input
                type="number"
                min={0}
                value={extraSeats}
                onChange={(e) => setExtraSeats(Math.max(0, Number(e.target.value || 0)))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </label>
            <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
              <p>Base: <b className="text-slate-800">{formatCurrency(amountPreview.base)}</b></p>
              <p>Add-on: <b className="text-slate-800">{formatCurrency(amountPreview.addon)}</b></p>
              <p>Total: <b className="text-slate-900">{formatCurrency(amountPreview.total)}</b></p>
            </div>
          </div>

          <button
            type="button"
            onClick={startCheckout}
            disabled={isAccessLocked || checkingOut || loading}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 ${
              isAccessLocked || loading
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {isAccessLocked ? (
              <>
                <Lock size={14} /> Locked
              </>
            ) : (
              <>
                <CreditCard size={14} /> {checkingOut ? "Starting checkout..." : "Pay with Razorpay"}
              </>
            )}
          </button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl border border-blue-100 bg-white shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 inline-flex items-center gap-2">
              <Receipt size={18} className="text-blue-600" /> Billing History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="text-left py-2">Payment Id</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments || []).length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-slate-500 text-center">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                  {(payments || []).map((payment) => (
                    <tr key={payment._id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium text-slate-800">
                        {payment.providerPaymentId || payment.providerEventId || payment._id}
                      </td>
                      <td className="py-3 text-slate-600">
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </td>
                      <td className="py-3 text-slate-800">{formatCurrency(payment.amount)}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Billing Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Current Plan" value={current?.planCodeSnapshot || "-"} />
              <SummaryRow label="Cycle" value={current?.billingCycle || "-"} />
              <SummaryRow
                label="Next Billing"
                value={formatDate(current?.currentPeriodEnd || current?.trialEndsAt)}
              />
              <SummaryRow label="Amount" value={formatCurrency(current?.totalAmount)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function UsageCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
