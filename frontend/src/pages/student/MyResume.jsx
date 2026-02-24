import { useEffect, useMemo, useRef, useState } from "react";
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
const MAX_RESUME_COUNT = 3;

const getFileNameFromUrl = (url = "") => {
  if (!url) return "resume";
  const cleanUrl = String(url).split("?")[0];
  const parts = cleanUrl.split("/");
  const fileName = parts[parts.length - 1] || "resume";
  return decodeURIComponent(fileName);
};

export default function MyResume() {
  const inputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [defaultResumeUrl, setDefaultResumeUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveResumeState = async (nextResumes, nextDefaultResumeUrl) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please login again");

    const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resume: nextDefaultResumeUrl || "",
        resumes: nextResumes,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to save resumes");
    }

    const profile = data?.profile || {};
    const normalizedResumes = Array.isArray(profile?.resumes) ? profile.resumes : [];
    return {
      resumes: normalizedResumes,
      resume: profile?.resume || "",
    };
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
        const profile = data?.profile || {};
        const list = Array.isArray(profile?.resumes) ? profile.resumes : [];
        const legacyResume = String(profile?.resume || "").trim();
        const seen = new Set();
        const normalized = list
          .map((item) => {
            const url = String(item?.url || item || "").trim();
            if (!url || seen.has(url)) return null;
            seen.add(url);
            return {
              url,
              name: String(item?.name || getFileNameFromUrl(url)).trim() || getFileNameFromUrl(url),
              uploadedAt: item?.uploadedAt || null,
            };
          })
          .filter(Boolean);

        if (legacyResume && !seen.has(legacyResume)) {
          normalized.unshift({
            url: legacyResume,
            name: getFileNameFromUrl(legacyResume),
            uploadedAt: null,
          });
        }

        setResumes(normalized);
        setDefaultResumeUrl(legacyResume || normalized[0]?.url || "");
      })
      .catch(() => {
        toast.error("Failed to load resumes");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sortedResumes = useMemo(
    () =>
      [...resumes].sort((a, b) => {
        const aTime = a?.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bTime = b?.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [resumes]
  );

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
    if (resumes.length >= MAX_RESUME_COUNT) {
      const msg = `You can upload maximum ${MAX_RESUME_COUNT} resumes. Remove one to upload a new resume.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setUploading(true);
      setSaving(true);

      const cdnUrl = await uploadResumeToSupabase(file);
      if (!cdnUrl) {
        throw new Error("Upload failed. No file URL returned.");
      }

      const nextResumes = [
        { url: cdnUrl, name: file.name || getFileNameFromUrl(cdnUrl), uploadedAt: new Date().toISOString() },
        ...resumes.filter((item) => item.url !== cdnUrl),
      ];
      const persisted = await saveResumeState(nextResumes, cdnUrl);
      setResumes(
        (Array.isArray(persisted?.resumes) ? persisted.resumes : nextResumes).map((item) => ({
          url: String(item?.url || ""),
          name: String(item?.name || getFileNameFromUrl(item?.url || "")).trim(),
          uploadedAt: item?.uploadedAt || null,
        }))
      );
      setDefaultResumeUrl(persisted?.resume || cdnUrl);
      toast.success("Resume uploaded");
    } catch (uploadError) {
      setError(uploadError?.message || "Resume upload failed");
      toast.error(uploadError?.message || "Resume upload failed");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const handleRemove = async (url) => {
    try {
      setSaving(true);
      const nextResumes = resumes.filter((item) => item.url !== url);
      const nextDefault =
        defaultResumeUrl === url ? nextResumes[0]?.url || "" : defaultResumeUrl;
      const persisted = await saveResumeState(nextResumes, nextDefault);
      setResumes(Array.isArray(persisted?.resumes) ? persisted.resumes : nextResumes);
      setDefaultResumeUrl(persisted?.resume || nextDefault);
      setError("");
      toast.success("Resume removed");
    } catch (removeError) {
      toast.error(removeError?.message || "Failed to remove resume");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (url) => {
    try {
      setSaving(true);
      const persisted = await saveResumeState(resumes, url);
      setResumes(Array.isArray(persisted?.resumes) ? persisted.resumes : resumes);
      setDefaultResumeUrl(persisted?.resume || url);
      toast.success("Default resume updated");
    } catch (setDefaultError) {
      toast.error(setDefaultError?.message || "Failed to set default resume");
    } finally {
      setSaving(false);
    }
  };

  const openResume = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadResume = (url, name) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "resume";
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
              Upload multiple resumes and choose which one is default for internship applications.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {resumes.length}/{MAX_RESUME_COUNT} resumes used
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-sky-400 hover:bg-slate-50">
              <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-sky-700" />
                <p className="text-sm font-medium text-slate-700">
                  {uploading ? "Uploading..." : "Click to upload resume"}
                </p>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX | Max 2 MB</p>
                {resumes.length >= MAX_RESUME_COUNT ? (
                  <p className="text-xs font-medium text-amber-700">
                    Resume limit reached. Remove one to upload a new resume.
                  </p>
                ) : null}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                onChange={handleSelectFile}
                className="hidden"
                disabled={uploading || saving || resumes.length >= MAX_RESUME_COUNT}
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
            ) : sortedResumes.length ? (
              <div className="space-y-3">
                {sortedResumes.map((item) => {
                  const isDefault = item.url === defaultResumeUrl;
                  return (
                    <div
                      key={item.url}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-lg bg-sky-100 p-2.5">
                            <FileText className="h-6 w-6 text-sky-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {item.name || getFileNameFromUrl(item.url)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {isDefault ? "Default resume for apply" : "Saved resume"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          <button
                            type="button"
                            onClick={() => openResume(item.url)}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadResume(item.url, item.name)}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>

                          {!isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(item.url)}
                              disabled={saving || uploading}
                              className="inline-flex items-center justify-center gap-1 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Use for Apply
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleRemove(item.url)}
                            disabled={saving || uploading}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No resumes saved yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
