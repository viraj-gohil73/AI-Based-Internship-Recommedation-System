import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarRange,
  FileText,
  IndianRupee,
  MapPin,
  Save,
  Sparkles,
  Users2,
} from "lucide-react";

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

  const perksCount = useMemo(
    () => form.perks.split(",").map((item) => item.trim()).filter(Boolean).length,
    [form.perks]
  );
  const skillsCount = useMemo(
    () => form.skill_req.split(",").map((item) => item.trim()).filter(Boolean).length,
    [form.skill_req]
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-24 rounded-3xl bg-slate-200" />
          <div className="h-[420px] rounded-3xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,_#e0f2fe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#eff6ff,_transparent_48%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles size={13} />
                Internship Editor
              </p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">Edit Internship</h1>
              <p className="mt-1 text-sm text-slate-600">
                Refine role details, timeline, and requirements before publishing updates.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MetaPill label="Skills" value={skillsCount} />
                <MetaPill label="Perks" value={perksCount} />
                <MetaPill label="Status" value={form.intern_status || "DRAFT"} />
              </div>
            </div>

            <Link
              to={`/company/dashboard/internships/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to View
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <SectionCard
            icon={Briefcase}
            title="Role Basics"
            subtitle="Define the internship identity and how candidates will experience it."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Development Intern"
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
            </div>
          </SectionCard>

          <SectionCard
            icon={MapPin}
            title="Location & Capacity"
            subtitle="Clarify where the role happens and how many interns you can onboard."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, State"
                className="md:col-span-2"
              />
              <Input
                label="Openings"
                name="openings"
                type="number"
                min="0"
                value={form.openings}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={CalendarRange}
            title="Timeline"
            subtitle="Set internship duration and critical dates for candidates."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Duration (months)"
                name="duration"
                type="number"
                min="0"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 3"
              />
              <Input
                label="Start Date"
                name="starting_date"
                type="date"
                value={form.starting_date}
                onChange={handleChange}
              />
              <Input
                label="Apply By / Deadline"
                name="deadline_at"
                type="date"
                value={form.deadline_at}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={IndianRupee}
            title="Compensation"
            subtitle="Keep stipend range clear to improve applicant quality and intent."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Stipend Min"
                name="stipend_min"
                type="number"
                min="0"
                value={form.stipend_min}
                onChange={handleChange}
                placeholder="e.g. 10000"
              />
              <Input
                label="Stipend Max"
                name="stipend_max"
                type="number"
                min="0"
                value={form.stipend_max}
                onChange={handleChange}
                placeholder="e.g. 20000"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={FileText}
            title="Description & Eligibility"
            subtitle="Describe responsibilities and candidate fit in a scannable way."
          >
            <div className="grid grid-cols-1 gap-4">
              <TextArea
                label="About Work"
                name="about_work"
                value={form.about_work}
                onChange={handleChange}
                placeholder="What will the intern do week-to-week?"
              />
              <TextArea
                label="Who Can Apply"
                name="who_can_apply"
                value={form.who_can_apply}
                onChange={handleChange}
                placeholder="Eligibility, preferred profiles, and academic requirements"
              />
              <TextArea
                label="Other Requirements"
                name="other_req"
                value={form.other_req}
                onChange={handleChange}
                placeholder="Tools, portfolio links, communication expectations, etc."
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Users2}
            title="Skills & Perks"
            subtitle="Use comma-separated values to keep both lists clean and searchable."
          >
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Skills"
                name="skill_req"
                value={form.skill_req}
                onChange={handleChange}
                placeholder="React, TypeScript, Git"
                helperText="Separate each skill with a comma."
              />
              <Input
                label="Perks"
                name="perks"
                value={form.perks}
                onChange={handleChange}
                placeholder="Certificate, PPO opportunity, Flexible timing"
                helperText="Separate each perk with a comma."
              />
            </div>
          </SectionCard>

          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to={`/company/dashboard/internships/${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetaPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      <span className="text-blue-600">{label}</span>
      <span className="rounded-full bg-white px-1.5 py-0.5 font-semibold text-slate-700">{value}</span>
    </span>
  );
}

function Input({ label, helperText, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

function Select({ label, options, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={4}
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}
