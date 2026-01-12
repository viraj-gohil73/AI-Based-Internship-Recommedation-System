import { Upload, FileText } from "lucide-react";

export default function Documents({ data, setFormData, disabled }) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-6">

      {/* REGISTRATION DOCUMENT */}
      <div className="space-y-2">
        <label className="text-sm font-medium block mb-2 ">
          Company Registration Document
        </label>

        {/* IF DOCUMENT EXISTS */}
        {data?.registration ? (
          <div className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-gray-50">
            <FileText size={18} />
            <span className="text-sm">{data.registration}</span>

            {!disabled && (
              <button
                className="ml-auto text-sm text-red-500 cursor-pointer hover:underline"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    documents: { ...prev.documents, registration: null },
                  }))
                }
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          /* UPLOAD ONLY IF NOT LOCKED */
          <label
            className={`flex items-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer ${
              disabled
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : "hover:bg-gray-50"
            }`}
          >
            <Upload size={18} />
            <span className="text-sm">Upload document</span>
            <input
              type="file"
              hidden
              disabled={disabled}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documents: {
                    ...prev.documents,
                    registration: e.target.files[0].name,
                  },
                }))
              }
            />
          </label>
          
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        Accepted formats: PDF, DOCX. Max size: 5MB.
      </div>

    </div>
  );
}
