// EditProfile.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Plus,
  X,
  Upload,
  ArrowLeft,
  Check,
  Trash2,
} from "lucide-react";

/**
 * Full single-file Edit Profile page.
 * - Tailwind CSS utility classes expected
 * - Framer Motion for animations
 * - Medium-sized UI, professional gradient colors
 *
 * NOTE: sampleResumeUrl uses an uploaded local file path (your uploaded file).
 * Replace with your API/url when integrating to backend.
 */
export default function EditProfile() {
  const [activeTab, setActiveTab] = useState("basic");

  // Education state
  const [education, setEducation] = useState([
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of California",
      startYear: "2022",
      endYear: "2026",
      gpa: "3.8",
    },
  ]);

  const addEducation = () =>
    setEducation([
      ...education,
      { degree: "", school: "", startYear: "", endYear: "", gpa: "" },
    ]);

  const removeEducation = (index) =>
    setEducation((prev) => prev.filter((_, i) => i !== index));

  const updateEducation = (i, field, value) => {
    const updated = [...education];
    updated[i][field] = value;
    setEducation(updated);
  };

  // Skills
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([
    "React",
    "TypeScript",
    "Node.js",
    "Python",
  ]);
  const recommended = ["GraphQL", "Docker", "AWS", "MongoDB"];

  const addSkillFromInput = (value) => {
    const s = value?.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((p) => [...p, s]);
  };

  const addSkill = () => {
    addSkillFromInput(skillInput);
    setSkillInput("");
  };

  const toggleAddRecommended = (skill) => {
    if (skills.includes(skill)) {
      setSkills((p) => p.filter((s) => s !== skill));
    } else {
      setSkills((p) => [...p, skill]);
    }
  };

  const removeSkill = (skill) => setSkills((p) => p.filter((s) => s !== skill));

  // Social
  const sampleResumeUrl =
    "/mnt/data/da22bf33-67c5-47d8-9e1c-655209219993.png"; // uploaded file path (used as sample)

  const [social, setSocial] = useState({
    linkedin: "https://linkedin.com/in/sarahjohnson",
    github: "https://github.com/sarahjohnson",
    portfolio: "https://sarahjohnson.dev",
    twitter: "@sarahjohnson",
    resume: sampleResumeUrl,
  });

  const handleSocialChange = (field, value) =>
    setSocial((p) => ({ ...p, [field]: value }));

  // small helper for animated section wrapper
  const Section = ({ children, keyProp }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>
          <span className="ml-2 text-sm text-gray-500">
            Update your details to improve visibility
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-md text-sm border hover:bg-gray-50">
            Cancel
          </button>

          <button className="px-4 py-2 rounded-md text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md hover:shadow-lg flex items-center gap-2">
            <Check size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">
        {/* Animated Tabs (medium size) */}
        <div className="w-full border-b border-gray-100 pb-3 mb-6">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {[
              { id: "basic", label: "Basic Info" },
              { id: "education", label: "Education" },
              { id: "skills", label: "Skills" },
              { id: "social", label: "Social Links" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-2 text-sm font-medium transition-all focus:outline-none ${
                  activeTab === tab.id
                    ? "text-purple-700"
                    : "text-gray-500 hover:text-purple-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full bottom-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div>
          {/* BASIC */}
          {activeTab === "basic" && (
            <Section keyProp="basic">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Avatar */}
                <div className="w-full md:w-1/4 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                      SJ
                    </div>

                    <label className="absolute -bottom-1 -right-1 bg-white border rounded-full p-2 cursor-pointer shadow transition hover:scale-105">
                      <Camera size={16} className="text-purple-600" />
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <p className="mt-3 text-sm text-gray-500">Click to change profile photo</p>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-3/4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="First name" defaultValue="Sarah" />
                    <FormInput label="Last name" defaultValue="Johnson" />
                    <FormInput label="Email" defaultValue="sarahj@university.edu" type="email" />
                    <FormInput label="Phone" defaultValue="+1 (555) 123-4567" />
                    <FormInput label="Location" defaultValue="San Francisco, CA" />
                    <FormInput label="Gender" defaultValue="Female" />
                    <FormInput label="Date of Birth" type="date" defaultValue="2003-05-15" />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">About / Bio</label>
                    <textarea
                      rows={4}
                      className="input-box mt-2 text-sm"
                      defaultValue="Passionate computer science student with a focus on full-stack development and AI. Love building innovative solutions and always eager to learn new technologies."
                    />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <Section keyProp="education">
              <div className="flex flex-col gap-4">
                {education.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.995 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.995 }}
                    transition={{ duration: 0.12 }}
                    className="relative bg-gray-50 border rounded-xl p-5 shadow-sm"
                  >
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(i)}
                        className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-50 transition text-red-500"
                        title="Remove education"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-semibold text-gray-800">Education {i + 1}</h3>
                      <span className="text-xs text-gray-500">Optional fields ok</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <LabeledInput
                        label="Degree"
                        value={item.degree}
                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                      />
                      <LabeledInput
                        label="School / University"
                        value={item.school}
                        onChange={(e) => updateEducation(i, "school", e.target.value)}
                      />
                      <LabeledInput
                        label="Start Year"
                        value={item.startYear}
                        onChange={(e) => updateEducation(i, "startYear", e.target.value)}
                      />
                      <LabeledInput
                        label="End Year"
                        value={item.endYear}
                        onChange={(e) => updateEducation(i, "endYear", e.target.value)}
                      />
                      <LabeledInput
                        label="GPA (Optional)"
                        value={item.gpa}
                        onChange={(e) => updateEducation(i, "gpa", e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addEducation}
                  className="w-full border-dashed border-2 border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition text-sm"
                >
                  <Plus size={14} /> Add education
                </button>
              </div>
            </Section>
          )}

          {/* SKILLS */}
          {activeTab === "skills" && (
            <Section keyProp="skills">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Add skill</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      className="input-box flex-1 text-sm"
                      placeholder="e.g. JavaScript, UI/UX, Node.js"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addSkill();
                        }
                      }}
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm shadow"
                      title="Add skill"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">Press Enter or click + to add</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-sm shadow-sm"
                      >
                        <span className="text-sm text-purple-700">{s}</span>
                        <button onClick={() => removeSkill(s)} className="p-1 rounded-full hover:bg-gray-100">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                  <p className="text-sm text-gray-600 mb-3">In-demand skills you can add quickly.</p>

                  <div className="flex flex-wrap gap-2">
                    {recommended.map((r) => (
                      <button
                        key={r}
                        onClick={() => toggleAddRecommended(r)}
                        className={`px-3 py-1 border rounded-lg text-sm transition ${
                          skills.includes(r)
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "bg-white hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {skills.includes(r) ? <span>✓ {r}</span> : <span>+ {r}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* SOCIAL */}
          {activeTab === "social" && (
            <Section keyProp="social">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="LinkedIn"
                  defaultValue={social.linkedin}
                  onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                />
                <FormInput
                  label="GitHub"
                  defaultValue={social.github}
                  onChange={(e) => handleSocialChange("github", e.target.value)}
                />
                <FormInput
                  label="Portfolio"
                  defaultValue={social.portfolio}
                  onChange={(e) => handleSocialChange("portfolio", e.target.value)}
                />
                <FormInput
                  label="Twitter / X"
                  defaultValue={social.twitter}
                  onChange={(e) => handleSocialChange("twitter", e.target.value)}
                />

                <div className="md:col-span-2 grid grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    className="input-box col-span-2 text-sm"
                    value={social.resume}
                    onChange={(e) => handleSocialChange("resume", e.target.value)}
                  />
                  <button className="flex items-center gap-2 justify-center border rounded-md px-3 py-2 hover:bg-gray-50">
                    <Upload size={16} /> Upload
                  </button>
                </div>

                <div className="md:col-span-2 bg-green-50 border border-green-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800">Profile visibility</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Adding social links & a resume increases recruiter trust and match rate.
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={social.resume || sampleResumeUrl}
                      alt="resume-sample"
                      className="w-20 h-14 object-cover rounded-md border"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">Resume</div>
                      <div className="text-xs text-gray-500">Uploaded sample file</div>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Shared input styles */}
      <style>{`
        .input-box {
          width: 100%;
          margin-top: 6px;
          padding: 10px 12px;
          border-radius: 10px;
          background-color: #fbfbfd;
          border: 1px solid #e9e9f0;
          outline: none;
          transition: box-shadow .15s, border-color .15s, transform .08s;
        }
        .input-box:focus {
          border-color: rgba(124, 58, 237, 0.9);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.08);
          background-color: #fff;
          transform: translateY(-1px);
        }
        /* hide scrollbar for tab strip on webkit */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* Small helper components */

function FormInput({ label, type = "text", defaultValue = "", onChange }) {
  return (
    <div className="mb-2">
      <label className="text-sm text-gray-700 font-medium">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        onChange={onChange}
        className="input-box mt-2 text-sm"
      />
    </div>
  );
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="input-box mt-2 text-sm"
      />
    </div>
  );
}
