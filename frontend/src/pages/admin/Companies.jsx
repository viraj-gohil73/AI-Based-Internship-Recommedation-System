import { useEffect, useState } from "react";
import {
  Building2,
  Eye,
  Ban,
  CheckCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const statusColor = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("adminToken");

  /* ---------------- FETCH ALL COMPANIES ---------------- */
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/companies/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setCompanies(data);
      setFiltered(data);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
    let data = companies;

    if (status !== "ALL") {
      data = data.filter((c) => c.verificationStatus === status);
    }

    if (search.trim()) {
      data = data.filter(
        (c) =>
          c.companyName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [search, status, companies]);

  /* ---------------- BLOCK / UNBLOCK ---------------- */
  const toggleBlock = async (id, isBlocked) => {
    try {
      const res = await fetch(
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

      if (!res.ok) throw new Error();

      toast.success(isBlocked ? "Company unblocked" : "Company blocked");
      fetchCompanies();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Companies</h1>

        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search company..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-500">
                  No companies found
                </td>
              </tr>
            )}

            {filtered.map((c) => (
              <tr key={c._id} className="border-t hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={c.logo}
                    alt="logo"
                    className="w-9 h-9 rounded-full object-cover border"
                  />
                  <span className="font-medium">{c.companyName}</span>
                </td>

                <td>{c.email}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusColor[c.verificationStatus]
                    }`}
                  >
                    {c.verificationStatus}
                  </span>
                </td>

                <td>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-right space-x-2">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-slate-100">
                    <Eye size={14} />
                    View
                  </button>

                  <button
                    onClick={() => toggleBlock(c._id, c.isBlocked)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white ${
                      c.isBlocked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
