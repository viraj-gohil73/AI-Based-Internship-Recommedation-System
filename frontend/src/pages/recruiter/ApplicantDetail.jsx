import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  UserCircle2,
  Award,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

const STATUS_ACTIONS = [
  { label: "Shortlist", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Select", value: "SELECTED" },
  { label: "Reject", value: "REJECTED" },
  { label: "Reset", value: "APPLIED" },
];

const getStatusClass = (status) => {
  switch (status) {
    case "SHORTLISTED":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "INTERVIEW":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "SELECTED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

function getInitials(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "ST";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "ST";
}

export default function ApplicantDetail() {
  const { internshipId, studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState(null);

  const fetchApplicantDetail = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(
        `http://localhost:5000/api/recruiter/applications/${internshipId}/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch applicant detail");
      setPayload(data);
    } catch (error) {
      toast.error(error.message || "Unable to load applicant detail");
    } finally {
      setLoading(false);
    }
  }, [internshipId, studentId]);

  useEffect(() => {
    fetchApplicantDetail();
  }, [fetchApplicantDetail]);

  const studentName = useMemo(() => {
    const student = payload?.student;
    if (!student) return "Student";
    const full = `${student.fname || ""} ${student.lname || ""}`.trim();
    return full || student.name || "Student";
  }, [payload]);

  const updateStatus = async (status) => {
    if (!payload?.application || payload.application.status === status || busy) return;
    try {
      setBusy(true);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(
        `http://localhost:5000/api/recruiter/applications/${internshipId}/${studentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              application: { ...prev.application, status: data.status || status },
            }
          : prev
      );
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error(error.message || "Unable to update status");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Link
            to="/recruiter/applicants"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back to Applicants
          </Link>
          <p className="mt-4 text-sm text-slate-600">Applicant record not found.</p>
        </div>
      </div>
    );
  }

  const student = payload.student || {};
  const interviews = Array.isArray(payload.interviews) ? payload.interviews : [];
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const projects = Array.isArray(student.projects) ? student.projects : [];
  const certificates = Array.isArray(student.certificates) ? student.certificates : [];
  const currentStatus = payload.application?.status || "APPLIED";

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
                {getInitials(studentName)}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Applicant Detail</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{studentName}</h1>
                <p className="mt-1 text-sm text-slate-600">{payload.internship?.title || "Internship"}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      currentStatus
                    )}`}
                  >
                    {currentStatus}
                  </span>
                  <span className="text-xs text-slate-500">Applied on: {formatDateTime(payload.application?.appliedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/recruiter/applicants"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <Link
                to={`/recruiter/interviews?internshipId=${internshipId}&studentId=${studentId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <CalendarClock size={16} />
                Schedule Interview
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Candidate Profile</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Mail size={14} />
                    {student.email || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone size={14} />
                    {student.phone_no || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500">Location</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin size={14} />
                    {[student.city, student.state].filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.length ? (
                    skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No skills listed.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/60 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-cyan-700">
                  <FolderKanban size={14} /> Projects
                </p>
                <div className="mt-2 space-y-2">
                  {projects.length ? (
                    projects.map((project, index) => (
                      <div key={`${project?.title || "project"}-${index}`} className="rounded-lg border border-cyan-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{project?.title || "Untitled Project"}</p>
                        {project?.projectType ? (
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-700">{project.projectType}</p>
                        ) : null}
                        {project?.description ? <p className="mt-1 text-xs text-slate-600">{project.description}</p> : null}
                        {project?.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline"
                          >
                            <ExternalLink size={12} />
                            View project
                          </a>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No projects added.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-violet-700">
                  <Award size={14} /> Certificates
                </p>
                <div className="mt-2 space-y-2">
                  {certificates.length ? (
                    certificates.map((certificate, index) => (
                      <div
                        key={`${certificate?.name || certificate?.certificateType || "certificate"}-${index}`}
                        className="rounded-lg border border-violet-200 bg-white p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {certificate?.name || certificate?.certificateType || "Certificate"}
                        </p>
                        {certificate?.issuingOrganization || certificate?.issuedBy ? (
                          <p className="mt-1 text-xs text-slate-600">{certificate.issuingOrganization || certificate.issuedBy}</p>
                        ) : null}
                        {certificate?.certificateFile ? (
                          <a
                            href={certificate.certificateFile}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
                          >
                            <ExternalLink size={12} />
                            View certificate
                          </a>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No certificates added.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Interview Timeline</h2>
              <div className="mt-3 space-y-3">
                {interviews.length ? (
                  interviews.map((interview, index) => (
                    <div
                      key={interview._id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          Round {index + 1}: {formatDateTime(interview.scheduledAt)}
                        </p>
                        <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {interview.status || "Scheduled"}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock3 size={12} />
                        Mode: {interview.mode || "-"}
                      </p>
                      {interview.notes ? (
                        <p className="mt-2 text-xs text-slate-600">{interview.notes}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No interviews scheduled yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="h-max rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Application Actions</h2>
            <p className="mt-1 text-xs text-slate-500">Current status: {currentStatus}</p>

            <div className="mt-3 space-y-2">
              {STATUS_ACTIONS.map((action) => {
                const isCurrent = action.value === currentStatus;
                return (
                  <button
                    key={action.value}
                    onClick={() => updateStatus(action.value)}
                    disabled={busy || isCurrent}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCurrent
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={14} />
                Tip
              </p>
              <p className="mt-1">Set status to INTERVIEW when you schedule rounds to keep pipeline reports clean.</p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <UserCircle2 size={14} />
              Profile created: {formatDateTime(student.createdAt)}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

