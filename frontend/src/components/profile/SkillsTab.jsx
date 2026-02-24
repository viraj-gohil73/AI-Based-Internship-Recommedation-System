import { useEffect, useState } from "react";
import { Plus, X, Save, CodeXml, Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

export default function SkillsTab() {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const suggestions = [
    "Objectivity",
    "Verification and Validation (V&V)",
    "Financial Services Industry Knowledge",
    "Audience Segmentation",
    "Language Learning Tools",
    "Google Search Console",
    "Business Ethics",
    "Self-Discipline",
    "Angular",
    "Adobe InDesign",
  ];

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) return;
    setSkills([...skills, value]);
    setSkillInput("");
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Failed to load skills");
        const nextSkills = Array.isArray(data?.profile?.skills)
          ? data.profile.skills.filter((skill) => typeof skill === "string")
          : [];
        setSkills(nextSkills);
      })
      .catch((error) => {
        toast.error(error.message || "Unable to load skills");
      });
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to save skills");
      }

      const savedSkills = Array.isArray(data?.profile?.skills)
        ? data.profile.skills.filter((skill) => typeof skill === "string")
        : skills;

      setSkills(savedSkills);
      toast.success("Skills saved");
    } catch (error) {
      toast.error(error.message || "Failed to save skills");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-blue-200 text-blue-600 flex items-center justify-center">
              <CodeXml size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
              <p className="text-sm text-slate-600 mt-1">Showcase your strongest capabilities for better recruiter matching.</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} className="text-blue-600" />
            {skills.length} skill{skills.length !== 1 ? "s" : ""} added
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Add a new skill</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, Data Analysis, Figma"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />

            <button
              onClick={addSkill}
              className="px-6 py-3 rounded-xl bg-white text-blue-700 border border-blue-300 text-sm font-medium hover:bg-blue-50 transition"
            >
              <Plus size={16} className="inline-block mr-1" />
              Add Skill
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition ${
                isSaving ? "bg-blue-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              } text-white`}
            >
              <Save size={18} className="inline-block mr-1 mt-[2px]" />
              {isSaving ? "Saving..." : "Save Skills"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Your Skills</p>

          <div className="flex flex-wrap gap-2 min-h-[52px]">
            {skills.length === 0 && (
              <p className="text-sm text-slate-400">No skills added yet. Add skills to showcase your expertise.</p>
            )}

            {skills.map((skill, index) => (
              <SkillChip key={index} label={skill} onRemove={() => removeSkill(index)} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-blue-600" />
          <p className="text-sm font-medium text-slate-700">Suggested Skills</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((suggestion) => !skills.some((skill) => skill.toLowerCase() === suggestion.toLowerCase()))
            .map((skill, index) => (
              <SuggestionChip key={index} label={skill} onAdd={() => setSkills([...skills, skill])} />
            ))}
        </div>
      </section>
    </div>
  );
}

function SkillChip({ label, onRemove }) {
  return (
    <span className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
      {label}
      <button onClick={onRemove} className="text-blue-400 hover:text-red-500 transition cursor-pointer">
        <X size={14} />
      </button>
    </span>
  );
}

function SuggestionChip({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-dashed border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}
