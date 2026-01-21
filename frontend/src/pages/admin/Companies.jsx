import { useEffect, useState } from "react";
import { Ban, CheckCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Approved Companies
      </h1>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th>Email</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={c.logo}
                    className="w-9 h-9 rounded-full"
                  />
                  {c.companyName}
                </td>

                <td>{c.email}</td>

                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() =>
                      (window.location.href =
                        `/admin/companies/${c._id}`)
                    }
                    className="px-3 py-1.5 border rounded-lg"
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    onClick={() =>
                      toggleBlock(c._id, c.isBlocked)
                    }
                    className={`px-3 py-1.5 rounded-lg text-white ${
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

            {companies.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="p-6 text-center text-slate-500"
                >
                  No approved companies
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
