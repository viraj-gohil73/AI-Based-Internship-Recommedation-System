import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleAlert,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useCompany } from "../../../context/CompanyContext";
import { useSubscription } from "../../../context/SubscriptionContext";

const API_BASE = "http://localhost:5000/api/company";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatRelative = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  const abs = Math.abs(diffDays);
  return `${abs} day${abs > 1 ? "s" : ""} ago`;
};

export default function Overview() {
  const { company, loading: companyLoading } = useCompany();
  const { current, entitlements, loading: subLoading } = useSubscription();

  const [internships, setInternships] = useState([]);
  const [recruitersCount, setRecruitersCount] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadError("Session expired. Please login again.");
      setLoadingMetrics(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoadingMetrics(true);
        setLoadError("");

        const [recruitersRes, internshipsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/recruiters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/internships`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (recruitersRes.status === "fulfilled") {
          const recruitersJson = await recruitersRes.value.json();
          if (recruitersRes.value.ok) {
            setRecruitersCount(Array.isArray(recruitersJson?.recruiters) ? recruitersJson.recruiters.length : 0);
          }
        }

        if (internshipsRes.status === "fulfilled") {
          const internshipsJson = await internshipsRes.value.json();
          if (internshipsRes.value.ok) {
            setInternships(Array.isArray(internshipsJson?.internships) ? internshipsJson.internships : []);
          }
        }

        if (
          recruitersRes.status === "rejected" ||
          internshipsRes.status === "rejected" ||
          (recruitersRes.status === "fulfilled" && !recruitersRes.value.ok) ||
          (internshipsRes.status === "fulfilled" && !internshipsRes.value.ok)
        ) {
          setLoadError("Some dashboard metrics could not be loaded.");
        }
      } catch {
        setLoadError("Failed to load dashboard metrics.");
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadData();
  }, []);

  const data = useMemo(() => {
    const totalInternships = internships.length;
    const activeInternships = internships.filter((item) => item?.intern_status === "ACTIVE").length;
    const activePublishedInternships = internships.filter((item) => {
      const status = String(item?.intern_status || "").toUpperCase();
      const published = String(item?.is_published || "").toLowerCase();
      return status === "ACTIVE" && published === "true";
    }).length;
    const totalApplications = internships.reduce(
      (sum, item) => sum + Number(item?.applicationsCount || 0),
      0
    );

    const activePostingsUsed = activePublishedInternships || activeInternships;
    const postingsLimit = entitlements?.limits?.maxActivePostings ?? current?.maxActivePostings ?? null;
    const remainingPosts =
      postingsLimit === null ? "Unlimited" : Math.max(postingsLimit - activePostingsUsed, 0);

    return {
      totalRecruiters: Number(recruitersCount) || 0,
      totalInternships,
      activeInternships,
      totalApplications,
      activePostingsUsed,
      remainingPosts,
      postingsLimit,
    };
  }, [internships, recruitersCount, entitlements, current]);

  const stats = [
    {
      title: "Total Recruiters",
      value: data.totalRecruiters,
      icon: <Users className="text-cyan-700" size={20} />,
      bg: "bg-cyan-100",
      note: `Seats used: ${data.totalRecruiters}`,
    },
    {
      title: "Total Internships",
      value: data.totalInternships,
      icon: <BriefcaseBusiness className="text-indigo-700" size={20} />,
      bg: "bg-indigo-100",
      note: `Applications: ${data.totalApplications}`,
    },
    {
      title: "Active Internships",
      value: data.activeInternships,
      icon: <CheckCircle2 className="text-emerald-700" size={20} />,
      bg: "bg-emerald-100",
      note: `Live postings: ${data.activePostingsUsed}`,
    },
    {
      title: "Remaining Posts",
      value: data.remainingPosts,
      icon: <Layers className="text-amber-700" size={20} />,
      bg: "bg-amber-100",
      note: data.postingsLimit === null ? "No posting limit" : `Limit: ${data.postingsLimit}`,
    },
  ];

  const pageLoading = companyLoading || subLoading || loadingMetrics;
  const planName = current?.plan?.name || current?.planCodeSnapshot || "Trial";
  const subscriptionStatus = current?.status || "Unknown";
  const cycleEnd =
    entitlements?.effectiveEndDate || current?.currentPeriodEnd || current?.trialEndsAt || null;

  const quickSummary = [
    {
      label: "Company verification",
      value: company?.verificationStatus || "DRAFT",
      ok: company?.verificationStatus === "APPROVED",
    },
    {
      label: "Subscription access",
      value: entitlements?.accessAllowed ? "Allowed" : "Restricted",
      ok: Boolean(entitlements?.accessAllowed),
    },
    {
      label: "Recruiter seats",
      value: `${data.totalRecruiters}/${current?.totalRecruiterSeats ?? 0}`,
      ok:
        current?.totalRecruiterSeats === undefined ||
        data.totalRecruiters < current.totalRecruiterSeats,
    },
  ];

  const topInternships = internships.slice(0, 4);

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fbff_40%,_#f1f5f9)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Company Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {company?.companyName || "Company"} Overview
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Live snapshot of recruiters, internships, posting capacity, and subscription status.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-semibold text-slate-800">Subscription: {planName}</p>
              <p className="text-slate-600">
                Ends: {formatDate(cycleEnd)} {cycleEnd ? `(${formatRelative(cycleEnd)})` : ""}
              </p>
            </div>
          </div>
          {loadError && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {loadError}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {pageLoading ? "-" : item.value}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${item.bg}`}>{item.icon}</div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Recent Internship Posts</h2>
            <div className="mt-4 space-y-3">
              {pageLoading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Loading internships...
                </div>
              ) : topInternships.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  No internships posted yet.
                </div>
              ) : (
                topInternships.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title || "Untitled internship"}</p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {item.location || "Location not set"} | Apps: {item.applicationsCount || 0}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.intern_status || "DRAFT"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Live Status</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Account</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Building2 size={16} />
                  {company?.email || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Subscription</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{subscriptionStatus}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Quick Summary</p>
                <div className="space-y-2">
                  {quickSummary.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">{item.label}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.ok ? <ShieldCheck size={14} /> : <CircleAlert size={14} />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
