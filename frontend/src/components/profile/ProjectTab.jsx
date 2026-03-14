import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Image,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers3,
  CalendarDays,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";
import StudentLoadingCard from "../common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

const EMPTY_PROJECT = {
  title: "",
  description: "",
  projectType: "",
  techStack: [],
  startDate: "",
  endDate: "",
  liveUrl: "",
  thumbnail: "",
};

const normalizeProject = (project = {}) => ({
  title: project.title || "",
  description: project.description || "",
  projectType: project.projectType || "",
  techStack: Array.isArray(project.techStack) ? project.techStack : [],
  startDate: project.startDate || "",
  endDate: project.endDate || "",
  liveUrl: project.liveUrl || "",
  thumbnail: project.thumbnail || "",
});

function normalizeUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [savingProjects, setSavingProjects] = useState(false);

  const isFormVisible = editingIndex !== null;
  const isEditMode = isFormVisible && editingIndex < projects.length;
  const editingProjectTitle = isEditMode ? projects[editingIndex]?.title : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingProjects(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Failed to load projects");
        const items = Array.isArray(data?.profile?.projects) ? data.profile.projects : [];
        setProjects(items.map((item) => normalizeProject(item)));
      })
      .catch((error) => {
        toast.error(error.message || "Failed to load projects");
      })
      .finally(() => {
        setLoadingProjects(false);
      });
  }, []);

  const saveProjectsToDb = async (nextProjects, successMessage) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login again");

    try {
      setSavingProjects(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projects: nextProjects }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to save projects");

      const apiProjects = Array.isArray(data?.profile?.projects)
        ? data.profile.projects.map((item) => normalizeProject(item))
        : nextProjects.map((item) => normalizeProject(item));

      setProjects(apiProjects);
      toast.success(successMessage);
    } finally {
      setSavingProjects(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTech = () => {
    const tech = techInput.trim();
    if (!tech) return;
    if (formData.techStack.some((item) => item.toLowerCase() === tech.toLowerCase())) return;
    setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, tech] }));
    setTechInput("");
  };

  const handleRemoveTech = (tech) => {
    setFormData((prev) => ({ ...prev, techStack: prev.techStack.filter((item) => item !== tech) }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.projectType) {
      toast.error("Project title and project type are required");
      return;
    }

    const payload = normalizeProject({
      ...formData,
      liveUrl: normalizeUrl(formData.liveUrl.trim()),
    });

    const nextProjects =
      editingIndex === projects.length
        ? [...projects, payload]
        : projects.map((item, index) => (index === editingIndex ? payload : item));

    try {
      await saveProjectsToDb(nextProjects, editingIndex === projects.length ? "Project added" : "Project updated");
      setFormData(EMPTY_PROJECT);
      setTechInput("");
      setEditingIndex(null);
    } catch (error) {
      toast.error(error.message || "Unable to save project");
    }
  };

  const handleEdit = (index) => {
    setFormData(normalizeProject(projects[index]));
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const nextProjects = projects.filter((_, i) => i !== index);
    try {
      await saveProjectsToDb(nextProjects, "Project deleted");
    } catch (error) {
      toast.error(error.message || "Unable to delete project");
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_PROJECT);
    setTechInput("");
    setEditingIndex(projects.length);
  };

  const handleCancel = () => {
    setFormData(EMPTY_PROJECT);
    setTechInput("");
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              <Sparkles size={14} />
              Portfolio Showcase
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-2">Projects</h2>
            <p className="text-sm text-slate-600 mt-1">Highlight practical work to demonstrate hands-on skills.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} className="text-blue-600" />
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-800">Your Projects</h3>
        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            disabled={loadingProjects || savingProjects}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      {loadingProjects && !isFormVisible && <StudentLoadingCard message="Loading projects..." className="sm:p-10" />}

      {!loadingProjects && projects.length === 0 && editingIndex === null && (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-white ring-4 ring-blue-100 flex items-center justify-center text-blue-600">
            <Image size={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">No projects added yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Projects help recruiters understand your practical experience and execution.
            </p>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
          <div
            className={`rounded-xl border p-4 ${
              isEditMode ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {isEditMode ? "Editing Project" : "Create New Project"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {isEditMode
                    ? `You are updating "${editingProjectTitle || "Project"}".`
                    : "Add project details to strengthen your profile."}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
                {isEditMode ? "Edit Mode" : "New Entry"}
              </span>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Layers3 size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Project Basics</h5>
            </div>

            <Input label="Project Title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />

            <Select
              label="Project Type"
              value={formData.projectType}
              options={["Academic", "Personal", "Internship", "Freelance"]}
              onChange={(val) => handleChange("projectType", val)}
            />

            <div>
              <label className="text-sm font-medium text-slate-700">Project Description</label>
              <textarea
                rows={4}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What did you build, what problems did it solve, and your key contributions?"
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Wrench size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Tech & Media</h5>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Tech Stack</label>
              <div className="flex gap-2 mt-2">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g. React"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                />
                <button
                  onClick={handleAddTech}
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.techStack.map((tech, i) => (
                  <button
                    key={`${tech}-${i}`}
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                  >
                    {tech} x
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Thumbnail URL (optional)"
              value={formData.thumbnail}
              onChange={(e) => handleChange("thumbnail", e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />

            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="preview" className="w-28 h-20 object-cover rounded-md border border-slate-200" />
            )}
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Timeline & Link</h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="month"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />

              <Input label="End Date" type="month" value={formData.endDate} onChange={(e) => handleChange("endDate", e.target.value)} />
            </div>

            <Input
              label="Live Project URL (optional)"
              value={formData.liveUrl}
              onChange={(e) => handleChange("liveUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </section>

          <div className="sticky bottom-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 rounded-xl border border-slate-200 p-3">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={savingProjects}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={savingProjects}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} /> {savingProjects ? "Saving..." : isEditMode ? "Update Project" : "Save Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length > 0 &&
        !isFormVisible &&
        projects.map((proj, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl border hover:shadow-md transition border-slate-200 hover:border-blue-300 mb-4 overflow-hidden flex flex-col sm:flex-row"
          >
            <div className="sm:w-full sm:max-w-xs h-52 sm:h-auto bg-slate-100">
              {proj.thumbnail ? (
                <img src={proj.thumbnail} alt={proj.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
              )}
            </div>

            <div className="flex-1 p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h3 className="text-md font-semibold text-slate-800">{proj.title}</h3>

                <p className="text-sm text-slate-500 mt-1">
                  {proj.projectType} - {proj.startDate}
                  {proj.endDate ? ` - ${proj.endDate}` : " - Present"}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {proj.techStack.map((tech, i) => (
                    <span key={`${tech}-${i}`} className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                      {tech}
                    </span>
                  ))}
                </div>

                {proj.liveUrl && <p className="text-xs text-slate-400 mt-3 truncate">{proj.liveUrl}</p>}
              </div>

              <div className="flex sm:flex-col justify-end gap-3">
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border rounded-lg border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer text-slate-500 hover:text-blue-600"
                    title="Open Project"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => handleEdit(index)}
                  disabled={savingProjects}
                  className="p-2 border rounded-lg border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer text-slate-500 hover:text-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  disabled={savingProjects}
                  className="p-2 border rounded-lg border-slate-200 hover:border-red-500 hover:bg-red-50 cursor-pointer text-slate-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}


