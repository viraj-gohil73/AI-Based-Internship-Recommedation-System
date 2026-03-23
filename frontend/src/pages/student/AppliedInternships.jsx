import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, Clock3, Eye, MapPin, Search, Star, Users, Wallet, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import StudentLayout from "../../layout/StudentLayout";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

const STATUS_STYLES = {
  APPLIED: "bg-blue-100/80 text-blue-800 border-blue-300",
  SHORTLISTED: "bg-blue-100/80 text-blue-800 border-blue-300",
  INTERVIEW: "bg-blue-100/80 text-blue-800 border-blue-300",
  SELECTED: "bg-blue-100/80 text-blue-800 border-blue-300",
  REJECTED: "bg-blue-100/80 text-blue-800 border-blue-300",
};

const STATUS_META = {
  APPLIED: {
    card: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    text: "text-blue-700",
  },
  SHORTLISTED: {
    card: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    text: "text-blue-700",
  },
  INTERVIEW: {
    card: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    text: "text-blue-700",
  },
  SELECTED: {
    card: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    text: "text-blue-700",
  },
  REJECTED: {
    card: "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    text: "text-blue-700",
  },
};

const formatStipend = (min, max) => {
  if (!min && !max) return "Unpaid";
  const n = new Intl.NumberFormat("en-IN");
  return `INR ${n.format(min || 0)} - INR ${n.format(max || 0)} / month`;
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeInternship = (item) => ({
  id: String(item?._id || item?.id || ""),
  title: item?.title || "Untitled Internship",
  company: item?.company || "Unknown Company",
  companyLogo: item?.companyLogo || "",
  location: item?.location || "Remote",
  workmode: item?.workmode || "Remote",
  employmentType: item?.employment_type || "Full Time",
  duration: Number(item?.duration || 0),
  openings: Number(item?.openings || 0),
  stipendMin: Number(item?.stipend_min || 0),
  stipendMax: Number(item?.stipend_max || 0),
  status: item?.applicationStatus || "APPLIED",
  appliedAt: item?.appliedAt || "",
  deadlineAt: item?.deadline_at || "",
  internshipCompleted: Boolean(item?.internshipCompleted),
  canGiveFeedback: Boolean(item?.canGiveFeedback),
  hasFeedback: Boolean(item?.hasFeedback),
  feedbackRating: Number(item?.feedbackRating || 0),
  interviewScheduledAt: item?.interviewScheduledAt || "",
  interviewDurationMinutes: Number(item?.interviewDurationMinutes || 0),
  interviewMode: item?.interviewMode || "",
  interviewMeetingLink: item?.interviewMeetingLink || "",
  interviewLocation: item?.interviewLocation || "",
  interviewNotes: item?.interviewNotes || "",
  interviewStatus: item?.interviewStatus || "",
});

export default function AppliedInternships() {
  const locationState = useLocation();
  const currentRoute = `${locationState.pathname}${locationState.search || ""}`;
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  const [sortBy, setSortBy] = useState("latest-applied");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeFeedbackItem, setActiveFeedbackItem] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Please login to view applied internships.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/student/internships/applied`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Failed to load applied internships");

        const list = Array.isArray(data?.appliedInternships)
          ? data.appliedInternships.map(normalizeInternship).filter((x) => x.id)
          : [];

        setInternships(list);
      } catch (err) {
        if (err?.name !== "AbortError") setError(err?.message || "Failed to load applied internships");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    const result = { total: internships.length };
    internships.forEach((item) => {
      result[item.status] = (result[item.status] || 0) + 1;
    });
    return result;
  }, [internships]);

  const filtered = useMemo(() => {
    let list = [...internships];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }

    if (status !== "all") list = list.filter((i) => i.status === status);
    if (mode !== "all") list = list.filter((i) => i.workmode === mode);

    if (sortBy === "latest-applied") list.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    if (sortBy === "deadline") list.sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
    if (sortBy === "stipend") list.sort((a, b) => b.stipendMax - a.stipendMax);

    return list;
  }, [internships, query, status, mode, sortBy]);

  const activeFiltersCount = [status !== "all", mode !== "all"].filter(Boolean).length;

  const openFeedbackModal = (item) => {
    setActiveFeedbackItem(item);
    setFeedbackRating(item?.feedbackRating || 0);
    setFeedbackComment("");
    setFeedbackError("");
    setFeedbackOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackOpen(false);
    setActiveFeedbackItem(null);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackError("");
  };

  const submitFeedback = async () => {
    if (!activeFeedbackItem) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setFeedbackError("Please login again.");
      return;
    }
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      setFeedbackError("Please select a rating.");
      return;
    }
    if (!feedbackComment.trim()) {
      setFeedbackError("Please add feedback comment.");
      return;
    }

    try {
      setFeedbackSubmitting(true);
      setFeedbackError("");

      const res = await fetch(
        `${API_BASE_URL}/api/student/internships/${activeFeedbackItem.id}/feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: feedbackRating,
            comment: feedbackComment.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to submit feedback");
      }

      setInternships((prev) =>
        prev.map((item) =>
          item.id === activeFeedbackItem.id
            ? { ...item, hasFeedback: true, feedbackRating, canGiveFeedback: false }
            : item
        )
      );
      closeFeedbackModal();
    } catch (err) {
      setFeedbackError(err?.message || "Failed to submit feedback");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <StudentLayout title="Applied Internships">
      <div className="min-h-full bg-gradient-to-b from-blue-50 via-indigo-50 to-slate-100 p-4 md:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-4 text-white md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold md:text-xl">Track Your Applications</h2>
                <p className="text-sm text-indigo-50">Monitor statuses and stay ready for next steps.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-white/20 px-3 py-1 font-medium text-white backdrop-blur">{filtered.length} results</span>
                <span className="rounded-full bg-white/20 px-3 py-1 font-medium text-white backdrop-blur">{activeFiltersCount} active filters</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setMode("all");
                    setSortBy("latest-applied");
                  }}
                  className="rounded-xl border border-white/40 bg-white/20 px-3 py-1.5 font-medium text-white transition hover:bg-white/30"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3">
                <p className="text-xs text-indigo-500">Total</p>
                <p className="text-lg font-semibold text-indigo-900">{counts.total || 0}</p>
              </div>
              {["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"].map((item) => {
                const statusMeta = STATUS_META[item] || {};
                return (
                  <div key={item} className={`rounded-xl border p-3 ${statusMeta.card || "border-slate-200 bg-slate-50"}`}>
                    <p className={`text-xs ${statusMeta.text || "text-slate-500"}`}>{item}</p>
                    <p className={`text-lg font-semibold ${statusMeta.text || "text-slate-900"}`}>{counts[item] || 0}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 mt-4 rounded-2xl border border-blue-200 bg-white/90 p-4 shadow-md backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-slate-600">Filter your applications</p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
            <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company, role, location"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="all">All status</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="all">All modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="latest-applied">Latest applied</option>
              <option value="deadline">Closest deadline</option>
              <option value="stipend">Highest stipend</option>
            </select>
          </div>
        </section>

        <div className="mt-4">
          {loading ? <StudentLoadingCard message="Loading applied internships..." /> : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">No applied internships found.</div>
          ) : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((item) => {
                const statusClass = STATUS_STYLES[item.status] || "bg-slate-50 text-slate-700 border-slate-200";
                const statusMeta = STATUS_META[item.status];

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      statusMeta?.card || "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200">
                        {item.companyLogo ? (
                          <img src={item.companyLogo} alt={`${item.company} logo`} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                            {item.company.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="truncate text-lg font-semibold text-slate-900">{item.title}</h3>
                            <p className="truncate text-sm text-slate-600">{item.company}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><MapPin size={14} /> {item.location}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><Briefcase size={14} /> {item.workmode} / {item.employmentType}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><Wallet size={14} /> {formatStipend(item.stipendMin, item.stipendMax)}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><Clock3 size={14} /> {item.duration || 0} months</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><Users size={14} /> {item.openings || 0} openings</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800"><CalendarDays size={14} /> Applied {formatDate(item.appliedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {(item.status === "INTERVIEW" || item.interviewScheduledAt) ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
                        <p className="font-semibold">Interview Scheduled</p>
                        <p className="mt-1">Date: {formatDateTime(item.interviewScheduledAt || item.appliedAt)}</p>
                        <p className="mt-1">Mode: {item.interviewMode || "Not available"}</p>
                        <p className="mt-1">Status: {item.interviewStatus || "SCHEDULED"}</p>
                        {item.interviewDurationMinutes > 0 ? (
                          <p className="mt-1">Duration: {item.interviewDurationMinutes} minutes</p>
                        ) : null}
                        {item.interviewLocation ? (
                          <p className="mt-1">Location: {item.interviewLocation}</p>
                        ) : null}
                        {item.interviewMeetingLink ? (
                          <a
                            href={item.interviewMeetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                          >
                            Join Interview Link
                          </a>
                        ) : null}
                        {item.interviewNotes ? (
                          <p className="mt-2 text-xs text-amber-800">Note: {item.interviewNotes}</p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/student/explore/${item.id}`}
                          state={{ internship: item, from: currentRoute }}
                          className="inline-flex items-center gap-1 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <Eye size={15} />
                          View Details
                        </Link>

                        {item.hasFeedback ? (
                          <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                            <Star size={14} fill="currentColor" />
                            Feedback Submitted ({item.feedbackRating.toFixed(1)})
                          </span>
                        ) : item.canGiveFeedback ? (
                          <button
                            type="button"
                            onClick={() => openFeedbackModal(item)}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                          >
                            <Star size={14} />
                            Give Feedback
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {feedbackOpen && activeFeedbackItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share Internship Feedback</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activeFeedbackItem.title} at {activeFeedbackItem.company}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Your Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedbackRating(value)}
                    className="rounded-md p-1"
                  >
                    <Star
                      size={24}
                      className={value <= feedbackRating ? "text-amber-500" : "text-slate-300"}
                      fill={value <= feedbackRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Feedback Comment
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={5}
                placeholder="Share your internship experience..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {feedbackError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {feedbackError}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={feedbackSubmitting}
                onClick={submitFeedback}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StudentLayout>
  );
}


