export default function GenderSelect({ value, onChange, error }) {
  const options = ["Male", "Female", "Other"];
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">Gender</label>
      <div className="flex flex-wrap gap-3 ">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full cursor-pointer border text-sm transition
              ${value === opt
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 hover:border-blue-500"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}