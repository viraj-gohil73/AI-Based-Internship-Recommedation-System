import { useEffect, useMemo, useState } from "react";
import {
  BookmarkCheck,
  BookmarkPlus,
  Briefcase,
  Clock3,
  Eye,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PAGE_SIZE = 8;

const formatStipend = (min, max) => {
  const minNum = Number(min || 0);
  const maxNum = Number(max || 0);
  if (!minNum && !maxNum) return "Unpaid";

  const n = new Intl.NumberFormat("en-IN");
  return `INR ${n.format(minNum)} - INR ${n.format(maxNum)} / month`;
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

const normalize = (value) => String(value || "").trim().toLowerCase();

const clampText = (value, limit = 180) => {
  if (!value) return "No additional description shared yet.";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

const formatDate = (value) => {
  if (!value) return "No deadline";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
};

const getDeadlineState = (value) => {
  if (!value) return { label: "No deadline", tone: "neutral" };
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return { label: "No deadline", tone: "neutral" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineEnd = new Date(deadline);
  deadlineEnd.setHours(23, 59, 59, 999);

  const dayDiff = Math.ceil((deadlineEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff < 0) return { label: "Closed", tone: "closed" };
  if (dayDiff === 0) return { label: "Last day to apply", tone: "urgent" };
  if (dayDiff === 1) return { label: "1 day left", tone: "warning" };
  if (dayDiff <= 3) return { label: `${dayDiff} days left`, tone: "warning" };
  return { label: `${dayDiff} days left`, tone: "safe" };
};

export default function ExploreInternships() {
  const locationState = useLocation();
  const currentRoute = `${locationState.pathname}${locationState.search || ""}`;

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("all");
  const [minStipend, setMinStipend] = useState("0");
  const [maxDuration, setMaxDuration] = useState("all");
  const [minOpenings, setMinOpenings] = useState("0");
  const [skillFilter, setSkillFilter] = useState("");
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

  const {
    isOpen: isResumeModalOpen,
    options: resumeOptions,
    selectedResumeUrl,
    setSelectedResumeUrl,
    requestResumeSelection,
    confirmSelection,
    cancelSelection,
  } = useResumePickerModal();

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
  }, [query, location, mode, type, minStipend, maxDuration, minOpenings, skillFilter, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setLocation("");
    setMode("all");
    setType("all");
    setMinStipend("0");
    setMaxDuration("all");
    setMinOpenings("0");
    setSkillFilter("");
    setSortBy("newest");
  };

  const locationSuggestions = useMemo(
    () => [...new Set(internships.map((i) => i.location).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [internships]
  );

  const filtered = useMemo(() => {
    let list = [...internships];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (location.trim()) {
      const loc = location.trim().toLowerCase();
      list = list.filter((i) => i.location.toLowerCase().includes(loc));
    }

    if (mode !== "all") list = list.filter((i) => normalize(i.workmode) === normalize(mode));
    if (type !== "all") list = list.filter((i) => normalize(i.employmentType) === normalize(type));

    const minStipendValue = Number(minStipend || 0);
    if (minStipendValue > 0) {
      list = list.filter((i) => Math.max(i.stipendMin || 0, i.stipendMax || 0) >= minStipendValue);
    }

    if (maxDuration !== "all") {
      const duration = Number(maxDuration);
      list = list.filter((i) => i.duration > 0 && i.duration <= duration);
    }

    const openings = Number(minOpenings || 0);
    if (openings > 0) list = list.filter((i) => (i.openings || 0) >= openings);

    if (skillFilter.trim()) {
      const skill = skillFilter.trim().toLowerCase();
      list = list.filter((i) => i.skills.some((s) => s.toLowerCase().includes(skill)));
    }

    if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "deadline") list.sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
    if (sortBy === "stipend") list.sort((a, b) => b.stipendMax - a.stipendMax);

    return list;
  }, [internships, query, location, mode, type, minStipend, maxDuration, minOpenings, skillFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFiltersCount = [
    location.trim(),
    mode !== "all",
    type !== "all",
    Number(minStipend) > 0,
    maxDuration !== "all",
    Number(minOpenings) > 0,
    skillFilter.trim(),
  ].filter(Boolean).length;

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
      toast.success(alreadySaved ? "Removed from saved" : "Saved internship");
    } catch (err) {
      const message = err?.message || "Failed to save internship";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(key, false);
    }
  };

  const applyInternship = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const message = "Please login to apply internships.";
      setError(message);
      toast.error(message);
      return;
    }

    if (isMonthlyLimitReached) {
      const message = `Monthly application limit reached (${applyLimit.monthlyApplicationLimit}).`;
      setError(message);
      toast.error(message);
      return;
    }

    const key = `apply:${id}`;
    if (busyIds.has(key) || appliedIds.has(id)) return;

    try {
      const selectedResume = await requestResumeSelection(API_BASE_URL, token);
      if (!selectedResume) return;

      setBusy(key, true);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeUrl: selectedResume.url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to apply internship");

      setAppliedIds((prev) => new Set(prev).add(id));
      setApplyLimit((prev) => ({
        ...prev,
        appliedThisMonth: prev.appliedThisMonth + 1,
        remainingThisMonth: Math.max(0, prev.remainingThisMonth - 1),
      }));
      window.dispatchEvent(new Event("student-application-status-updated"));
      toast.success("Applied successfully");
    } catch (err) {
      const message = err?.message || "Failed to apply internship";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(key, false);
    }
  };

  return (
    <StudentLayout title="Explore Internships">
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 md:p-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* <section className="overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-5 text-white md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold md:text-2xl">Explore Internships</h2>
                <p className="mt-1 text-sm text-blue-50">Find active opportunities that match your skills and goals.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/20 px-3 py-1.5">{filtered.length} results</span>
                <span className="rounded-full bg-white/20 px-3 py-1.5">{activeFiltersCount} filters</span>
                {applyLimit.monthlyApplicationLimit > 0 ? (
                  <span className="rounded-full bg-white/20 px-3 py-1.5">
                    {applyLimit.remainingThisMonth}/{applyLimit.monthlyApplicationLimit} applies left
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section> */}

        <section className=" rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal size={16} /> Search & Filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
            <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
              <Search size={15} className="text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role, company, skills"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              list="explore-location-suggestions"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
            <datalist id="explore-location-suggestions">
              {locationSuggestions.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>

            <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="all">All modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="all">All types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>

            <select value={minStipend} onChange={(e) => setMinStipend(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="0">Any stipend</option>
              <option value="5000">INR 5,000+</option>
              <option value="10000">INR 10,000+</option>
              <option value="15000">INR 15,000+</option>
              <option value="25000">INR 25,000+</option>
            </select>

            <select value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="all">Any duration</option>
              <option value="3">Up to 3 months</option>
              <option value="6">Up to 6 months</option>
              <option value="12">Up to 12 months</option>
            </select>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
              <Filter size={15} className="text-slate-500" />
              <input
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter by skill"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            <select value={minOpenings} onChange={(e) => setMinOpenings(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="0">Any openings</option>
              <option value="1">1+ openings</option>
              <option value="3">3+ openings</option>
              <option value="5">5+ openings</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
              <option value="newest">Sort: Newest</option>
              <option value="deadline">Sort: Closest deadline</option>
              <option value="stipend">Sort: Highest stipend</option>
            </select>
          </div>
        </section>

        <div className="mt-4 space-y-4">
          {loading ? <StudentLoadingCard message="Loading internships..." /> : null}

          {!loading && pageItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No internships found for current filters.
            </div>
          ) : null}

          {!loading
            ? pageItems.map((item) => {
                const saveKey = `save:${item.id}`;
                const applyKey = `apply:${item.id}`;
                const saveBusy = busyIds.has(saveKey);
                const applyBusy = busyIds.has(applyKey);
                const isApplied = appliedIds.has(item.id);
                const deadlineState = getDeadlineState(item.deadlineAt);
                const deadlineToneClass =
                  deadlineState.tone === "closed"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : deadlineState.tone === "urgent"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : deadlineState.tone === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : deadlineState.tone === "safe"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-700";

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {item.companyLogo ? (
                            <img src={item.companyLogo} alt={`${item.company} logo`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
                              {item.company.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold text-slate-900">{item.title}</h3>
                          <p className="truncate text-sm text-slate-600">{item.company}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                          <MapPin size={14} /> {item.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                          <Briefcase size={14} /> {item.workmode} / {item.employmentType}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                          <Wallet size={14} /> {formatStipend(item.stipendMin, item.stipendMax)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                          <Clock3 size={14} /> {item.duration || 0} months
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                          <Users size={14} /> {item.openings || 0} openings
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{clampText(item.aboutWork)}</p>

                      {item.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.skills.slice(0, 6).map((skill, idx) => (
                            <span key={`${item.id}-skill-${idx}`} className="rounded-full border border-indigo-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {skill}
                            </span>
                          ))}
                          {item.skills.length > 6 ? (
                            <span className="rounded-full border border-indigo-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              +{item.skills.length - 6} more
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex flex-col gap-3 border-t border-blue-100 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${deadlineToneClass}`}>
                            <Clock3 size={13} /> {deadlineState.label}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                            Apply by: {formatDate(item.deadlineAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/student/explore/${item.id}`}
                            state={{ internship: item, from: currentRoute }}
                            className="inline-flex items-center gap-1 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            <Eye size={15} /> Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => applyInternship(item.id)}
                            disabled={isApplied || applyBusy || isMonthlyLimitReached}
                            className={`rounded-xl px-3 py-2 text-sm font-semibold text-white transition ${
                              isApplied
                                ? "cursor-not-allowed bg-blue-300"
                                : "bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            }`}
                          >
                            {applyBusy ? "Applying..." : isApplied ? "Applied" : "Apply"}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave(item.id)}
                            disabled={saveBusy}
                            className="inline-flex items-center gap-1 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            {savedIds.has(item.id) ? <BookmarkCheck size={15} className="text-blue-600" /> : <BookmarkPlus size={15} />}
                            {saveBusy ? "Saving..." : savedIds.has(item.id) ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            : null}
        </div>

        {!loading ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm shadow-sm">
            <p className="text-slate-600">Page {safePage} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ResumeSelectionModal
        open={isResumeModalOpen}
        options={resumeOptions}
        selectedResumeUrl={selectedResumeUrl}
        onSelect={setSelectedResumeUrl}
        onConfirm={confirmSelection}
        onCancel={cancelSelection}
      />
    </StudentLayout>
  );
}

