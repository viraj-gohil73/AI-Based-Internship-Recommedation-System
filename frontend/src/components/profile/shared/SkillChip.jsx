import { X } from "lucide-react";   

export default function SkillChip({ label, onRemove }) {
  return (
    <span
      className="flex items-center gap-2 px-3 py-1.5
      bg-blue-100 text-blue-700
      rounded-full text-sm font-medium"
    >
      {label}
      <button
        onClick={onRemove}
        className="text-blue-700 hover:text-red-500 text-lg leading-none cursor-pointer"
      >
        <X size="16" />
      </button>
    </span>
  );
}