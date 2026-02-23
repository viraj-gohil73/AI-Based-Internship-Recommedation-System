import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle,
  Eye,
  Search,
  Filter,
  Building2,
  RefreshCcw,
  Inbox,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import NotAvailable from "../../components/NotAvailable.jsx";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [profileLoadingId, setProfileLoadingId] = useState(null);

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

  const openCompanyProfile = async (company) => {
    setSelectedCompany(company);
    try {
      setProfileLoadingId(company._id);
      const res = await fetch(`http://localhost:5000/api/admin/company/${company._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result?.success) {
        setSelectedCompany(result.data || company);
      }
    } catch {
      // Keep popup open with existing list data.
    } finally {
      setProfileLoadingId(null);
    }
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ================= HEADER ================= */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Companies
                </h1>
                <p className="text-sm text-slate-600">
                  Manage verified companies and control access.
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
	                <td colSpan="4" className="p-10 text-center text-slate-500">
	                  Loading companies...
	                </td>
	              </tr>
	            )}

	            {!loading && filteredCompanies.length === 0 && (
	              <tr>
	                <td colSpan="4" className="p-10">
	                  <div className="flex flex-col items-center gap-2 text-slate-500">
	                    <Inbox size={18} />
	                    <NotAvailable text="No companies found" />
	                  </div>
	                </td>
	              </tr>
	            )}

            {!loading &&
              filteredCompanies.map((c) => (
                <tr key={c._id} className="border-t border-slate-200 hover:bg-slate-50">
	                  <td className="p-4">
	                    <div className="flex items-center gap-3">
	                      {c.logo ? (
	                        <img
	                          src={c.logo}
	                          alt={c.companyName || "company"}
	                          className="w-9 h-9 rounded-full border border-slate-200 object-cover"
	                        />
	                      ) : (
	                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-600">
	                          {(c.companyName || "CO").slice(0, 2).toUpperCase()}
	                        </div>
	                      )}
	                      <div>
	                        <p className="font-medium text-slate-900">{c.companyName}</p>
	                        <p className="text-xs text-slate-500">{c.industry || "Not specified"}</p>
	                      </div>
	                    </div>
	                  </td>

                  <td className="p-4 text-slate-600">{c.email}</td>

                  <td className="p-4">
	                    <span
	                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
	                        c.isActive
	                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
	                          : "bg-rose-50 text-rose-700 border-rose-200"
	                      }`}
	                    >
	                      {c.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openCompanyProfile(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-medium"
                        disabled={profileLoadingId === c._id}
                      >
                        <Eye size={15} />
                        {profileLoadingId === c._id ? "Loading..." : "View Profile"}
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
	        {loading && (
	          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
	            Loading companies...
	          </div>
	        )}

	        {!loading && filteredCompanies.length === 0 && (
	          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8">
	            <div className="flex flex-col items-center gap-2 text-slate-500">
	              <Inbox size={18} />
	              <NotAvailable text="No companies found" />
	            </div>
	          </div>
	        )}

	        {!loading && filteredCompanies.map((c) => (
	          <div key={c._id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
	            <div className="flex gap-3">
	              {c.logo ? (
	                <img
	                  src={c.logo}
	                  alt={c.companyName || "company"}
	                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
	                />
	              ) : (
	                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
	                  {(c.companyName || "CO").slice(0, 2).toUpperCase()}
	                </div>
	              )}
	              <div>
	                <p className="font-medium text-slate-900">{c.companyName}</p>
	                <p className="text-xs text-slate-500">{c.email}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
	              <span
	                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
	                  c.isActive
	                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
	                    : "bg-rose-50 text-rose-700 border-rose-200"
	                }`}
	              >
                {c.isActive ? "Active" : "Blocked"}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => openCompanyProfile(c)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 border border-slate-200 rounded-lg text-xs"
                  disabled={profileLoadingId === c._id}
                >
                  <Eye size={16} />
                  {profileLoadingId === c._id ? "..." : "View"}
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

      {/* Company profile popup */}

      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-700 px-6 py-5 text-white">
              <div className="absolute right-0 top-0 h-full w-36 bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedCompany.logo ? (
                    <img
                      src={selectedCompany.logo}
                      className="h-14 w-14 rounded-full border border-white/30 object-cover ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold text-white ring-4 ring-white/10">
                      {(selectedCompany.companyName || "CO").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedCompany.companyName || selectedCompany.email || "Company"}
                    </h3>
                    <p className="text-sm text-white/80">
                      {selectedCompany.industry || "Industry not specified"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-1 ${
                          selectedCompany.isActive || selectedCompany.isactive
                            ? "bg-emerald-400/20 text-emerald-100"
                            : "bg-rose-400/20 text-rose-100"
                        }`}
                      >
                        {(selectedCompany.isActive || selectedCompany.isactive)
                          ? "Active"
                          : "Blocked"}
                      </span>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-white/90">
                        Status: {selectedCompany.verificationStatus || "DRAFT"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
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
                    <span className="truncate">{selectedCompany.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {selectedCompany.mobile || "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-slate-400" />
                    {selectedCompany.website || "-"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    {selectedCompany.city || "-"}, {selectedCompany.state || "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" />
                    {selectedCompany.companySize || "-"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {selectedCompany.createdAt
                      ? new Date(selectedCompany.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
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
