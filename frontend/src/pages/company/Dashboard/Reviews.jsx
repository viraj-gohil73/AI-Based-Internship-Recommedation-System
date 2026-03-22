import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  Star,
  StarHalf,
  TrendingUp,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/company";

function formatDate(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-IN");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeReview(raw, index) {
  const id = raw?._id || raw?.id || `review-${index + 1}`;
  const student =
    raw?.studentName ||
    raw?.student?.name ||
    raw?.studentId?.name ||
    raw?.candidateName ||
    "Anonymous";
  const internshipTitle =
    raw?.internshipTitle ||
    raw?.internship?.title ||
    raw?.internshipId?.title ||
    "Internship";
  const rating = clamp(Number(raw?.rating || 0), 0, 5);
  const comment = String(raw?.comment || raw?.review || raw?.feedback || "").trim();
  const createdAt = raw?.createdAt || raw?.date || new Date().toISOString();

  return {
    id,
    studentName: student,
    internshipTitle,
    rating,
    comment,
    createdAt,
  };
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
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

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const loadReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const res = await fetch(`${API_BASE}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Could not load reviews from API");
        }

        const list = Array.isArray(data?.reviews)
          ? data.reviews
          : Array.isArray(data)
            ? data
            : [];

        setReviews(list.map(normalizeReview));
      } catch (error) {
        setReviews([]);
        setLoadError(error?.message || "Unable to load reviews right now.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const text = query.trim().toLowerCase();
    const minimum = ratingFilter === "all" ? 0 : Number(ratingFilter);

    const list = reviews.filter((item) => {
      if (item.rating < minimum) return false;
      if (!text) return true;

      return [item.studentName, item.internshipTitle, item.comment]
        .join(" ")
        .toLowerCase()
        .includes(text);
    });

    if (sortBy === "highest") {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "lowest") {
      return [...list].sort((a, b) => a.rating - b.rating);
    }

    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, query, ratingFilter, sortBy]);

  const summary = useMemo(() => {
    const total = reviews.length;
    const avg = total
      ? reviews.reduce((acc, row) => acc + Number(row.rating || 0), 0) / total
      : 0;

    const buckets = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    for (const row of reviews) {
      const star = clamp(Math.floor(Number(row.rating || 0)), 1, 5);
      buckets[star] += 1;
    }

    const positive = reviews.filter((row) => Number(row.rating || 0) >= 4).length;
    const satisfaction = total ? Math.round((positive / total) * 100) : 0;

    return { total, avg, buckets, satisfaction };
  }, [reviews]);

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#e2e8f0,_transparent_38%),linear-gradient(to_bottom,_#f8fafc,_#eff6ff)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-blue-100 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Reputation Insights
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Review & Ratings
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Track intern feedback quality, identify trends, and improve the hiring experience.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Average rating</p>
              <p className="mt-1 inline-flex items-center gap-2 text-xl font-bold text-slate-900">
                {summary.avg.toFixed(1)}
                <Stars rating={summary.avg} />
              </p>
              <p className="mt-1 text-xs text-slate-500">{summary.total} total feedback entries</p>
            </div>
          </div>

          {loadError ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {loadError}
            </div>
          ) : null}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Reviews</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.total}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-700">
              <MessageSquareText size={14} />
              Feedback captured from completed internships
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Avg. Rating</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.avg.toFixed(1)}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
              <Star size={14} />
              Across all review submissions
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Satisfaction</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.satisfaction}%</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <TrendingUp size={14} />
              Reviews with 4 stars and above
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Filtered Results</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{filteredReviews.length}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700">
              <Filter size={14} />
              Matching your current filter/search
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by student, internship, or comment..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2">
                <SlidersHorizontal size={15} className="text-slate-500" />
                <select
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2">
                <Filter size={15} className="text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900">Rating Distribution</h2>
            <div className="mt-4 space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.buckets[star];
                const width = summary.total ? Math.round((count / summary.total) * 100) : 0;
                return (
                  <div key={star} className="grid grid-cols-[42px_1fr_42px] items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      {star} <Star size={13} className="text-amber-500" fill="currentColor" />
                    </span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-right font-medium text-slate-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Feedback Timeline</h2>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  Loading reviews...
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  No reviews match the current search/filter.
                </div>
              ) : (
                filteredReviews.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{item.internshipTitle}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Stars rating={item.rating} />
                          {item.rating.toFixed(1)}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {item.comment || "No written feedback submitted."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

