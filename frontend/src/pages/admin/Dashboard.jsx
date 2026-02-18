import { Building2, Users, Clock, Briefcase } from "lucide-react";

const cards = [
  {
    label: "Total Companies",
    value: 120,
    icon: Building2,
    tone: "from-blue-50 to-indigo-50 text-blue-700",
  },
  {
    label: "Students",
    value: 5400,
    icon: Users,
    tone: "from-emerald-50 to-teal-50 text-emerald-700",
  },
  {
    label: "Pending Approvals",
    value: 8,
    icon: Clock,
    tone: "from-amber-50 to-orange-50 text-amber-700",
  },
  {
    label: "Active Recruiters",
    value: 310,
    icon: Briefcase,
    tone: "from-violet-50 to-purple-50 text-violet-700",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Snapshot of platform activity and approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {card.value}
                  </h2>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${card.tone} p-3`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
