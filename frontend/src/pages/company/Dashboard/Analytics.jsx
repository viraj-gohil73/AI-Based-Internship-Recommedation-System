import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Download,
  MessageSquareText,
  RefreshCcw,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/company";

const safeNumber = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
};

const buildCsv = (headers, rows) => {
  const head = headers.map(escapeCsvValue).join(",");
  const body = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  return `${head}\n${body}`;
};

const downloadCsv = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function statusTone(status) {
  const text = String(status || "").toUpperCase();
  if (text === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (text === "CLOSED") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-700";
}

export default function CompanyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [internships, setInternships] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [reviews, setReviews] = useState([]);

  const loadAnalytics = async ({ silent = false } = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [internshipsRes, recruitersRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/internships`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/recruiters`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const internshipsJson = await internshipsRes.json();
      const recruitersJson = await recruitersRes.json();
      const reviewsJson = await reviewsRes.json();

      if (!internshipsRes.ok) {
        throw new Error(internshipsJson?.message || "Failed to fetch internships analytics");
      }
      if (!recruitersRes.ok) {
        throw new Error(recruitersJson?.message || "Failed to fetch recruiters analytics");
      }
      if (!reviewsRes.ok) {
        throw new Error(reviewsJson?.message || "Failed to fetch review analytics");
      }

      setInternships(Array.isArray(internshipsJson?.internships) ? internshipsJson.internships : []);
      setRecruiters(Array.isArray(recruitersJson?.recruiters) ? recruitersJson.recruiters : []);
      setReviews(Array.isArray(reviewsJson?.reviews) ? reviewsJson.reviews : []);
    } catch (err) {
      setError(err?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const metrics = useMemo(() => {
    const totalInternships = internships.length;
    const activeInternships = internships.filter((item) => item?.intern_status === "ACTIVE").length;
    const draftInternships = internships.filter((item) => item?.intern_status === "DRAFT").length;
    const closedInternships = internships.filter((item) => item?.intern_status === "CLOSED").length;

    const totalApplications = internships.reduce(
      (sum, item) => sum + safeNumber(item?.applicationsCount),
      0
    );
    const avgApplicationsPerInternship = totalInternships
      ? (totalApplications / totalInternships).toFixed(1)
      : "0.0";

    const totalReviews = reviews.length;
    const avgRating = totalReviews
      ? (
          reviews.reduce((sum, item) => sum + safeNumber(item?.rating), 0) / totalReviews
        ).toFixed(1)
      : "0.0";

    const reviewsByStars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((item) => {
      const star = Math.min(5, Math.max(1, Math.floor(safeNumber(item?.rating))));
      reviewsByStars[star] += 1;
    });

    return {
      totalInternships,
      activeInternships,
      draftInternships,
      closedInternships,
      totalApplications,
      avgApplicationsPerInternship,
      totalRecruiters: recruiters.length,
      totalReviews,
      avgRating,
      reviewsByStars,
    };
  }, [internships, recruiters, reviews]);

  const topInternships = useMemo(() => {
    return [...internships]
      .sort((a, b) => safeNumber(b?.applicationsCount) - safeNumber(a?.applicationsCount))
      .slice(0, 6);
  }, [internships]);

  const recruiterLoad = useMemo(() => {
    if (!internships.length || !recruiters.length) return [];

    const byRecruiter = internships.reduce((acc, item) => {
      const key = String(item?.recruiter?._id || "");
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          recruiterId: key,
          recruiterName: item?.recruiter?.name || "Recruiter",
          internships: 0,
          applications: 0,
        };
      }

      acc[key].internships += 1;
      acc[key].applications += safeNumber(item?.applicationsCount);
      return acc;
    }, {});

    return Object.values(byRecruiter).sort((a, b) => b.applications - a.applications);
  }, [internships, recruiters]);

  const exportInternshipsCsv = () => {
    const headers = [
      "Internship Title",
      "Status",
      "Location",
      "Recruiter",
      "Applications",
      "Created At",
      "Updated At",
    ];
    const rows = internships.map((item) => [
      item?.title || "Untitled internship",
      item?.intern_status || "DRAFT",
      item?.location || "",
      item?.recruiter?.name || "",
      safeNumber(item?.applicationsCount),
      formatDate(item?.createdAt),
      formatDate(item?.updatedAt),
    ]);
    downloadCsv("company-analytics-internships.csv", buildCsv(headers, rows));
  };

  const exportRecruiterCsv = () => {
    const headers = ["Recruiter", "Internships", "Applications", "Last Activity"];
    const rows = recruiterLoad.map((item) => [
      item.recruiterName,
      item.internships,
      item.applications,
      formatDate(
        internships
          .filter((row) => String(row?.recruiter?._id || "") === item.recruiterId)
          .sort((a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0))[0]
          ?.updatedAt
      ),
    ]);
    downloadCsv("company-analytics-recruiters.csv", buildCsv(headers, rows));
  };

  const exportReviewsCsv = () => {
    const headers = ["Student", "Internship", "Rating", "Comment", "Created At"];
    const rows = reviews.map((item) => [
      item?.studentName || "Student",
      item?.internshipTitle || "Internship",
      safeNumber(item?.rating),
      item?.comment || "",
      formatDate(item?.createdAt),
    ]);
    downloadCsv("company-analytics-reviews.csv", buildCsv(headers, rows));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4 animate-pulse">
          <div className="h-40 rounded-3xl bg-slate-200" />
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
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Company Intelligence</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Analytics</h1>
              <p className="mt-2 text-sm text-slate-600">
                Performance view across recruiters, internships, applications, and candidate feedback.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadAnalytics({ silent: true })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh Analytics"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportInternshipsCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={14} />
              Export Internships
            </button>
            <button
              type="button"
              onClick={exportRecruiterCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={14} />
              Export Recruiters
            </button>
            <button
              type="button"
              onClick={exportReviewsCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download size={14} />
              Export Reviews
            </button>
          </div>
          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Internships</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.totalInternships}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700">
              <BriefcaseBusiness size={14} />
              {metrics.activeInternships} active, {metrics.draftInternships} drafts
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Applications</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.totalApplications}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <TrendingUp size={14} />
              Avg {metrics.avgApplicationsPerInternship} per internship
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Recruiters</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.totalRecruiters}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-700">
              <Users size={14} />
              Team contributing to hiring pipeline
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Candidate Rating</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{metrics.avgRating}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
              <Star size={14} />
              From {metrics.totalReviews} submitted reviews
            </p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Top Performing Internships</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                <BarChart3 size={14} />
                By applications
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {topInternships.length ? (
                topInternships.map((item) => {
                  const count = safeNumber(item?.applicationsCount);
                  const max = safeNumber(topInternships[0]?.applicationsCount) || 1;
                  const width = Math.max(8, Math.round((count / max) * 100));
                  return (
                    <div key={item._id || item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title || "Untitled internship"}</p>
                          <p className="mt-0.5 text-xs text-slate-600">{item.location || "Location not set"}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.intern_status)}`}>
                          {item.intern_status || "DRAFT"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2.5 flex-1 rounded-full bg-slate-200">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{count} apps</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No internships available for ranking.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Review Breakdown</h2>
            <div className="mt-4 space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = metrics.reviewsByStars[star];
                const width = metrics.totalReviews
                  ? Math.round((count / metrics.totalReviews) * 100)
                  : 0;
                return (
                  <div key={star} className="grid grid-cols-[40px_1fr_34px] items-center gap-2 text-sm">
                    <span className="font-medium text-slate-700">{star}★</span>
                    <div className="h-2.5 rounded-full bg-slate-200">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-right text-slate-600">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Closed Internships</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{metrics.closedInternships}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                <Clock3 size={13} />
                Completed opportunities in your pipeline
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recruiter Contribution</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <MessageSquareText size={14} />
              Internship load & applications
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-2 font-semibold">Recruiter</th>
                  <th className="px-3 py-2 font-semibold">Internships</th>
                  <th className="px-3 py-2 font-semibold">Applications</th>
                  <th className="px-3 py-2 font-semibold">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {recruiterLoad.length ? (
                  recruiterLoad.map((item) => (
                    <tr key={item.recruiterId} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-slate-800">{item.recruiterName}</td>
                      <td className="px-3 py-2 text-slate-700">{item.internships}</td>
                      <td className="px-3 py-2 text-slate-700">{item.applications}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {formatDate(
                          internships
                            .filter((row) => String(row?.recruiter?._id || "") === item.recruiterId)
                            .sort((a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0))[0]
                            ?.updatedAt
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-5 text-center text-slate-500">
                      No recruiter analytics available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
