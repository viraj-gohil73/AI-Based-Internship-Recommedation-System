import { useEffect, useRef, useState } from "react";
import { AlertCircle, Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import StudentLayout from "../../layout/StudentLayout";
import { supabase } from "../../utils/supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ACCEPT_ATTR = ".pdf,.doc,.docx";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const SUPABASE_RESUME_BUCKET = import.meta.env.VITE_SUPABASE_RESUME_BUCKET || "resumes";

const getFileNameFromUrl = (url = "") => {
  if (!url) return "resume";
  const cleanUrl = String(url).split("?")[0];
  const parts = cleanUrl.split("/");
  const fileName = parts[parts.length - 1] || "resume";
  return decodeURIComponent(fileName);
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
};

export default function MyResume() {
  const inputRef = useRef(null);

  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeSize, setResumeSize] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveResumeToProfile = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login again");

    const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resume: url }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to save resume");
    }

    return data?.profile?.resume || url;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const existingResume = data?.profile?.resume || "";
        setResumeUrl(existingResume);
        setResumeName(getFileNameFromUrl(existingResume));
      })
      .catch(() => {
        toast.error("Failed to load resume");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const validateFile = (file) => {
    if (!file) return false;

    const typeValid = ACCEPTED_TYPES.includes(file.type);
    const extensionValid = ACCEPT_ATTR.split(",").some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!typeValid && !extensionValid) {
      setError("Only PDF, DOC, and DOCX files are allowed.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum allowed size is 2 MB.");
      return false;
    }

    setError("");
    return true;
  };

  const uploadResumeToSupabase = async (file) => {
    if (!supabase) {
      throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }

    const normalizedName = (file.name || "resume")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = `student-resumes/${Date.now()}-${normalizedName}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_RESUME_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || "Upload failed");
    }

    const { data } = supabase.storage.from(SUPABASE_RESUME_BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error("Upload succeeded but public URL is not available.");
    }

    return data.publicUrl;
  };

  const handleSelectFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !validateFile(file)) return;

    try {
      setUploading(true);
      setSaving(true);

      const cdnUrl = await uploadResumeToSupabase(file);
      if (!cdnUrl) {
        throw new Error("Upload failed. No file URL returned.");
      }

      const savedUrl = await saveResumeToProfile(cdnUrl);
      setResumeUrl(savedUrl);
      setResumeName(file.name);
      setResumeSize(file.size);
      toast.success("Resume uploaded and saved");
    } catch (uploadError) {
      setError(uploadError?.message || "Resume upload failed");
      toast.error(uploadError?.message || "Resume upload failed");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setSaving(true);
      await saveResumeToProfile("");
      setResumeUrl("");
      setResumeName("");
      setResumeSize(0);
      setError("");
      toast.success("Resume removed");
    } catch (removeError) {
      toast.error(removeError?.message || "Failed to remove resume");
    } finally {
      setSaving(false);
    }
  };

  const openResume = () => {
    if (!resumeUrl) return;
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  const downloadResume = () => {
    if (!resumeUrl) return;
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = resumeName || "resume";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StudentLayout title="My Resume">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h1 className="text-lg font-semibold text-slate-900">Resume Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload your resume to Supabase Storage and save its link to your profile.
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-sky-400 hover:bg-slate-50">
              <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-sky-700" />
                <p className="text-sm font-medium text-slate-700">
                  {uploading ? "Uploading..." : "Click to upload or replace resume"}
                </p>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX | Max 2 MB</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                onChange={handleSelectFile}
                className="hidden"
                disabled={uploading || saving}
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading resume...
              </div>
            ) : resumeUrl ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-sky-100 p-2.5">
                      <FileText className="h-6 w-6 text-sky-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {resumeName || getFileNameFromUrl(resumeUrl)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(resumeSize) || "Uploaded to Supabase Storage"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={openResume}
                      className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={downloadResume}
                      className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={saving || uploading}
                      className="inline-flex items-center justify-center gap-1 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No resume saved yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
