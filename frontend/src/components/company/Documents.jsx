import { Upload, Files, Trash2, CheckCircle2, ExternalLink, ListChecks } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCompany } from "../../context/CompanyContext";
import { supabase } from "../../utils/supabaseClient";

const SUPABASE_COMPANY_DOC_BUCKET =
  import.meta.env.VITE_SUPABASE_COMPANY_DOC_BUCKET ||
  import.meta.env.VITE_SUPABASE_RESUME_BUCKET ||
  "resumes";

export default function Documents({ data, setFormData, disabled }) {
  const fileRef = useRef(null);
  const { updateCompany, company } = useCompany();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ✅ SINGLE SOURCE OF TRUTH */
  const regDocUrl =
    typeof data?.reg_doc === "string" ? data.reg_doc.trim() : "";
  const hasDocument = Boolean(regDocUrl);

  /* ---------------- FILE NAME (UI ONLY) ---------------- */
  const getDisplayFileName = () => {
    if (!data?.companyName) return "registration_document.pdf";
    return `${data.companyName
      .toLowerCase()
      .replace(/\s+/g, "_")}_registration.pdf`;
  };

  /* ---------------- FILE VALIDATION ---------------- */
  const validateFile = (file) => {
    if (!file) return false;

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = (file.name || "").toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );
    const hasAllowedMimeType = allowedMimeTypes.includes(file.type);

    if (!hasAllowedMimeType && !hasAllowedExtension) {
      toast.error("Only PDF or DOC/DOCX files are allowed");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const uploadDocumentToSupabase = async (selectedFile) => {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      );
    }

    const safeFileName = (selectedFile.name || "registration-document")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const filePath = `company-documents/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_COMPANY_DOC_BUCKET)
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        contentType: selectedFile.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message || "Document upload failed");
    }

    const { data } = supabase.storage
      .from(SUPABASE_COMPANY_DOC_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Upload succeeded but public URL is unavailable");
    }

    return data.publicUrl;
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a file first");
      return;
    }

    if (!validateFile(file)) return;

    setUploading(true);

    try {
      const documentUrl = await uploadDocumentToSupabase(file);

      await updateCompany({ reg_doc: documentUrl });

      setFormData((prev) => ({
        ...prev,
        reg_doc: documentUrl,
      }));

      toast.success("Document uploaded successfully");

      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- REMOVE ---------------- */
  const handleRemove = async () => {
    try {
      await updateCompany({ reg_doc: null });

      setFormData((prev) => ({
        ...prev,
        reg_doc: null,
      }));

      toast.success("Document removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove document");
    }

    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-md">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-6 border-b border-blue-100">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
          <Files className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Company Registration Document
          </h3>
          <p className="text-xs text-gray-500 mt-1">Upload your official company registration certificate</p>
        </div>
      </div>

      {/* ================= DOCUMENT EXISTS ================= */}
      {hasDocument ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg px-4 py-4 hover:shadow-md transition-all duration-300">
            
            {/* ICON */}
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shrink-0 shadow-md">
              <CheckCircle2 size={24} className="text-white" />
            </div>

            {/* FILE INFO */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-green-900 break-all sm:truncate">
                {getDisplayFileName()}
              </p>
              <a
                href={regDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-600 hover:text-green-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
              >
                <ExternalLink size={12} />
                View Document
              </a>
            </div>

            {/* REMOVE */}
            {!disabled && company.verificationStatus !== "APPROVED" && (
              <button
                onClick={handleRemove}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg w-full sm:w-auto transition-all duration-300 hover:shadow-md"
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Document Uploaded</p>
              <p className="text-xs text-green-700">Your registration document has been successfully uploaded. Click "View Document" to verify.</p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= NO DOCUMENT ================= */
        <div className="space-y-6">
          
          {/* FILE INPUT */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <label className="cursor-pointer">
              <input
                ref={fileRef}
                accept=".pdf,.doc,.docx"
                type="file"
                disabled={disabled}
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC or DOCX (max. 5MB)</p>
              </div>
            </label>
          </div>

          {/* FILE NAME INDICATOR */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Files className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          {!disabled && (
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                uploading || !file
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              <Upload size={18} />
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          )}
        </div>
      )}

      {/* REQUIREMENTS */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-start gap-3">
        <ListChecks size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-2">File Requirements:</p>
          <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
            <li>Accepted formats: PDF, DOC, DOCX</li>
            <li>Maximum file size: 5MB</li>
            <li>Must be a valid company registration certificate</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
