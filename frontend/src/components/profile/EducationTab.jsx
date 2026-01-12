import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";

const EMPTY_EDU = {
  instituteName: "",
  boardOrUniversity: "",
  degreeType: "",
  fieldOfStudy: "",
  specialization: "",
  startYear: "",
  endYear: "",
  status: "pursuing",
  courseType: "",
  gradeType: "",
  gradeValue: "",
  location: "",
  description: "",
};

export default function EducationTab() {
  const [educations, setEducations] = useState([
  {
    instituteName: "Silver Oak University",
    boardOrUniversity: "GTU",
    degreeType: "Bachelor's Degree",
    fieldOfStudy: "Computer Engineering",
    specialization: "Web Development",
    startYear: "2021",
    endYear: "2025",
    status: "pursuing",
    courseType: "Full-time",
    gradeType: "CGPA",
    gradeValue: "8.4",
    location: "Ahmedabad, Gujarat",
    description:
      "Focused on Data Structures, Web Technologies, and Software Engineering.",
  },
  {
    instituteName: "Shree Narayana Higher Secondary School",
    boardOrUniversity: "GSEB",
    degreeType: "Higher Secondary (12th)",
    fieldOfStudy: "Science (PCM)",
    specialization: "",
    startYear: "2019",
    endYear: "2021",
    status: "completed",
    courseType: "Full-time",
    gradeType: "Percentage",
    gradeValue: "82%",
    location: "Ahmedabad, Gujarat",
    description:
      "Completed higher secondary education with Physics, Chemistry, and Mathematics.",
  },
]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EDU);

  /* ================= FETCH FROM BACKEND ================= */
  useEffect(() => {
    // Example:
  //  fetch("/api/educations")
  //     .then(res => res.json())
  //     .then(data => setEducations(data));

    // TEMP DEMO
    //setEducations([]);
  }, []);

  const isFormVisible =
    educations.length === 0 || editingIndex !== null;

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (editingIndex === educations.length) {
      // ADD
      setEducations([...educations, formData]);
    } else {
      // UPDATE
      const updated = [...educations];
      updated[editingIndex] = formData;
      setEducations(updated);
    }

    setFormData(EMPTY_EDU);
    setEditingIndex(null);

    // TODO: POST / PUT API CALL
  };

  const handleEdit = (index) => {
    setFormData(educations[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
    // TODO: DELETE API CALL
  };

  const handleAddNew = () => {
    setFormData(EMPTY_EDU);
    setEditingIndex(educations.length);
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Education</h2>

        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2
            border border-blue-600 text-blue-600 rounded-lg
            hover:bg-blue-50 text-sm"
          >
            <Plus size={16} /> Add Education
          </button>
        )}
      </div>

      {/* ================= FORM ================= */}
      {isFormVisible && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

          <Input
            label="Institute / College Name"
            value={formData.instituteName}
            onChange={(e) =>
              handleChange("instituteName", e.target.value)
            }
          />

          <Input
            label="Board / University"
            value={formData.boardOrUniversity}
            onChange={(e) =>
              handleChange("boardOrUniversity", e.target.value)
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Degree Type"
              value={formData.degreeType}
              options={[
                "Secondary (10th)",
                "Higher Secondary (12th)",
                "Diploma",
                "Bachelor's Degree",
                "Master's Degree",
                "Doctorate (PhD)",
              ]}
              onChange={(val) =>
                handleChange("degreeType", val)
              }
            />

            <Input
              label="Course Name"
              value={formData.fieldOfStudy}
              onChange={(e) =>
                handleChange("fieldOfStudy", e.target.value)
              }
            />
          </div>

          <Input
            label="Specialization"
            value={formData.specialization}
            onChange={(e) =>
              handleChange("specialization", e.target.value)
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Year"
              type="number"
              value={formData.startYear}
              onChange={(e) =>
                handleChange("startYear", e.target.value)
              }
            />
            <Input
              label="End Year"
              type="number"
              value={formData.endYear}
              onChange={(e) =>
                handleChange("endYear", e.target.value)
              }
            />
            <Select
              label="Status"
              value={formData.status}
              options={["pursuing", "completed"]}
              onChange={(val) =>
                handleChange("status", val)
              }
            />
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) =>
              handleChange("location", e.target.value)
            }
          />

          <textarea
            rows={3}
            placeholder="Additional Information"
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
              <Save size={16} /> Save Education
            </button>
          </div>
        </div>
      )}

      {/* ================= CARD VIEW ================= */}
      {!isFormVisible &&
  educations.map((edu, index) => (
    <div
      key={index}
      className="bg-white rounded-2xl border-2 border-slate-200
      p-5 sm:p-6 mb-4
      hover:shadow-md hover:border-blue-500 transition 
      flex flex-col sm:flex-row
      sm:items-start sm:justify-between gap-4"
    >
      {/* LEFT CONTENT */}
      <div className="space-y-2">
        {/* Institute */}
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          {edu.instituteName}
        </h3>

        {/* Degree + Duration */}
        <p className="text-sm text-slate-500">
          {edu.degreeType}
          {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
        </p>

        <p className="text-sm text-slate-500">
          {edu.startYear} – {edu.endYear} • {edu.status}
        </p>

        {/* META INFO */}
        <div className="flex flex-wrap gap-2 mt-2">
          {edu.gradeValue && (
            <span className="px-2.5 py-1 text-xs rounded-full
            bg-blue-50 text-blue-600 font-medium">
              {edu.gradeType}: {edu.gradeValue}
            </span>
          )}

          {edu.courseType && (
            <span className="px-2.5 py-1 text-xs rounded-full
            bg-slate-100 text-slate-600">
              {edu.courseType}
            </span>
          )}

          {edu.location && (
            <span className="px-2.5 py-1 text-xs rounded-full
            bg-slate-100 text-slate-600">
              {edu.location}
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        {edu.description && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {edu.description}
          </p>
        )}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex sm:flex-col gap-3 self-end sm:self-start">
        <button
          onClick={() => handleEdit(index)}
          className="p-2 rounded-lg
          border
          border-blue-500 cursor-pointer
        text-blue-600
          transition"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => handleDelete(index)}
          className="p-2 rounded-lg
          border border-red-500
         cursor-pointer
          text-red-600
          transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  ))}

    </div>
  );
}
