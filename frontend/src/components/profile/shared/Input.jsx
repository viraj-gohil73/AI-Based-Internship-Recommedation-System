import { AlertCircle } from "lucide-react";

export default function Input({ label, error, disabled, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border text-sm
          outline-none transition
          focus:ring-2 focus:ring-blue-500
          ${
            disabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
              : "bg-white border-slate-300"
          }
          ${error ? "border-red-500" : ""}
        `}
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}