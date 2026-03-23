import { Lock, XCircle, CheckCircle, RefreshCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeCompanyVerificationStatus } from "../utils/companyVerificationStatus";

const STATUS_UI = {
  SUBMITTED: {
    icon: Lock,
    border: "border-blue-300",
    bg: "from-blue-50 to-blue-50",
    iconBg: "bg-blue-100 text-blue-700",
    bar: "bg-blue-400",
  },
  RESUBMISSION: {
    icon: RefreshCcw,
    border: "border-amber-300",
    bg: "from-amber-50 to-amber-50",
    iconBg: "bg-amber-100 text-amber-700",
    bar: "bg-amber-400",
  },
  APPROVED: {
    icon: CheckCircle,
    border: "border-green-300",
    bg: "from-green-50 to-green-50",
    iconBg: "bg-green-100 text-green-700",
    bar: "bg-green-400",
  },
  REJECTED: {
    icon: XCircle,
    border: "border-red-300",
    bg: "from-red-50 to-red-50",
    iconBg: "bg-red-100 text-red-700",
    bar: "bg-red-400",
  },
};

export default function UnderReviewAlert({ status = "SUBMITTED", message, subMessage }) {
  const normalizedStatus = useMemo(() => normalizeCompanyVerificationStatus(status), [status]);
  const storageKey = `company_alert_${normalizedStatus}_closed`;

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const closed = localStorage.getItem(storageKey);
    setVisible(closed !== "true");
  }, [storageKey]);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(storageKey, "true");
  };

  if (!visible) return null;

  const config = STATUS_UI[normalizedStatus];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border ${config.border} bg-gradient-to-r ${config.bg} p-4 shadow-sm transition-all duration-200`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${config.bar}`} />

      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${config.iconBg}`}>
        <Icon size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{message}</p>
        {subMessage ? <p className="mt-1 text-xs leading-relaxed text-slate-700">{subMessage}</p> : null}
      </div>

      <button
        onClick={handleClose}
        className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-600"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
