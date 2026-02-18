export default function InternshipMetaItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-blue-600" />}
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-semibold text-gray-900 text-base">{value || "N/A"}</p>
    </div>
  );
}
