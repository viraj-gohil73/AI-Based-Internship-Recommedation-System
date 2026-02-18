import { useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  CalendarRange,
  User,
  Building2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const csvCell = (value) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const token = localStorage.getItem("adminToken");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (severityFilter !== "ALL") params.set("severity", severityFilter);

      const res = await fetch(
        `http://localhost:5000/api/admin/audit-logs?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load logs");
      }

      const list = Array.isArray(data) ? data : data.data || [];
      setLogs(list);
    } catch (error) {
      toast.error(error.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, typeFilter, severityFilter]);

  const formatted = useMemo(() => {
    return logs.map((log) => ({
      ...log,
      timeLabel: log.createdAt
        ? new Date(log.createdAt).toLocaleString()
        : "-",
    }));
  }, [logs]);

  const handleExport = () => {
    if (formatted.length === 0) {
      toast.error("No audit logs to export");
      return;
    }

    const rows = [
      ["Action", "Type", "Actor", "Target", "Severity", "Time"],
      ...formatted.map((log) => [
        log.action || "-",
        log.type || "-",
        log.actor || "-",
        log.target || "-",
        log.severity || "-",
        log.timeLabel || "-",
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `audit-logs-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
              <p className="text-sm text-slate-500">System activity and admin actions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <CalendarRange size={16} />
              Date range
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <FileText size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, actor, or target"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="ALL">All types</option>
              <option value="COMPANY">Company</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="STUDENT">Student</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="ADMIN">Admin</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="ALL">All severity</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">Actor</th>
                <th className="p-4 text-left">Target</th>
                <th className="p-4 text-left">Severity</th>
                <th className="p-4 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && formatted.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              )}

              {!loading &&
                formatted.map((log) => (
                  <tr key={log._id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.type}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        {log.actor}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        {log.target || "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${severityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{log.timeLabel}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function severityBadge(level) {
  if (level === "HIGH") return "bg-rose-100 text-rose-700";
  if (level === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}
