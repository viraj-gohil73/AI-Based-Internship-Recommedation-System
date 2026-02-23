import { useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, CalendarClock, Download, RefreshCw, UserRoundCheck, Users } from "lucide-react";
import toast from "react-hot-toast";

function getEffectiveInternshipStatus(internship) {
  if (!internship) return "-";
  if (internship.intern_status === "ACTIVE" && internship.deadline_at) {
    const deadline = new Date(internship.deadline_at);
    if (!Number.isNaN(deadline.getTime()) && deadline < new Date()) return "EXPIRED";
  }
  return internship.intern_status || "-";
}

function monthKey(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = String(key).split("-").map(Number);
  if (!year || !month) return key;
  return new Date(year, month - 1, 1).toLocaleString(undefined, { month: "short", year: "2-digit" });
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll("\"", '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RecruiterAnalytics() {
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
      toast.error(error.message || "Unable to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overview = useMemo(() => {
    const activeInternships = internships.filter((item) => getEffectiveInternshipStatus(item) === "ACTIVE").length;
    const selectedApplicants = applicants.filter((item) => item.status === "SELECTED").length;
    const scheduledInterviews = interviews.filter((item) => item.status === "SCHEDULED").length;
    const completedInterviews = interviews.filter((item) => item.status === "COMPLETED").length;
    const conversion = applicants.length ? Math.round((selectedApplicants / applicants.length) * 100) : 0;

    return {
      activeInternships,
      selectedApplicants,
      scheduledInterviews,
      completedInterviews,
      conversion,
    };
  }, [internships, applicants, interviews]);

  const topInternships = useMemo(() => {
    const map = new Map();

    applicants.forEach((item) => {
      const key = String(item.internshipId || "");
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          internshipId: key,
          internshipTitle: item.internshipTitle || "Internship",
          applicants: 0,
          selected: 0,
          interview: 0,
        });
      }
      const row = map.get(key);
      row.applicants += 1;
      if (item.status === "SELECTED") row.selected += 1;
      if (item.status === "INTERVIEW") row.interview += 1;
    });

    return [...map.values()].sort((a, b) => b.applicants - a.applicants).slice(0, 5);
  }, [applicants]);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const keys = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(monthKey(d));
    }

    const applicantsByMonth = new Map(keys.map((key) => [key, 0]));
    applicants.forEach((item) => {
      const key = monthKey(item.appliedAt);
      if (key && applicantsByMonth.has(key)) applicantsByMonth.set(key, applicantsByMonth.get(key) + 1);
    });

    const interviewsByMonth = new Map(keys.map((key) => [key, 0]));
    interviews.forEach((item) => {
      const key = monthKey(item.scheduledAt);
      if (key && interviewsByMonth.has(key)) interviewsByMonth.set(key, interviewsByMonth.get(key) + 1);
    });

    const maxValue = Math.max(1, ...keys.map((key) => Math.max(applicantsByMonth.get(key), interviewsByMonth.get(key))));

    return keys.map((key) => ({
      key,
      label: monthLabel(key),
      applicants: applicantsByMonth.get(key),
      interviews: interviewsByMonth.get(key),
      applicantsPct: Math.round((applicantsByMonth.get(key) / maxValue) * 100),
      interviewsPct: Math.round((interviewsByMonth.get(key) / maxValue) * 100),
    }));
  }, [applicants, interviews]);

  const statusMix = useMemo(() => {
    const counts = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    applicants.forEach((item) => {
      const status = item.status || "APPLIED";
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [applicants]);

  const exportApplicantsReport = () => {
    const rows = [
      ["Student", "Email", "Internship", "Status", "Applied At"],
      ...applicants.map((item) => [
        item.student?.name || "Student",
        item.student?.email || "-",
        item.internshipTitle || "Internship",
        item.status || "APPLIED",
        item.appliedAt ? new Date(item.appliedAt).toLocaleString() : "-",
      ]),
    ];
    downloadCsv("recruiter-applicants-report.csv", rows);
  };

  const exportInterviewsReport = () => {
    const rows = [
      ["Candidate", "Internship", "Scheduled At", "Mode", "Status"],
      ...interviews.map((item) => [
        `${item.studentId?.fname || ""} ${item.studentId?.lname || ""}`.trim() || item.studentId?.email || "Candidate",
        item.internshipId?.title || "Internship",
        item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "-",
        item.mode || "-",
        item.status || "SCHEDULED",
      ]),
    ];
    downloadCsv("recruiter-interviews-report.csv", rows);
  };

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
          <div className="h-80 rounded-2xl bg-slate-200" />
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

          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Recruiter Workspace</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Analytics & Reports</h1>
              <p className="mt-2 text-sm text-slate-600">Live funnel metrics and downloadable recruiter reports from your current pipeline.</p>
            </div>

            <button
              onClick={() => loadData({ silent: true })}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 ${
                refreshing ? "scale-[0.98] shadow-inner" : "shadow-sm hover:shadow"
              }`}
            >
              <RefreshCw size={15} className={`transition-colors ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Internships</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{overview.activeInternships}</p>
            <p className="mt-2 text-xs text-slate-600">{internships.length} total internships</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Applicants</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{applicants.length}</p>
            <p className="mt-2 text-xs text-slate-600">{statusMix.APPLIED} awaiting first review</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Scheduled Interviews</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{overview.scheduledInterviews}</p>
            <p className="mt-2 text-xs text-slate-600">{overview.completedInterviews} completed</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Selection Rate</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{overview.conversion}%</p>
            <p className="mt-2 text-xs text-slate-600">{overview.selectedApplicants} selected candidates</p>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-700" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">6-Month Trend</h2>
            </div>

            <div className="mt-4 space-y-3">
              {monthlySeries.map((row) => (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span>{row.applicants} applicants | {row.interviews} interviews</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${row.applicantsPct}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${row.interviewsPct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Application Funnel</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-600">Applied</span>
                <span className="font-semibold text-slate-900">{statusMix.APPLIED}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-600">Shortlisted</span>
                <span className="font-semibold text-slate-900">{statusMix.SHORTLISTED}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-600">Interview</span>
                <span className="font-semibold text-slate-900">{statusMix.INTERVIEW}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-600">Selected</span>
                <span className="font-semibold text-emerald-700">{statusMix.SELECTED}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-600">Rejected</span>
                <span className="font-semibold text-rose-700">{statusMix.REJECTED}</span>
              </div>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={16} className="text-blue-700" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Top Internships by Applicants</h2>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2">Internship</th>
                    <th className="py-2">Applicants</th>
                    <th className="py-2">Interview</th>
                    <th className="py-2">Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {topInternships.length ? (
                    topInternships.map((row) => (
                      <tr key={row.internshipId} className="border-b border-slate-100">
                        <td className="py-2 pr-3 text-slate-800">{row.internshipTitle}</td>
                        <td className="py-2 text-slate-700">{row.applicants}</td>
                        <td className="py-2 text-slate-700">{row.interview}</td>
                        <td className="py-2 text-emerald-700 font-semibold">{row.selected}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={4}>No applicant data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Reports</h2>
            <div className="mt-4 space-y-2">
              <button
                onClick={exportApplicantsReport}
                className="inline-flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Applicants Report
                <Download size={14} />
              </button>
              <button
                onClick={exportInterviewsReport}
                className="inline-flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Interviews Report
                <Download size={14} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <Users size={13} />
                Auto-calculated
              </p>
              <p className="mt-1">Metrics are generated from your current internships, applicants, and interviews in real time.</p>
            </div>

            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <UserRoundCheck size={13} />
                Conversion Focus
              </p>
              <p className="mt-1">Use selected/interview ratios to prioritize internships with high conversion potential.</p>
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <CalendarClock size={13} />
                Interview Hygiene
              </p>
              <p className="mt-1">Keep interview status updated after each round for more accurate reports.</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
