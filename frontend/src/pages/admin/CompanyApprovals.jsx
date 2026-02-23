import { useEffect, useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Building2,
  Clock,
  Inbox,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ================= STATUS STYLES ================= */
const statusStyle = {
  SUBMITTED: "bg-amber-50 text-amber-700 border border-amber-200",
  RESUBMISSION: "bg-blue-50 text-blue-700 border border-blue-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmittedCompanies();
  }, []);

  /* ================= FETCH ================= */
  const fetchSubmittedCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/admin/companies/approvals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (!result.success) {
        toast.error("Failed to load approvals");
        return;
      }

      setCompanies(result.data);
    } catch {
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTION ================= */
  const updateStatus = async (id, action) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/company/${id}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message || "Action failed");
        return;
      }

      toast.success(result.message);

      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ================= HEADER ================= */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Company Approval Requests
              </h1>
              <p className="text-sm text-slate-600">
                Review submissions and take quick decisions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            <Clock className="h-4 w-4" />
            Pending: {companies.length}
          </div>
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading &&
              companies.map((c) => (
              <tr
                key={c._id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt="logo"
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">
                        {c.companyName?.slice(0, 2)?.toUpperCase() || "CO"}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {c.companyName}
                      </p>
                      <p className="text-xs text-slate-500">{c.industry || "Not specified"}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-600">{c.email}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[c.verificationStatus]}`}
                  >
                    {c.verificationStatus}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <ActionBtn
                      icon={<Eye size={14} />}
                      label="View"
                      onClick={() => navigate(`/admin/companies/${c._id}`)}
                    />
                    <ActionBtn
                      icon={<CheckCircle size={14} />}
                      label="Approve"
                      color="green"
                      onClick={() => updateStatus(c._id, "APPROVED")}
                    />
                    <ActionBtn
                      icon={<RotateCcw size={14} />}
                      label="Re-submit"
                      color="blue"
                      onClick={() => updateStatus(c._id, "RESUBMISSION")}
                    />
                    <ActionBtn
                      icon={<XCircle size={14} />}
                      label="Reject"
                      color="red"
                      onClick={() => updateStatus(c._id, "REJECTED")}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-500">
                  Loading approval requests...
                </td>
              </tr>
            )}

            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Inbox className="h-5 w-5" />
                    <p>No pending approvals</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {!loading &&
          companies.map((c) => (
          <div
            key={c._id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {c.logo ? (
                <img
                  src={c.logo}
                  alt="logo"
                  className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center">
                  {c.companyName?.slice(0, 2)?.toUpperCase() || "CO"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {c.companyName}
                </p>
                <p className="text-xs text-slate-500">{c.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/admin/companies/${c._id}`)}
                className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium"
              >
                <Eye size={16} />
                View Details
              </button>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[c.verificationStatus]}`}
              >
                {c.verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <MobileBtn
                label="Approve"
                color="green"
                onClick={() => updateStatus(c._id, "APPROVED")}
              />
              <MobileBtn
                label="Re-Submit"
                color="blue"
                onClick={() => updateStatus(c._id, "RESUBMISSION")}
              />
              <MobileBtn
                label="Reject"
                color="red"
                onClick={() => updateStatus(c._id, "REJECTED")}
              />
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-slate-500 py-8">
            Loading approval requests...
          </div>
        )}

        {!loading && companies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-10 px-4">
            <div className="text-center text-slate-500 flex flex-col items-center gap-2">
              <Inbox className="h-5 w-5" />
              No pending approvals
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function ActionBtn({ icon, label, onClick, color }) {
  const map = {
    green: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-rose-600 hover:bg-rose-700",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 cursor-pointer px-3 py-2 rounded-lg text-xs font-medium transition ${
        color
          ? `text-white ${map[color]}`
          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileBtn({ label, onClick, color }) {
  const map = {
    green: "bg-emerald-600",
    blue: "bg-blue-600",
    red: "bg-rose-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white ${map[color]}`}
    >
      {label}
    </button>
  );
}
