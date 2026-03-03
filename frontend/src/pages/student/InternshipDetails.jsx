import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, Briefcase, Clock3, MapPin, Users, Wallet } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import ResumeSelectionModal from "../../components/ResumeSelectionModal";
import { useResumePickerModal } from "../../hooks/useResumePickerModal";

const API_BASE_URL = "http://localhost:5000";

const formatStipend = (min, max) => {
  if (!min && !max) return "Unpaid";
  const n = new Intl.NumberFormat("en-IN");
  return `INR ${n.format(min || 0)} - INR ${n.format(max || 0)} / month`;
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
          // Keep route state data when internship is no longer part of explore listings.
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

  const toggleSave = async () => {
    const internshipId = internship?.id || String(id);
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
    } catch (err) {
      setError(err?.message || "Failed to save internship");
    } finally {
      setBusy(key, false);
    }
  };

  const applyInternship = async () => {
    const internshipId = internship?.id || String(id);
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
    if (busyIds.has(key) || appliedIds.has(internshipId)) return;

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
    } catch (err) {
      const message = err?.message || "Failed to apply internship";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(key, false);
    }
  };

  const saveBusy = busyIds.has(`save:${internship?.id || String(id)}`);
  const applyBusy = busyIds.has(`apply:${internship?.id || String(id)}`);
  const isMonthlyLimitReached =
    applyLimit.monthlyApplicationLimit > 0 &&
    applyLimit.appliedThisMonth >= applyLimit.monthlyApplicationLimit;

  return (
    <StudentLayout title="Internship Details">
      <div className="min-h-full bg-slate-50 p-4 md:p-6">
        <Link to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">
          <ArrowLeft size={16} />
          Back
        </Link>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">Loading internship details...</div>
        ) : null}

        {!loading && !internship ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Internship details are unavailable.
          </div>
        ) : null}

        {!loading && internship ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {internship.companyLogo ? (
                      <img src={internship.companyLogo} alt={`${internship.company} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base font-semibold text-slate-500">
                        {internship.company.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">{internship.title}</h1>
                    <p className="text-sm text-slate-600">{internship.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {applyLimit.monthlyApplicationLimit > 0 ? (
                    <p className="w-full rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      {applyLimit.remainingThisMonth} / {applyLimit.monthlyApplicationLimit} applications left this month
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={applyInternship}
                    disabled={appliedIds.has(internship.id) || applyBusy || isMonthlyLimitReached}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      appliedIds.has(internship.id) ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {applyBusy ? "Applying..." : appliedIds.has(internship.id) ? "Applied" : "Apply"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSave}
                    disabled={saveBusy}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    {savedIds.has(internship.id) ? <BookmarkCheck size={15} className="text-blue-600" /> : <BookmarkPlus size={15} />}
                    {saveBusy ? "Saving..." : savedIds.has(internship.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                <p className="inline-flex items-center gap-1"><MapPin size={14} /> {internship.location}</p>
                <p className="inline-flex items-center gap-1"><Briefcase size={14} /> {internship.workmode} / {internship.employmentType}</p>
                <p className="inline-flex items-center gap-1"><Clock3 size={14} /> {internship.duration || 0} months</p>
                <p className="inline-flex items-center gap-1"><Users size={14} /> {internship.openings || 0} openings</p>
                <p className="inline-flex items-center gap-1"><Wallet size={14} /> {formatStipend(internship.stipendMin, internship.stipendMax)}</p>
                <p>Apply by: {formatDate(internship.deadlineAt)}</p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">About Internship</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {internship.aboutWork || "No additional details provided."}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Who Can Apply</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {internship.whoCanApply || "Eligibility details are not specified."}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Required Skills</h2>
                {internship.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {internship.skills.map((skill, index) => (
                      <span key={`${internship.id}-skill-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No skills listed.</p>
                )}
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Perks</h2>
                {internship.perks.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {internship.perks.map((perk, index) => (
                      <span key={`${internship.id}-perk-${index}`} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
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
