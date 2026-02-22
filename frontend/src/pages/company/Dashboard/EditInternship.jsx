import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const initialState = {
  title: "",
  employment_type: "",
  workmode: "",
  location: "",
  duration: "",
  openings: "",
  stipend_min: "",
  stipend_max: "",
  starting_date: "",
  deadline_at: "",
  about_work: "",
  who_can_apply: "",
  other_req: "",
  intern_status: "DRAFT",
  skill_req: "",
  perks: "",
};

function toDateInput(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export default function CompanyEditInternship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/company/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch internship");

        const item = data.internship || {};
        setForm({
          title: item.title || "",
          employment_type: item.employment_type || "",
          workmode: item.workmode || "",
          location: item.location || "",
          duration: item.duration ?? "",
          openings: item.openings ?? "",
          stipend_min: item.stipend_min ?? "",
          stipend_max: item.stipend_max ?? "",
          starting_date: toDateInput(item.starting_date),
          deadline_at: toDateInput(item.deadline_at),
          about_work: item.about_work || "",
          who_can_apply: item.who_can_apply || "",
          other_req: item.other_req || "",
          intern_status: item.intern_status || "DRAFT",
          skill_req: (item.skill_req || []).join(", "),
          perks: (item.perks || []).join(", "),
        });
      } catch (err) {
        setError(err.message || "Failed to fetch internship");
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      if (Number(form.stipend_min || 0) > Number(form.stipend_max || 0)) {
        setError("Stipend min cannot be greater than stipend max.");
        setSaving(false);
        return;
      }

      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        duration: form.duration === "" ? 0 : Number(form.duration),
        openings: form.openings === "" ? 0 : Number(form.openings),
        stipend_min: form.stipend_min === "" ? 0 : Number(form.stipend_min),
        stipend_max: form.stipend_max === "" ? 0 : Number(form.stipend_max),
        skill_req: form.skill_req
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        perks: form.perks
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      const res = await fetch(`http://localhost:5000/api/company/internships/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update internship");

      navigate(`/company/dashboard/internships/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update internship");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading internship...</div>;

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Internship</h1>
            <p className="text-sm text-slate-500">Update details and save changes.</p>
          </div>
          <Link
            to={`/company/dashboard/internships/${id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />

          <Select
            label="Status"
            name="intern_status"
            value={form.intern_status}
            onChange={handleChange}
            options={["ACTIVE", "CLOSED", "DRAFT"]}
          />

          <Select
            label="Employment Type"
            name="employment_type"
            value={form.employment_type}
            onChange={handleChange}
            options={["Full Time", "Part Time"]}
          />

          <Select
            label="Work Mode"
            name="workmode"
            value={form.workmode}
            onChange={handleChange}
            options={["Remote", "Onsite", "Hybrid"]}
          />

          <Input label="Location" name="location" value={form.location} onChange={handleChange} />
          <Input label="Duration (months)" name="duration" type="number" value={form.duration} onChange={handleChange} />
          <Input label="Openings" name="openings" type="number" value={form.openings} onChange={handleChange} />
          <Input label="Start Date" name="starting_date" type="date" value={form.starting_date} onChange={handleChange} />
          <Input label="Apply By / Deadline" name="deadline_at" type="date" value={form.deadline_at} onChange={handleChange} />
          <Input label="Stipend Min" name="stipend_min" type="number" value={form.stipend_min} onChange={handleChange} />
          <Input label="Stipend Max" name="stipend_max" type="number" value={form.stipend_max} onChange={handleChange} />

          <TextArea
            label="About Work"
            name="about_work"
            value={form.about_work}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <TextArea
            label="Who Can Apply"
            name="who_can_apply"
            value={form.who_can_apply}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <TextArea
            label="Other Requirements"
            name="other_req"
            value={form.other_req}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <Input
            label="Skills (comma separated)"
            name="skill_req"
            value={form.skill_req}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Perks (comma separated)"
            name="perks"
            value={form.perks}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Link
              to={`/company/dashboard/internships/${id}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Select({ label, options, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={4}
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
