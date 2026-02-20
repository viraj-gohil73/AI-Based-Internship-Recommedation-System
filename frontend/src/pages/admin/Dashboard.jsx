import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
    tone: "from-emerald-50 to-teal-50 text-emerald-700",
    progress: "from-emerald-500 to-teal-500",
  },
  "Active companies": {
    icon: Building2,
    tone: "from-blue-50 to-indigo-50 text-blue-700",
    progress: "from-blue-500 to-indigo-500",
  },
  "Open internships": {
    icon: Briefcase,
    tone: "from-violet-50 to-purple-50 text-violet-700",
    progress: "from-violet-500 to-purple-500",
  },
  "Active recruiters": {
    icon: TrendingUp,
    tone: "from-amber-50 to-orange-50 text-amber-700",
    progress: "from-amber-500 to-orange-500",
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Real-time platform snapshot for last {data.rangeDays} days.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {numberFormat.format(card.value)}
                    </h2>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br ${card.tone} p-3`}>
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
              <p className="text-sm text-slate-500">No trend data available.</p>
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
              <p className="text-sm text-slate-500">No highlights available.</p>
            )}

            {(data.highlights || []).map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
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
