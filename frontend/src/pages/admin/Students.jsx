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
  MapPin,
  Calendar,
  X,
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Students
                </h1>
                <p className="text-sm text-slate-500">
                  Review student profiles and control access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Total: {summary.total}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                Active: {summary.active}
              </span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
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
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10">
                  <NotAvailable text="No students found" />
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
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <Eye size={16} />
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
        {filteredStudents.map((s) => (
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
                className={`px-2.5 py-1 rounded-full text-xs ${
                  s.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {s.isActive ? "Active" : "Blocked"}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStudent(s)}
                  className="p-2 border border-slate-200 rounded-lg"
                >
                  <Eye size={16} />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-700 px-6 py-5 text-white">
              <div className="absolute right-0 top-0 h-full w-36 bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedStudent.profilePic ? (
                    <img
                      src={selectedStudent.profilePic}
                      className="h-14 w-14 rounded-full border border-white/30 object-cover ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold text-white ring-4 ring-white/10">
                      {getStudentName(selectedStudent).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      {getStudentName(selectedStudent)}
                    </h3>
                    <p className="text-sm text-white/80">
                      {selectedStudent.loginType || "email"} login
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          selectedStudent.isActive
                            ? "bg-emerald-400/20 text-emerald-100"
                            : "bg-rose-400/20 text-rose-100"
                        }`}
                      >
                        {selectedStudent.isActive ? "Active" : "Blocked"}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-white/90">
                        Skills: {selectedStudent.skills?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {selectedStudent.phone_no || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Profile
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    {selectedStudent.preferredLocation || "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {selectedStudent.createdAt
                      ? new Date(selectedStudent.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 px-6 pb-6 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-2.5 py-1">
                Student ID: {selectedStudent._id || "-"}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">
                Login: {selectedStudent.loginType || "email"}
              </span>
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
