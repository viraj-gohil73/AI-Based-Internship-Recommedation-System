import { Lock } from "lucide-react";

export default function UnderReviewAlert({
  message = "Your company profile is under admin review.",
  subMessage = "Settings will be enabled after approval.",
}) {
  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-blue-300 
      bg-gradient-to-r from-blue-50 to-blue-50 
      p-4 shadow-sm transition-all duration-200">

      {/* Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full 
        bg-blue-100 text-blue-700">
        <Lock size={18} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {message}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          {subMessage}
        </p>
      </div>

      {/* Accent bar */}
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-blue-400" />
    </div>
  );
}
