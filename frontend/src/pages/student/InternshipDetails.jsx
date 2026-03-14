import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BookmarkCheck,
  BookmarkPlus,
  Briefcase,
  Clock3,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";
import StudentLoadingCard from "../../components/common/StudentLoadingCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatStipend = (min, max) => {
  const minNum = Number(min || 0);
  const maxNum = Number(max || 0);
  if (!minNum && !maxNum) return "Unpaid";

  const n = new Intl.NumberFormat("en-IN");
  return `INR ${n.format(minNum)} - INR ${n.format(maxNum)} / month`;
};

const formatDate = (date) => {
  if (!date) return "Not specified";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not specified";
  return parsed.toLocaleDateString("en-IN", {
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
  skills: Array.isArray(item?.skills) ? item.skills : [],
  perks: Array.isArray(item?.perks) ? item.perks : [],
  aboutWork: item?.about_work || "",
  whoCanApply: item?.who_can_apply || "",
  deadlineAt: item?.deadline_at || "",
});

export default function InternshipDetails() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from || "/student/explore";

  const initialInternship = useMemo(() => {
    const item = location.state?.internship;
    if (!item) return null;
    const normalized = normalizeInternship(item);
    return normalized.id === String(id) ? normalized : null;
  }, [id, location.state]);

  const [internship, setInternship] = useState(initialInternship);
  const [loading, setLoading] = useState(!initialInternship);
  const [error, setError] = useState("");

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
      setError("Please login to view internship details.");
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setError("");
        if (!initialInternship) setLoading(true);

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

        if (!exploreRes.ok) throw new Error(exploreData?.message || "Failed to load internship details");

        const list = Array.isArray(exploreData?.internships)
          ? exploreData.internships.map(normalizeInternship).filter((x) => x.id)
          : [];

        const found = list.find((item) => item.id === String(id)) || null;
        if (found) {
          setInternship(found);
        } else if (initialInternship) {
          setInternship(initialInternship);
        } else {
          setInternship(null);
          setError("Internship details not found.");
        }

        setSavedIds(new Set((statusData?.savedIds || []).map(String)));
        setAppliedIds(new Set((statusData?.appliedIds || []).map(String)));
        setApplyLimit({
          monthlyApplicationLimit: Number(statusData?.monthlyApplicationLimit || 0),
          appliedThisMonth: Number(statusData?.appliedThisMonth || 0),
          remainingThisMonth: Number(statusData?.remainingThisMonth || 0),
        });
      } catch (err) {
        if (err?.name !== "AbortError") setError(err?.message || "Failed to load internship details");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, initialInternship]);

  const setBusy = (key, value) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const internshipId = internship?.id || String(id);
  const saveBusy = busyIds.has(`save:${internshipId}`);
  const applyBusy = busyIds.has(`apply:${internshipId}`);
  const isApplied = appliedIds.has(internshipId);
  const isMonthlyLimitReached =
    applyLimit.monthlyApplicationLimit > 0 &&
    applyLimit.appliedThisMonth >= applyLimit.monthlyApplicationLimit;

  const toggleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Please login to save internships.");

    const key = `save:${internshipId}`;
    if (busyIds.has(key)) return;

    try {
      setBusy(key, true);
      const alreadySaved = savedIds.has(internshipId);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${internshipId}/save`, {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to save internship");

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.delete(internshipId);
        else next.add(internshipId);
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

  const applyInternship = async () => {
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

    const key = `apply:${internshipId}`;
    if (busyIds.has(key) || isApplied) return;

    try {
      const selectedResume = await requestResumeSelection(API_BASE_URL, token);
      if (!selectedResume) return;

      setBusy(key, true);
      const response = await fetch(`${API_BASE_URL}/api/student/internships/${internshipId}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeUrl: selectedResume.url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to apply internship");

      setAppliedIds((prev) => new Set(prev).add(internshipId));
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
    <StudentLayout title="Internship Details">
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4 md:p-6">
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? <StudentLoadingCard message="Loading internship details..." /> : null}

        {!loading && !internship ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Internship details are unavailable.
          </div>
        ) : null}

        {!loading && internship ? (
          <div className="space-y-4">
            <section className="overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-md">
              <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-5 text-white md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/40 bg-white/20">
                      {internship.companyLogo ? (
                        <img src={internship.companyLogo} alt={`${internship.company} logo`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base font-semibold text-white">
                          {internship.company.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold md:text-2xl">{internship.title}</h1>
                      <p className="mt-1 text-sm text-blue-100">{internship.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {applyLimit.monthlyApplicationLimit > 0 ? (
                      <p className="w-full rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold text-white">
                        {applyLimit.remainingThisMonth}/{applyLimit.monthlyApplicationLimit} applications left this month
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={applyInternship}
                      disabled={isApplied || applyBusy || isMonthlyLimitReached}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isApplied
                          ? "cursor-not-allowed bg-emerald-200 text-emerald-800"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      }`}
                    >
                      {applyBusy ? "Applying..." : isApplied ? "Applied" : "Apply"}
                    </button>

                    <button
                      type="button"
                      onClick={toggleSave}
                      disabled={saveBusy}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
                    >
                      {savedIds.has(internship.id) ? <BookmarkCheck size={15} /> : <BookmarkPlus size={15} />}
                      {saveBusy ? "Saving..." : savedIds.has(internship.id) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-white p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3 md:p-5">
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <MapPin size={14} /> {internship.location}
                </p>
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <Briefcase size={14} /> {internship.workmode} / {internship.employmentType}
                </p>
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <Clock3 size={14} /> {internship.duration || 0} months
                </p>
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <Users size={14} /> {internship.openings || 0} openings
                </p>
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <Wallet size={14} /> {formatStipend(internship.stipendMin, internship.stipendMax)}
                </p>
                <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">
                  <BadgeCheck size={14} /> Apply by: {formatDate(internship.deadlineAt)}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">About Internship</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {internship.aboutWork || "No additional details provided."}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Who Can Apply</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {internship.whoCanApply || "Eligibility details are not specified."}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Required Skills</h2>
                {internship.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {internship.skills.map((skill, index) => (
                      <span
                        key={`${internship.id}-skill-${index}`}
                        className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No skills listed.</p>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Perks</h2>
                {internship.perks.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {internship.perks.map((perk, index) => (
                      <span
                        key={`${internship.id}-perk-${index}`}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No perks mentioned.</p>
                )}
              </article>
            </section>
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
