import { useEffect, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/company/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();
      if (!result.success) {
        toast.error("Failed to load company details");
        return;
      }
      setCompany(result.data);
    } catch {
      toast.error("Failed to load company details");
    }
  };

  if (!company) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Loading company details...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-3 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center cursor-pointer rounded-full border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3">
            {company.logo ? (
              <img
                src={company.logo}
                alt="logo"
                className="w-11 h-11 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                {company.companyName?.slice(0, 2)?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{company.companyName}</h1>
              <StatusBadge status={company.verificationStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="mx-auto max-w-7xl space-y-6 px-1 md:px-4">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Company Overview</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {company.companyName}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {company.industry || "Industry not provided"} |{" "}
                {company.city || "City not provided"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatChip label="Founded" value={company.foundedYear || "-"} />
              <StatChip label="Team Size" value={company.companySize || "-"} />
              <StatChip label="Status" value={company.verificationStatus || "-"} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
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
            <p className="text-sm text-slate-700 leading-relaxed">
              {company.about || "-"}
            </p>
          </Card>

          <Card title="Address" iconColor="orange">
            <InfoRow icon={<MapPin />} color="orange" label="Address">
              {company.address1} {company.address2}
            </InfoRow>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <KeyValue label="City" value={company.city} />
              <KeyValue label="State" value={company.state} />
              <KeyValue label="Pincode" value={company.pincode} />
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card title="Company Meta" iconColor="pink">
            <KeyValue
              icon={<Calendar />}
              color="violet"
              label="Founded Year"
              value={company.foundedYear || "-"}
            />

            <KeyValue
              icon={<Users />}
              color="pink"
              label="Company Size"
              value={company.companySize || "-"}
            />

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
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Card({ title, iconColor = "indigo", children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 font-semibold text-sm text-slate-800 border-b border-slate-100 pb-3">
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
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`h-9 w-9 flex items-center justify-center rounded-full border ${map[color]}`}
    >
      {children}
    </span>
  );
}

function InfoRow({ icon, label, color = "slate", children }) {
  return (
    <div className="flex gap-4 items-start text-sm">
      <IconCircle color={color}>{icon}</IconCircle>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">
          {children}
        </p>
      </div>
    </div>
  );
}

function KeyValue({ icon, label, value, color = "slate" }) {
  return (
    <div className="flex gap-4 items-start text-sm">
      {icon && <IconCircle color={color}>{icon}</IconCircle>}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    DRAFT: "bg-slate-100 text-slate-700",
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    RESUBMISSION: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-medium ${map[status] || map.DRAFT}`}
    >
      {status}
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
