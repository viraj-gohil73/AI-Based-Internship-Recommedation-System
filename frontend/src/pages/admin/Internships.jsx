import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Eye,
  Filter,
  Inbox,
  MapPin,
  RefreshCcw,
  Search,
  User,
  Building2,
  Calendar,
  Mail,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import NotAvailable from "../../components/NotAvailable.jsx";

export default function Internships() {
  const ITEMS_PER_PAGE = 8;
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("adminToken");

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/internships", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Failed to fetch internships");
      }
      setInternships(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const filteredInternships = useMemo(() => {
    const q = search.trim().toLowerCase();
    return internships.filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const company = String(item?.companyName || "").toLowerCase();
      const recruiter = String(item?.recruiterName || "").toLowerCase();

      const matchesSearch = !q || title.includes(q) || company.includes(q) || recruiter.includes(q);
      const matchesStatus = statusFilter === "ALL" || item?.intern_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [internships, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalFiltered = filteredInternships.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedInternships = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInternships.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInternships, currentPage, ITEMS_PER_PAGE]);

  const pageStart = totalFiltered === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered);

  const summary = useMemo(() => {
    const total = internships.length;
    const active = internships.filter((item) => item?.intern_status === "ACTIVE").length;
    const closed = internships.filter((item) => item?.intern_status === "CLOSED").length;
    const draft = internships.filter((item) => item?.intern_status === "DRAFT").length;
    return { total, active, closed, draft };
  }, [internships]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusClasses = (status) => {
    if (status === "ACTIVE") return "bg-emerald-100 text-emerald-700";
    if (status === "CLOSED") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

  const openInternship = (item) => {
    setSelectedInternship(item);
  };

  const disableInternship = async (item) => {
    const internshipId = item?._id || item?.id;
    if (!internshipId || item?.intern_status === "CLOSED") return;

    try {
      setActionLoadingId(internshipId);
      const res = await fetch(`http://localhost:5000/api/admin/internship/${internshipId}/disable`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to disable internship");
      }

      const nowIso = new Date().toISOString();
      setInternships((prev) =>
        prev.map((row) =>
          String(row._id || row.id) === String(internshipId)
            ? { ...row, intern_status: "CLOSED", is_published: "false", updatedAt: nowIso }
            : row
        )
      );
      setSelectedInternship((prev) =>
        prev && String(prev._id || prev.id) === String(internshipId)
          ? { ...prev, intern_status: "CLOSED", is_published: "false", updatedAt: nowIso }
          : prev
      );
      toast.success("Internship disabled");
    } catch (error) {
      toast.error(error.message || "Failed to disable internship");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Internships</h1>
                <p className="text-sm text-slate-500">View all internships posted across companies and recruiters.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Total: {summary.total}</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Active: {summary.active}</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Closed: {summary.closed}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, company, or recruiter"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <button
              type="button"
              onClick={fetchInternships}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left">Internship</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Recruiter</th>
              <th className="p-4 text-left">Applications</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="p-10 text-center text-slate-500">
                  Loading internships...
                </td>
              </tr>
            )}
            {!loading && filteredInternships.length === 0 && (
              <tr>
                <td colSpan="6" className="p-10">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Inbox size={18} />
                    <NotAvailable text="No internships found" />
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              paginatedInternships.map((item) => (
                <tr key={item._id || item.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{item.title || "Untitled internship"}</p>
                    <p className="text-xs text-slate-500">{item.workmode || "-"} | {item.location || "-"}</p>
                  </td>
                  <td className="p-4 text-slate-700">{item.companyName || "-"}</td>
                  <td className="p-4 text-slate-700">{item.recruiterName || "-"}</td>
                  <td className="p-4 text-slate-700">{Number(item.applicationsCount || 0)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        item.intern_status
                      )}`}
                    >
                      {item.intern_status || "DRAFT"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openInternship(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => disableInternship(item)}
                        disabled={item?.intern_status === "CLOSED" || actionLoadingId === (item._id || item.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white ${
                          item?.intern_status === "CLOSED"
                            ? "cursor-not-allowed bg-slate-300"
                            : "bg-rose-600 hover:bg-rose-700"
                        }`}
                      >
                        {actionLoadingId === (item._id || item.id) ? "..." : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && totalFiltered > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {pageStart}-{pageEnd} of {totalFiltered}
            </p>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 md:hidden">
        {loading && <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">Loading internships...</div>}
        {!loading && filteredInternships.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8">
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Inbox size={18} />
              <NotAvailable text="No internships found" />
            </div>
          </div>
        )}
        {!loading &&
          paginatedInternships.map((item) => (
            <div key={item._id || item.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.title || "Untitled internship"}</p>
                <p className="text-xs text-slate-500">{item.companyName || "-"} | {item.recruiterName || "-"}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Applications: {Number(item.applicationsCount || 0)}</span>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openInternship(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs hover:bg-slate-50"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => disableInternship(item)}
                    disabled={item?.intern_status === "CLOSED" || actionLoadingId === (item._id || item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium text-white ${
                      item?.intern_status === "CLOSED"
                        ? "cursor-not-allowed bg-slate-300"
                        : "bg-rose-600"
                    }`}
                  >
                    {actionLoadingId === (item._id || item.id) ? "..." : "Disable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        {!loading && totalFiltered > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <p>
                {pageStart}-{pageEnd} of {totalFiltered}
              </p>
              <p>
                Page {currentPage}/{totalPages}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={() => setSelectedInternship(null)}>
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="z-10 border-b border-indigo-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold">{selectedInternship.title || "Untitled internship"}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className={`rounded-full px-2.5 py-1 ${getStatusClasses(selectedInternship.intern_status)}`}>
                      {selectedInternship.intern_status || "DRAFT"}
                    </span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1">{selectedInternship.workmode || "-"}</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1">{selectedInternship.location || "-"}</span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1">
                      ID: {selectedInternship._id || selectedInternship.id || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => disableInternship(selectedInternship)}
                    disabled={
                      selectedInternship?.intern_status === "CLOSED" ||
                      actionLoadingId === (selectedInternship._id || selectedInternship.id)
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      selectedInternship?.intern_status === "CLOSED"
                        ? "cursor-not-allowed bg-white/30 text-white"
                        : "bg-rose-500 text-white hover:bg-rose-600"
                    }`}
                  >
                    {actionLoadingId === (selectedInternship._id || selectedInternship.id) ? "Disabling..." : "Disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInternship(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 [scrollbar-gutter:stable]">
              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Applications</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{Number(selectedInternship.applicationsCount || 0)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Openings</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selectedInternship.openings ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Duration</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedInternship.duration ? `${selectedInternship.duration} months` : "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">Stipend</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(selectedInternship.stipend_min)} - {formatCurrency(selectedInternship.stipend_max)}
                  </p>
                </div>
              </div>

                <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ownership</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><Building2 size={14} className="text-slate-400" /> {selectedInternship.companyName || "-"}</p>
                    <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {selectedInternship.companyEmail || "-"}</p>
                    <p className="flex items-center gap-2"><User size={14} className="text-slate-400" /> {selectedInternship.recruiterName || "-"}</p>
                    <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {selectedInternship.recruiterEmail || "-"}</p>
                    <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {selectedInternship.location || "-"}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Start: {formatDate(selectedInternship.starting_date)}</p>
                    <p className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Deadline: {formatDate(selectedInternship.deadline_at)}</p>
                    <p className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Created: {formatDateTime(selectedInternship.createdAt)}</p>
                    <p className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Updated: {formatDateTime(selectedInternship.updatedAt)}</p>
                    <p className="pt-1 text-xs text-slate-500">
                      Published: <span className="font-semibold text-slate-700">{selectedInternship.is_published || "false"}</span>
                    </p>
                  </div>
                </div>
              </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">About Work</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedInternship.about_work || "-"}</p>
              </div>

                <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Who Can Apply</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedInternship.who_can_apply || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Other Requirements</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{selectedInternship.other_req || "-"}</p>
                </div>
              </div>

                <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asArray(selectedInternship.skill_req).length ? asArray(selectedInternship.skill_req).map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{item}</span>
                    )) : <span className="text-sm text-slate-500">No skills listed</span>}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Perks</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {asArray(selectedInternship.perks).length ? asArray(selectedInternship.perks).map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{item}</span>
                    )) : <span className="text-sm text-slate-500">No perks listed</span>}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

