import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Brain, Briefcase, Clock3, MapPin, RefreshCcw, Sparkles, Users, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const MIN_RECOMMENDATION_SCORE = 60;
const TOP_RECOMMENDATION_LIMIT = 10;

const REASON_LABELS = {
  SKILL_MATCH: "Skill match",
  LOCATION_MATCH: "Location match",
  RECENT_POST: "Recent post",
  POPULAR_ROLE: "Popular role",
};

const formatStipend = (min, max) => {
  const minNum = Number(min || 0);
  const maxNum = Number(max || 0);
  if (!minNum && !maxNum) return "Unpaid";
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  return `${formatter.format(minNum)} - ${formatter.format(maxNum)}`;
};

const reasonText = (reason) => REASON_LABELS[reason] || reason;

const normalizeInternshipForDetails = (item) => ({
  id: String(item?._id || item?.id || ""),
  title: item?.title || "Untitled Internship",
  company: item?.company || "Unknown Company",
  companyLogo: item?.companyLogo || "",
  location: item?.location || "Remote",
  workmode: item?.workmode || item?.mode || "Remote",
  employment_type: item?.employment_type || "Full Time",
  duration: Number(item?.duration || item?.duration_months || 0),
  openings: Number(item?.openings || 0),
  stipend_min: Number(item?.stipend_min || 0),
  stipend_max: Number(item?.stipend_max || 0),
  skills: Array.isArray(item?.skills) ? item.skills : Array.isArray(item?.skill_req) ? item.skill_req : [],
  perks: Array.isArray(item?.perks) ? item.perks : [],
  about_work: item?.about_work || "",
  who_can_apply: item?.who_can_apply || "",
  deadline_at: item?.deadline_at || item?.apply_by_date || "",
});

export default function AIRecommend() {
  const locationState = useLocation();
  const currentRoute = `${locationState.pathname}${locationState.search || ""}`;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ generatedAt: "", source: "", modelVersion: "" });
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

  const fetchRecommendations = async ({ refresh = false } = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Please login to see recommendations.");
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [recommendationRes, statusRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/student/recommendations?limit=${TOP_RECOMMENDATION_LIMIT}&minScore=${MIN_RECOMMENDATION_SCORE}${refresh ? "&refresh=true" : ""}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`${API_BASE_URL}/api/student/internships/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = await recommendationRes.json();
      const statusData = statusRes.ok
        ? await statusRes.json()
        : { appliedIds: [], monthlyApplicationLimit: 0, appliedThisMonth: 0, remainingThisMonth: 0 };

      if (!recommendationRes.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load recommendations");
      }

      setItems(Array.isArray(data?.items) ? data.items : []);
      setMeta({
        generatedAt: data?.generatedAt || "",
        source: data?.source || "",
        modelVersion: data?.modelVersion || "",
      });
      setAppliedIds(new Set((statusData?.appliedIds || []).map(String)));
      setApplyLimit({
        monthlyApplicationLimit: Number(statusData?.monthlyApplicationLimit || 0),
        appliedThisMonth: Number(statusData?.appliedThisMonth || 0),
        remainingThisMonth: Number(statusData?.remainingThisMonth || 0),
      });
    } catch (err) {
      setError(err?.message || "Failed to load recommendations");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const updatedAt = useMemo(() => {
    if (!meta.generatedAt) return "";
    const date = new Date(meta.generatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  }, [meta.generatedAt]);

  const visibleItems = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .filter((item) => Number(item?.score || 0) >= MIN_RECOMMENDATION_SCORE)
        .sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0))
        .slice(0, TOP_RECOMMENDATION_LIMIT),
    [items]
  );

  const isMonthlyLimitReached =
    applyLimit.monthlyApplicationLimit > 0 && applyLimit.remainingThisMonth <= 0;

  const setBusy = (key, value) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
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
    if (!id || busyIds.has(key) || appliedIds.has(id)) return;

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
    <StudentLayout title="AI Recommendations">
      <div className="min-h-full bg-gradient-to-b from-indigo-50 via-blue-50 to-slate-100 p-4 md:p-6">
        <section className="rounded-2xl border border-indigo-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 p-5 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-semibold md:text-2xl">AI Internship Recommendations</h1>
                <p className="mt-1 text-sm text-blue-50">
                  Personalized rankings based on your profile and internship signals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchRecommendations({ refresh: true })}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30 disabled:opacity-60"
              >
                <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh recommendations"}
              </button>
            </div>
          </div>

          <div className="border-t border-indigo-100 px-5 py-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
                <Brain size={13} /> {meta.modelVersion || "-"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                <Sparkles size={13} /> source: {meta.source || "-"}
              </span>
              {updatedAt ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700">
                  generated: {updatedAt}
                </span>
              ) : null}
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-medium text-violet-700">
                showing top {TOP_RECOMMENDATION_LIMIT} (score {MIN_RECOMMENDATION_SCORE}+)
              </span>
              {applyLimit.monthlyApplicationLimit > 0 ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                  applications left: {applyLimit.remainingThisMonth}/{applyLimit.monthlyApplicationLimit}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading recommendations...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && visibleItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No high-match recommendations found (score {MIN_RECOMMENDATION_SCORE}+). Add more skills in profile and refresh.
          </div>
        ) : null}

        {!loading && !error && visibleItems.length > 0 ? (
          <div className="mt-4 space-y-4">
            {visibleItems.map((item) => {
              const internship = item?.internship || {};
              const internshipId = String(item?.internshipId || internship?._id || "");
              const reasons = Array.isArray(item?.reasons) ? item.reasons : [];
              const missingSkills = Array.isArray(item?.missingSkills) ? item.missingSkills : [];
              const detailsState = normalizeInternshipForDetails(internship);
              const applyBusy = busyIds.has(`apply:${internshipId}`);
              const isApplied = appliedIds.has(internshipId);

              return (
                <article
                  key={internshipId}
                  className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {internship?.title || "Untitled Internship"}
                        </h3>
                        <p className="text-sm text-slate-600">{internship?.company || "Unknown Company"}</p>
                      </div>

                      <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        Score: {Number(item?.score || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <MapPin size={14} /> {internship?.location || "Location not specified"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <Briefcase size={14} /> {internship?.workmode || internship?.mode || "Remote"} / {internship?.employment_type || "Full Time"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <Clock3 size={14} /> {Number(internship?.duration || internship?.duration_months || 0)} months
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <Users size={14} /> {Number(internship?.openings || 0)} openings
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <Wallet size={14} /> {formatStipend(internship?.stipend_min, internship?.stipend_max)}
                      </span>
                    </div>

                    {reasons.length ? (
                      <div className="flex flex-wrap gap-2">
                        {reasons.map((reason) => (
                          <span
                            key={`${internshipId}-${reason}`}
                            className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                          >
                            {reasonText(reason)}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {missingSkills.length ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Suggested missing skills: <span className="font-semibold">{missingSkills.slice(0, 5).join(", ")}</span>
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-3">
                      <p className="text-xs font-medium text-slate-500">
                        Apply by: {internship?.deadline_at ? new Date(internship.deadline_at).toLocaleDateString() : "Not specified"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/student/explore/${internshipId}`}
                          state={{ internship: detailsState, from: currentRoute }}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => applyInternship(internshipId)}
                          disabled={isApplied || applyBusy || isMonthlyLimitReached}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                            isApplied
                              ? "cursor-not-allowed bg-emerald-300"
                              : "bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          }`}
                        >
                          {applyBusy ? "Applying..." : isApplied ? "Applied" : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
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
