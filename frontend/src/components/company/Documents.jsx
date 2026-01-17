import { Upload, FileText, Trash2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCompany} from "../../context/CompanyContext"


export default function Documents({ data, setFormData, disabled }) {
  const fileRef = useRef(null);
  const { updateCompany} = useCompany();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const hasDocument = typeof data?.reg_doc === "string";

  /* ---------------- FILE NAME (UI ONLY) ---------------- */
  const getDisplayFileName = () => {
    if (!data?.companyName) return "registration_document.pdf";
    return `${data.companyName
      .toLowerCase()
      .replace(/\s+/g, "_")}_registration.pdf`;
  };

  /* ---------------- UPLOAD ---------------- */
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a file first");
      return;
    }

    setUploading(true);

    try {
      const upload = window.uploadcare.fileFrom("object", file);
      const result = await upload.promise();

      await updateCompany({ reg_doc: result.cdnUrl });

      setFormData((prev) => ({
        ...prev,
        reg_doc: result.cdnUrl,
      }));

      toast.success("Document uploaded successfully");

      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
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
    <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-6 space-y-6">
      <h3 className="text-sm sm:text-base font-semibold text-gray-800">
        Company Registration Document
      </h3>

      {/* ================= DOCUMENT EXISTS ================= */}
      {hasDocument ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-blue-300 rounded-lg px-4 py-3 bg-slate-50">
          
          {/* ICON */}
          <div className="p-2 hidden sm:block bg-blue-100 rounded-lg shrink-0">
            <FileText size={20} className="text-blue-600" />
          </div>

          {/* FILE INFO */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-all sm:truncate">
              {getDisplayFileName()}
            </p>
            <a
              href={data.reg_doc}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View document
            </a>
          </div>

          {/* REMOVE */}
          {!disabled && (
            <button
              onClick={handleRemove}
              className="flex items-center justify-center gap-1
                         text-sm text-red-600 bg-red-100
                         hover:bg-red-200 px-3 py-1.5
                         rounded-md w-full sm:w-auto"
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
        </div>
      ) : (
        /* ================= NO DOCUMENT ================= */
        <div className="space-y-4">
          
          {/* FILE INPUT */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            disabled={disabled}
            onChange={(e) => setFile(e.target.files[0])}
            className="block text-sm
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-medium
                       file:bg-blue-100 file:text-blue-600 cursor-pointer 
                       hover:file:bg-blue-100"
          />

          {/* UPLOAD BUTTON */}
          {!disabled && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2
                         w-full sm:w-auto
                         px-4 py-2 rounded-lg
                         bg-blue-600 text-white cursor-pointer
                         text-sm font-medium
                         hover:bg-blue-700 disabled:opacity-60"
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Accepted formats: PDF, DOCX. Max size: 5MB.
      </p>
    </div>
  );
}
