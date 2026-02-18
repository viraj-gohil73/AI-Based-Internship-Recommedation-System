export default function InternshipStatCard({ label, value, icon: Icon, secondary }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {secondary && <p className="text-xs text-gray-500 mt-1">{secondary}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
