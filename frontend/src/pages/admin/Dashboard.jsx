import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Building2,
  Briefcase,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";

const RANGE_OPTIONS = [7, 30, 90, 180];

const METRIC_STYLES = {
  "Active students": {
    icon: Users,
    tone: "from-sky-50 to-blue-50 text-blue-700",
    progress: "from-sky-500 to-blue-500",
  },
  "Active companies": {
    icon: Building2,
    tone: "from-blue-50 to-indigo-50 text-blue-700",
    progress: "from-blue-500 to-indigo-500",
  },
  "Open internships": {
    icon: Briefcase,
    tone: "from-blue-50 to-sky-50 text-sky-700",
    progress: "from-blue-500 to-sky-500",
  },
  "Active recruiters": {
    icon: TrendingUp,
    tone: "from-indigo-50 to-blue-50 text-indigo-700",
    progress: "from-indigo-500 to-blue-500",
  },
};

const numberFormat = new Intl.NumberFormat("en-IN");

const toSafeMetrics = (metrics = []) =>
  Array.isArray(metrics)
    ? metrics.map((metric) => {
        const style = METRIC_STYLES[metric.label] || METRIC_STYLES["Active companies"];
        return {
          ...metric,
          icon: style.icon,
          tone: style.tone,
          progress: style.progress,
          value: Number(metric.value || 0),
        };
      })
    : [];

export default function Dashboard() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState({
    rangeDays: 30,
    metrics: [],
    trends: [],
    highlights: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");
        const res = await fetch(
          `http://localhost:5000/api/admin/reports/summary?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok || result.success === false) {
          throw new Error(result.message || "Failed to load dashboard data");
        }

        setData({
          rangeDays: result.rangeDays || range,
          metrics: toSafeMetrics(result.metrics),
          trends: Array.isArray(result.trends) ? result.trends : [],
          highlights: Array.isArray(result.highlights) ? result.highlights : [],
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const metricCards = useMemo(() => data.metrics || [], [data.metrics]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative z-10 space-y-1.5">
            <p className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/70 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Analytics Overview
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Real-time platform snapshot for last {data.rangeDays} days.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="rounded-xl border border-blue-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {RANGE_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  Last {days} days
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchDashboard({ silent: true })}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="mt-3 h-8 w-20 rounded bg-slate-200" />
              <div className="mt-4 h-1.5 w-full rounded bg-slate-200" />
            </div>
          ))}

        {!loading &&
          metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {numberFormat.format(card.value)}
                    </h2>
                  </div>
                  <div
                    className={`rounded-2xl bg-gradient-to-br ${card.tone} p-3 transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${card.progress}`}
                    style={{ width: `${Math.min(100, Math.max(18, card.value % 100 || 42))}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Growth Trends</h2>
          <p className="mt-1 text-sm text-slate-500">
            Share of new additions in the selected period.
          </p>

          <div className="mt-4 space-y-4">
            {(data.trends || []).length === 0 && !loading && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">
                No trend data available.
              </p>
            )}

            {(data.trends || []).map((trend) => {
              const value = Number(trend.value || 0);
              return (
                <div key={trend.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{trend.label}</span>
                    <span className="font-semibold text-slate-900">{value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
          <p className="mt-1 text-sm text-slate-500">
            Key activity signals from the selected window.
          </p>

          <div className="mt-4 space-y-3">
            {(data.highlights || []).length === 0 && !loading && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">
                No highlights available.
              </p>
            )}

            {(data.highlights || []).map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/40 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
