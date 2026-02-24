import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

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

export default function RecruiterEditInternship() {
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
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch(`http://localhost:5000/api/recruiter/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch internship");

        setForm({
          title: data.title || "",
          employment_type: data.employment_type || "",
          workmode: data.workmode || "",
          location: data.location || "",
          duration: data.duration ?? "",
          openings: data.openings ?? "",
          stipend_min: data.stipend_min ?? "",
          stipend_max: data.stipend_max ?? "",
          starting_date: toDateInput(data.starting_date),
          deadline_at: toDateInput(data.deadline_at),
          about_work: data.about_work || "",
          who_can_apply: data.who_can_apply || "",
          other_req: data.other_req || "",
          intern_status: data.intern_status || "DRAFT",
          skill_req: (data.skill_req || []).join(", "),
          perks: (data.perks || []).join(", "),
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

      const token = localStorage.getItem("recruiterToken");
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

      const res = await fetch(`http://localhost:5000/api/recruiter/internships/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update internship");

      navigate(`/recruiter/internships/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update internship");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-28 rounded-2xl bg-blue-100/70" />
          <div className="h-[520px] rounded-2xl bg-blue-100/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">Recruiter Workspace</p>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Edit Internship</h1>
              <p className="mt-1 text-sm text-blue-100">Update details and save changes.</p>
            </div>
            <Link
              to={`/recruiter/internships/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
              Back to View
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">Basic Details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Developer Intern"
                  required
                />

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

                <Input
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru / Remote"
                />
                <Input
                  label="Duration (months)"
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                />
                <Input
                  label="Openings"
                  name="openings"
                  type="number"
                  value={form.openings}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />
              </div>
            </section>

            <section className="rounded-xl border border-blue-100 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">Timeline & Compensation</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Start Date" name="starting_date" type="date" value={form.starting_date} onChange={handleChange} />
                <Input label="Apply By / Deadline" name="deadline_at" type="date" value={form.deadline_at} onChange={handleChange} />
                <Input
                  label="Stipend Min (INR)"
                  name="stipend_min"
                  type="number"
                  value={form.stipend_min}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                />
                <Input
                  label="Stipend Max (INR)"
                  name="stipend_max"
                  type="number"
                  value={form.stipend_max}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                />
              </div>
            </section>

            <section className="rounded-xl border border-blue-100 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">Descriptions</h2>
              <div className="grid grid-cols-1 gap-4">
                <TextArea
                  label="About Work"
                  name="about_work"
                  value={form.about_work}
                  onChange={handleChange}
                  placeholder="Describe responsibilities, day-to-day tasks, and expected outcomes."
                />
                <TextArea
                  label="Who Can Apply"
                  name="who_can_apply"
                  value={form.who_can_apply}
                  onChange={handleChange}
                  placeholder="Mention eligibility criteria, preferred background, and required knowledge."
                />
                <TextArea
                  label="Other Requirements"
                  name="other_req"
                  value={form.other_req}
                  onChange={handleChange}
                  placeholder="Add tools, assessments, availability requirements, or any additional notes."
                />
              </div>
            </section>

            <section className="rounded-xl border border-blue-100 p-4">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700">Skills & Perks</h2>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Skills (comma separated)"
                  name="skill_req"
                  value={form.skill_req}
                  onChange={handleChange}
                  placeholder="e.g. React, JavaScript, Tailwind CSS"
                />
                <Input
                  label="Perks (comma separated)"
                  name="perks"
                  value={form.perks}
                  onChange={handleChange}
                  placeholder="e.g. Certificate, PPO, Flexible hours"
                />
              </div>
            </section>

            <div className="flex flex-wrap justify-end gap-2 border-t border-blue-100 pt-4">
              <Link
                to={`/recruiter/internships/${id}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Select({ label, options, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <select
        {...props}
        className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        rows={5}
        {...props}
        className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
