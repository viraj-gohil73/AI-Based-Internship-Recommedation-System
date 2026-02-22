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
  CircleAlert,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [subscriptionState, setSubscriptionState] = useState({
    loading: true,
    entitlements: null,
    usage: null,
    status: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("recruiterToken");

        const res = await fetch("http://localhost:5000/api/recruiter/internships", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setInternships(Array.isArray(data) ? data : []);
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
  const canPost = subscriptionState.entitlements?.accessAllowed && !postingLimitReached;

  const isInternshipExpired = (internship) => {
    if (!internship?.deadline_at) return false;
    const deadline = new Date(internship.deadline_at);
    if (Number.isNaN(deadline.getTime())) return false;
    return deadline < new Date();
  };

  const getEffectiveStatus = (internship) => {
    if (internship?.intern_status === "ACTIVE" && isInternshipExpired(internship)) return "EXPIRED";
    return internship?.intern_status || "-";
  };

  const activeCount = internships.filter((i) => getEffectiveStatus(i) === "ACTIVE").length;
  const closedCount = internships.filter((i) => getEffectiveStatus(i) === "CLOSED").length;
  const draftCount = internships.filter((i) => getEffectiveStatus(i) === "DRAFT").length;
  const expiredCount = internships.filter((i) => getEffectiveStatus(i) === "EXPIRED").length;

  const filtered = internships.filter((i) => {
    const matchSearch = (i.title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "ALL" || getEffectiveStatus(i) === status;

    return matchSearch && matchStatus;
  });

  const getStatusStyle = (value) =>
    value === "ACTIVE"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : value === "CLOSED"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : value === "EXPIRED"
      ? "bg-slate-200 text-slate-700 border-slate-300"
      : "bg-amber-100 text-amber-700 border-amber-200";

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

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "-";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  const updateInternshipStatus = async (internship) => {
    const nextStatus = internship.intern_status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    if (nextStatus === "ACTIVE" && isInternshipExpired(internship)) {
      alert("This internship deadline has passed. It cannot be re-activated.");
      return;
    }

    const confirmText =
      nextStatus === "CLOSED"
        ? "Close this internship? Students will no longer be able to apply."
        : "Re-activate this internship?";

    if (!window.confirm(confirmText)) return;

    try {
      setActionLoadingId(internship._id);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(`http://localhost:5000/api/recruiter/internships/${internship._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intern_status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update internship status");

      setInternships((prev) =>
        prev.map((item) =>
          item._id === internship._id ? { ...item, intern_status: data?.data?.intern_status || nextStatus } : item
        )
      );
    } catch (error) {
      alert(error.message || "Failed to update internship status");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-2xl bg-white/80" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Recruiter Workspace</p>
              <h1 className="text-3xl font-bold text-slate-900">Internship Listings</h1>
              <p className="mt-1 text-sm text-slate-600">Manage postings, review status, and track listing activity.</p>
            </div>

            <Link
              to="/recruiter/internships/create"
              onClick={(e) => {
                if (!canPost) e.preventDefault();
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                canPost ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Plus size={18} />
              Post Internship
            </Link>
          </div>
        </motion.div>

        {!subscriptionState.loading && !canPost && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {postingLimitReached
              ? `Posting limit reached (${activePostingsCount}/${maxActivePostings}). Upgrade plan to continue.`
              : `Posting is blocked (subscription status: ${subscriptionState.status || "UNKNOWN"}).`}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Total</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900">{internships.length}</p>
              <Layers className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">Active</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-emerald-900">{activeCount}</p>
              <CheckCircle2 className="text-emerald-700" size={20} />
            </div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-700">Closed</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-rose-900">{closedCount}</p>
              <XCircle className="text-rose-700" size={20} />
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Draft</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-amber-900">{draftCount}</p>
              <CircleAlert className="text-amber-700" size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by internship title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="EXPIRED">Expired</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Internship</th>
                  <th className="px-4 py-3 text-left font-semibold">Important Details</th>
                  <th className="px-4 py-3 text-center font-semibold">Mode</th>
                  <th className="px-4 py-3 text-center font-semibold">Stipend</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => {
                      const effectiveStatus = getEffectiveStatus(item);
                      return (
                        <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700">
                                  <Briefcase size={16} />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">{item.title || "Untitled Internship"}</p>
                              <p className="text-xs text-slate-500">Posted: {formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1 text-xs text-slate-600">
                            <p>
                              <span className="font-semibold text-slate-700">Location:</span> {item.location || "-"}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Openings:</span> {item.openings ?? 0}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Type:</span> {item.employment_type || "-"}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">Deadline:</span> {formatDate(item.deadline_at)}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                            {getModeIcon(item.workmode)}
                            {item.workmode || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center font-medium text-slate-700">
                          {formatMoney(item.stipend_min)} - {formatMoney(item.stipend_max)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              effectiveStatus
                            )}`}
                          >
                            {effectiveStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/recruiter/internships/${item._id}`}
                              className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                              title="View"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              to={`/recruiter/internships/edit/${item._id}`}
                              className="rounded-lg bg-indigo-100 p-2 text-indigo-700 hover:bg-indigo-200"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </Link>

                            <button
                              onClick={() => updateInternshipStatus(item)}
                              disabled={
                                actionLoadingId === item._id ||
                                (item.intern_status !== "ACTIVE" && isInternshipExpired(item))
                              }
                              className="rounded-lg bg-rose-100 p-2 text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                              title={
                                item.intern_status !== "ACTIVE" && isInternshipExpired(item)
                                  ? "Deadline passed - cannot activate"
                                  : item.intern_status === "ACTIVE"
                                  ? "Close"
                                  : "Activate"
                              }
                            >
                              <Ban size={16} />
                            </button>
                          </div>
                        </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-14">
                        <div className="mx-auto max-w-sm text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <Briefcase size={18} />
                          </div>
                          <p className="text-sm font-semibold text-slate-800">No internships found</p>
                          <p className="mt-1 text-xs text-slate-500">Try another filter or create a new internship posting.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">
              <span>
                Showing <strong>{filtered.length}</strong> of <strong>{internships.length}</strong>
              </span>
              <span>
                Active listings: <strong>{activeCount}</strong>
              </span>
              <span>
                Expired listings: <strong>{expiredCount}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
