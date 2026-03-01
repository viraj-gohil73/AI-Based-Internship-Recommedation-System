import { useEffect, useMemo, useState } from "react";
import { Lock, Users, Briefcase } from "lucide-react";
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

const formatCurrency = (amount) =>
  `INR ${new Intl.NumberFormat("en-IN").format(Number(amount || 0))}`;

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
    loading,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlanCode, setSelectedPlanCode] = useState("Starter");
  const [extraSeats, setExtraSeats] = useState(0);
  const selectedPlan = useMemo(
    () => plans.find((p) => p.code === selectedPlanCode) || null,
    [plans, selectedPlanCode]
  );

  useEffect(() => {
    if (!plans.length) return;
    const isCurrentSelectionValid = plans.some((p) => p.code === selectedPlanCode);
    if (!isCurrentSelectionValid) {
      setSelectedPlanCode(plans[0].code);
    }
  }, [plans, selectedPlanCode]);
  const bestChoiceCode = useMemo(() => {
    if (!plans.length) return null;
    const orderedByValue = [...plans].sort((a, b) => {
      const aPrice = Number(a.monthlyBasePrice || 0);
      const bPrice = Number(b.monthlyBasePrice || 0);
      return aPrice - bPrice;
    });
    return orderedByValue[Math.floor(orderedByValue.length / 2)]?.code || orderedByValue[0]?.code || null;
  }, [plans]);

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
            subMessage="Premium access is available after approval."
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
                const isBestChoice = bestChoiceCode === plan.code;
                const price =
                  billingCycle === "yearly" ? plan.yearlyBasePrice : plan.monthlyBasePrice;
                const seatPrice =
                  billingCycle === "yearly"
                    ? plan.addonRecruiterSeatYearlyPrice
                    : plan.addonRecruiterSeatMonthlyPrice;
                const yearlySavings = Math.max(
                  0,
                  Number(plan.monthlyBasePrice || 0) * 12 - Number(plan.yearlyBasePrice || 0)
                );
                return (
                  <button
                    key={plan._id}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-blue-500 shadow-md bg-gradient-to-b from-blue-50 to-white"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{plan.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                      </div>
                      {isBestChoice && (
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                          Best Choice
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(price)}</p>
                      <p className="text-xs text-slate-500">
                        per {billingCycle === "yearly" ? "year" : "month"}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <li>
                        {plan.includedRecruiterSeats} recruiter seat{plan.includedRecruiterSeats > 1 ? "s" : ""} included
                      </li>
                      <li>
                        {plan.maxActivePostings === null
                          ? "Unlimited active internship posts"
                          : `${plan.maxActivePostings} active internship posts`}
                      </li>
                      <li>Extra seat: {formatCurrency(seatPrice)}</li>
                      {yearlySavings > 0 && (
                        <li>Yearly savings: {formatCurrency(yearlySavings)}</li>
                      )}
                    </ul>
                    {isSelected && (
                      <p className="mt-3 inline-flex rounded-md bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                        Selected plan
                      </p>
                    )}
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
              <p>
                Recruiter seats:{" "}
                <b className="text-slate-800">
                  {(selectedPlan?.includedRecruiterSeats || 0) + Number(extraSeats || 0)}
                </b>
              </p>
              <p>
                Internship post limit:{" "}
                <b className="text-slate-800">
                  {selectedPlan?.maxActivePostings === null
                    ? "Unlimited"
                    : selectedPlan?.maxActivePostings ?? 0}
                </b>
              </p>
            </div>
          </div>

          <div
            className={`w-full rounded-lg py-2.5 px-3 text-sm font-semibold inline-flex items-center justify-center gap-2 ${
              isAccessLocked || loading
                ? "bg-slate-200 text-slate-500"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <Lock size={14} />
            {isAccessLocked || loading
              ? "Locked"
              : "Online payment is disabled. Contact admin for plan changes."}
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
