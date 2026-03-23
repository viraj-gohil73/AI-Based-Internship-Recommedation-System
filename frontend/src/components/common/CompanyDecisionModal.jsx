import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";

const DECISION_META = {
  APPROVE: {
    label: "Approve",
    icon: CheckCircle2,
    iconClass: "text-emerald-700",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
    helperText: "Company profile will be marked as approved and features will be unlocked.",
  },
  REJECT: {
    label: "Reject",
    icon: XCircle,
    iconClass: "text-rose-700",
    buttonClass: "bg-rose-600 hover:bg-rose-700",
    helperText: "Company profile will be marked as rejected.",
  },
  RESUBMIT: {
    label: "Resubmit",
    icon: RotateCcw,
    iconClass: "text-blue-700",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    helperText: "Company will be asked to update profile details and resubmit.",
  },
};

export default function CompanyDecisionModal({
  open,
  company,
  decision,
  busy = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("");
  }, [open, decision, company?._id]);

  const meta = useMemo(() => DECISION_META[decision] || DECISION_META.APPROVE, [decision]);
  const Icon = meta.icon;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Icon size={18} className={meta.iconClass} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Confirm {meta.label}</h3>
              <p className="text-xs text-slate-600">{meta.helperText}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            disabled={busy}
            aria-label="Close decision modal"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            <span className="font-medium">Company:</span> {company?.companyName || "-"}
          </p>
          <p className="mt-1">
            <span className="font-medium">Email:</span> {company?.email || "-"}
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Add a short note for the company (recommended for reject/resubmit)."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            disabled={busy}
          />
          <p className="mt-1 text-xs text-slate-500">This note will be saved in verification history.</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(reason.trim())}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60 ${meta.buttonClass}`}
          >
            {busy ? <AlertTriangle size={15} className="animate-pulse" /> : <Icon size={15} />}
            {busy ? "Applying..." : `Confirm ${meta.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
