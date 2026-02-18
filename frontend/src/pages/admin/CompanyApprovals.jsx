import { useEffect, useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Building2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ================= STATUS STYLES ================= */
const statusStyle = {
  SUBMITTED: "bg-amber-100 text-amber-700",
  RESUBMISSION: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function CompanyApprovals() {
  const [companies, setCompanies] = useState([]);
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmittedCompanies();
  }, []);

  /* ================= FETCH ================= */
  const fetchSubmittedCompanies = async () => {
    try {
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
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Company Approval Requests
            </h1>
            <p className="text-sm text-slate-500">
              Review, approve, or request changes from companies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
          <Clock className="h-4 w-4" />
          Pending: {companies.length}
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
            {companies.map((c) => (
              <tr
                key={c._id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.logo}
                      alt="logo"
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {c.companyName}
                      </p>
                      <p className="text-xs text-slate-500">{c.industry}</p>
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

            {companies.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-500">
                  No pending approvals
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid gap-4 md:hidden">
        {companies.map((c) => (
          <div
            key={c._id}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={c.logo}
                alt="logo"
                className="w-11 h-11 rounded-full border border-slate-200 object-cover"
              />
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

        {companies.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            No pending approvals
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function ActionBtn({ icon, label, onClick, color }) {
  const map = {
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 cursor-pointer px-3 py-2 rounded-lg text-xs transition ${
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
    green: "bg-green-600",
    blue: "bg-blue-600",
    red: "bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-white ${map[color]}`}
    >
      {label}
    </button>
  );
}
