import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Building2,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NotAvailable from "../../components/NotAvailable.jsx";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  /* ================= FETCH & NORMALIZE ================= */
  useEffect(() => {
    fetchApprovedCompanies();
  }, []);

  const fetchApprovedCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/admin/companies",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      const normalized = data.map((c) => ({
        ...c,
        isActive:
          c.isActive ??
          c.isactive ??
          (typeof c.status === "string"
            ? c.status.toUpperCase() === "ACTIVE"
            : false),
      }));

      setCompanies(normalized);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleBlock = async (id, isActive) => {
    try {
      await fetch(
        `http://localhost:5000/api/admin/company/${id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      toast.success(
        isActive ? "Company blocked" : "Company unblocked"
      );

      fetchApprovedCompanies();
    } catch {
      toast.error("Action failed");
    }
  };

  const requestBlockChange = (company) => {
    setConfirmAction({
      id: company._id,
      isActive: company.isActive,
      name: company.companyName,
    });
  };

  const closeConfirm = () => setConfirmAction(null);

  const confirmBlockChange = () => {
    if (!confirmAction) return;
    toggleBlock(confirmAction.id, confirmAction.isActive);
    closeConfirm();
  };

  /* ================= SEARCH + FILTER ================= */
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "ACTIVE"
          ? c.isActive
          : !c.isActive;

      return matchSearch && matchFilter;
    });
  }, [companies, search, filter]);

  const summary = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.isActive).length;
    const blocked = total - active;
    return { total, active, blocked };
  }, [companies]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Companies
                </h1>
                <p className="text-sm text-slate-500">
                  Manage verified companies and control access.
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
            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or email"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            {/* FILTER */}
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
              onClick={fetchApprovedCompanies}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filteredCompanies.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10">
                  <NotAvailable text="No companies found" />
                </td>
              </tr>
            )}

            {!loading &&
              filteredCompanies.map((c) => (
                <tr key={c._id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.logo}
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{c.companyName}</p>
                        <p className="text-xs text-slate-500">{c.industry}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600">{c.email}</td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/companies/${c._id}`)}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => requestBlockChange(c)}
                        className={`p-2 rounded-lg text-white transition ${
                          c.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {c.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {filteredCompanies.map((c) => (
          <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex gap-3">
              <img src={c.logo} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
              <div>
                <p className="font-medium text-slate-900">{c.companyName}</p>
                <p className="text-xs text-slate-500">{c.email}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`px-2.5 py-1 rounded-full text-xs ${
                  c.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.isActive ? "Active" : "Blocked"}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/companies/${c._id}`)}
                  className="p-2 border border-slate-200 rounded-lg"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => requestBlockChange(c)}
                  className={`p-2 rounded-lg text-white ${
                    c.isActive ? "bg-red-600" : "bg-green-600"
                  }`}
                >
                  {c.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details view uses /admin/companies/:id */}

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
              {confirmAction.isActive ? "Block company?" : "Unblock company?"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirmAction.isActive
                ? "This will prevent the company from accessing the platform."
                : "This will restore access for the company."}
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
