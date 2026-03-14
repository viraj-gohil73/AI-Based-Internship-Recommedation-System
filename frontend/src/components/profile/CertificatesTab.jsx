import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Trophy, Sparkles, CheckCircle2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../profile/shared/Input";
import Select from "../profile/shared/Select";
import StudentLoadingCard from "../common/StudentLoadingCard";

const EMPTY_CERT = {
  name: "",
  organization: "",
  certificateType: "",
  techStack: [],
  issueDate: "",
  expiryDate: "",
  hasExpiry: false,
  status: "active",
  credentialId: "",
  credentialUrl: "",
  certificateFile: "",
  certificateFileName: "",
  description: "",
};

const API_BASE_URL = "http://localhost:5000";

const normalizeCertificate = (cert = {}) => ({
  name: cert.name || "",
  organization: cert.organization || "",
  certificateType: cert.certificateType || "",
  techStack: Array.isArray(cert.techStack) ? cert.techStack : [],
  issueDate: cert.issueDate || "",
  expiryDate: cert.expiryDate || "",
  hasExpiry: Boolean(cert.hasExpiry),
  status: cert.status || "active",
  credentialId: cert.credentialId || "",
  credentialUrl: cert.credentialUrl || "",
  certificateFile: cert.certificateFile || "",
  certificateFileName: cert.certificateFileName || "",
  description: cert.description || "",
});

export default function CertificatesTab() {
  const [certificates, setCertificates] = useState([]);

  const [techInput, setTechInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CERT);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [savingCertificates, setSavingCertificates] = useState(false);

  const isFormVisible = editingIndex !== null;
  const isEditMode = editingIndex !== null && editingIndex < certificates.length;
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    expired: "bg-rose-50 text-rose-700 border-rose-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    revoked: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const openCertificate = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveCertificatesToDb = async (nextCertificates, successMessage) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please login again");
    }

    try {
      setSavingCertificates(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ certificates: nextCertificates }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to save certificates");
      }

      const normalizedFromApi = Array.isArray(data?.profile?.certificates)
        ? data.profile.certificates.map((cert) => normalizeCertificate(cert))
        : nextCertificates.map((cert) => normalizeCertificate(cert));

      setCertificates(normalizedFromApi);
      toast.success(successMessage);
    } finally {
      setSavingCertificates(false);
    }
  };

  const handleSave = async () => {
    if (certificateUploading) {
      toast.error("Please wait for certificate upload to finish");
      return;
    }

    if (!formData.name.trim() || !formData.organization.trim()) {
      toast.error("Certificate name and organization are required");
      return;
    }

    const nextCertificates =
      editingIndex === certificates.length
        ? [...certificates, normalizeCertificate(formData)]
        : certificates.map((cert, index) => (index === editingIndex ? normalizeCertificate(formData) : cert));

    try {
      await saveCertificatesToDb(
        nextCertificates,
        editingIndex === certificates.length ? "Certificate added" : "Certificate updated"
      );
      setFormData(EMPTY_CERT);
      setTechInput("");
      setEditingIndex(null);
    } catch (error) {
      toast.error(error.message || "Unable to save certificate");
    }
  };

  const handleEdit = (index) => {
    setFormData(normalizeCertificate(certificates[index]));
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    const nextCertificates = certificates.filter((_, i) => i !== index);

    try {
      await saveCertificatesToDb(nextCertificates, "Certificate removed");
    } catch (error) {
      toast.error(error.message || "Unable to delete certificate");
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_CERT);
    setTechInput("");
    setEditingIndex(certificates.length);
  };

  const handleCancel = () => {
    setFormData(EMPTY_CERT);
    setTechInput("");
    setEditingIndex(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingCertificates(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const items = Array.isArray(data?.profile?.certificates) ? data.profile.certificates : [];
        setCertificates(items.map((cert) => normalizeCertificate(cert)));
      })
      .catch(() => {
        toast.error("Failed to load certificates");
      })
      .finally(() => {
        setLoadingCertificates(false);
      });
  }, []);

  const addTech = () => {
    const tech = techInput.trim();
    if (!tech) return;
    if (formData.techStack.some((item) => item.toLowerCase() === tech.toLowerCase())) return;

    handleChange("techStack", [...formData.techStack, tech]);
    setTechInput("");
  };

  const validateCertificateFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, PNG, JPG, or WEBP files are allowed");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Certificate file must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleCertificateFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.uploadcare) {
      toast.error("Upload service not available");
      return;
    }

    if (!validateCertificateFile(file)) return;

    try {
      setCertificateUploading(true);
      const upload = window.uploadcare.fileFrom("object", file);
      const result = await upload.promise();

      handleChange("certificateFile", result.cdnUrl || "");
      handleChange("certificateFileName", file.name);
      toast.success("Certificate uploaded successfully");
    } catch (error) {
      toast.error("Certificate upload failed");
    } finally {
      setCertificateUploading(false);
      e.target.value = "";
    }
  };

  const removeTech = (index) => {
    handleChange(
      "techStack",
      formData.techStack.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              <Sparkles size={14} />
              Profile Credentials
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-2">Certificates</h2>
            <p className="text-sm text-slate-600 mt-1">Show verified courses and achievements to build credibility.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} className="text-blue-600" />
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-800">Your Certificates</h3>

      {!isFormVisible && (
          <button
            onClick={handleAddNew}
            disabled={loadingCertificates || savingCertificates}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Add Certificate
          </button>
        )}
      </div>

      {loadingCertificates && editingIndex === null && <StudentLoadingCard message="Loading certificates..." className="sm:p-10" />}

      {!loadingCertificates && certificates.length === 0 && editingIndex === null && (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-white ring-4 ring-blue-100 flex items-center justify-center text-blue-600">
            <Trophy size={24} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">No certificates added yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Certificates are optional, but they help recruiters verify your skills, achievements, and learning credibility.
            </p>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-4">
          <Input
            label="Certificate Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <Input
            label="Issuing Organization"
            value={formData.organization}
            onChange={(e) => handleChange("organization", e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleChange("issueDate", e.target.value)}
            />

            <Input
              label="Expiry Date"
              type="date"
              disabled={!formData.hasExpiry}
              value={formData.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => handleChange("hasExpiry", !formData.hasExpiry)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  formData.hasExpiry
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600"
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
              onChange={(e) => handleChange("credentialId", e.target.value)}
            />

            <Input
              label="Credential URL (optional)"
              placeholder="https://"
              value={formData.credentialUrl}
              onChange={(e) => handleChange("credentialUrl", e.target.value)}
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
              onChange={(val) => handleChange("certificateType", val)}
            />

            <Select
              label="Status"
              value={formData.status}
              options={["active", "expired", "completed", "revoked"]}
              onChange={(val) => handleChange("status", val)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tech Stack / Skills</label>
            <div className="flex flex-wrap gap-2 border rounded-lg p-3 mt-1">
              {formData.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(index)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    x
                  </button>
                </span>
              ))}

              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Add tech and press Enter"
                className="outline-none text-sm flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Certificate Image / PDF</label>

            <label className="mt-2 block rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 py-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleCertificateFileSelect}
                className="hidden"
              />
              <p className="text-sm font-medium text-slate-700">
                {certificateUploading ? "Uploading..." : "Click to upload certificate"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF / PNG / JPG / WEBP (max 5MB)</p>
            </label>

            {certificateUploading && (
              <p className="mt-2 text-xs text-blue-600">Uploading certificate...</p>
            )}

            {!!formData.certificateFile && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-600 break-all">
                  Uploaded: <span className="font-medium text-slate-800">{formData.certificateFileName || "certificate"}</span>
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={formData.certificateFile}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("certificateFile", "");
                      handleChange("certificateFileName", "");
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <textarea
            rows={3}
            placeholder="Description (what you learned, skills gained)"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleCancel} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={certificateUploading || savingCertificates}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} />{" "}
              {certificateUploading
                ? "Uploading..."
                : savingCertificates
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                    ? "Update Certificate"
                    : "Add Certificate"}
            </button>
          </div>
        </div>
      )}

      {!isFormVisible &&
        certificates.map((cert, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-4 hover:shadow-md hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-1 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-700" />
                <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[cert.status] || statusStyles.completed}`}>
                  {cert.status}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">{cert.name}</h3>
              <p className="text-sm text-slate-500">{cert.organization}</p>
              <p className="text-sm text-slate-500">
                Issued: {cert.issueDate}
                {cert.hasExpiry && ` - Expires: ${cert.expiryDate}`}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {cert.techStack.map((tech, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {cert.credentialId && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                    ID: {cert.credentialId}
                  </span>
                )}
                {!!cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                  >
                    Verify URL
                  </a>
                )}
              </div>

            </div>

            <div className="flex sm:flex-col gap-3 self-end sm:self-start">
              {!!cert.certificateFile && (
                <button
                  type="button"
                  onClick={() => openCertificate(cert.certificateFile)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition text-sm font-medium"
                >
                  <ExternalLink size={14} />
                  View
                </button>
              )}

              <button
                disabled={savingCertificates}
                onClick={() => handleEdit(index)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-500 cursor-pointer text-slate-600 hover:text-blue-600 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                disabled={savingCertificates}
                onClick={() => handleDelete(index)}
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


