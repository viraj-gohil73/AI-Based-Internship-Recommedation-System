import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Users,
  RefreshCcw,
  Mail,
  Phone,
  X,
  Inbox,
  GraduationCap,
  Award,
  FolderKanban,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import NotAvailable from "../../components/NotAvailable.jsx";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [profileLoadingId, setProfileLoadingId] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/admin/students",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      const normalized = list.map((s) => ({
        ...s,
        isActive: s.isActive ?? s.isactive ?? true,
      }));

      setStudents(normalized);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const normalizeStudent = (student) => ({
    ...student,
    isActive: student?.isActive ?? student?.isactive ?? true,
  });

  const toggleBlock = async (id, isActive) => {
    try {
      await fetch(
        `http://localhost:5000/api/admin/student/${id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      toast.success(isActive ? "Student blocked" : "Student unblocked");
      fetchStudents();
    } catch {
      toast.error("Action failed");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = `${s.fname || ""} ${s.lname || ""}`.trim();
      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "ACTIVE"
          ? s.isActive
          : !s.isActive;

      return matchSearch && matchFilter;
    });
  }, [students, search, filter]);

  const summary = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.isActive).length;
    const blocked = total - active;
    return { total, active, blocked };
  }, [students]);

  const requestBlockChange = (student) => {
    const name = `${student.fname || ""} ${student.lname || ""}`.trim();
    setConfirmAction({
      id: student._id,
      isActive: student.isActive,
      name: name || student.email,
    });
  };

  const closeConfirm = () => setConfirmAction(null);

  const confirmBlockChange = () => {
    if (!confirmAction) return;
    toggleBlock(confirmAction.id, confirmAction.isActive);
    closeConfirm();
  };

  const getStudentName = (s) => {
    const name = `${s.fname || ""} ${s.lname || ""}`.trim();
    return name || s.email || "Student";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString("en-IN");
  };

  const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

  const openStudentProfile = async (student) => {
    const studentId = student?._id || student?.id;
    if (!studentId) {
      toast.error("Student id is missing");
      return;
    }

    setSelectedStudent(normalizeStudent(student));

    try {
      setProfileLoadingId(studentId);
      const res = await fetch(`http://localhost:5000/api/admin/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Failed to load student profile");
      }

      setSelectedStudent(normalizeStudent(result.data || student));
    } catch (error) {
      console.error("Student profile fetch failed:", error);
    } finally {
      setProfileLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Students
                </h1>
                <p className="text-sm text-slate-600">
                  Review student profiles and control access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-slate-600">
                Total: {summary.total}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Active: {summary.active}
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                Blocked: {summary.blocked}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or email"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <button
              onClick={fetchStudents}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Login</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">
                  Loading students...
                </td>
              </tr>
            )}

            {!loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Inbox size={18} />
                    <NotAvailable text="No students found" />
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              filteredStudents.map((s) => (
                <tr key={s._id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.profilePic ? (
                        <img
                          src={s.profilePic}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                          {getStudentName(s).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{getStudentName(s)}</p>
                        <p className="text-xs text-slate-500">{s.preferredLocation || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{s.email}</td>
                  <td className="p-4 text-slate-600">{s.loginType || "email"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        s.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {s.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openStudentProfile(s)}
                        className="p-2 flex items-center font-semibold border border-slate-200 rounded-lg hover:bg-slate-50"
                        disabled={profileLoadingId === s._id}
                      >
                        {profileLoadingId === s._id ? "..." : <Eye size={16} className="mr-2"/>} View Profile
                      </button>
                      <button
                        onClick={() => requestBlockChange(s)}
                        className={`p-2 rounded-lg text-white transition ${
                          s.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {s.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Loading students...
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8">
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Inbox size={18} />
              <NotAvailable text="No students found" />
            </div>
          </div>
        )}

        {!loading && filteredStudents.map((s) => (
          <div key={s._id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex gap-3">
              {s.profilePic ? (
                <img src={s.profilePic} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                  {getStudentName(s).slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">{getStudentName(s)}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  s.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {s.isActive ? "Active" : "Blocked"}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => openStudentProfile(s)}
                  className="p-2 border border-slate-200 rounded-lg"
                  disabled={profileLoadingId === s._id}
                >
                  {profileLoadingId === s._id ? "..." : <Eye size={16} />}
                </button>
                <button
                  onClick={() => requestBlockChange(s)}
                  className={`p-2 rounded-lg text-white ${
                    s.isActive ? "bg-red-600" : "bg-green-600"
                  }`}
                >
                  {s.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="z-10 border-b border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-5 text-white">
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedStudent.profilePic ? (
                    <img
                      src={selectedStudent.profilePic}
                      className="h-14 w-14 rounded-full border border-white/30 object-cover ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 text-sm font-semibold text-white">
                      {getStudentName(selectedStudent).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      {getStudentName(selectedStudent)}
                    </h3>
                    <p className="text-sm text-indigo-100">
                      {selectedStudent.loginType || "email"} login
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          selectedStudent.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {selectedStudent.isActive ? "Active" : "Blocked"}
                      </span>
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-white">
                        Skills: {selectedStudent.skills?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto bg-slate-50 px-6 py-5 [scrollbar-gutter:stable]">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Saved Internships</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{asArray(selectedStudent.savedInternships).length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Applied Internships</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{asArray(selectedStudent.appliedInternships).length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Certificates</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{asArray(selectedStudent.certificates).length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Projects</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{asArray(selectedStudent.projects).length}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{selectedStudent.email || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {selectedStudent.phone_no || "-"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Personal
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p><span className="text-slate-500">First Name:</span> {selectedStudent.fname || "-"}</p>
                    <p><span className="text-slate-500">Last Name:</span> {selectedStudent.lname || "-"}</p>
                    <p><span className="text-slate-500">Gender:</span> {selectedStudent.gender || "-"}</p>
                    <p><span className="text-slate-500">DOB:</span> {formatDate(selectedStudent.dob)}</p>
                    <p className="sm:col-span-2"><span className="text-slate-500">Location:</span> {selectedStudent.preferredLocation || "-"}</p>
                    <p><span className="text-slate-500">City:</span> {selectedStudent.city || "-"}</p>
                    <p><span className="text-slate-500">State:</span> {selectedStudent.state || "-"}</p>
                    <p><span className="text-slate-500">Pincode:</span> {selectedStudent.pincode || "-"}</p>
                    <p><span className="text-slate-500">Joined:</span> {formatDate(selectedStudent.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  {[selectedStudent.address1, selectedStudent.address2, selectedStudent.city, selectedStudent.state, selectedStudent.pincode]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Languages
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asArray(selectedStudent.languages).length ? asArray(selectedStudent.languages).map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item}</span>
                    )) : <span className="text-sm text-slate-500">-</span>}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hobbies
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asArray(selectedStudent.hobbies).length ? asArray(selectedStudent.hobbies).map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item}</span>
                    )) : <span className="text-sm text-slate-500">-</span>}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Skills
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {asArray(selectedStudent.skills).length ? asArray(selectedStudent.skills).map((item, idx) => (
                    <span key={`${item}-${idx}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item}</span>
                  )) : <span className="text-sm text-slate-500">No skills added</span>}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Activity
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <p>Saved internships: <span className="font-semibold">{asArray(selectedStudent.savedInternships).length}</span></p>
                  <p>Applied internships: <span className="font-semibold">{asArray(selectedStudent.appliedInternships).length}</span></p>
                  <p>Profile updated: <span className="font-semibold">{formatDate(selectedStudent.updatedAt)}</span></p>
                  <p>Joined on: <span className="font-semibold">{formatDate(selectedStudent.createdAt)}</span></p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <GraduationCap size={14} />
                    Education
                  </p>
                  <div className="mt-3 space-y-2">
                    {asArray(selectedStudent.educations).length ? asArray(selectedStudent.educations).map((edu, idx) => (
                      <div key={`edu-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-semibold">{edu?.instituteName || "-"}</p>
                        <p>{edu?.degreeType || "-"} {edu?.fieldOfStudy ? `- ${edu.fieldOfStudy}` : ""}</p>
                        <p className="text-xs text-slate-500">
                          {edu?.startYear || "-"} - {edu?.endYear || (edu?.status === "pursuing" ? "Present" : "-")}
                        </p>
                      </div>
                    )) : <p className="text-sm text-slate-500">No education details</p>}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <Award size={14} />
                    Certificates
                  </p>
                  <div className="mt-3 space-y-2">
                    {asArray(selectedStudent.certificates).length ? asArray(selectedStudent.certificates).map((cert, idx) => (
                      <div key={`cert-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-semibold">{cert?.name || "-"}</p>
                        <p>{cert?.organization || "-"}</p>
                        <p className="text-xs text-slate-500">{cert?.issueDate || "-"} {cert?.expiryDate ? `to ${cert.expiryDate}` : ""}</p>
                      </div>
                    )) : <p className="text-sm text-slate-500">No certificates</p>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <FolderKanban size={14} />
                    Projects
                  </p>
                  <div className="mt-3 space-y-2">
                    {asArray(selectedStudent.projects).length ? asArray(selectedStudent.projects).map((project, idx) => (
                      <div key={`project-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-semibold">{project?.title || "-"}</p>
                        <p className="line-clamp-2">{project?.description || "-"}</p>
                        {project?.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs text-indigo-600 hover:underline">
                            View project link
                          </a>
                        )}
                      </div>
                    )) : <p className="text-sm text-slate-500">No projects</p>}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                    <LinkIcon size={14} />
                    Social Links
                  </p>
                  <div className="mt-3 space-y-2">
                    {asArray(selectedStudent.socialLinks).length ? asArray(selectedStudent.socialLinks).map((item, idx) => (
                      <a
                        key={`social-${idx}`}
                        href={item?.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <span>{item?.platform || "Link"}</span>
                        <span className="truncate text-xs text-slate-500 max-w-[65%] text-right">{item?.username || item?.url || "-"}</span>
                      </a>
                    )) : <p className="text-sm text-slate-500">No social links</p>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-700 pb-1">
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-sm">
                  Student ID: {selectedStudent._id || "-"}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-sm">
                  Login: {selectedStudent.loginType || "email"}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-sm">
                  Created: {formatDate(selectedStudent.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmAction.isActive ? "Block student?" : "Unblock student?"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirmAction.isActive
                ? "This student will lose access to the platform."
                : "This student will regain access to the platform."}
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {confirmAction.name}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockChange}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  confirmAction.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {confirmAction.isActive ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

