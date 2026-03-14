import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";
import StudentLoadingCard from "../common/StudentLoadingCard";

const API_BASE_URL = "http://localhost:5000";

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
  const [educations, setEducations] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_EDU);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch education data");

        const educationData = Array.isArray(data?.profile?.educations) ? data.profile.educations : [];
        setEducations(educationData);
      })
      .catch((error) => {
        toast.error(error.message || "Unable to load education details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const isFormVisible = educations.length === 0 || editingIndex !== null;
  const isEditMode = isFormVisible && editingIndex !== null && editingIndex < educations.length;
  const editingInstitute = isEditMode ? educations[editingIndex]?.instituteName : "";

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const persistEducations = async (nextEducations, successMessage) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return false;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ educations: nextEducations }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to save education details");
      }

      setEducations(nextEducations);
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to save education details");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.instituteName.trim()) {
      toast.error("Institute name is required");
      return;
    }

    const isNewEducation = editingIndex === null || editingIndex === educations.length;

    const nextEducations =
      isNewEducation
        ? [...educations, formData]
        : educations.map((education, index) => (index === editingIndex ? formData : education));

    const saved = await persistEducations(nextEducations, isNewEducation ? "Education added" : "Education updated");
    if (!saved) return;

    setFormData(EMPTY_EDU);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setFormData(educations[index]);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const nextEducations = educations.filter((_, i) => i !== index);
    await persistEducations(nextEducations, "Education deleted");
  };

  const moveEducation = async (fromIndex, toIndex) => {
    if (isSaving) return;
    if (fromIndex === toIndex) return;
    if (toIndex < 0 || toIndex >= educations.length) return;

    const nextEducations = [...educations];
    const [moved] = nextEducations.splice(fromIndex, 1);
    nextEducations.splice(toIndex, 0, moved);
    await persistEducations(nextEducations, "Education sequence updated");
  };

  const handleDragStart = (index) => {
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleDrop = async (targetIndex) => {
    if (draggingIndex === null) return;
    await moveEducation(draggingIndex, targetIndex);
    setDraggingIndex(null);
  };

  const handleAddNew = () => {
    setFormData(EMPTY_EDU);
    setEditingIndex(educations.length);
  };

  const handleCancel = () => {
    setFormData(EMPTY_EDU);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              <Sparkles size={14} />
              Academic Profile
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-2">Education</h2>
            <p className="text-sm text-slate-600 mt-1">Present your academic journey clearly for recruiters.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} className="text-blue-600" />
            {educations.length} record{educations.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-800">Your Education</h3>
        {!isLoading && !isFormVisible && (
          <button
            onClick={handleAddNew}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm"
          >
            <Plus size={16} /> Add Education
          </button>
        )}
      </div>

      {isLoading && <StudentLoadingCard message="Loading education details..." className="p-5" />}

      {!isLoading && isFormVisible && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
          <div
            className={`rounded-xl border p-4 ${
              isEditMode ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {isEditMode ? "Editing Education" : "Add Education"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {isEditMode
                    ? `Updating details for "${editingInstitute || "Education"}".`
                    : "Fill in your academic details to strengthen your profile."}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
                {isEditMode ? "Edit Mode" : "New Entry"}
              </span>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Institute Details</h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institute / College Name"
                value={formData.instituteName}
                onChange={(e) => handleChange("instituteName", e.target.value)}
              />

              <Input
                label="Board / University"
                value={formData.boardOrUniversity}
                onChange={(e) => handleChange("boardOrUniversity", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Course Details</h5>
            </div>

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
                onChange={(val) => handleChange("degreeType", val)}
              />

              <Input
                label="Course Name"
                value={formData.fieldOfStudy}
                onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Percentage or CGPA"
                value={formData.gradeType}
                options={["Percentage", "CGPA"]}
                onChange={(val) => handleChange("gradeType", val)}
              />
              <Input
                label={formData.gradeType === "Percentage" ? "Percentage" : "CGPA / Score"}
                placeholder={formData.gradeType === "Percentage" ? "Eg. 82.5" : "Eg. 8.4"}
                value={formData.gradeValue}
                onChange={(e) => handleChange("gradeValue", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Timeline & Status</h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Start Year"
                type="number"
                min="1900"
                max="2100"
                value={formData.startYear}
                onChange={(e) => handleChange("startYear", e.target.value)}
              />
              <Input
                label="End Year"
                type="number"
                min="1900"
                max="2100"
                value={formData.endYear}
                onChange={(e) => handleChange("endYear", e.target.value)}
              />
              <Select
                label="Status"
                value={formData.status}
                options={["pursuing", "completed"]}
                onChange={(val) => handleChange("status", val)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList size={15} className="text-blue-600" />
              <h5 className="text-sm font-semibold text-slate-800">Additional Information</h5>
            </div>

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={4}
                placeholder="Add achievements, projects, key subjects, or relevant highlights..."
                className="mt-1 w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </section>

          <div className="sticky bottom-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 rounded-xl border border-slate-200 p-3">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} /> {isSaving ? "Saving..." : isEditMode ? "Update Education" : "Save Education"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading &&
        !isFormVisible &&
        educations.map((edu, index) => (
          <div
            key={index}
            draggable={!isSaving}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(index)}
            className={`group bg-white rounded-2xl border p-5 sm:p-6 mb-4 hover:shadow-md transition flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${
              draggingIndex === index ? "border-blue-400 bg-blue-50/40" : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                <GripVertical size={14} />
                Drag to reorder
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">{edu.instituteName}</h3>

              <p className="text-sm text-slate-500">
                {edu.degreeType}
                {edu.fieldOfStudy && ` - ${edu.fieldOfStudy}`}
              </p>

              <p className="text-sm text-slate-500">
                {edu.startYear} - {edu.endYear} - {edu.status}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {edu.gradeValue && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                    {(edu.gradeType || "Score")}: {edu.gradeValue}
                  </span>
                )}
                {edu.courseType && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                    {edu.courseType}
                  </span>
                )}
                {edu.location && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                    {edu.location}
                  </span>
                )}
              </div>

              {edu.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{edu.description}</p>}
            </div>

            <div className="flex sm:flex-col gap-3 self-end sm:self-start">
              <button
                onClick={() => moveEducation(index, index - 1)}
                disabled={isSaving || index === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer text-slate-600 hover:text-blue-600 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowUp size={16} />
                Up
              </button>

              <button
                onClick={() => moveEducation(index, index + 1)}
                disabled={isSaving || index === educations.length - 1}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer text-slate-600 hover:text-blue-600 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowDown size={16} />
                Down
              </button>

              <button
                onClick={() => handleEdit(index)}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer text-slate-600 hover:text-blue-600 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() => handleDelete(index)}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500 cursor-pointer text-red-600 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}



