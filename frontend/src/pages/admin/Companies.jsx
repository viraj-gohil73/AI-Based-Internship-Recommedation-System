import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle, Eye, Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchApprovedCompanies();
  }, []);

  const fetchApprovedCompanies = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/companies/approved",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCompanies(data);
    } catch {
      toast.error("Failed to load companies");
    }
  };

  /* ---------------- BLOCK / UNBLOCK ---------------- */
  const toggleBlock = async (id, isBlocked) => {
    try {
      await fetch(
        `http://localhost:5000/api/admin/company/${id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isBlocked: !isBlocked }),
        }
      );

      toast.success(
        isBlocked ? "Company unblocked" : "Company blocked"
      );
      fetchApprovedCompanies();
    } catch {
      toast.error("Action failed");
    }
  };

  /* ---------------- SEARCH + FILTER ---------------- */
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.companyName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "BLOCKED"
          ? c.isBlocked
          : !c.isBlocked;

      return matchSearch && matchFilter;
    });
  }, [companies, search, filter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Approved Companies
        </h1>

        {/* SEARCH */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search company or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        {["ALL", "ACTIVE", "BLOCKED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm border ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th>Email</th>
              <th>Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCompanies.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={c.logo}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {c.companyName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.industry}
                    </p>
                  </div>
                </td>

                <td>{c.email}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      c.isBlocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>

                <td className="p-4 text-right space-x-2">
                  {/* VIEW QUICK INFO */}
                  <button
                    onClick={() => setSelectedCompany(c)}
                    className="px-3 py-1.5 border rounded-lg inline-flex items-center gap-1"
                  >
                    <Eye size={14} /> View
                  </button>

                  {/* BLOCK / UNBLOCK */}
                  <button
                    onClick={() =>
                      toggleBlock(c._id, c.isBlocked)
                    }
                    className={`px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1 ${
                      c.isBlocked
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {c.isBlocked ? (
                      <>
                        <CheckCircle size={14} /> Unblock
                      </>
                    ) : (
                      <>
                        <Ban size={14} /> Block
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {filteredCompanies.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-slate-500"
                >
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedCompany.logo}
                className="w-14 h-14 rounded-full"
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedCompany.companyName}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedCompany.industry}
                </p>
              </div>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <strong>Email:</strong>{" "}
                {selectedCompany.email}
              </p>
              <p>
                <strong>City:</strong>{" "}
                {selectedCompany.city}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedCompany.isBlocked
                  ? "Blocked"
                  : "Active"}
              </p>
            </div>

            <button
              onClick={() =>
                (window.location.href =
                  `/admin/companies/${selectedCompany._id}`)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Open Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
