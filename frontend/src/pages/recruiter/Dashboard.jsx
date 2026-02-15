export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: 120 },
          { label: "Students", value: 5400 },
          { label: "Pending Approvals", value: 8 },
          { label: "Active Recruiters", value: 310 },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 rounded-xl border shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <h2 className="text-2xl font-bold">{card.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
