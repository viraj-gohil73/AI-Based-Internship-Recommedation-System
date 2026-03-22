import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Edit3,
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
  const value = String(status || "").toUpperCase();
  if (value === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (value === "CLOSED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function CompanyInternshipView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internship, setInternship] = useState(null);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/company/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch internship");
        setInternship(data.internship || null);
      } catch (err) {
        setError(err.message || "Failed to fetch internship");
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id]);

  const stipendLabel = useMemo(() => {
    if (!internship) return "-";
    return `${formatMoney(internship.stipend_min)} - ${formatMoney(internship.stipend_max)}`;
  }, [internship]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="h-32 rounded-3xl bg-slate-100" />
          <div className="h-72 rounded-3xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Internship not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#eef2ff,_transparent_48%),linear-gradient(to_bottom,_#f8fafc,_#eff6ff)] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles size={13} />
                Internship Overview
              </p>

              <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{internship.title}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(internship.intern_status)}`}>
                  <CircleDot size={12} />
                  {internship.intern_status || "DRAFT"}
                </span>
                <span className="text-slate-400">|</span>
                <span>Recruiter: {internship.recruiter?.name || "-"}</span>
                <span className="text-slate-400">|</span>
                <span>Applications: {internship.applicationsCount || 0}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/company/dashboard/internships"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <Link
                to={`/company/dashboard/internships/${internship._id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700"
              >
                <Edit3 size={16} />
                Edit Internship
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Briefcase} title="Work Setup" lines={[
            `Mode: ${internship.workmode || "-"}`,
            `Type: ${internship.employment_type || "-"}`,
            `Location: ${internship.location || "-"}`,
          ]} />

          <MetricCard icon={CalendarClock} title="Timeline" lines={[
            `Duration: ${internship.duration || 0} months`,
            `Start: ${formatDate(internship.starting_date)}`,
            `Deadline: ${formatDate(internship.deadline_at)}`,
          ]} />

          <MetricCard icon={IndianRupee} title="Compensation" lines={[
            `Stipend: ${stipendLabel}`,
            `Openings: ${internship.openings || 0}`,
            `Status: ${internship.intern_status || "-"}`,
          ]} />

          <MetricCard icon={Users} title="Applicants" lines={[
            `Total Applications: ${internship.applicationsCount || 0}`,
            `Recruiter: ${internship.recruiter?.name || "-"}`,
            `Recruiter Email: ${internship.recruiter?.email || "-"}`,
          ]} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ContentCard title="About Work" icon={Briefcase}>
            <p className="text-sm leading-6 text-slate-700">{internship.about_work || "-"}</p>
          </ContentCard>

          <ContentCard title="Who Can Apply" icon={CheckCircle2}>
            <p className="text-sm leading-6 text-slate-700">{internship.who_can_apply || "-"}</p>
          </ContentCard>
        </section>

        <ContentCard title="Other Requirements" icon={MapPin}>
          <p className="text-sm leading-6 text-slate-700">{internship.other_req || "-"}</p>
        </ContentCard>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TagCard
            title="Skills"
            tone="blue"
            items={internship.skill_req || []}
            emptyText="No skills listed."
          />
          <TagCard
            title="Perks"
            tone="emerald"
            items={internship.perks || []}
            emptyText="No perks listed."
          />
        </section>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, lines }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
          <Icon size={16} />
        </span>
        {title}
      </div>
      <div className="space-y-1.5">
        {lines.map((line) => (
          <p key={line} className="text-sm text-slate-600">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function ContentCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 text-blue-700">
          <Icon size={16} />
        </span>
        {title}
      </div>
      {children}
    </section>
  );
}

function TagCard({ title, items, emptyText, tone = "blue" }) {
  const palette =
    tone === "emerald"
      ? {
          chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        }
      : {
          chip: "bg-blue-100 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
        {title}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={item}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${palette.chip}`}
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

