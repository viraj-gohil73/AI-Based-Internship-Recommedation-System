import { useEffect, useMemo, useState } from "react";
import { Building2, Filter, MessageSquareText, Search, Star, StarHalf } from "lucide-react";
import StudentLayout from "../../layout/StudentLayout";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

function formatDate(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function Stars({ rating }) {
  const safe = clamp(Number(rating || 0), 0, 5);
  const full = Math.floor(safe);
  const hasHalf = safe - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} size={14} fill="currentColor" />
      ))}
      {hasHalf ? <StarHalf size={14} fill="currentColor" /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} size={14} />
      ))}
    </span>
  );
}

function normalizeItem(raw, index) {
  const id = String(raw?._id || raw?.id || `feedback-${index + 1}`);
  const companyReplyMessage = String(raw?.companyReply?.message || "").trim();

  return {
    id,
    internshipTitle: raw?.internshipTitle || "Internship",
    companyName: raw?.companyName || "Company",
    companyLogo: raw?.companyLogo || "",
    rating: clamp(Number(raw?.rating || 0), 0, 5),
    comment: String(raw?.comment || "").trim(),
    submittedAt: raw?.submittedAt || raw?.createdAt || null,
    companyReply: companyReplyMessage
      ? {
          message: companyReplyMessage,
          repliedAt: raw?.companyReply?.repliedAt || null,
        }
      : null,
  };
}

export default function FeedbackHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Please login to view your feedback history.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/student/feedback/history`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load feedback history");
        }

        const list = Array.isArray(data?.feedbackHistory) ? data.feedbackHistory : [];
        setItems(list.map(normalizeItem));
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load feedback history");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const companyOptions = useMemo(() => {
    const names = Array.from(new Set(items.map((item) => item.companyName).filter(Boolean)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return items.filter((item) => {
      if (companyFilter !== "all" && item.companyName !== companyFilter) return false;
      if (!text) return true;

      return [item.internshipTitle, item.companyName, item.comment, item.companyReply?.message || ""]
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [items, query, companyFilter]);

  const withReplies = filtered.filter((item) => item.companyReply).length;

  return (
    <StudentLayout title="Feedback History">
      <div className="min-h-full bg-gradient-to-b from-blue-50 via-indigo-50 to-slate-100 p-4 md:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-xl border border-indigo-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-4 text-white md:p-5">
            <h2 className="text-lg font-semibold md:text-xl">My Feedback History</h2>
            <p className="text-sm text-indigo-50">
              Track your submitted internship feedback and official company replies.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3 md:p-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-indigo-600">Total Submitted</p>
              <p className="text-xl font-semibold text-indigo-900">{items.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Replies Received</p>
              <p className="text-xl font-semibold text-emerald-900">{withReplies}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Filtered</p>
              <p className="text-xl font-semibold text-slate-900">{filtered.length}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-md">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <label className="lg:col-span-3 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search internship, company, or feedback"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            <div className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
              <Filter size={15} className="text-slate-500" />
              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All Companies</option>
                {companyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="mt-4">
          {loading ? <StudentLoadingCard message="Loading feedback history..." /> : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
              No feedback history found for your current filters.
            </div>
          ) : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.internshipTitle}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                        <Building2 size={14} />
                        {item.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Stars rating={item.rating} />
                        {item.rating.toFixed(1)}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Submitted on {formatDate(item.submittedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <MessageSquareText size={13} />
                      Your Feedback
                    </p>
                    <p className="mt-1 text-sm text-slate-800">{item.comment || "No comment submitted."}</p>
                  </div>

                  {item.companyReply ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Official Company Reply
                      </p>
                      <p className="mt-1 text-sm text-emerald-900">{item.companyReply.message}</p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Replied on {formatDate(item.companyReply.repliedAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                      No company reply yet.
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </StudentLayout>
  );
}
