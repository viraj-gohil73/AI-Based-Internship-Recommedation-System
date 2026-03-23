import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Building2,
  Clock,
  Inbox,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CompanyDecisionModal from "../../components/common/CompanyDecisionModal";
import {
  getCompanyVerificationStatusLabel,
  normalizeCompanyVerificationStatus,
} from "../../utils/companyVerificationStatus";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const statusStyle = {
  SUBMITTED: "bg-amber-50 text-amber-700 border border-amber-200",
  RESUBMISSION: "bg-blue-50 text-blue-700 border border-blue-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  DRAFT: "bg-slate-100 text-slate-700 border border-slate-200",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const maskEmail = (email = "") => {
  if (!email || !email.includes("@")) return "****";
  const [name, domain] = email.split("@");
  if (!name) return `****@${domain || ""}`;

  const visibleStart = name.slice(0, Math.min(2, name.length));
  const visibleEnd = name.length > 4 ? name.slice(-1) : "";
  return `${visibleStart}****${visibleEnd}@${domain || ""}`;
};

const normalizeCompanyRow = (row = {}) => {
  const status = normalizeCompanyVerificationStatus(row.verificationStatus);
  return {
    ...row,
    verificationStatus: status,
    verificationLabel: getCompanyVerificationStatusLabel(status),
  };
};

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decisionState, setDecisionState] = useState({ open: false, company: null, decision: "APPROVE" });
  const [decisionBusy, setDecisionBusy] = useState(false);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmittedCompanies();
  }, []);

  const fetchSubmittedCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/companies/approvals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message || "Failed to load approvals");
        return;
      }

      const list = Array.isArray(result.data) ? result.data.map(normalizeCompanyRow) : [];
      setCompanies(list);
    } catch {
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = useMemo(() => companies.length, [companies]);

  const openDecisionModal = (company, decision) => {
    setDecisionState({ open: true, company, decision });
  };

  const closeDecisionModal = () => {
    if (decisionBusy) return;
    setDecisionState({ open: false, company: null, decision: "APPROVE" });
  };

  const applyDecision = async (reason = "") => {
    if (!decisionState.company?._id || !decisionState.decision) return;

    try {
      setDecisionBusy(true);
      const payload = {
        decision: decisionState.decision,
      };
      if (reason) payload.reason = reason;

      const res = await fetch(`${API_BASE_URL}/api/admin/company/${decisionState.company._id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Action failed");
      }

      toast.success(result.message || "Decision applied successfully");
      setCompanies((prev) => prev.filter((item) => item._id !== decisionState.company._id));
      closeDecisionModal();
    } catch (error) {
      toast.error(error.message || "Action failed");
    } finally {
      setDecisionBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Company Approval Requests</h1>
              <p className="text-sm text-slate-600">Review submissions and take quick decisions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubmittedCompanies}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Clock className="h-4 w-4" />
              Pending: {pendingCount}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-4 text-left font-semibold">Company</th>
              <th className="px-5 py-4 text-left font-semibold">Email</th>
              <th className="px-5 py-4 text-left font-semibold">Requested On</th>
              <th className="px-5 py-4 text-left font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              companies.map((c) => (
                <tr key={c._id} className="border-t border-slate-200 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {c.logo ? (
                        <img src={c.logo} alt="logo" className="h-10 w-10 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                          {c.companyName?.slice(0, 2)?.toUpperCase() || "CO"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">
                          <span title={c.companyName} className="block max-w-[220px] truncate">
                            {c.companyName}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    <HoverEmail email={c.email} className="max-w-[100px]" />
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateTime(c.createdAt)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[c.verificationStatus] || statusStyle.DRAFT}`}>
                      {c.verificationLabel}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      <ActionBtn icon={<Eye size={14} />} label="View" onClick={() => navigate(`/admin/companies/${c._id}`)} />
                      <ActionBtn
                        icon={<CheckCircle size={14} />}
                        label="Approve"
                        color="green"
                        onClick={() => openDecisionModal(c, "APPROVE")}
                      />
                      <ActionBtn
                        icon={<RotateCcw size={14} />}
                        label="Re-submit"
                        color="blue"
                        onClick={() => openDecisionModal(c, "RESUBMIT")}
                      />
                      <ActionBtn
                        icon={<XCircle size={14} />}
                        label="Reject"
                        color="red"
                        onClick={() => openDecisionModal(c, "REJECT")}
                      />
                    </div>
                  </td>
                </tr>
              ))}

            {loading && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">
                  Loading approval requests...
                </td>
              </tr>
            )}

            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Inbox className="h-5 w-5" />
                    <p>No pending approvals</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {!loading &&
          companies.map((c) => (
            <div
              key={c._id}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                {c.logo ? (
                  <img src={c.logo} alt="logo" className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                    {c.companyName?.slice(0, 2)?.toUpperCase() || "CO"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    <span title={c.companyName} className="block max-w-[180px] truncate">
                      {c.companyName}
                    </span>
                  </p>
                  <HoverEmail email={c.email} className="max-w-[210px] text-xs text-slate-500" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Requested
                </span>
                <span className="font-medium text-slate-700">{formatDateTime(c.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/admin/companies/${c._id}`)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600"
                >
                  <Eye size={16} />
                  View Details
                </button>

                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[c.verificationStatus] || statusStyle.DRAFT}`}>
                  {c.verificationLabel}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <MobileBtn label="Approve" color="green" onClick={() => openDecisionModal(c, "APPROVE")} />
                <MobileBtn label="Re-Submit" color="blue" onClick={() => openDecisionModal(c, "RESUBMIT")} />
                <MobileBtn label="Reject" color="red" onClick={() => openDecisionModal(c, "REJECT")} />
              </div>
            </div>
          ))}

        {loading && <div className="py-8 text-center text-slate-500">Loading approval requests...</div>}

        {!loading && companies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10">
            <div className="flex flex-col items-center gap-2 text-center text-slate-500">
              <Inbox className="h-5 w-5" />
              No pending approvals
            </div>
          </div>
        )}
      </div>

      <CompanyDecisionModal
        open={decisionState.open}
        company={decisionState.company}
        decision={decisionState.decision}
        busy={decisionBusy}
        onClose={closeDecisionModal}
        onConfirm={applyDecision}
      />
    </div>
  );
}

function ActionBtn({ icon, label, onClick, color }) {
  const map = {
    green: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-rose-600 hover:bg-rose-700",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
        color ? `text-white ${map[color]}` : "border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileBtn({ label, onClick, color }) {
  const map = {
    green: "bg-emerald-600",
    blue: "bg-blue-600",
    red: "bg-rose-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white ${map[color]}`}
    >
      {label}
    </button>
  );
}

function HoverEmail({ email = "", className = "" }) {
  return (
    <span className={`group relative block ${className}`}>
      <span title={email} className="block truncate">
        {maskEmail(email)}
      </span>
      <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden max-w-[280px] whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
        {email}
      </span>
    </span>
  );
}


