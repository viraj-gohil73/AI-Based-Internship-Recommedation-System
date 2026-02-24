import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CreditCard,
  Eye,
  Filter,
  RefreshCcw,
  Search,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "INR 0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `INR ${new Intl.NumberFormat("en-IN").format(num)}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getRenewalDate = (sub) =>
  sub.periodEnd || sub.currentPeriodEnd || sub.trialEndsAt || sub.renewsOn;

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/subscriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load subscriptions");
      }

      const list = Array.isArray(data) ? data : data.data || [];
      setSubscriptions(list);
    } catch (error) {
      toast.error(error.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const company = (
        sub.companyName || sub.companyId?.companyName || sub.company || ""
      ).toLowerCase();
      const email = (
        sub.companyEmail ||
        sub.billingEmail ||
        sub.companyId?.email ||
        sub.email ||
        ""
      ).toLowerCase();

      const matchSearch =
        company.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const planValue = sub.planCode || sub.planCodeSnapshot || sub.plan;
      const matchPlan = planFilter === "ALL" ? true : planValue === planFilter;
      const matchStatus =
        statusFilter === "ALL" ? true : sub.status === statusFilter;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [subscriptions, search, planFilter, statusFilter]);

  const summary = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
    const trials = subscriptions.filter((s) => s.status === "TRIAL").length;
    const pastDue = subscriptions.filter((s) => s.status === "PAST_DUE").length;
    const cancelled = subscriptions.filter((s) => s.status === "CANCELLED").length;
    return { active, trials, pastDue, cancelled };
  }, [subscriptions]);

  const requestCancel = (sub) => setConfirmCancel(sub);
  const closeCancel = () => setConfirmCancel(null);

  const confirmCancelPlan = async () => {
    if (!confirmCancel) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/subscription/${confirmCancel._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      toast.success("Subscription cancelled");
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.message || "Action failed");
    } finally {
      closeCancel();
    }
  };

  const getCompanyName = (sub) =>
    sub.companyName || sub.companyId?.companyName || sub.company || "-";
  const getCompanyEmail = (sub) =>
    sub.companyEmail ||
    sub.billingEmail ||
    sub.companyId?.email ||
    sub.email ||
    "-";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Subscription Management</h1>
                <p className="text-sm text-slate-600">
                  Track billing status, renewal windows, and plan health.
                </p>
              </div>
            </div>

            <button
              onClick={fetchSubscriptions}
              className="relative z-10 inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryPill label="Active" value={summary.active} className="border border-emerald-100 bg-white/80 text-emerald-700" />
            <SummaryPill label="Trials" value={summary.trials} className="border border-blue-100 bg-white/80 text-blue-700" />
            <SummaryPill label="Past Due" value={summary.pastDue} className="border border-amber-100 bg-white/80 text-amber-700" />
            <SummaryPill label="Cancelled" value={summary.cancelled} className="border border-rose-100 bg-white/80 text-rose-700" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or email"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All plans</option>
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Edge">Edge</option>
            </select>
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Renewal</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Loading subscriptions...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">
                  No subscriptions found.
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((sub) => (
                <tr key={sub._id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{getCompanyName(sub)}</p>
                    <p className="text-xs text-slate-500">{getCompanyEmail(sub)}</p>
                  </td>
                  <td className="p-4 text-slate-700">
                    {sub.planCode || sub.planCodeSnapshot || sub.plan || "-"}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${statusBadge(sub.status)}`}>
                      {readableStatus(sub.status)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{formatDate(getRenewalDate(sub))}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setSelected(sub)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => requestCancel(sub)}
                        className="rounded-lg bg-rose-600 p-2 text-white transition hover:bg-rose-700"
                        title="Cancel plan"
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-4 md:hidden">
        {loading && <p className="rounded-xl bg-white p-4 text-center text-sm text-slate-500">Loading subscriptions...</p>}
        {!loading && filtered.length === 0 && (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-slate-500">No subscriptions found.</p>
        )}

        {!loading &&
          filtered.map((sub) => (
            <article
              key={sub._id}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{getCompanyName(sub)}</p>
                <p className="text-xs text-slate-500">{getCompanyEmail(sub)}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-xs ${statusBadge(sub.status)}`}>
                  {readableStatus(sub.status)}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {sub.planCode || sub.planCodeSnapshot || sub.plan || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp size={13} /> Renewal: {formatDate(getRenewalDate(sub))}
                </span>
                <span>{formatCurrency(sub.totalAmount || sub.amount)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(sub)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                >
                  View
                </button>
                <button
                  onClick={() => requestCancel(sub)}
                  className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white"
                >
                  Cancel
                </button>
              </div>
            </article>
          ))}
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {getCompanyName(selected)}
            </h3>
            <p className="text-sm text-slate-500">{getCompanyEmail(selected)}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><b className="text-slate-700">Plan:</b> {selected.planCode || selected.planCodeSnapshot || selected.plan || "-"}</p>
              <p><b className="text-slate-700">Cycle:</b> {selected.billingCycle || "-"}</p>
              <p><b className="text-slate-700">Seats:</b> {selected.totalRecruiterSeats || selected.seats || 0}</p>
              <p><b className="text-slate-700">Amount:</b> {formatCurrency(selected.totalAmount || selected.amount)}</p>
              <p><b className="text-slate-700">Period End:</b> {formatDate(getRenewalDate(selected))}</p>
              <p><b className="text-slate-700">Status:</b> {readableStatus(selected.status)}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeCancel}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Cancel subscription?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              This will cancel the plan for {getCompanyName(confirmCancel)}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Keep plan
              </button>
              <button
                onClick={confirmCancelPlan}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
              >
                Cancel plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryPill({ label, value, className }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${className}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function statusBadge(status) {
  if (status === "ACTIVE" || status === "Active") return "bg-green-100 text-green-700";
  if (status === "TRIAL" || status === "Trial") return "bg-blue-100 text-blue-700";
  if (status === "PAST_DUE" || status === "Past Due") return "bg-amber-100 text-amber-700";
  if (status === "EXPIRED") return "bg-orange-100 text-orange-700";
  return "bg-rose-100 text-rose-700";
}

function readableStatus(status) {
  if (!status) return "-";
  if (status === "PAST_DUE") return "Past Due";
  if (status === "ACTIVE") return "Active";
  if (status === "TRIAL") return "Trial";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "EXPIRED") return "Expired";
  return status;
}
