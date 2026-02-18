import { useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  Crown,
  Lock,
  Receipt,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext";

const PLAN_DEFINITIONS = [
  {
    id: "free",
    title: "Free",
    subtitle: "For early-stage teams",
    monthly: 0,
    yearly: 0,
    recruiters: "Up to 2 recruiters",
    postings: "Up to 3 active postings",
    support: "Community support",
    analytics: "Basic analytics",
  },
  {
    id: "growth",
    title: "Growth",
    subtitle: "Best for hiring teams",
    monthly: 1499,
    yearly: 13999,
    recruiters: "Up to 10 recruiters",
    postings: "Unlimited postings",
    support: "Priority email support",
    analytics: "Advanced analytics",
    popular: true,
  },
  {
    id: "scale",
    title: "Scale",
    subtitle: "For high-volume companies",
    monthly: 3999,
    yearly: 37999,
    recruiters: "Unlimited recruiters",
    postings: "Unlimited postings",
    support: "Dedicated manager",
    analytics: "Premium analytics + exports",
    premium: true,
  },
];

const INVOICES = [
  { id: "INV-2026-021", date: "2026-02-04", amount: 1499, status: "Paid" },
  { id: "INV-2026-001", date: "2026-01-04", amount: 1499, status: "Paid" },
  { id: "INV-2025-120", date: "2025-12-04", amount: 1499, status: "Paid" },
];

export default function Subscription() {
  const { company } = useCompany();
  const isLocked = company?.verificationStatus !== "APPROVED";

  const [billingCycle, setBillingCycle] = useState("monthly");
  const currentPlanId = "growth";

  const plans = useMemo(
    () =>
      PLAN_DEFINITIONS.map((plan) => ({
        ...plan,
        price: billingCycle === "monthly" ? plan.monthly : plan.yearly,
      })),
    [billingCycle]
  );

  const usage = {
    recruiters: 6,
    activePostings: 12,
    monthlyViews: 2842,
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">Subscription</h1>
          <p className="text-blue-100 mt-1 text-sm sm:text-base">
            Manage your plan, billing cycle, and platform usage.
          </p>
        </section>

        {isLocked && (
          <UnderReviewAlert
            message="Your company profile is under admin review."
            subMessage="Plan upgrades will be enabled after approval."
          />
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageCard icon={Users} label="Recruiters" value={`${usage.recruiters} / 10`} />
          <UsageCard icon={Briefcase} label="Active Postings" value={usage.activePostings} />
          <UsageCard icon={TrendingUp} label="Monthly Profile Views" value={usage.monthlyViews} />
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Choose Plan</h2>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  billingCycle === "monthly"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  billingCycle === "yearly"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const disabledUpgrade = isLocked || isCurrent;

              return (
                <article
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 flex flex-col ${
                    plan.popular
                      ? "border-blue-500 shadow-md"
                      : "border-slate-200 shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white text-xs px-3 py-1 font-medium">
                      Most Popular
                    </span>
                  )}

                  {plan.premium && <Crown className="absolute top-4 right-4 text-amber-500" size={18} />}

                  <h3 className="text-base font-semibold text-slate-900">{plan.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.subtitle}</p>

                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-bold text-slate-900">Rs. {plan.price}</span>
                    <span className="text-xs text-slate-500">
                      / {billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {[plan.recruiters, plan.postings, plan.support, plan.analytics].map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check size={14} className="mt-1 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={disabledUpgrade}
                    className={`mt-5 w-full rounded-lg py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${
                      isCurrent
                        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                        : isLocked
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {isCurrent ? (
                      "Current Plan"
                    ) : isLocked ? (
                      <>
                        <Lock size={14} /> Locked
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} /> Upgrade Plan
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
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
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium text-slate-800">{invoice.id}</td>
                      <td className="py-3 text-slate-600">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-800">Rs. {invoice.amount}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                          {invoice.status}
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
              <SummaryRow label="Current Plan" value="Growth" />
              <SummaryRow label="Cycle" value={billingCycle === "monthly" ? "Monthly" : "Yearly"} />
              <SummaryRow label="Next Billing" value="March 04, 2026" />
              <SummaryRow label="Payment Method" value="Visa ending 1242" />
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Payment Method
            </button>
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
