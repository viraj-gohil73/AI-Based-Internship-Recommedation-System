import { useState } from "react";
import { Plus, Pencil, Trash2, Save, Image } from "lucide-react";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";

const EMPTY_PROJECT = {
  title: "",
  description: "",
  projectType: "",
  techStack: [],
  startDate: "",
  endDate: "",
  liveUrl: "",
  thumbnail: null,
};

export default function ProjectsTab() {
  const [projects, setProjects] = useState([
    {
      title: "AI Internship Recommendation System",
      description:
        "AI-based platform that recommends internships based on skills, interests, and profile analysis.",
      projectType: "Academic",
      techStack: ["React", "Node.js", "MongoDB", "ML"],
      startDate: "2024-01",
      endDate: "",
      liveUrl: "",
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    },
  ]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState("");

  const isFormVisible = editingIndex !== null;

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (formData.techStack.includes(techInput)) return;

    setFormData({
      ...formData,
      techStack: [...formData.techStack, techInput],
    });
    setTechInput("");
  };

  const handleRemoveTech = (tech) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleSave = () => {
    if (editingIndex === projects.length) {
      setProjects([...projects, formData]);
    } else {
      const updated = [...projects];
      updated[editingIndex] = formData;
      setProjects(updated);
    }

    setFormData(EMPTY_PROJECT);
    setEditingIndex(null);

    // TODO: POST / PUT API
  };

  const handleEdit = (index) => {
    setFormData(projects[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
    // TODO: DELETE API
  };

  const handleAddNew = () => {
    setFormData(EMPTY_PROJECT);
    setEditingIndex(projects.length);
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Projects</h2>

        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2
            border border-blue-600 text-blue-600 rounded-lg
            hover:bg-blue-50 text-sm"
          >
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>

      {/* ================= EMPTY STATE ================= */}
{projects.length === 0 && editingIndex === null && (
  <div className="bg-white rounded-xl border border-dashed
  p-8 sm:p-10 text-center space-y-4">

    <div className="mx-auto w-14 h-14 rounded-full bg-blue-50
    flex items-center justify-center text-blue-600">
      <Image size={28} />
    </div>

    <div>
      <h3 className="text-lg font-semibold text-slate-800">
        No projects added yet
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Projects are optional, but adding them helps recruiters
        understand your practical experience and skills.
      </p>
    </div>
  </div>
)}


      {/* ================= FORM ================= */}
      {isFormVisible && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

          <Input
            label="Project Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <Select
            label="Project Type"
            value={formData.projectType}
            options={["Academic", "Personal", "Internship", "Freelance"]}
            onChange={(val) => handleChange("projectType", val)}
          />

          <textarea
            rows={3}
            placeholder="Project Description"
            className="w-full px-4 py-3 rounded-lg border border-slate-300
            focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          {/* THUMBNAIL */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Project Thumbnail
            </label>

            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2
              border rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                <Image size={16} /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleChange(
                      "thumbnail",
                      URL.createObjectURL(e.target.files[0])
                    )
                  }
                />
              </label>

              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="preview"
                  className="w-20 h-14 object-cover rounded-md border"
                />
              )}
            </div>
          </div>

          {/* TECH STACK */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Tech Stack
            </label>

            <div className="flex gap-2 mt-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleAddTech}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-100
                  text-blue-700 text-sm cursor-pointer"
                  onClick={() => handleRemoveTech(tech)}
                >
                  {tech} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="month"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />

            <Input
              label="End Date"
              type="month"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>

          <Input
            label="Live Project URL (optional)"
            value={formData.liveUrl}
            onChange={(e) => handleChange("liveUrl", e.target.value)}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingIndex(null)}
              className="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2
              bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Save size={16} /> Save Project
            </button>
          </div>
        </div>
      )}

      {/* ================= CARD VIEW ================= */}
      {projects.length > 0 && !isFormVisible &&
        projects.map((proj, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border
            hover:shadow-md transition border-slate-200  mb-4
            overflow-hidden flex flex-col sm:flex-row"
          >
            {/* THUMBNAIL */}
            <div className="sm:w-full sm:max-w-65 h-50 sm:h-auto bg-slate-100">
              {proj.thumbnail ? (
                <img
                  src={proj.thumbnail}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center
                justify-center text-slate-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h3 className=" text-md font-semibold text-slate-800">
                  {proj.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {proj.projectType} • {proj.startDate}
                  {proj.endDate && ` – ${proj.endDate}`}
                  {!proj.endDate && " – Present"}
                  
                </p>

            

                <div className="flex flex-wrap gap-2 mt-3">
                  {proj.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs rounded-full
                      bg-slate-100 text-slate-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                  {proj.liveUrl ? (

                    
          
                <div className="mt-3 text-sm text-slate-600">
                  {/* project url button */}
                  <button
                    onClick={() => {
                      if (proj.liveUrl) {
                        window.open(proj.liveUrl, "_blank");
                      }
                    }}
                    className={`text-sm px-3 py-1 rounded-md cursor-pointer mt-2
                    ${proj.liveUrl ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  >
                    {proj.liveUrl ? "View Project" : "No Live URL"}
                  </button>
              </div>) : null}
</div>
              {/* ACTIONS */}
              <div className="flex sm:flex-col justify-end gap-3">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 border rounded-lg hover:bg-blue-50 cursor-pointer text-blue-500"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 border rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
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
