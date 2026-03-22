import { Link } from "react-router-dom";

export default function ResumeSelectionModal({
  open,
  mode = "select",
  options,
  selectedResumeUrl,
  onSelect,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const isRequiredMode = mode === "required";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        {isRequiredMode ? (
          <>
            <h3 className="text-lg font-semibold text-slate-900">Resume Required</h3>
            <p className="mt-1 text-sm text-slate-600">
              Please upload a resume before applying.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Not now
              </button>
              <Link
                to="/student/resume"
                onClick={onCancel}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Upload Resume
              </Link>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-900">Select Resume</h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose which resume to attach with this application.
            </p>

            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {options.map((item) => (
                <label
                  key={item.url}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="resume-option"
                    value={item.url}
                    checked={selectedResumeUrl === item.url}
                    onChange={(event) => onSelect(event.target.value)}
                  />
                  <span className="truncate text-sm text-slate-800">{item.name}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!selectedResumeUrl}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Attach & Apply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

