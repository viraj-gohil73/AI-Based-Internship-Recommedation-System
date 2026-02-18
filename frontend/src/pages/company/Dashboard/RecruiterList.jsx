import { useEffect, useState } from "react";
import { Eye, Pencil, Ban, CheckCircle, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext"
import { useSubscription } from "../../../context/SubscriptionContext";


export default function RecruiterList() {
  const navigate = useNavigate();

  const [recruiters, setRecruiters] = useState([]);
  const [confirmRecruiter, setConfirmRecruiter] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { company } = useCompany();
  const { entitlements, usage, current } = useSubscription();
  const lockedByVerification = company?.verificationStatus !== "APPROVED";
  const lockedBySubscription = entitlements !== null && !entitlements?.accessAllowed;
  const seatLimit = current?.totalRecruiterSeats ?? 0;
  const usedSeats = usage?.recruitersCount ?? 0;
  const seatLimitReached =
    entitlements?.accessAllowed && seatLimit !== null && usedSeats >= seatLimit;
  const isLocked = lockedByVerification || lockedBySubscription;
  const filteredRecruiters = recruiters.filter((r) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      r.name?.toLowerCase().includes(query) ||
      r.email?.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && r.isactive) ||
      (statusFilter === "blocked" && !r.isactive);

    return matchesSearch && matchesStatus;
  });
  /* ---------------- FETCH FROM BACKEND ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRecruiters = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/company/recruiters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const text = await res.text();

        if (text.startsWith("<")) {
          throw new Error("API not reached. HTML returned.");
        }

        const data = JSON.parse(text);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch recruiters");
        }

        setRecruiters(data.recruiters || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  const updateStatus = async (recruiter) => {
  try {
    setUpdating(true);
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/company/recruiter/${recruiter._id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isactive: !recruiter.isactive,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update recruiter status");
    }

    // ✅ UI update after backend success
    setRecruiters((prev) =>
      prev.map((r) =>
        r._id === recruiter._id
          ? { ...r, isactive: !r.isactive }
          : r
      )
    );

    // close popup
    setConfirmRecruiter(null);
  } catch (err) {
    console.error(err);
    alert(err.message || "Server error");
  } finally {
    setUpdating(false);
  }
};

  

  /* ---------------- UI STATUS TOGGLE (TEMP) ---------------- */
  const toggleStatus = (id) => {
    setRecruiters((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, isactive: !r.isactive } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading recruiters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        {/* 🔒 STATUS MESSAGE */}
        <AnimatePresence>
          {(isLocked || seatLimitReached) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <UnderReviewAlert
                message={
                  lockedByVerification
                    ? "Your company profile is under admin review."
                    : seatLimitReached
                    ? "Recruiter seat limit reached."
                    : "Subscription access is currently locked."
                }
                subMessage={
                  lockedByVerification
                    ? "Add recruiters will be enabled after approval."
                    : seatLimitReached
                    ? `Used ${usedSeats} of ${seatLimit} seats. Upgrade plan to add more recruiters.`
                    : "Approve company and keep trial/active subscription to continue."
                }
              />
            </motion.div>
          )}
        </AnimatePresence>


        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-white border border-blue-200 rounded-lg shadow-sm p-3"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-blue-400" size={20} />
              <input
                type="text"
                placeholder="Search recruiter by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div className="relative sm:w-56">
              <SlidersHorizontal className="absolute left-3 top-3 text-blue-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border-2 border-blue-200 rounded-lg bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <motion.button
              onClick={() => navigate("/company/dashboard/recruiters/add")}
              disabled={isLocked || seatLimitReached}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-semibold shadow-md transition whitespace-nowrap"
            >
              <Plus size={20} />
              Add Recruiter
            </motion.button>
          </div>
        </motion.div>
{confirmRecruiter && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Action</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to{" "}
        <span className="font-semibold text-blue-600">
          {confirmRecruiter.isactive ? "block" : "unblock"}
        </span>{" "}
        <b>{confirmRecruiter.name}</b>?
      </p>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setConfirmRecruiter(null)}
          className="w-full border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={updating}
          onClick={() => updateStatus(confirmRecruiter)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition"
        >
          {updating ? "Updating..." : "Confirm"}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
)}

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden border border-blue-200"
      >
        <div className="overflow-x-auto">
          <table className={`w-full ${isLocked ? "opacity-60" : ""}`}>
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Recruiter</th>
                <th className="px-5 py-3 text-left font-semibold">Email</th>
                <th className="px-5 py-3 text-left font-semibold">Last Login</th>
                <th className="px-5 py-3 text-center font-semibold">Can Post</th>
                <th className="px-5 py-3 text-center font-semibold">Status</th>
                <th className="px-5 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {filteredRecruiters.length > 0 ? (
                  filteredRecruiters.map((r, index) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-t border-blue-100 hover:bg-blue-50 transition"
                    >
                      {/* Recruiter (DP + Name) */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              r.dp ||
                              `https://ui-avatars.com/api/?name=${r.name}&background=random`
                            }
                            className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
                            alt={r.name}
                          />
                          <span className="font-semibold text-gray-800">{r.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 text-gray-700">{r.email}</td>

                      {/* Last Login */}
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {r.last_login ? (
                          <>
                            <div>{new Date(r.last_login).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(r.last_login).toLocaleTimeString()}
                            </div>
                          </>
                        ) : (
                          <span className="italic text-gray-400">Never</span>
                        )}
                      </td>

                      {/* Can Post */}
                      <td className="px-5 py-3 text-center">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                            r.canpost
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {r.canpost ? "Yes" : "No"}
                        </motion.span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                            r.isactive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.isactive ? "Active" : "Blocked"}
                        </motion.span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <ActionButtons
                            r={r}
                            navigate={navigate}
                            onConfirm={() => setConfirmRecruiter(r)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <p className="text-gray-500 font-medium">No recruiters found</p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {filteredRecruiters.map((r, index) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-md border border-blue-200 p-3"
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={
                      r.dp ||
                      `https://ui-avatars.com/api/?name=${r.name}&background=random`
                    }
                    className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover"
                    alt={r.name}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.email}</p>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        r.isactive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.isactive ? "Active" : "Blocked"}
                    </motion.span>
                  </div>
                </div>

                <ActionButtons
                  r={r}
                  navigate={navigate}
                  onConfirm={() => setConfirmRecruiter(r)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

/* =========== ACTION BUTTONS =========== */
function ActionButtons({ r, navigate, onConfirm }){
  return (
    <div className="flex gap-2 flex-col sm:flex-row justify-center">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          navigate(`/company/dashboard/recruiters/${r._id}`)
        }
        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
        title="View"
      >
        <Eye size={18} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
          navigate(`/company/dashboard/recruiters/${r._id}/edit`)
        }
        className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition"
        title="Edit"
      >
        <Pencil size={18} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onConfirm}
        className={`p-2 rounded-lg transition ${
          r.isactive
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-green-100 text-green-600 hover:bg-green-200"
        }`}
        title={r.isactive ? "Block" : "Unblock"}
      >
        {r.isactive ? <Ban size={18} /> : <CheckCircle size={18} />}
      </motion.button>
    </div>
  );
}
