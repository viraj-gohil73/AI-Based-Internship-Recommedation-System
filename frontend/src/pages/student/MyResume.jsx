import { FileText, Trash2, Eye, Download, Upload } from "lucide-react";
import StudentLayout from "../../layout/StudentLayout";
import { useState } from "react";

export default function MyResume() {
  const [resume, setResume] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleView = () => {
    const fileURL = URL.createObjectURL(resume);
    window.open(fileURL);
  };

  const handleDownload = () => {
    const fileURL = URL.createObjectURL(resume);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = resume.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeResume = () => setResume(null);

  return (
    <StudentLayout title="My Resume">
      {/* Container */}
      <div className="w-full bg-white border border-slate-300 rounded-xl shadow-sm p-4 sm:p-6">
        {!resume ? (
          /* Upload Mode */
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 sm:p-10 cursor-pointer hover:border-indigo-500 transition text-center">
            <Upload className="w-12 h-12 text-indigo-500 mb-4" />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-indigo-600">Click to upload</span>{" "}
              or drag & drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOC, DOCX • Max 2MB
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={handleUpload}
            />
          </label>
        ) : (
          /* View Resume Mode */
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 sm:p-5 border border-slate-300 rounded-xl bg-slate-50">
            {/* Left Section */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="bg-indigo-100 p-3 rounded-lg shrink-0">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {resume.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(resume.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleView}
                className="flex items-center gap-1 text-sm px-3 py-2 rounded-md border text-slate-700 hover:bg-slate-100 w-full sm:w-auto justify-center"
              >
                <Eye className="w-4 h-4" />
                View
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-sm px-3 py-2 rounded-md border text-slate-700 hover:bg-slate-100 w-full sm:w-auto justify-center"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <label className="flex items-center gap-1 text-sm px-3 py-2 rounded-md border text-indigo-600 hover:bg-indigo-50 cursor-pointer w-full sm:w-auto justify-center">
                <Upload className="w-4 h-4" />
                Replace
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleUpload}
                />
              </label>

              <button
                onClick={removeResume}
                className="flex items-center justify-center p-2 rounded-md text-red-500 hover:bg-red-50 w-full sm:w-auto"
                title="Delete Resume"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 text-sm text-slate-500">
        <ul className="list-disc pl-5 space-y-1">
          <li>Recruiters prefer PDF resumes</li>
          <li>Keep projects & skills updated</li>
          <li>Use clear formatting for ATS systems</li>
        </ul>
      </div>
    </StudentLayout>
  );
}
