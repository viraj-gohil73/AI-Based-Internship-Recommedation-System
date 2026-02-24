import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  UserRound,
  Video,
} from "lucide-react";

const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
const INTERVIEW_MODES = ["ONLINE", "OFFLINE", "PHONE"];

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toInputDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60 * 1000);
  return normalized.toISOString().slice(0, 16);
};

const studentLabel = (student) => {
  if (!student) return "Student";
  const first = student.fname || "";
  const last = student.lname || "";
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return student.email || "Student";
};

const internshipLabel = (internship) => internship?.title || "Internship";

const getStatusClass = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "NO_SHOW":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

const getModeClass = (mode) => {
  switch (mode) {
    case "ONLINE":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "OFFLINE":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
  }
};

export default function Interviews() {
  const [searchParams] = useSearchParams();
  const prefillInternshipId = searchParams.get("internshipId") || "";
  const prefillStudentId = searchParams.get("studentId") || "";

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState({
    internshipId: prefillInternshipId,
    studentId: prefillStudentId,
    scheduledAt: "",
    durationMinutes: 30,
    mode: "ONLINE",
    meetingLink: "",
    location: "",
    notes: "",
  });
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [updatingScheduleId, setUpdatingScheduleId] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const loadData = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      const token = localStorage.getItem("recruiterToken");
      const [interviewRes, applicantRes] = await Promise.all([
        fetch("http://localhost:5000/api/recruiter/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/recruiter/applicants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const interviewData = await interviewRes.json();
      const applicantData = await applicantRes.json();

      if (!interviewRes.ok) {
        throw new Error(interviewData.message || "Failed to fetch interviews");
      }
      if (!applicantRes.ok) {
        throw new Error(applicantData.message || "Failed to fetch applicants");
      }

      setInterviews(Array.isArray(interviewData.interviews) ? interviewData.interviews : []);
      setApplicants(Array.isArray(applicantData.applicants) ? applicantData.applicants : []);
    } catch (error) {
      toast.error(error.message || "Unable to load interviews");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const candidateOptions = useMemo(() => {
    if (!form.internshipId) return applicants;
    return applicants.filter((item) => String(item.internshipId) === String(form.internshipId));
  }, [applicants, form.internshipId]);

  const internshipOptions = useMemo(() => {
    const seen = new Set();
    const rows = [];
    applicants.forEach((item) => {
      const id = String(item.internshipId || "");
      if (!id || seen.has(id)) return;
      seen.add(id);
      rows.push({ id, title: item.internshipTitle || "Internship" });
    });
    return rows;
  }, [applicants]);

  const interviewStats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i) => i.status === "SCHEDULED").length;
    const completed = interviews.filter((i) => i.status === "COMPLETED").length;
    return { total, scheduled, completed };
  }, [interviews]);

  const createInterview = async (e) => {
    e.preventDefault();
    if (!form.internshipId || !form.studentId || !form.scheduledAt) {
      toast.error("Internship, student and schedule time are required");
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch("http://localhost:5000/api/recruiter/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: form.internshipId,
          studentId: form.studentId,
          scheduledAt: form.scheduledAt,
          durationMinutes: Number(form.durationMinutes) || 30,
          mode: form.mode,
          meetingLink: form.meetingLink,
          location: form.location,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule interview");

      toast.success("Interview scheduled");
      setForm((prev) => ({
        ...prev,
        scheduledAt: "",
        durationMinutes: 30,
        mode: "ONLINE",
        meetingLink: "",
        location: "",
        notes: "",
      }));
      await loadData({ silent: true });
    } catch (error) {
      toast.error(error.message || "Unable to schedule interview");
    } finally {
      setCreating(false);
    }
  };

  const updateInterviewStatus = async (interviewId, status) => {
    try {
      setUpdatingStatusId(interviewId);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(`http://localhost:5000/api/recruiter/interviews/${interviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update interview");

      setInterviews((prev) =>
        prev.map((row) =>
          row._id === interviewId ? { ...row, status: data?.interview?.status || status } : row
        )
      );
      toast.success("Interview updated");
    } catch (error) {
      toast.error(error.message || "Unable to update interview");
    } finally {
      setUpdatingStatusId("");
    }
  };

  const updateInterviewSchedule = async (interview, nextValue) => {
    if (!nextValue) return;
    if (toInputDateTimeLocal(interview.scheduledAt) === nextValue) return;

    try {
      setUpdatingScheduleId(interview._id);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(`http://localhost:5000/api/recruiter/interviews/${interview._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduledAt: nextValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reschedule interview");

      setInterviews((prev) =>
        prev.map((row) =>
          row._id === interview._id
            ? { ...row, scheduledAt: data?.interview?.scheduledAt || nextValue }
            : row
        )
      );
      toast.success("Interview rescheduled");
    } catch (error) {
      toast.error(error.message || "Unable to reschedule interview");
    } finally {
      setUpdatingScheduleId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="h-80 rounded-2xl bg-slate-200" />
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-100 via-blue-50 to-white p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Recruiter Workspace</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Interview Management</h1>
              <p className="mt-1 text-sm text-slate-600">Schedule rounds and keep interview pipeline updates consistent.</p>
            </div>
            <button
              onClick={() => loadData({ silent: true })}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 ${
                refreshing ? "scale-[0.98] shadow-inner" : "shadow-sm hover:shadow"
              }`}
            >
              <RefreshCw size={15} className={`transition-colors ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs uppercase tracking-wide text-blue-700">Total Interviews</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{interviewStats.total}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-700">Scheduled</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{interviewStats.scheduled}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Completed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{interviewStats.completed}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Plus size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Schedule New Interview</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <CalendarClock size={16} />
              {showScheduleForm ? "Hide Schedule Section" : "Open Schedule Section"}
            </button>
          </div>

          {showScheduleForm && (
            <form onSubmit={createInterview} className="mt-4 space-y-4 border-t border-slate-200 pt-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Internship</span>
                  <select
                    value={form.internshipId}
                    onChange={(e) => setForm((prev) => ({ ...prev, internshipId: e.target.value, studentId: "" }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select internship</option>
                    {internshipOptions.map((internship) => (
                      <option key={internship.id} value={internship.id}>
                        {internship.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Candidate</span>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select candidate</option>
                    {candidateOptions.map((candidate) => (
                      <option key={`${candidate.studentId}-${candidate.internshipId}`} value={candidate.studentId}>
                        {candidate.student?.name || candidate.student?.email || "Student"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Schedule</span>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Duration (minutes)</span>
                  <input
                    type="number"
                    min="10"
                    max="480"
                    value={form.durationMinutes}
                    onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Mode</span>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                  >
                    {INTERVIEW_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Meeting Link</span>
                  <input
                    type="text"
                    value={form.meetingLink}
                    onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="For online interviews"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Location</span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="For offline interviews"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Notes</span>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <CalendarClock size={16} />
                {creating ? "Scheduling..." : "Schedule Interview"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-slate-700">Interview List</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-sm">
              <thead className="bg-slate-900 text-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">Candidate</th>
                  <th className="px-4 py-3 text-left">Internship</th>
                  <th className="px-4 py-3 text-left">Schedule</th>
                  <th className="px-4 py-3 text-left">Mode</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.length ? (
                  interviews.map((interview) => {
                    const student = interview.studentId;
                    const internship = interview.internshipId;
                    return (
                      <tr key={interview._id} className="border-t border-slate-100 even:bg-slate-50/60">
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <UserRound size={14} className="text-slate-500" />
                            <div>
                              <p className="font-semibold text-slate-800">{studentLabel(student)}</p>
                              <p className="text-xs text-slate-500">{student?.email || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 align-top">{internshipLabel(internship)}</td>
                        <td className="px-4 py-3 text-slate-700 align-top">
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1">
                            <Clock3 size={14} className="text-slate-500" />
                            {formatDateTime(interview.scheduledAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getModeClass(interview.mode)}`}>
                            {interview.mode}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(interview.status)}`}>
                            {interview.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/recruiter/applicants/${interview.internshipId?._id || interview.internshipId}/${interview.studentId?._id || interview.studentId}`}
                              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Open Candidate
                            </Link>

                            <select
                              value={interview.status}
                              onChange={(e) => updateInterviewStatus(interview._id, e.target.value)}
                              disabled={updatingStatusId === interview._id}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:ring-2 focus:ring-blue-300"
                            >
                              {INTERVIEW_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <input
                              type="datetime-local"
                              defaultValue={toInputDateTimeLocal(interview.scheduledAt)}
                              onBlur={(e) => updateInterviewSchedule(interview, e.target.value)}
                              disabled={updatingScheduleId === interview._id}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none transition focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      <div className="inline-flex flex-col items-center gap-2">
                        <Video size={18} className="text-slate-400" />
                        <p>No interviews yet.</p>
                        <p className="text-xs">Use "Open Schedule Section" to schedule your first interview.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:px-5">
            <p className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Tip: Keep interview status updated after each round to maintain accurate pipeline reporting.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
