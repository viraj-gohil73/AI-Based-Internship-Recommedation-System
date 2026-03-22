import { useEffect, useMemo, useState } from "react";
import { BookmarkX, Briefcase, Clock3, Eye, MapPin, Search, Users, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

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

const clampText = (value, limit = 140) => {
  if (!value) return "No additional description shared yet.";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
};

export default function SavedInternshipsPro() {
  const locationState = useLocation();
  const currentRoute = `${locationState.pathname}${locationState.search || ""}`;
  const [savedInternships, setSavedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("all");
  const [sortBy, setSortBy] = useState("saved-order");

  const [appliedIds, setAppliedIds] = useState(new Set());
  const [busyIds, setBusyIds] = useState(new Set());
  const [applyLimit, setApplyLimit] = useState({
    monthlyApplicationLimit: 0,
    appliedThisMonth: 0,
    remainingThisMonth: 0,
  });
  const {
    isOpen: isResumeModalOpen,
    modalMode: resumeModalMode,
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
      setError("Please login to view saved internships.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [savedRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/student/internships/saved`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/student/internships/status`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        const savedData = await savedRes.json();
        const statusData = statusRes.ok
          ? await statusRes.json()
          : { appliedIds: [], monthlyApplicationLimit: 0, appliedThisMonth: 0, remainingThisMonth: 0 };

        if (!savedRes.ok) throw new Error(savedData?.message || "Failed to load saved internships");

        const list = Array.isArray(savedData?.savedInternships)
          ? savedData.savedInternships.map(normalizeInternship).filter((x) => x.id)
          : [];

        setSavedInternships(list);
        setAppliedIds(new Set((statusData?.appliedIds || []).map(String)));
        setApplyLimit({
          monthlyApplicationLimit: Number(statusData?.monthlyApplicationLimit || 0),
          appliedThisMonth: Number(statusData?.appliedThisMonth || 0),
          remainingThisMonth: Number(statusData?.remainingThisMonth || 0),
        });
      } catch (err) {
        if (err?.name !== "AbortError") setError(err?.message || "Failed to load saved internships");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    let list = [...savedInternships];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    }

    if (location.trim()) {
      const l = location.toLowerCase();
      list = list.filter((i) => i.location.toLowerCase().includes(l));
    }

    if (mode !== "all") list = list.filter((i) => i.workmode === mode);

    if (sortBy === "deadline") list.sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt));
    if (sortBy === "stipend") list.sort((a, b) => b.stipendMax - a.stipendMax);

    return list;
  }, [savedInternships, query, location, mode, sortBy]);
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

  const unsaveInternship = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Please login to manage saved internships.");

    const key = `unsave:${id}`;
    if (busyIds.has(key)) return;

    try {
      setBusy(key, true);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${id}/save`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to remove saved internship");

      setSavedInternships((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err?.message || "Failed to remove saved internship");
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
    } catch (err) {
      setError(err?.message || "Failed to apply internship");
    } finally {
      setBusy(key, false);
    }
  };

  return (
    <StudentLayout title="Saved Internships">
      <div className="min-h-full bg-slate-50 p-4 md:p-6">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Saved Internships</h2>
          <p className="text-sm text-slate-600">Manage your watchlist and apply quickly.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <label className="md:col-span-2 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <Search size={16} className="text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved internships"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
            <option value="all">All modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
            <option value="saved-order">Saved order</option>
            <option value="deadline">Closest deadline</option>
            <option value="stipend">Highest stipend</option>
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-slate-600">{filtered.length} saved internships</p>
          {applyLimit.monthlyApplicationLimit > 0 ? (
            <p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              {applyLimit.remainingThisMonth} / {applyLimit.monthlyApplicationLimit} applications left this month
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("");
              setMode("all");
              setSortBy("saved-order");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? <StudentLoadingCard message="Loading saved internships..." /> : null}

        {!loading && filtered.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
            <p>No saved internships found.</p>
            <Link to="/student/explore" className="mt-2 inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
              Explore internships
            </Link>
          </div>
        ) : null}

        {!loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((item) => {
              const unsaveKey = `unsave:${item.id}`;
              const applyKey = `apply:${item.id}`;
              const unsaveBusy = busyIds.has(unsaveKey);
              const applyBusy = busyIds.has(applyKey);

              return (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {item.location}</span>
                          <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {item.workmode} / {item.employmentType}</span>
                          <span className="inline-flex items-center gap-1"><Wallet size={14} /> {formatStipend(item.stipendMin, item.stipendMax)}</span>
                          <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {item.duration || 0} months</span>
                          <span className="inline-flex items-center gap-1"><Users size={14} /> {item.openings || 0} openings</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">{clampText(item.aboutWork)}</p>

                    {item.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.skills.slice(0, 4).map((skill, index) => (
                          <span key={`${item.id}-skill-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {skill}
                          </span>
                        ))}
                        {item.skills.length > 4 ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            +{item.skills.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/student/explore/${item.id}`}
                        state={{ internship: item, from: currentRoute }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>

                      <button
                        type="button"
                        onClick={() => applyInternship(item.id)}
                        disabled={appliedIds.has(item.id) || applyBusy || isMonthlyLimitReached}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          appliedIds.has(item.id) ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {applyBusy ? "Applying..." : appliedIds.has(item.id) ? "Applied" : "Apply"}
                      </button>

                      <button
                        type="button"
                        onClick={() => unsaveInternship(item.id)}
                        disabled={unsaveBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                      >
                        <BookmarkX size={15} />
                        {unsaveBusy ? "Removing..." : "Unsave"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
      </div>
      <ResumeSelectionModal
        open={isResumeModalOpen}
        mode={resumeModalMode}
        options={resumeOptions}
        selectedResumeUrl={selectedResumeUrl}
        onSelect={setSelectedResumeUrl}
        onConfirm={confirmSelection}
        onCancel={cancelSelection}
      />
    </StudentLayout>
  );
}






