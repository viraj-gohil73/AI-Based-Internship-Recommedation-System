import { useEffect, useMemo, useState } from "react";
import {
  Layers,
  PencilLine,
  Plus,
  Power,
  RefreshCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  description: "",
  monthlyBasePrice: 0,
  yearlyBasePrice: 0,
  includedRecruiterSeats: 0,
  maxActivePostings: "",
  addonRecruiterSeatMonthlyPrice: 0,
  addonRecruiterSeatYearlyPrice: 0,
  displayOrder: 0,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `INR ${new Intl.NumberFormat("en-IN").format(num)}`;
};


const getPlanTheme = (planName) => {
  const value = String(planName || "").toLowerCase();
  if (value.includes("starter")) {
    return {
      card: "from-emerald-50 via-white to-lime-50 border-emerald-200",
      chip: "bg-emerald-100 text-emerald-700",
      icon: "text-emerald-600",
    };
  }
  if (value.includes("pro")) {
    return {
      card: "from-blue-50 via-white to-indigo-50 border-blue-200",
      chip: "bg-blue-100 text-blue-700",
      icon: "text-blue-600",
    };
  }
  return {
    card: "from-fuchsia-50 via-white to-orange-50 border-fuchsia-200",
    chip: "bg-fuchsia-100 text-fuchsia-700",
    icon: "text-fuchsia-600",
  };
};

export default function PlansManagement() {
  const token = localStorage.getItem("adminToken");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch plans");
      setPlans(data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const modeLabel = useMemo(
    () => (editingId ? "Update Plan" : "Create Plan"),
    [editingId]
  );

  const summary = useMemo(() => {
    const active = plans.filter((p) => p.isActive).length;
    const inactive = plans.length - active;
    const avgMonthly =
      plans.length > 0
        ? Math.round(
            plans.reduce((sum, p) => sum + Number(p.monthlyBasePrice || 0), 0) /
              plans.length
          )
        : 0;

    return {
      total: plans.length,
      active,
      inactive,
      avgMonthly,
    };
  }, [plans]);

  const toPayload = () => ({
    ...form,
    maxActivePostings:
      form.maxActivePostings === "" ? null : Number(form.maxActivePostings),
    monthlyBasePrice: Number(form.monthlyBasePrice || 0),
    yearlyBasePrice: Number(form.yearlyBasePrice || 0),
    includedRecruiterSeats: Number(form.includedRecruiterSeats || 0),
    addonRecruiterSeatMonthlyPrice: Number(form.addonRecruiterSeatMonthlyPrice || 0),
    addonRecruiterSeatYearlyPrice: Number(form.addonRecruiterSeatYearlyPrice || 0),
    displayOrder: Number(form.displayOrder || 0),
  });

  const submitPlan = async () => {
    try {
      const payload = toPayload();
      const endpoint = editingId
        ? `http://localhost:5000/api/admin/plans/${editingId}`
        : "http://localhost:5000/api/admin/plans";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data.message || "Action failed";
        if (!editingId && res.status === 409) {
          const normalizedName = String(form.name || "").trim().toLowerCase();
          const existing = plans.find(
            (plan) => String(plan.name || "").trim().toLowerCase() === normalizedName
          );
          if (existing) {
            startEdit(existing);
            toast.error("Plan already exists. Opened in edit mode.");
            return;
          }
        }
        throw new Error(message);
      }

      toast.success(editingId ? "Plan updated" : "Plan created");
      setForm(emptyForm);
      setEditingId(null);
      fetchPlans();
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  const toggleStatus = async (plan) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/plans/${plan._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !plan.isActive }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      toast.success(plan.isActive ? "Plan disabled" : "Plan enabled");
      fetchPlans();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const startEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name || "",
      description: plan.description || "",
      monthlyBasePrice: plan.monthlyBasePrice || 0,
      yearlyBasePrice: plan.yearlyBasePrice || 0,
      includedRecruiterSeats: plan.includedRecruiterSeats || 0,
      maxActivePostings:
        plan.maxActivePostings === null ? "" : Number(plan.maxActivePostings || 0),
      addonRecruiterSeatMonthlyPrice: plan.addonRecruiterSeatMonthlyPrice || 0,
      addonRecruiterSeatYearlyPrice: plan.addonRecruiterSeatYearlyPrice || 0,
      displayOrder: plan.displayOrder || 0,
    });
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative z-10">
            <p className="inline-flex items-center rounded-full border border-blue-200 bg-white/70 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-700">
              Admin Billing
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Plan Management</h1>
            <p className="mt-1 text-sm text-slate-600">
              Configure pricing, seat limits, and posting caps for all plans.
            </p>
          </div>
          <button
            onClick={fetchPlans}
            className="relative z-10 inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard label="Total Plans" value={summary.total} />
          <SummaryCard label="Active" value={summary.active} />
          <SummaryCard label="Inactive" value={summary.inactive} />
          <SummaryCard label="Avg Monthly" value={formatCurrency(summary.avgMonthly)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{modeLabel}</h2>
          {editingId && (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <PencilLine size={12} /> Editing existing plan
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className={inputClass}
              placeholder="Public name shown in UI"
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Monthly Base">
            <input
              type="number"
              value={form.monthlyBasePrice}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, monthlyBasePrice: e.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Yearly Base">
            <input
              type="number"
              value={form.yearlyBasePrice}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, yearlyBasePrice: e.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Included Recruiter Seats">
            <input
              type="number"
              value={form.includedRecruiterSeats}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, includedRecruiterSeats: e.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Max Active Postings (leave blank for unlimited)">
            <input
              type="number"
              value={form.maxActivePostings}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxActivePostings: e.target.value }))
              }
              className={inputClass}
              placeholder="Leave blank for unlimited"
            />
          </Field>
          <Field label="Addon Seat Monthly">
            <input
              type="number"
              value={form.addonRecruiterSeatMonthlyPrice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  addonRecruiterSeatMonthlyPrice: e.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Addon Seat Yearly">
            <input
              type="number"
              value={form.addonRecruiterSeatYearlyPrice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  addonRecruiterSeatYearlyPrice: e.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-3">
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className={inputClass}
              placeholder="Short description for internal/admin context"
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={submitPlan}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            {modeLabel}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {loading && <p className="p-3 text-center text-sm text-slate-500">Loading plans...</p>}
        {!loading && plans.length === 0 && (
          <p className="p-3 text-center text-sm text-slate-500">No plans found.</p>
        )}

        {!loading && plans.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan._id}
                className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${getPlanTheme(plan.name).card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`inline-flex items-center gap-1.5 text-sm font-semibold ${getPlanTheme(plan.name).icon}`}>
                      <Layers size={15} /> {plan.name || "Plan"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{plan.description || "No description"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.isActive ? getPlanTheme(plan.name).chip : "bg-rose-100 text-rose-700"}`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[11px] text-slate-500">Monthly Base</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {formatCurrency(plan.monthlyBasePrice)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[11px] text-slate-500">Yearly Base</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {formatCurrency(plan.yearlyBasePrice)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[11px] text-slate-500">Included Seats</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {plan.includedRecruiterSeats}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[11px] text-slate-500">Max Postings</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {plan.maxActivePostings === null ? "Unlimited" : plan.maxActivePostings}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  Addon seat: {formatCurrency(plan.addonRecruiterSeatMonthlyPrice)} /{" "}
                  {formatCurrency(plan.addonRecruiterSeatYearlyPrice)}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <PencilLine size={14} /> Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Power size={14} /> {plan.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white/80 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm text-slate-700">
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
    </label>
  );
}
