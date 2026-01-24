import { AlertCircle } from "lucide-react";

export default function NotAvailable({ text = "Not available" }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center animate-fadeIn">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <AlertCircle size={20} className="text-red-400 animate-pulse" />
      </div>
      <span className="text-sm text-slate-500">
        {text}
      </span>
    </div>
  );
}
