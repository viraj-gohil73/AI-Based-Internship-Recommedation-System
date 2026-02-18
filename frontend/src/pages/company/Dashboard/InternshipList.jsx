import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Briefcase,
  CircleCheck,
  CircleOff,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  title: "",
  recruiter: "",
  mode: "Remote",
  location: "Remote",
  stipend: "",
  status: "Active",
};

const INITIAL_INTERNSHIPS = [
  {
    id: "INT-101",
    title: "Frontend Developer Intern",
    recruiter: "Amit Sharma",
    mode: "Remote",
    location: "Remote",
    stipend: "8,000 - 12,000",
    status: "Active",
    applications: 48,
    postedOn: "2026-01-15",
  },
  {
    id: "INT-102",
    title: "Backend Developer Intern",
    recruiter: "Neha Patel",
    mode: "Onsite",
    location: "Ahmedabad",
    stipend: "10,000",
    status: "Closed",
    applications: 26,
    postedOn: "2026-01-04",
  },
  {
    id: "INT-103",
    title: "UI/UX Intern",
    recruiter: "Rahul Verma",
    mode: "Hybrid",
    location: "Bengaluru",
    stipend: "12,000 - 15,000",
    status: "Active",
    applications: 64,
    postedOn: "2026-02-02",
  },
  {
    id: "INT-104",
    title: "Data Analyst Intern",
    recruiter: "Sneha Desai",
    mode: "Remote",
    location: "Remote",
    stipend: "9,000 - 11,000",
    status: "Draft",
    applications: 0,
    postedOn: "2026-02-10",
  },
];

export default function InternshipList() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [internships, setInternships] = useState(INITIAL_INTERNSHIPS);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredInternships = useMemo(() => {
    const q = query.trim().toLowerCase();

    return internships.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.recruiter.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter;

      const matchesMode = modeFilter === "all" || item.mode.toLowerCase() === modeFilter;

      return matchesQuery && matchesStatus && matchesMode;
    });
  }, [internships, modeFilter, query, statusFilter]);

  const stats = useMemo(() => {
    const active = internships.filter((item) => item.status === "Active").length;
    const closed = internships.filter((item) => item.status === "Closed").length;
    const applications = internships.reduce((sum, item) => sum + item.applications, 0);

    return {
      total: internships.length,
      active,
      closed,
      applications,
    };
  }, [internships]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      recruiter: item.recruiter,
      mode: item.mode,
      location: item.location,
      stipend: item.stipend,
      status: item.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.recruiter.trim() || !form.location.trim()) return;

    if (editingId) {
      setInternships((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      setInternships((prev) => [
        {
          id: `INT-${Math.floor(Math.random() * 900 + 100)}`,
          ...form,
          applications: 0,
          postedOn: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }

    closeForm();
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Delete this internship?");
    if (!ok) return;

    setInternships((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Internship Listings</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                Manage, edit, and monitor all internship postings.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 px-4 py-2.5 font-semibold hover:bg-blue-50 transition"
            >
              <Plus size={18} /> Add Internship
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Listings" value={stats.total} icon={Briefcase} />
          <StatCard label="Active Jobs" value={stats.active} icon={CircleCheck} />
          <StatCard label="Closed Jobs" value={stats.closed} icon={CircleOff} secondary={`Applications: ${stats.applications}`} />
        </section>

        <section className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or recruiter"
                className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="all">All Modes</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Showing {filteredInternships.length} of {internships.length} internships
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Internship</th>
                <th className="px-4 py-3 text-left">Recruiter</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Applications</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInternships.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Posted: {new Date(item.postedOn).toLocaleDateString()} | Stipend: Rs. {item.stipend}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.recruiter}</td>
                  <td className="px-4 py-3 text-slate-700">{item.mode}</td>
                  <td className="px-4 py-3 text-slate-700">{item.location}</td>
                  <td className="px-4 py-3 text-slate-700">{item.applications}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "Draft"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/company/dashboard/internships/${item.id}`)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInternships.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                    No internships found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingId ? "Edit Internship" : "Add Internship"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField label="Title" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
              <TextField label="Recruiter" value={form.recruiter} onChange={(value) => setForm((prev) => ({ ...prev, recruiter: value }))} />
              <TextField label="Location" value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} />
              <TextField label="Stipend" value={form.stipend} onChange={(value) => setForm((prev) => ({ ...prev, stipend: value }))} />

              <SelectField
                label="Mode"
                value={form.mode}
                options={["Remote", "Onsite", "Hybrid"]}
                onChange={(value) => setForm((prev) => ({ ...prev, mode: value }))}
              />
              <SelectField
                label="Status"
                value={form.status}
                options={["Active", "Draft", "Closed"]}
                onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700"
              >
                {editingId ? "Save Changes" : "Create Internship"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, secondary }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {secondary && <p className="text-xs text-slate-500 mt-1">{secondary}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
