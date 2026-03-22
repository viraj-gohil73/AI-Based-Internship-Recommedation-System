import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Briefcase,
  CircleCheck,
  CircleOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InternshipList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/company/internships", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch internships");
      }
      setInternships(Array.isArray(data.internships) ? data.internships : []);
    } catch (err) {
      setError(err.message || "Failed to fetch internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const filteredInternships = useMemo(() => {
    const q = query.trim().toLowerCase();
    return internships.filter((item) => {
      const status = (item.intern_status || "").toLowerCase();
      const mode = (item.workmode || "").toLowerCase();
      const recruiter = (item.recruiter?.name || "").toLowerCase();
      const title = (item.title || "").toLowerCase();

      const matchesQuery = !q || title.includes(q) || recruiter.includes(q);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesMode = modeFilter === "all" || mode === modeFilter;
      return matchesQuery && matchesStatus && matchesMode;
    });
  }, [internships, modeFilter, query, statusFilter]);

  const stats = useMemo(() => {
    const active = internships.filter((item) => item.intern_status === "ACTIVE").length;
    const closed = internships.filter((item) => item.intern_status === "CLOSED").length;
    const applications = internships.reduce(
      (sum, item) => sum + (Number(item.applicationsCount) || 0),
      0
    );
    return { total: internships.length, active, closed, applications };
  }, [internships]);

  const formatMoney = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.intern_status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    const message =
      nextStatus === "CLOSED"
        ? "Close this internship posting?"
        : "Activate this internship posting?";
    if (!window.confirm(message)) return;

    try {
      setActionLoadingId(item._id);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/company/internships/${item._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intern_status: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update internship status");
      }
      setInternships((prev) =>
        prev.map((row) =>
          row._id === item._id
            ? { ...row, intern_status: data?.internship?.intern_status || nextStatus }
            : row
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update internship status");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading internships...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Internship Listings</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                Showing all internships posted by recruiters of your company.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/company/dashboard/recruiters")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 px-4 py-2.5 font-semibold hover:bg-blue-50 transition"
            >
              <Plus size={18} /> Manage Recruiters
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Listings" value={stats.total} icon={Briefcase} />
          <StatCard label="Active Jobs" value={stats.active} icon={CircleCheck} />
          <StatCard
            label="Closed Jobs"
            value={stats.closed}
            icon={CircleOff}
            secondary={`Applications: ${stats.applications}`}
          />
        </section>

        <section className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or recruiter"
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredInternships.length} of {internships.length} internships
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Internship</th>
                <th className="px-4 py-3 text-left">Recruiter</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Applications</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInternships.map((item) => (
                <tr key={item._id} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{item.title || "-"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Posted: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}{" "}
                      | Stipend: {formatMoney(item.stipend_min)} - {formatMoney(item.stipend_max)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.recruiter?.name || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{item.workmode || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{item.location || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{item.applicationsCount || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.intern_status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.intern_status === "DRAFT"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.intern_status || "DRAFT"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/company/dashboard/internships/${item._id}`)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/company/dashboard/internships/${item._id}/edit`)}
                        className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(item)}
                        disabled={actionLoadingId === item._id}
                        className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        title={item.intern_status === "ACTIVE" ? "Close" : "Activate"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInternships.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                    No internships found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, secondary }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {secondary && <p className="text-xs text-slate-500 mt-1">{secondary}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

