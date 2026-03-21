import { Bell, BriefcaseBusiness, CheckCheck, Menu, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Header({ onMenuClick, title = "Student" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [applyStatus, setApplyStatus] = useState({
    monthlyApplicationLimit: 0,
    appliedThisMonth: 0,
    remainingThisMonth: 0,
  });
  const ref = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setNotificationsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to load student notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const loadApplyStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/student/internships/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setApplyStatus({
        monthlyApplicationLimit: Number(data?.monthlyApplicationLimit || 0),
        appliedThisMonth: Number(data?.appliedThisMonth || 0),
        remainingThisMonth: Number(data?.remainingThisMonth || 0),
      });
    } catch (error) {
      console.error("Failed to load student application status:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadApplyStatus();
  }, [loadNotifications, loadApplyStatus]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const onEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    const syncStatus = () => loadApplyStatus();

    window.addEventListener("focus", syncStatus);
    window.addEventListener("student-application-status-updated", syncStatus);

    return () => {
      window.removeEventListener("focus", syncStatus);
      window.removeEventListener("student-application-status-updated", syncStatus);
    };
  }, [loadApplyStatus]);

  const markOneRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setNotifications((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, read: true } : item))
    );

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark student notification:", error);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark all student notifications:", error);
    }
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setNotifications([]);

    try {
      await fetch(`${API_BASE_URL}/api/notifications/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to clear student notifications:", error);
    }
  };

  const applyLimitLabel =
    applyStatus.monthlyApplicationLimit > 0
      ? `${applyStatus.remainingThisMonth}/${applyStatus.monthlyApplicationLimit} applies left`
      : "Unlimited applies";

  const isLimitReached =
    applyStatus.monthlyApplicationLimit > 0 && applyStatus.remainingThisMonth <= 0;

  return (
    <header className="sticky top-0 z-30 border-b border-blue-200 bg-gradient-to-r from-white via-blue-50 to-white px-4 py-2 shadow-md sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-700 transition hover:bg-blue-100 hover:text-blue-600 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{title}</p>
          </div>

          <div
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex ${
              isLimitReached
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
            title="Monthly internship application balance"
          >
            <BriefcaseBusiness size={14} />
            {applyLimitLabel}
          </div>
        </div>

        <div className="relative flex items-center gap-3" ref={ref}>
          <button
            onClick={async () => {
              const next = !open;
              setOpen(next);
              if (next) await loadNotifications();
            }}
            aria-label="Show notifications"
            className="group relative rounded-lg p-2.5 text-gray-700 transition hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Bell size={22} className="transition-transform group-hover:scale-110" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[11px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[340px] overflow-hidden rounded-xl border border-blue-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="rounded-md p-1.5 text-red-500 hover:bg-slate-100"
                      title="Clear all notifications"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">No notifications</div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markOneRead(item.id)}
                      className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        item.read ? "bg-white" : "bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 rounded-full ${
                            item.read ? "bg-slate-300" : "bg-blue-600"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-600">{item.message}</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-blue-300 bg-gradient-to-br from-indigo-600 to-blue-600 text-sm font-bold text-white shadow-md lg:hidden">
            V
          </div>
        </div>
      </div>
    </header>
  );
}
