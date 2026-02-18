import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Pencil,
  Ban,
  Search,
  Plus,
  Briefcase,
  Globe,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionState, setSubscriptionState] = useState({
    loading: true,
    entitlements: null,
    usage: null,
    status: null,
  });

  // 🔹 Fetch Real Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("recruiterToken");

        const res = await fetch(
          "http://localhost:5000/api/recruiter/internships",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setInternships(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch("http://localhost:5000/api/recruiter/subscription/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch subscription");
        }
        setSubscriptionState({
          loading: false,
          entitlements: data.entitlements || null,
          usage: data.usage || null,
          status: data.data?.status || null,
        });
      } catch (err) {
        setSubscriptionState({
          loading: false,
          entitlements: null,
          usage: null,
          status: null,
        });
      }
    };
    fetchSubscription();
  }, []);

  const maxActivePostings = subscriptionState.entitlements?.limits?.maxActivePostings;
  const activePostingsCount = subscriptionState.usage?.activePostingsCount || 0;
  const postingLimitReached =
    subscriptionState.entitlements?.accessAllowed &&
    maxActivePostings !== null &&
    maxActivePostings !== undefined &&
    activePostingsCount >= maxActivePostings;
  const canPost =
    subscriptionState.entitlements?.accessAllowed && !postingLimitReached;

  const filtered = internships.filter((i) => {
    const matchSearch = i.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus =
      status === "ALL" || i.intern_status === status;

    return matchSearch && matchStatus;
  });

  const getStatusStyle = (status) =>
    status === "ACTIVE"
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-red-100 text-red-700 border-red-300";

  const getModeIcon = (mode) => {
    switch (mode) {
      case "Remote":
        return <Globe size={14} />;
      case "Onsite":
        return <MapPin size={14} />;
      default:
        return <Briefcase size={14} />;
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading internships...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Internship Listings
            </h1>
            <p className="text-gray-600 text-sm">
              Manage and monitor your internship postings
            </p>
          </div>

          <Link
            to="/recruiter/internships/create"
            onClick={(e) => {
              if (!canPost) e.preventDefault();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-md transition ${
              canPost
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus size={18} />
            Post Internship
          </Link>
        </div>

        {!subscriptionState.loading && !canPost && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {postingLimitReached
              ? `Posting limit reached (${activePostingsCount}/${maxActivePostings}). Upgrade plan to continue.`
              : `Posting is blocked (subscription status: ${subscriptionState.status || "UNKNOWN"}).`}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-4 mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-blue-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-blue-200 rounded-lg text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Internship</th>
                  <th className="px-4 py-3 text-center">Mode</th>
                  <th className="px-4 py-3 text-center">Stipend</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onMouseEnter={() => setHoveredId(item._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`border-t ${
                          hoveredId === item._id
                            ? "bg-blue-50"
                            : "hover:bg-blue-25"
                        }`}
                      >
                        {/* Internship Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                                  <Briefcase size={16} />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.duration} Months • Deadline{" "}
                                {new Date(
                                  item.deadline_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Mode */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center items-center gap-1 text-blue-600 font-medium">
                            {getModeIcon(item.workmode)}
                            {item.workmode}
                          </div>
                        </td>

                        {/* Stipend */}
                        <td className="px-4 py-3 text-center font-medium">
                          ₹{item.stipend_min} - ₹{item.stipend_max}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                              item.intern_status
                            )}`}
                          >
                            {item.intern_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/recruiter/internships/${item._id}`}
                              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              to={`/recruiter/internships/edit/${item._id}`}
                              className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200"
                            >
                              <Pencil size={16} />
                            </Link>

                            <button
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Ban size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10">
                        No internships found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          {filtered.length > 0 && (
            <div className="px-5 py-4 bg-blue-50 border-t flex justify-between text-sm">
              <span>
                Showing <strong>{filtered.length}</strong> of{" "}
                <strong>{internships.length}</strong>
              </span>
              <span>
                Active:{" "}
                <strong>
                  {internships.filter(
                    (i) => i.intern_status === "ACTIVE"
                  ).length}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
