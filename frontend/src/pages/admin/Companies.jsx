import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle, Eye, Search, X, Filter } from "lucide-react";
import toast from "react-hot-toast";
import NotAvailable from "../../components/NotAvailable.jsx";
export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Approved Companies</h1>

        <div className="flex gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or email"
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
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
              className="pl-9 pr-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th>Email</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center">
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
                <tr key={c._id} className="border-t">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={c.logo}
                      className="w-9 h-9 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{c.companyName}</p>
                      <p className="text-xs text-slate-500">{c.industry}</p>
                    </div>
                  </td>

                  <td>{c.email}</td>

                  <td>
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
                        onClick={() => setSelectedCompany(c)}
                        className="p-2 border rounded-lg"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => toggleBlock(c._id, c.isActive)}
                        className={`p-2 rounded-lg text-white ${
                          c.isActive
                            ? "bg-red-600"
                            : "bg-green-600"
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
          <div key={c._id} className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <img src={c.logo} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium">{c.companyName}</p>
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
                  onClick={() => setSelectedCompany(c)}
                  className="p-2 border rounded-lg"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => toggleBlock(c._id, c.isActive)}
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

      {/* ================= VIEW MODAL ================= */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3"
              onClick={() => setSelectedCompany(null)}
            >
              <X size={18} />
            </button>

            <div className="flex gap-3 items-center">
              <img src={selectedCompany.logo} className="w-14 h-14 rounded-full" />
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedCompany.companyName}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedCompany.industry}
                </p>
              </div>
            </div>

            <p><b>Email:</b> {selectedCompany.email}</p>
            <p><b>Status:</b> {selectedCompany.isActive ? "Active" : "Blocked"}</p>
            <p><b>City:</b> {selectedCompany.city || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
