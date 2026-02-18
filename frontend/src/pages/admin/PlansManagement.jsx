import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

const emptyForm = {
  code: "Starter",
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

  const modeLabel = useMemo(() => (editingId ? "Update Plan" : "Create Plan"), [editingId]);

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
      if (!res.ok) throw new Error(data.message || "Action failed");
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
      const res = await fetch(`http://localhost:5000/api/admin/plans/${plan._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
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
      code: plan.code,
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Plan Management</h1>
            <p className="text-sm text-slate-500">Manage pricing, limits and add-on seat charges.</p>
          </div>
          <button
            onClick={fetchPlans}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{modeLabel}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Code">
            <select
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              disabled={Boolean(editingId)}
            >
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Edge">Edge</option>
            </select>
          </Field>
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Display Order">
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Monthly Base">
            <input
              type="number"
              value={form.monthlyBasePrice}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, monthlyBasePrice: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Yearly Base">
            <input
              type="number"
              value={form.yearlyBasePrice}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, yearlyBasePrice: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Included Recruiter Seats">
            <input
              type="number"
              value={form.includedRecruiterSeats}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, includedRecruiterSeats: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Max Active Postings (blank=unlimited)">
            <input
              type="number"
              value={form.maxActivePostings}
              onChange={(e) => setForm((prev) => ({ ...prev, maxActivePostings: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </Field>
        <div className="flex gap-2">
          <button
            onClick={submitPlan}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
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
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Base (M/Y)</th>
              <th className="p-3 text-left">Limits</th>
              <th className="p-3 text-left">Addon (M/Y)</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-4 text-center text-slate-500" colSpan="6">
                  Loading plans...
                </td>
              </tr>
            )}
            {!loading &&
              plans.map((plan) => (
                <tr key={plan._id} className="border-t border-slate-100">
                  <td className="p-3">
                    <p className="font-medium text-slate-900">{plan.code}</p>
                    <p className="text-xs text-slate-500">{plan.name}</p>
                  </td>
                  <td className="p-3">
                    INR {plan.monthlyBasePrice} / INR {plan.yearlyBasePrice}
                  </td>
                  <td className="p-3">
                    Seats: {plan.includedRecruiterSeats} | Postings:{" "}
                    {plan.maxActivePostings === null ? "Unlimited" : plan.maxActivePostings}
                  </td>
                  <td className="p-3">
                    INR {plan.addonRecruiterSeatMonthlyPrice} / INR{" "}
                    {plan.addonRecruiterSeatYearlyPrice}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        plan.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => startEdit(plan)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(plan)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                      >
                        {plan.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm text-slate-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
