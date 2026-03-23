import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  FileText,
  BadgeCheck,
  ExternalLink,
  CheckCircle,
  RotateCcw,
  XCircle,
  MessageSquareText,
} from "lucide-react";
import toast from "react-hot-toast";
import CompanyDecisionModal from "../../components/common/CompanyDecisionModal";
import {
  getCompanyVerificationStatusLabel,
  normalizeCompanyVerificationStatus,
} from "../../utils/companyVerificationStatus";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionState, setDecisionState] = useState({ open: false, decision: "APPROVE" });
  const [decisionBusy, setDecisionBusy] = useState(false);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/company/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.message || "Failed to load company details");
        return;
      }
      setCompany(result.data);
    } catch {
      toast.error("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  const normalizedStatus = useMemo(
    () => normalizeCompanyVerificationStatus(company?.verificationStatus),
    [company?.verificationStatus]
  );

  const statusLabel = useMemo(
    () => getCompanyVerificationStatusLabel(normalizedStatus),
    [normalizedStatus]
  );

  const decisionReason = company?.verification?.adminDecisionReason || "";

  const openDecisionModal = (decision) => {
    setDecisionState({ open: true, decision });
  };

  const closeDecisionModal = () => {
    if (decisionBusy) return;
    setDecisionState({ open: false, decision: "APPROVE" });
  };

  const applyDecision = async (reason = "") => {
    if (!company?._id) return;

    try {
      setDecisionBusy(true);
      const payload = { decision: decisionState.decision };
      if (reason) payload.reason = reason;

      const res = await fetch(`${API_BASE_URL}/api/admin/company/${company._id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to apply decision");
      }

      toast.success(result.message || "Decision applied successfully");
      closeDecisionModal();
      await fetchCompany();
    } catch (error) {
      toast.error(error.message || "Failed to apply decision");
    } finally {
      setDecisionBusy(false);
    }
  };

  if (loading || !company) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Loading company details...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3">
            {company.logo ? (
              <img src={company.logo} alt="logo" className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                {company.companyName?.slice(0, 2)?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{company.companyName}</h1>
              <StatusBadge status={normalizedStatus} label={statusLabel} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-1 md:px-4">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Company Overview</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{company.companyName}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {company.industry || "Industry not provided"} | {company.city || "City not provided"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatChip label="Founded" value={company.foundedYear || "-"} />
              <StatChip label="Team Size" value={company.companySize || "-"} />
              <StatChip label="Status" value={statusLabel || "-"} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <ActionPill icon={CheckCircle} label="Approve" color="green" onClick={() => openDecisionModal("APPROVE")} />
            <ActionPill icon={RotateCcw} label="Re-submit" color="blue" onClick={() => openDecisionModal("RESUBMIT")} />
            <ActionPill icon={XCircle} label="Reject" color="red" onClick={() => openDecisionModal("REJECT")} />
          </div>
        </section>

        {decisionReason ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700">
                <MessageSquareText size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Reason from admin</p>
                <p className="mt-1 text-sm text-amber-800">{decisionReason}</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Company Information" iconColor="indigo">
              <InfoRow icon={<Mail />} color="blue" label="Email">
                {company.email}
              </InfoRow>

              <InfoRow icon={<Phone />} color="emerald" label="Mobile">
                {company.mobile}
              </InfoRow>

              <InfoRow icon={<Globe />} color="cyan" label="Website">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    {company.website} <ExternalLink size={14} />
                  </a>
                ) : (
                  "-"
                )}
              </InfoRow>

              <InfoRow icon={<BadgeCheck />} color="indigo" label="Industry">
                {company.industry || "-"}
              </InfoRow>
            </Card>

            <Card title="About Company" iconColor="violet">
              <p className="text-sm leading-relaxed text-slate-700">{company.about || "-"}</p>
            </Card>

            <Card title="Address" iconColor="orange">
              <InfoRow icon={<MapPin />} color="orange" label="Address">
                {company.address1} {company.address2}
              </InfoRow>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <KeyValue label="City" value={company.city} />
                <KeyValue label="State" value={company.state} />
                <KeyValue label="Pincode" value={company.pincode} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Company Meta" iconColor="pink">
              <KeyValue icon={<Calendar />} color="violet" label="Founded Year" value={company.foundedYear || "-"} />

              <KeyValue icon={<Users />} color="pink" label="Company Size" value={company.companySize || "-"} />

              <KeyValue label="GST No" value={company.gst_no || "-"} />
            </Card>

            <Card title="Documents" iconColor="amber">
              {company.reg_doc ? (
                <a
                  href={company.reg_doc}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 hover:bg-amber-100"
                >
                  <span className="inline-flex items-center gap-3">
                    <IconCircle color="amber">
                      <FileText size={16} />
                    </IconCircle>
                    Registration Document
                  </span>
                  <ExternalLink size={16} />
                </a>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  No document uploaded
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      <CompanyDecisionModal
        open={decisionState.open}
        company={company}
        decision={decisionState.decision}
        busy={decisionBusy}
        onClose={closeDecisionModal}
        onConfirm={applyDecision}
      />
    </div>
  );
}

function ActionPill({ icon: Icon, label, onClick, color = "green" }) {
  const map = {
    green: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-rose-600 hover:bg-rose-700",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white ${map[color]}`}
      type="button"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function Card({ title, iconColor = "indigo", children }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-800">
        <IconCircle color={iconColor}>
          <Building2 size={16} />
        </IconCircle>
        {title}
      </div>
      {children}
    </div>
  );
}

function IconCircle({ children, color = "slate" }) {
  const map = {
    indigo: "border-indigo-200 bg-indigo-100 text-indigo-700",
    blue: "border-blue-200 bg-blue-100 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-100 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-100 text-cyan-700",
    orange: "border-orange-200 bg-orange-100 text-orange-700",
    violet: "border-violet-200 bg-violet-100 text-violet-700",
    pink: "border-pink-200 bg-pink-100 text-pink-700",
    amber: "border-amber-200 bg-amber-100 text-amber-700",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${map[color]}`}>{children}</span>;
}

function InfoRow({ icon, label, color = "slate", children }) {
  return (
    <div className="flex items-start gap-4 text-sm">
      <IconCircle color={color}>{icon}</IconCircle>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{children}</p>
      </div>
    </div>
  );
}

function KeyValue({ icon, label, value, color = "slate" }) {
  return (
    <div className="flex items-start gap-4 text-sm">
      {icon ? <IconCircle color={color}>{icon}</IconCircle> : null}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const map = {
    DRAFT: "bg-slate-100 text-slate-700",
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    RESUBMISSION: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${map[status] || map.DRAFT}`}>
      {label || status}
    </span>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
