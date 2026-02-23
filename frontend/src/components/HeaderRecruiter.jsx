import { Bell, CheckCheck, Menu, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRecruiter } from "../context/RecruiterContext";

export default function RecruiterHeader({ title, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const { recruiter } = useRecruiter();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("recruiterToken");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/notifications?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to load recruiter notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markOneRead = async (id) => {
    const token = localStorage.getItem("recruiterToken");
    if (!token) return;

    setNotifications((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, read: true } : item))
    );

    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark recruiter notification:", error);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("recruiterToken");
    if (!token) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    try {
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark all recruiter notifications:", error);
    }
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("recruiterToken");
    if (!token) return;

    setNotifications([]);

    try {
      await fetch("http://localhost:5000/api/notifications/clear-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to clear recruiter notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const handleToggleNotification = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-3 relative" ref={wrapperRef}>
          <button
            onClick={handleToggleNotification}
            className="relative p-2 rounded-lg hover:bg-slate-100"
            aria-label="Show notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-[11px]
              bg-blue-600 text-white rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-3 z-50 w-[340px] rounded-xl shadow-2xl border border-blue-100 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-red-500"
                      title="Clear all notifications"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markOneRead(item.id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                        item.read ? "bg-white" : "bg-blue-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="w-9 h-9 lg:hidden rounded-full bg-blue-100
            flex items-center justify-center
            font-semibold text-blue-600">
            <img
              src={recruiter?.dp || "/default-avatar.png"}
              alt="Recruiter Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
