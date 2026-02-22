import { Bell, CheckCheck, Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Header({ title, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const wrapperRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      setNotificationsLoading(true);
      const res = await fetch("http://localhost:5000/api/notifications?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to load admin notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

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

  const markOneRead = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setNotifications((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) ? { ...item, read: true } : item
      )
    );

    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark admin notification:", error);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    try {
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to mark all admin notifications:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-300 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-3 relative" ref={wrapperRef}>
          <button
            onClick={async () => {
              const next = !open;
              setOpen(next);
              if (next) await loadNotifications();
            }}
            aria-label="Show notifications"
            className="relative p-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition group"
          >
            <Bell size={22} className="group-hover:scale-110 transition-transform" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-3 z-50 w-[340px] rounded-xl shadow-2xl border border-blue-100 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading...
                  </div>
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
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full ${
                            item.read ? "bg-slate-300" : "bg-blue-600"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
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

          <div className="lg:hidden w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm overflow-hidden">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7039/7039273.png"
                alt="dp"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
