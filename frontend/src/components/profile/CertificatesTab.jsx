import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Trophy } from "lucide-react";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";

const EMPTY_CERT = {
  name: "",
  organization: "",
  certificateType: "",      // NEW
  techStack: [],            // NEW
  issueDate: "",
  expiryDate: "",
  hasExpiry: false,
  status: "active",         // NEW
  credentialId: "",
  credentialUrl: "",
  certificateFile: null,    // NEW (image / pdf)
  description: "",
};


export default function CertificatesTab() {
  const [certificates, setCertificates] = useState([
  {
    name: "AWS Cloud Practitioner",
    organization: "Amazon Web Services",
    certificateType: "Professional",
    techStack: ["AWS", "EC2", "S3", "IAM", "Cloud Fundamentals"],
    issueDate: "2023-05-10",
    expiryDate: "2026-05-10",
    hasExpiry: true,
    status: "active",
    credentialId: "AWS-CP-12345",
    credentialUrl: "https://aws.amazon.com",
    certificateFile: null, // backend / upload ready
    description:
      "Learned AWS core services, cloud architecture basics, IAM, storage, and pricing models.",
  },
  {
    name: "Frontend Development",
    organization: "Coursera",
    certificateType: "Course Completion",
    techStack: ["HTML", "CSS", "JavaScript", "React"],
    issueDate: "2022-09-01",
    expiryDate: "",
    hasExpiry: false,
    status: "completed",
    credentialId: "",
    credentialUrl: "https://coursera.org",
    certificateFile: null,
    description:
      "Completed frontend fundamentals including responsive UI, React basics, and modern JavaScript.",
  },
]);

const [techInput, setTechInput] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CERT);

  const isFormVisible = editingIndex !== null;

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (editingIndex === certificates.length) {
      // ADD
      setCertificates([...certificates, formData]);
    } else {
      // UPDATE
      const updated = [...certificates];
      updated[editingIndex] = formData;
      setCertificates(updated);
    }

    setFormData(EMPTY_CERT);
    setEditingIndex(null);

    // TODO: POST / PUT API CALL
  };

  const handleEdit = (index) => {
    setFormData(certificates[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setCertificates(certificates.filter((_, i) => i !== index));
    // TODO: DELETE API CALL
  };

  const handleAddNew = () => {
    setFormData(EMPTY_CERT);
    setEditingIndex(certificates.length);
  };
  const addTech = () => {
  if (!techInput.trim()) return;
  if (formData.techStack.includes(techInput)) return;

  handleChange("techStack", [...formData.techStack, techInput]);
  setTechInput("");
};

const removeTech = (index) => {
  handleChange(
    "techStack",
    formData.techStack.filter((_, i) => i !== index)
  );
};


  /* ================= UI ================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Certificates</h2>

        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2
            border border-blue-600 text-blue-600 rounded-lg
            hover:bg-blue-50 text-sm"
          >
            <Plus size={16} /> Add Certificate
          </button>
        )}
      </div>

      {/* ================= EMPTY STATE ================= */}
{certificates.length === 0 && editingIndex === null && (
  <div
    className="bg-white rounded-xl border border-dashed
    p-8 sm:p-10 text-center space-y-4"
  >
    <div
      className="mx-auto w-14 h-14 rounded-full bg-indigo-50
      flex items-center justify-center text-indigo-600"
    >
      <Trophy size={24} />
    </div>

    <div>
      <h3 className="text-lg font-semibold text-slate-800">
        No certificates added yet
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Certificates are optional, but they help recruiters verify
        your skills, achievements, and learning credibility.
      </p>
    </div>

  </div>
)}



      {/* ================= FORM ================= */}
      {isFormVisible && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

          <Input
            label="Certificate Name"
            value={formData.name}
            onChange={(e) =>
              handleChange("name", e.target.value)
            }
          />

          <Input
            label="Issuing Organization"
            value={formData.organization}
            onChange={(e) =>
              handleChange("organization", e.target.value)
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                handleChange("issueDate", e.target.value)
              }
            />

            <Input
              label="Expiry Date"
              type="date"
              disabled={!formData.hasExpiry}
              value={formData.expiryDate}
              onChange={(e) =>
                handleChange("expiryDate", e.target.value)
              }
            />

            {/* TOGGLE */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  handleChange("hasExpiry", !formData.hasExpiry)
                }
                className={`px-4 py-2 rounded-full text-sm border transition
                ${
                  formData.hasExpiry
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300"
                }`}
              >
                Has Expiry
              </button>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Credential ID (optional)"
              value={formData.credentialId}
              onChange={(e) =>
                handleChange("credentialId", e.target.value)
              }
            />

            <Input
              label="Credential URL (optional)"
              placeholder="https://"
              value={formData.credentialUrl}
              onChange={(e) =>
                handleChange("credentialUrl", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Certificate Type"
                value={formData.certificateType}
                options={[
                  "Professional",
                  "Course Completion",
                  "Internship",
                  "Workshop",
                  "Bootcamp",
                  "Competition",
                ]}
                onChange={(val) =>
                  handleChange("certificateType", val)
                }
              />

              <Select
                label="Status"
                value={formData.status}
                options={[
                  "active",
                  "expired",
                  "completed",
                  "revoked",
                ]}
                onChange={(val) =>
                  handleChange("status", val)
                }
              />
            </div>

            <div>
  <label className="text-sm font-medium text-slate-700">
    Tech Stack / Skills
  </label>

  <div className="flex flex-wrap gap-2 border rounded-lg p-3 mt-1">
    {formData.techStack.map((tech, index) => (
      <span
        key={index}
        className="flex items-center gap-2 px-3 py-1
        bg-blue-100 text-blue-700 rounded-full text-sm"
      >
        {tech}
        <button onClick={() => removeTech(index)}>×</button>
      </span>
    ))}

    <input
      value={techInput}
      onChange={(e) => setTechInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && addTech()}
      placeholder="Add tech & press Enter"
      className="outline-none text-sm flex-1"
    />
  </div>
</div>

<div>
  <label className="text-sm font-medium text-slate-700">
    Certificate Image / PDF
  </label>

  <input
    type="file"
    accept="image/*,.pdf"
    onChange={(e) =>
      handleChange("certificateFile", e.target.files[0])
    }
    className="mt-2 block w-full text-sm
    file:mr-4 file:py-2 file:px-4
    file:rounded-lg file:border-0
    file:bg-blue-50 file:text-blue-600
    hover:file:bg-blue-100"
  />
</div>

          <textarea
            rows={3}
            placeholder="Description (what you learned, skills gained)"
            className="w-full px-4 py-3 rounded-lg border border-slate-300
            focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
          />

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
              <Save size={16} /> Save Certificate
            </button>
          </div>




        </div>
        
      )}

      {/* ================= CARD VIEW ================= */}
      {!isFormVisible &&
        certificates.map((cert, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border-2 border-slate-200
            p-5 sm:p-6 mb-4
            hover:shadow-md hover:border-blue-500 transition
            flex flex-col sm:flex-row
            sm:items-start sm:justify-between gap-4"
          >
            {/* LEFT */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                {cert.name}
              </h3>

              <p className="text-sm text-slate-500">
                {cert.organization}
              </p>

              <p className="text-sm text-slate-500">
                Issued: {cert.issueDate}
                {cert.hasExpiry && ` • Expires: ${cert.expiryDate}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
  {cert.techStack.map((tech, i) => (
    <span
      key={i}
      className="px-2 py-1 text-xs rounded-full
      bg-indigo-50 text-indigo-600"
    >
      {tech}
    </span>
  ))}
</div>


              <div className="flex flex-wrap gap-2 mt-2">
                {cert.credentialId && (
                  <span className="px-2.5 py-1 text-xs rounded-full
                  bg-blue-50 text-blue-600 font-medium">
                    ID: {cert.credentialId}
                  </span>
                )}

              </div>

              
            </div>

            {/* ACTIONS */}
            <div className="flex sm:flex-col gap-3 self-end sm:self-start">
              <button
                onClick={() => handleEdit(index)}
                className="p-2 rounded-lg
                border 
                border-blue-500 cursor-pointer
           text-blue-600 transition"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => handleDelete(index)}
                className="p-2 rounded-lg
                border 
                border-red-500 cursor-pointer
            text-red-600 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
