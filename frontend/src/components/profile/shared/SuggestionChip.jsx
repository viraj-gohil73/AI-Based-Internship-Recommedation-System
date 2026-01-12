import { Plus } from "lucide-react";

export default function SuggestionChip({ label, onAdd }) {
  return (
    <button
      onClick={onAdd}
      className=" flex px-3 py-1.5 text-sm rounded-full
      border border-dashed border-slate-400
      text-slate-700 hover:bg-slate-100 transition"
    >
      <Plus size="16" /> {label}
    </button>
  );
}