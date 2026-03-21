import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Brain,
  Briefcase,
  Clock3,
  Code2,
  Filter,
  GraduationCap,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const MIN_RECOMMENDATION_SCORE = 10;
const TOP_RECOMMENDATION_LIMIT = 10;

const REASON_LABELS = {
  SKILL_MATCH: "Skill match",
  LOCATION_MATCH: "Location match",
  RECENT_POST: "Recent post",
  POPULAR_ROLE: "Popular role",
  ELIGIBILITY_MATCH: "Eligibility match",
  CERTIFICATE_RELEVANCE: "Certificate relevance",
  POPULARITY_BOOST: "Popular internship",
  RECENCY_BOOST: "Recently posted",
  EDUCATION_MATCH: "Education match",
  PROJECT_RELEVANCE: "Project relevance",
  CGPA_ELIGIBLE: "CGPA eligible",
};

const REASON_ICONS = {
  SKILL_MATCH: Code2,
  LOCATION_MATCH: MapPin,
  EDUCATION_MATCH: GraduationCap,
  PROJECT_RELEVANCE: Sparkles,
  ELIGIBILITY_MATCH: ShieldCheck,
  RECENT_POST: Clock3,
  RECENCY_BOOST: Clock3,
  POPULAR_ROLE: TrendingUp,
  POPULARITY_BOOST: TrendingUp,
  CERTIFICATE_RELEVANCE: Award,
  CGPA_ELIGIBLE: BadgeCheck,
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
const reasonIcon = (reason) => REASON_ICONS[reason] || Brain;

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

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRoleBasedFallbacks = (title = "") => {
  const role = String(title || "").toLowerCase();

  if (role.includes("frontend")) {
    return {
      about:
        "Build and improve responsive UI components, integrate APIs, and support reusable frontend architecture.",
      whoCanApply:
        "Students with HTML, CSS, JavaScript, and React fundamentals who can build real project interfaces.",
      skills: ["HTML", "CSS", "JavaScript", "React", "Git"],
    };
  }

  if (role.includes("backend")) {
    return {
      about:
        "Develop and maintain APIs, handle database operations, and improve backend performance and security.",
      whoCanApply:
        "Students with Node.js or similar backend knowledge, database basics, and API development understanding.",
      skills: ["Node.js", "Express", "MongoDB", "REST API", "Git"],
    };
  }

  if (role.includes("data")) {
    return {
      about:
        "Work on data cleaning, reporting, dashboards, and insights generation for business and product teams.",
      whoCanApply:
        "Students with strong analytical thinking and hands-on SQL, Excel, or Python data analysis basics.",
      skills: ["SQL", "Excel", "Python", "Power BI", "Statistics"],
    };
  }

  if (role.includes("ui") || role.includes("ux") || role.includes("design")) {
    return {
      about:
        "Create user-centered wireframes and prototypes, collaborate on design systems, and improve usability.",
      whoCanApply:
        "Students with design portfolio, Figma proficiency, and understanding of user research and interaction design.",
      skills: ["Figma", "Wireframing", "Prototyping", "Design Systems", "User Research"],
    };
  }

  if (role.includes("ai") || role.includes("ml")) {
    return {
      about:
        "Build and evaluate ML models, prepare datasets, and improve recommendation or prediction workflows.",
      whoCanApply:
        "Students with ML fundamentals, Python programming, and project experience in model training and evaluation.",
      skills: ["Python", "Pandas", "Scikit-learn", "Machine Learning", "Model Evaluation"],
    };
  }

  return {
    about:
      "Contribute to real product features, collaborate with cross-functional teams, and deliver measurable outcomes.",
    whoCanApply:
      "Students with relevant academic background, problem-solving skills, and ability to work in a team environment.",
    skills: ["Communication", "Problem Solving", "Teamwork", "Time Management"],
  };
};

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
  const [selectedMode, setSelectedMode] = useState("All");

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
    fetchRecommendations({ refresh: true });
  }, []);

  const updatedAt = useMemo(() => {
    if (!meta.generatedAt) return "";
    const date = new Date(meta.generatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  }, [meta.generatedAt]);

  const topItems = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .filter((item) => Number(item?.score || 0) >= MIN_RECOMMENDATION_SCORE)
        .sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0))
        .slice(0, TOP_RECOMMENDATION_LIMIT),
    [items]
  );

  const modeOptions = useMemo(() => {
    const modes = new Set(["All"]);
    topItems.forEach((item) => {
      const mode = item?.internship?.workmode || item?.internship?.mode;
      if (mode) modes.add(mode);
    });
    return Array.from(modes);
  }, [topItems]);

  const visibleItems = useMemo(() => {
    if (selectedMode === "All") return topItems;
    return topItems.filter((item) => (item?.internship?.workmode || item?.internship?.mode) === selectedMode);
  }, [selectedMode, topItems]);

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
    <StudentLayout title="AI Recommendations">
      <div className="min-h-full bg-gradient-to-br from-sky-50 via-white to-indigo-100 p-4 md:p-6">
        <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 p-5 text-white md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">AI Internship Recommendations</h1>
                <p className="mt-1 text-sm text-blue-100">
                  Curated matches based on your profile, skills, and internship demand signals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchRecommendations({ refresh: true })}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
              >
                <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          {/* <div className="grid gap-3 border-t border-indigo-100 bg-white p-4 md:grid-cols-4 md:p-5">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Model</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{meta.modelVersion || "-"}</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Source</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{meta.source || "-"}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Applications Left</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {applyLimit.monthlyApplicationLimit > 0
                  ? `${applyLimit.remainingThisMonth}/${applyLimit.monthlyApplicationLimit}`
                  : "Unlimited"}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Generated</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{updatedAt || "-"}</p>
            </div>
          </div> */}
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Filter size={13} /> Work mode
            </span>
            {modeOptions.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedMode === mode
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        {loading ? <StudentLoadingCard className="mt-4" message="Loading recommendations..." /> : null}

        {!loading && error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : null}

        {!loading && !error && visibleItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No high-match recommendations found for selected filter.
          </div>
        ) : null}

        {!loading && !error && visibleItems.length > 0 ? (
          <div className="mt-4 space-y-4">
            {visibleItems.map((item, index) => {
              const internship = item?.internship || {};
              const internshipId = String(item?.internshipId || internship?._id || `row-${index}`);
              const reasons = Array.isArray(item?.reasons) ? item.reasons : [];
              const missingSkills = Array.isArray(item?.missingSkills) ? item.missingSkills : [];
              const detailsState = normalizeInternshipForDetails(internship);
              const applyBusy = busyIds.has(`apply:${internshipId}`);
              const isApplied = appliedIds.has(internshipId);
              const fallbacks = getRoleBasedFallbacks(internship?.title);
              const requiredSkills = Array.isArray(internship?.skill_req)
                ? internship.skill_req
                : Array.isArray(internship?.skills)
                  ? internship.skills
                  : fallbacks.skills;
              const aboutInternship = internship?.about_work || fallbacks.about;
              const whoCanApply = internship?.who_can_apply || fallbacks.whoCanApply;

              return (
                <article
                  key={internshipId}
                  className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 shadow-sm"
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
                        <Sparkles size={14} className="mr-1" /> Score: {Number(item?.score || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <MapPin size={14} /> {internship?.location || "Location not specified"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">
                        <Briefcase size={14} /> {internship?.workmode || internship?.mode || "Remote"} /{" "}
                        {internship?.employment_type || "Full Time"}
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

                    {reasons.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {reasons.map((reason) => {
                          const ReasonIcon = reasonIcon(reason);
                          return (
                            <span
                              key={`${internshipId}-${reason}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium leading-none text-indigo-700"
                            >
                              <ReasonIcon size={12} className="shrink-0" />
                              {reasonText(reason)}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}

                    {missingSkills.length > 0 ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Suggested missing skills: <span className="font-semibold">{missingSkills.slice(0, 5).join(", ")}</span>
                      </p>
                    ) : null}

                    {/* <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          About Internship
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{aboutInternship}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Who Can Apply
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{whoCanApply}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Required Skills
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {requiredSkills.slice(0, 8).map((skill) => (
                            <span
                              key={`${internshipId}-skill-${skill}`}
                              className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div> */}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <BadgeCheck size={13} /> Apply by: {formatDate(internship?.deadline_at)}
                      </div>

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
                              ? "cursor-not-allowed bg-blue-300"
                              : "bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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







