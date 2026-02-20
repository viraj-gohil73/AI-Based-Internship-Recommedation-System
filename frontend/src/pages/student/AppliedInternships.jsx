import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, Clock3, Eye, MapPin, Search, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import StudentLayout from "../../layout/StudentLayout";

const API_BASE_URL = "http://localhost:5000";

const STATUS_STYLES = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  SHORTLISTED: "bg-amber-50 text-amber-700 border-amber-200",
  INTERVIEW: "bg-violet-50 text-violet-700 border-violet-200",
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
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
});

export default function AppliedInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  const [sortBy, setSortBy] = useState("latest-applied");

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

  return (
    <StudentLayout title="Applied Internships">
      <div className="min-h-full bg-slate-50 p-4 md:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Track Your Applications</h2>
              <p className="text-sm text-slate-600">Monitor statuses and stay ready for next steps.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{filtered.length} results</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{activeFiltersCount} active filters</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setMode("all");
                  setSortBy("latest-applied");
                }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-semibold text-slate-900">{counts.total || 0}</p>
            </div>
            {["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{item}</p>
                <p className="text-lg font-semibold text-slate-900">{counts[item] || 0}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sticky top-0 z-20 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company, role, location"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="all">All status</option>
              <option value="APPLIED">Applied</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="all">All modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="latest-applied">Latest applied</option>
              <option value="deadline">Closest deadline</option>
              <option value="stipend">Highest stipend</option>
            </select>
          </div>
        </section>

        <div className="mt-4">
          {loading ? <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">Loading applied internships...</div> : null}

          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">No applied internships found.</div>
          ) : null}

          {!loading ? (
            <div className="space-y-4">
              {filtered.map((item) => {
                const statusClass = STATUS_STYLES[item.status] || "bg-slate-50 text-slate-700 border-slate-200";

                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><MapPin size={14} /> {item.location}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Briefcase size={14} /> {item.workmode} / {item.employmentType}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Wallet size={14} /> {formatStipend(item.stipendMin, item.stipendMax)}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Clock3 size={14} /> {item.duration || 0} months</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Users size={14} /> {item.openings || 0} openings</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><CalendarDays size={14} /> Applied {formatDate(item.appliedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        to={`/student/explore/${item.id}`}
                        state={{ internship: item }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </StudentLayout>
  );
}
