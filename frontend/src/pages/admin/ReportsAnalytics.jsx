import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  CalendarRange,
  TrendingUp,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

const metricConfig = {
  "Active students": {
    icon: Users,
    tone: "from-blue-50 to-indigo-50 text-blue-700",
  },
  "Active companies": {
    icon: Building2,
    tone: "from-emerald-50 to-teal-50 text-emerald-700",
  },
  "Open internships": {
    icon: Briefcase,
    tone: "from-amber-50 to-orange-50 text-amber-700",
  },
  "Active recruiters": {
    icon: TrendingUp,
    tone: "from-violet-50 to-purple-50 text-violet-700",
  },
};

const rangeDaysMap = { "7D": 7, "30D": 30, "90D": 90 };

const csvCell = (value) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

export default function ReportsAnalytics() {
  const [range, setRange] = useState("30D");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({ metrics: [], trends: [], highlights: [] });

  const token = localStorage.getItem("adminToken");

  const rangeLabel = useMemo(() => {
    if (range === "7D") return "Last 7 days";
    if (range === "90D") return "Last 90 days";
    return "Last 30 days";
  }, [range]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const rangeDays = rangeDaysMap[range] || 30;
      const res = await fetch(
        `http://localhost:5000/api/admin/reports/summary?range=${rangeDays}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load reports");
      }
      setReport({
        metrics: data.metrics || [],
        trends: data.trends || [],
        highlights: data.highlights || [],
      });
    } catch (error) {
      toast.error(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range]);

  const handleExport = () => {
    if (
      report.metrics.length === 0 &&
      report.trends.length === 0 &&
      report.highlights.length === 0
    ) {
      toast.error("No report data to export");
      return;
    }

    const rows = [
      ["Section", "Label", "Value", "Notes"],
      ...report.metrics.map((item) => ["Metric", item.label, item.value, rangeLabel]),
      ...report.trends.map((item) => ["Trend", item.label, `${item.value}%`, rangeLabel]),
      ...report.highlights.map((item) => ["Highlight", item.title, "", item.detail]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `reports-analytics-${range.toLowerCase()}-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Reports & Analytics
              </h1>
              <p className="text-sm text-slate-500">
                Performance overview for the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <CalendarRange size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                <option value="7D">Last 7 days</option>
                <option value="30D">Last 30 days</option>
                <option value="90D">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(report.metrics.length ? report.metrics : []).map((card) => {
          const config = metricConfig[card.label] || {
            icon: TrendingUp,
            tone: "from-slate-50 to-slate-100 text-slate-600",
          };
          const Icon = config.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{card.value}</h2>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${config.tone} p-3`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{rangeLabel}</p>
            </div>
          );
        })}

        {loading && report.metrics.length === 0 && (
          <div className="col-span-full text-center text-sm text-slate-500">
            Loading metrics...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Trend snapshot</h3>
          <p className="text-sm text-slate-500">Engagement and platform momentum.</p>

          <div className="mt-6 space-y-4">
            {report.trends.map((trend) => (
              <div key={trend.label}>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{trend.label}</span>
                  <span>{trend.value}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    style={{ width: `${trend.value}%` }}
                  />
                </div>
              </div>
            ))}

            {!loading && report.trends.length === 0 && (
              <p className="text-sm text-slate-500">No trend data available.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Highlights</h3>
          <p className="text-sm text-slate-500">Key insights for leadership.</p>

          <div className="mt-5 space-y-4">
            {report.highlights.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}

            {!loading && report.highlights.length === 0 && (
              <p className="text-sm text-slate-500">No highlights available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
