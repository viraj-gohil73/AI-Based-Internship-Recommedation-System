import { Eye, Pencil, Trash2 } from "lucide-react";

export default function InternshipActionButtons({ onView, onEdit, onDelete }) {
  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={onView}
        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
        title="View"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={onEdit}
        className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
        title="Edit"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={onDelete}
        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
