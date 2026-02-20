import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, BookmarkPlus, Briefcase, Clock3, Eye, MapPin, Search, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import StudentLayout from "../../layout/StudentLayout";

const API_BASE_URL = "http://localhost:5000";
const PAGE_SIZE = 8;

const formatStipend = (min, max) => {
  if (!min && !max) return "Unpaid";
  const n = new Intl.NumberFormat("en-IN");
  return `INR ${n.format(min || 0)} - INR ${n.format(max || 0)} / month`;
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
  skills: Array.isArray(item?.skills) ? item.skills : [],
  aboutWork: item?.about_work || "",
  createdAt: item?.createdAt || "",
  deadlineAt: item?.deadline_at || "",
});

const clampText = (value, limit = 160) => {
  if (!value) return "No additional description shared yet.";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

export default function ExploreInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [busyIds, setBusyIds] = useState(new Set());
  const [applyLimit, setApplyLimit] = useState({
    monthlyApplicationLimit: 0,
    appliedThisMonth: 0,
    remainingThisMonth: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Please login to explore internships.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [exploreRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/internships/explore`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/student/internships/status`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        const exploreData = await exploreRes.json();
        const statusData = statusRes.ok
          ? await statusRes.json()
          : { savedIds: [], appliedIds: [], monthlyApplicationLimit: 0, appliedThisMonth: 0, remainingThisMonth: 0 };

        if (!exploreRes.ok) throw new Error(exploreData?.message || "Failed to load internships");

        const list = Array.isArray(exploreData?.internships)
          ? exploreData.internships.map(normalizeInternship).filter((x) => x.id)
          : [];

        setInternships(list);
        setSavedIds(new Set((statusData?.savedIds || []).map(String)));
        setAppliedIds(new Set((statusData?.appliedIds || []).map(String)));
        setApplyLimit({
          monthlyApplicationLimit: Number(statusData?.monthlyApplicationLimit || 0),
          appliedThisMonth: Number(statusData?.appliedThisMonth || 0),
          remainingThisMonth: Number(statusData?.remainingThisMonth || 0),
        });
      } catch (err) {
        if (err?.name !== "AbortError") setError(err?.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, location, mode, type, sortBy]);

  const filtered = useMemo(() => {
    let list = [...internships];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (location.trim()) {
      const l = location.toLowerCase();
      list = list.filter((i) => i.location.toLowerCase().includes(l));
    }

    if (mode !== "all") list = list.filter((i) => i.workmode === mode);
    if (type !== "all") list = list.filter((i) => i.employmentType === type);

    if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "deadline") list.sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
    if (sortBy === "stipend") list.sort((a, b) => b.stipendMax - a.stipendMax);

    return list;
  }, [internships, query, location, mode, type, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFiltersCount = [location.trim(), mode !== "all", type !== "all"].filter(Boolean).length;
  const isMonthlyLimitReached =
    applyLimit.monthlyApplicationLimit > 0 &&
    applyLimit.appliedThisMonth >= applyLimit.monthlyApplicationLimit;

  const setBusy = (key, value) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleSave = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Please login to save internships.");

    const key = `save:${id}`;
    if (busyIds.has(key)) return;

    try {
      setBusy(key, true);
      const alreadySaved = savedIds.has(id);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${id}/save`, {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to save internship");

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.delete(id);
        else next.add(id);
        return next;
      });
    } catch (err) {
      setError(err?.message || "Failed to save internship");
    } finally {
      setBusy(key, false);
    }
  };

  const applyInternship = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Please login to apply internships.");
    if (isMonthlyLimitReached) {
      return setError(`Monthly application limit reached (${applyLimit.monthlyApplicationLimit}).`);
    }

    const key = `apply:${id}`;
    if (busyIds.has(key) || appliedIds.has(id)) return;

    try {
      setBusy(key, true);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${id}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to apply internship");

      setAppliedIds((prev) => new Set(prev).add(id));
      setSavedIds((prev) => new Set(prev).add(id));
      setApplyLimit((prev) => ({
        ...prev,
        appliedThisMonth: prev.appliedThisMonth + 1,
        remainingThisMonth: Math.max(0, prev.remainingThisMonth - 1),
      }));
    } catch (err) {
      setError(err?.message || "Failed to apply internship");
    } finally {
      setBusy(key, false);
    }
  };

  return (
    <StudentLayout title="Explore Internships">
      <div className="min-h-full bg-slate-50 p-4 md:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Find Your Next Internship</h2>
              <p className="text-sm text-slate-600">Browse active roles and apply quickly.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{filtered.length} results</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{activeFiltersCount} active filters</span>
              {applyLimit.monthlyApplicationLimit > 0 ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                  {applyLimit.remainingThisMonth} / {applyLimit.monthlyApplicationLimit} applications left this month
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setLocation("");
                  setMode("all");
                  setType("all");
                  setSortBy("newest");
                }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role, company, skill"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
            />
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="all">All modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="all">All types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">Sorted by</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
              <option value="newest">Newest</option>
              <option value="deadline">Closest deadline</option>
              <option value="stipend">Highest stipend</option>
            </select>
          </div>
        </section>

        <div className="mt-4">
          {loading ? <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">Loading internships...</div> : null}

          {!loading && pageItems.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">No internships found.</div>
          ) : null}

          {!loading ? (
            <div className="space-y-4">
              {pageItems.map((item) => {
                const saveKey = `save:${item.id}`;
                const applyKey = `apply:${item.id}`;
                const saveBusy = busyIds.has(saveKey);
                const applyBusy = busyIds.has(applyKey);

                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex flex-col gap-4">
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
                          <h3 className="truncate text-lg font-semibold text-slate-900">{item.title}</h3>
                          <p className="truncate text-sm text-slate-600">{item.company}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><MapPin size={14} /> {item.location}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Briefcase size={14} /> {item.workmode} / {item.employmentType}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Wallet size={14} /> {formatStipend(item.stipendMin, item.stipendMax)}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Clock3 size={14} /> {item.duration || 0} months</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Users size={14} /> {item.openings || 0} openings</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{clampText(item.aboutWork)}</p>

                      {item.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.skills.slice(0, 5).map((skill, index) => (
                            <span key={`${item.id}-skill-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {skill}
                            </span>
                          ))}
                          {item.skills.length > 5 ? (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              +{item.skills.length - 5} more
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/student/explore/${item.id}`}
                          state={{ internship: item }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={15} />
                          View Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => applyInternship(item.id)}
                          disabled={appliedIds.has(item.id) || applyBusy || isMonthlyLimitReached}
                          className={`rounded-xl px-3 py-2 text-sm font-medium ${
                            appliedIds.has(item.id) ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {applyBusy ? "Applying..." : appliedIds.has(item.id) ? "Applied" : "Apply"}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSave(item.id)}
                          disabled={saveBusy}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {savedIds.has(item.id) ? <BookmarkCheck size={15} className="text-blue-600" /> : <BookmarkPlus size={15} />}
                          {saveBusy ? "Saving..." : savedIds.has(item.id) ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>

        {!loading ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="text-slate-600">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </StudentLayout>
  );
}
