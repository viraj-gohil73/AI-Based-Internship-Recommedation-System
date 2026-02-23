import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CircleCheckBig,
  Clock4,
  FilePlus2,
  ListFilter,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function getEffectiveInternshipStatus(internship) {
  if (!internship) return "-";
  if (internship.intern_status === "ACTIVE" && internship.deadline_at) {
    const deadline = new Date(internship.deadline_at);
    if (!Number.isNaN(deadline.getTime()) && deadline < new Date()) return "EXPIRED";
  }
  return internship.intern_status || "-";
}

function studentLabel(student) {
  if (!student) return "Candidate";
  const first = student.fname || "";
  const last = student.lname || "";
  const full = `${first} ${last}`.trim();
  return full || student.name || student.email || "Candidate";
}

function internshipLabel(internship) {
  if (!internship) return "Internship";
  return internship.title || "Internship";
}

function statusColor(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("scheduled")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized.includes("completed")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (normalized.includes("cancel")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized.includes("no_show")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const loadData = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("recruiterToken");
      const [internshipRes, applicantRes, interviewRes] = await Promise.all([
        fetch("http://localhost:5000/api/recruiter/internships", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/recruiter/applicants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/recruiter/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const internshipData = await internshipRes.json();
      const applicantData = await applicantRes.json();
      const interviewData = await interviewRes.json();

      if (!internshipRes.ok) throw new Error(internshipData.message || "Failed to fetch internships");
      if (!applicantRes.ok) throw new Error(applicantData.message || "Failed to fetch applicants");
      if (!interviewRes.ok) throw new Error(interviewData.message || "Failed to fetch interviews");

      setInternships(Array.isArray(internshipData) ? internshipData : []);
      setApplicants(Array.isArray(applicantData.applicants) ? applicantData.applicants : []);
      setInterviews(Array.isArray(interviewData.interviews) ? interviewData.interviews : []);
    } catch (error) {
      toast.error(error.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const activeInternships = internships.filter((row) => getEffectiveInternshipStatus(row) === "ACTIVE").length;
    const selectedApplicants = applicants.filter((row) => row.status === "SELECTED").length;
    const upcomingInterviews = interviews.filter((row) => {
      if (row.status !== "SCHEDULED") return false;
      const dt = new Date(row.scheduledAt);
      return !Number.isNaN(dt.getTime()) && dt >= new Date();
    }).length;

    const completion = applicants.length ? Math.round((selectedApplicants / applicants.length) * 100) : 0;

    return {
      activeInternships,
      selectedApplicants,
      upcomingInterviews,
      completion,
    };
  }, [internships, applicants, interviews]);

  const stats = useMemo(
    () => [
      {
        label: "Active Internships",
        value: String(metrics.activeInternships),
        note: `${internships.length} total listings`,
        icon: BriefcaseBusiness,
        accent: "from-blue-500 to-indigo-600",
      },
      {
        label: "New Applicants",
        value: String(applicants.length),
        note: "Across all your internships",
        icon: Users,
        accent: "from-emerald-500 to-teal-600",
      },
      {
        label: "Interviews Scheduled",
        value: String(metrics.upcomingInterviews),
        note: "Upcoming rounds",
        icon: CalendarClock,
        accent: "from-indigo-500 to-violet-600",
      },
      {
        label: "Selection Rate",
        value: `${metrics.completion}%`,
        note: "Selected vs total applicants",
        icon: CircleCheckBig,
        accent: "from-orange-500 to-amber-500",
      },
    ],
    [metrics, internships.length, applicants.length]
  );

  const upcoming = useMemo(() => {
    return interviews
      .filter((item) => {
        const dt = new Date(item.scheduledAt);
        return !Number.isNaN(dt.getTime()) && dt >= new Date();
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 3)
      .map((item) => ({
        id: item._id,
        title: `${internshipLabel(item.internshipId)} - ${studentLabel(item.studentId)}`,
        when: new Date(item.scheduledAt).toLocaleString(),
        status: item.status || "SCHEDULED",
      }));
  }, [interviews]);

  const pendingApplications = applicants.filter((item) => item.status === "APPLIED").length;

  const quickActions = [
    {
      label: "Post Internship",
      to: "/recruiter/internships/create",
      icon: FilePlus2,
      style: "bg-blue-600 text-white hover:bg-blue-700",
    },
    {
      label: "View Applicants",
      to: "/recruiter/applicants",
      icon: Users,
      style: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    },
    {
      label: "Manage Interviews",
      to: "/recruiter/interviews",
      icon: CalendarClock,
      style: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    },
    {
      label: "Analytics Reports",
      to: "/recruiter/analytics",
      icon: ListFilter,
      style: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-44 rounded-3xl bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Recruiter Workspace</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Recruiter Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                Live hiring overview from your internships, applicants, and interview pipeline.
              </p>
            </div>

            <button
              onClick={() => loadData({ silent: true })}
              className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
            >
              <p className="font-semibold">Today: {pendingApplications + metrics.upcomingInterviews} priority tasks</p>
              <p className="mt-0.5 text-blue-700">{metrics.upcomingInterviews} interviews and {pendingApplications} fresh applications.</p>
              {refreshing ? <p className="mt-1 text-xs">Refreshing...</p> : null}
            </button>
          </div>

          <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`inline-flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${action.style}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon size={16} />
                    {action.label}
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm ${card.accent}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-600">{card.note}</p>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Activity</h2>
              <Link to="/recruiter/interviews" className="text-xs font-semibold text-blue-700 hover:text-blue-800">
                Open calendar
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcoming.length ? (
                upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{item.when}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No upcoming interview activity.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Notes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="font-semibold text-emerald-800">Selected candidates</p>
                <p className="mt-1 text-emerald-700">{metrics.selectedApplicants} candidates marked as SELECTED.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-800">Review queue</p>
                <p className="mt-1 text-amber-700">{pendingApplications} applications still in APPLIED state.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                <Clock4 size={16} />
                <p>{metrics.upcomingInterviews} interviews are currently scheduled.</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
