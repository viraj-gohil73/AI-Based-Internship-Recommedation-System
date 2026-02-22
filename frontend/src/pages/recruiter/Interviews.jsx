import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarClock, Clock3, Plus, RefreshCw, UserRound } from "lucide-react";

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
          row._id === interviewId
            ? { ...row, status: data?.interview?.status || status }
            : row
        )
      );
      toast.success("Interview updated");
    } catch (error) {
      toast.error(error.message || "Unable to update interview");
    } finally {
      setUpdatingStatusId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <p className="text-sm text-slate-600">Loading interviews...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                Recruiter Workspace
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Interview Management</h1>
              <p className="text-sm text-slate-600 mt-1">
                Schedule rounds and track candidate interview statuses.
              </p>
            </div>
            <button
              onClick={() => loadData({ silent: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <form
          onSubmit={createInterview}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-900">
            <Plus size={16} />
            <h2 className="text-sm font-semibold">Schedule New Interview</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={form.internshipId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, internshipId: e.target.value, studentId: "" }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">Select internship</option>
              {internshipOptions.map((internship) => (
                <option key={internship.id} value={internship.id}>
                  {internship.title}
                </option>
              ))}
            </select>

            <select
              value={form.studentId}
              onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">Select candidate</option>
              {candidateOptions.map((candidate) => (
                <option
                  key={`${candidate.studentId}-${candidate.internshipId}`}
                  value={candidate.studentId}
                >
                  {candidate.student?.name || candidate.student?.email || "Student"}
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              required
            />

            <input
              type="number"
              min="10"
              max="480"
              value={form.durationMinutes}
              onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
              placeholder="Duration (minutes)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />

            <select
              value={form.mode}
              onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            >
              {INTERVIEW_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={form.meetingLink}
              onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="Meeting link (for online)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />

            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location (for offline)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />

            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Interview notes"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <CalendarClock size={16} />
            {creating ? "Scheduling..." : "Schedule Interview"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
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
                      <tr key={interview._id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserRound size={14} className="text-slate-500" />
                            <div>
                              <p className="font-medium text-slate-800">{studentLabel(student)}</p>
                              <p className="text-xs text-slate-500">{student?.email || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {internshipLabel(internship)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Clock3 size={14} className="text-slate-500" />
                            {formatDateTime(interview.scheduledAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{interview.mode}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {interview.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/recruiter/applicants/${interview.internshipId?._id || interview.internshipId}/${interview.studentId?._id || interview.studentId}`}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Open Candidate
                            </Link>
                            <select
                              value={interview.status}
                              onChange={(e) =>
                                updateInterviewStatus(interview._id, e.target.value)
                              }
                              disabled={updatingStatusId === interview._id}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-300"
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
                              onBlur={(e) => {
                                const nextValue = e.target.value;
                                if (!nextValue) return;
                                if (toInputDateTimeLocal(interview.scheduledAt) === nextValue) {
                                  return;
                                }
                                fetch(
                                  `http://localhost:5000/api/recruiter/interviews/${interview._id}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "recruiterToken"
                                      )}`,
                                    },
                                    body: JSON.stringify({ scheduledAt: nextValue }),
                                  }
                                )
                                  .then(async (res) => {
                                    const data = await res.json();
                                    if (!res.ok) {
                                      throw new Error(
                                        data.message || "Failed to reschedule interview"
                                      );
                                    }
                                    setInterviews((prev) =>
                                      prev.map((row) =>
                                        row._id === interview._id
                                          ? {
                                              ...row,
                                              scheduledAt:
                                                data?.interview?.scheduledAt || nextValue,
                                            }
                                          : row
                                      )
                                    );
                                    toast.success("Interview rescheduled");
                                  })
                                  .catch((error) =>
                                    toast.error(error.message || "Unable to reschedule interview")
                                  );
                              }}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                      No interviews yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
