import { useState } from "react";
import { Plus, X, Save , CodeXml } from "lucide-react";

export default function SkillsTab() {
  // TEMP DATA (replace with backend later)
  const [skills, setSkills] = useState([
    "Education Law",
    "HTML",
    "Ruby (Programming Language)",
    "E-Discovery",
    "Facility Layout Design",
  ]);

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

  /* ================= ADD SKILL ================= */
  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.includes(value)) return;

    setSkills([...skills, value]);
    setSkillInput("");
  };

  /* ================= REMOVE SKILL ================= */
  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  /* ================= SAVE TO BACKEND ================= */
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 🔹 BACKEND CALL (example)
      // await fetch("/api/profile/skills", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ skills }),
      // });

      console.log("Saved skills:", skills);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 sm:p-7 lg:p-8 space-y-8">

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 
        flex items-center justify-center text-blue-500 text-sm">
          <CodeXml />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Skills
          </h2>
        </div>
      </div>

      {/* ================= SELECTED SKILLS ================= */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">
          Your Skills
        </p>

        <div
          className="flex flex-wrap gap-2
          border border-slate-300 rounded-lg
          p-4 min-h-[60px]"
        >
          {skills.length === 0 && (
            <p className="text-sm text-slate-400">
              No skills added yet. Add skills to showcase your expertise.
            </p>
          )}

          {skills.map((skill, index) => (
            <SkillChip
              key={index}
              label={skill}
              onRemove={() => removeSkill(index)}
            />
          ))}
        </div>
      </div>

      {/* ================= ADD SKILL INPUT ================= */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Add a new skill
        </label>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. React, Data Analysis"
            className="flex-1 px-4 py-3
            border border-slate-300 rounded-lg text-sm
            focus:ring-1 focus:ring-blue-500 outline-none "
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />

          <button
            onClick={addSkill}
            className="px-7 py-3 rounded-lg
            bg-white  text-blue-500 border-2 text-sm font-medium cursor-pointer
            hover:text-blue-700 hover:bg-blue-100 transition"
          >
            <Plus size={16} className="inline-block mr-1" />
            Add Skill
          </button>

          <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex  justify-center  gap-2 px-7 py-3 rounded-lg text-sm font-medium transition cursor-pointer
          ${
            isSaving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }
          text-white`}
        >
          <Save size={18} className="inline-block mr-1 mt-[2px]"/>
          {isSaving ? "Saving..." : "Save Skills"}
        </button>

        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <hr />

      {/* ================= SUGGESTED SKILLS ================= */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">
          Suggested Skills
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((s) => !skills.includes(s))
            .map((skill, index) => (
              <SuggestionChip
                key={index}
                label={skill}
                onAdd={() => setSkills([...skills, skill])}
              />
            ))}
        </div>
      </div>

    
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function SkillChip({ label, onRemove }) {
  return (
    <span
      className="flex items-center gap-2 px-3 py-1.5
      bg-blue-100 text-blue-700
      rounded-full text-sm font-medium"
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-500 transition cursor-pointer"
      >
        <X size={14} />
      </button>
    </span>
  );
}

function SuggestionChip({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5
      px-3 py-1.5 text-sm rounded-full
      border border-dashed border-slate-400
      text-slate-700 hover:bg-slate-100 transition"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}
