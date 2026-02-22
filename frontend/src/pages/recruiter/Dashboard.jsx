import {
  BriefcaseBusiness,
  CalendarClock,
  CircleCheckBig,
  Clock4,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Active Internships",
    value: "12",
    note: "+3 this week",
    icon: BriefcaseBusiness,
    accent: "from-cyan-500 to-blue-600",
  },
  {
    label: "New Applicants",
    value: "48",
    note: "Last 7 days",
    icon: Users,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    label: "Interviews Scheduled",
    value: "9",
    note: "Next 5 days",
    icon: CalendarClock,
    accent: "from-indigo-500 to-violet-600",
  },
  {
    label: "Profile Completion",
    value: "88%",
    note: "Improve to unlock trust badge",
    icon: CircleCheckBig,
    accent: "from-orange-500 to-amber-500",
  },
];

const upcoming = [
  {
    title: "UI/UX Intern - Candidate Screening",
    when: "Today, 4:30 PM",
    status: "In 2 hours",
  },
  {
    title: "React Developer Intern - Technical Round",
    when: "Tomorrow, 11:00 AM",
    status: "Scheduled",
  },
  {
    title: "Backend Intern - Resume Review Batch",
    when: "Monday, 10:00 AM",
    status: "Pending review",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Recruiter Workspace
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Recruiter Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Track hiring progress, pipeline activity, and upcoming actions in one view.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
              <span className="font-semibold">Today:</span> 6 priority tasks pending
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{card.value}</p>
                  </div>
                  <div
                    className={`rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm ${card.accent}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-600">{card.note}</p>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Activity</h2>
            <div className="mt-4 space-y-3">
              {upcoming.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{item.when}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Notes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="font-semibold text-emerald-800">Strong pipeline</p>
                <p className="mt-1 text-emerald-700">8 candidates moved to interview this week.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-800">Action needed</p>
                <p className="mt-1 text-amber-700">2 internships need description updates.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                <Clock4 size={16} />
                <p>Next sync with company admin: Friday, 3:00 PM</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
