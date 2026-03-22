import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Clock3,
  Pencil,
  IndianRupee,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("active") || normalized.includes("open")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (normalized.includes("pause") || normalized.includes("hold")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (normalized.includes("close") || normalized.includes("inactive")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function detailRows(internship) {
  return [
    {
      label: "Work Mode",
      value: internship.workmode || "-",
      icon: Briefcase,
    },
    {
      label: "Employment Type",
      value: internship.employment_type || "-",
      icon: Sparkles,
    },
    {
      label: "Location",
      value: internship.location || "-",
      icon: MapPin,
    },
    {
      label: "Duration",
      value: `${internship.duration || 0} months`,
      icon: Clock3,
    },
    {
      label: "Start Date",
      value: formatDate(internship.starting_date),
      icon: CalendarDays,
    },
    {
      label: "Apply By",
      value: formatDate(internship.deadline_at),
      icon: CalendarDays,
    },
    {
      label: "Openings",
      value: String(internship.openings || 0),
      icon: Users,
    },
    {
      label: "Stipend Range",
      value: `${formatMoney(internship.stipend_min)} - ${formatMoney(internship.stipend_max)}`,
      icon: IndianRupee,
    },
  ];
}

function SectionCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{value || "-"}</p>
    </div>
  );
}

export default function RecruiterInternshipView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internship, setInternship] = useState(null);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch(`http://localhost:5000/api/recruiter/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch internship");
        setInternship(data);
      } catch (err) {
        setError(err.message || "Failed to fetch internship");
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id]);

  const rows = useMemo(() => (internship ? detailRows(internship) : []), [internship]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-36 rounded-3xl bg-blue-100/70" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-blue-100/70" />
            ))}
          </div>
          <div className="h-40 rounded-2xl bg-blue-100/70" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-600">
          Internship not found.
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-90px)] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-5">
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-5 md:p-7">
            <div className="pointer-events-none absolute -right-16 -top-10 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Internship Overview</p>
              <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{internship.title}</h1>
              <p className="mt-2 text-sm text-blue-100">
                Review role details, requirements, and hiring metadata at a glance.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(
                    internship.intern_status
                  )}`}
                >
                  {internship.intern_status || "Status unavailable"}
                </span>
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  {internship.employment_type || "Employment type"}
                </span>
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  {internship.workmode || "Work mode"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/recruiter/internships"
                className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <Link
                to={`/recruiter/internships/edit/${internship._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Pencil size={16} />
                Edit Internship
              </Link>
            </div>
          </div>
          </div>
          <div className="border-t border-blue-100 bg-blue-50/70 px-5 py-3 text-xs text-blue-700 md:px-7">
            Created: <span className="font-semibold">{formatDate(internship.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="rounded-md bg-blue-100 p-1 text-blue-700">
                    <Icon size={12} />
                  </span>
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
              </article>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard title="About Work" value={internship.about_work} />
          <SectionCard title="Who Can Apply" value={internship.who_can_apply} />
        </div>

        <SectionCard title="Other Requirements" value={internship.other_req} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(internship.skill_req || []).length ? (
                internship.skill_req.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills listed.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Perks</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(internship.perks || []).length ? (
                internship.perks.map((perk) => (
                  <span
                    key={perk}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                  >
                    {perk}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No perks listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



