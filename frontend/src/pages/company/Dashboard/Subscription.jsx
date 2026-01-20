import { Check, CreditCard, Crown, Lock } from "lucide-react";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext";

export default function Subscription() {
  const { company } = useCompany();
  const isLocked = company?.verificationStatus !== "APPROVED";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* 🔒 UNDER REVIEW ALERT */}
      {isLocked && (
        <div className="mb-6">
          <UnderReviewAlert
            message="Your company profile is under admin review."
            subMessage="You can upgrade plans after approval."
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upgrade your plan to unlock more recruiters, visibility, and analytics.
        </p>
      </div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <PlanCard
          title="Free"
          price="₹0"
          duration="Forever"
          current
          isLocked={isLocked}
          features={[
            "Company profile listing",
            "Post up to 2 internships",
            "Limited recruiter access",
            "Basic analytics",
          ]}
        />

        <PlanCard
          title="Starter"
          price="₹999"
          duration="/month"
          popular
          isLocked={isLocked}
          features={[
            "Unlimited internships",
            "Up to 5 recruiters",
            "Priority listing",
            "Email support",
          ]}
        />

        <PlanCard
          title="Pro"
          price="₹2999"
          duration="/month"
          premium
          isLocked={isLocked}
          features={[
            "Unlimited internships",
            "Unlimited recruiters",
            "Top priority listing",
            "Advanced analytics",
            "Dedicated support",
          ]}
        />
      </div>

      {/* Billing Info */}
      <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="font-medium text-slate-800">Billing & Cancellation</p>
        <p className="mt-1 text-slate-500">
          All plans are billed monthly. You can upgrade, downgrade, or cancel at any time.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Plan Card ---------------- */

function PlanCard({
  title,
  price,
  duration,
  features,
  current,
  popular,
  premium,
  isLocked,
}) {
  const disableUpgrade = isLocked || current;

  return (
    <div
      className={`relative flex flex-col rounded-xl bg-white p-5 transition
        ${
          popular
            ? "border-2 border-blue-600 shadow-md"
            : "border border-slate-200 shadow-sm"
        }
        ${disableUpgrade && !current ? "opacity-70" : ""}
      `}
    >
      {/* Badges */}
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
          Most Popular
        </span>
      )}

      {premium && (
        <Crown className="absolute right-4 top-4 text-yellow-500" size={18} />
      )}

      {/* Title */}
      <h2 className="text-base font-semibold text-slate-800">
        {title}
      </h2>

      {/* Price */}
      <div className="mt-2 flex items-end gap-1">
        <span className="text-2xl font-bold text-slate-900">{price}</span>
        <span className="text-xs text-slate-500">{duration}</span>
      </div>

      <div className="my-4 h-px bg-slate-200" />

      {/* Features */}
      <ul className="space-y-2 text-sm text-slate-600">
        {features.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={14} className="mt-1 text-green-600" />
            {item}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-5">
        {current ? (
          <button
            disabled
            className="w-full rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
          >
            Current Plan
          </button>
        ) : (
          <button
            disabled={isLocked}
            className={`w-full rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2
              ${
                isLocked
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isLocked ? (
              <>
                <Lock size={14} />
                Locked
              </>
            ) : (
              <>
                <CreditCard size={14} />
                Upgrade Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
