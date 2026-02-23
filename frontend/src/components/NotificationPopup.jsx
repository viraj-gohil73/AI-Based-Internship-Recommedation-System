import { X, ArrowLeft, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationPopup({ onClose, updateCount }) {
  const [list, setList] = useState([{
        id: 1,
        title: "New Internship Matched",
        message: "Frontend Developer Internship matches your profile.",
        createdAt: "2025-01-30T10:30:00Z",
        read: false
      },
      {
        id: 2,
        title: "Application Viewed",
        message: "Google viewed your internship application.",
        createdAt: "2025-01-29T08:15:00Z",
        read: true
      },
    {
        id: 3,
        title: "New Internship Matched",
        message: "Frontend Developer Internship matches your profile.",
        createdAt: "2025-01-30T10:30:00Z",
        read: false
      },
      {
        id: 4,
        title: "Application Viewed",
        message: "Google viewed your internship application.",
        createdAt: "2025-01-29T08:15:00Z",
        read: true
      }
    ,
{
        id: 5,
        title: "New Internship Matched",
        message: "Frontend Developer Internship matches your profile.",
        createdAt: "2025-01-30T10:30:00Z",
        read: false
      },
      {
        id: 6,
        title: "Application Viewed",
        message: "Google viewed your internship application.",
        createdAt: "2025-01-29T08:15:00Z",
        read: true
      },{
        id: 7,
        title: "New Internship Matched",
        message: "Frontend Developer Internship matches your profile.",
        createdAt: "2025-01-30T10:30:00Z",
        read: false
      },
      {
        id: 8,
        title: "Application Viewed",
        message: "Google viewed your internship application.",
        createdAt: "2025-01-29T08:15:00Z",
        read: true
      },{
        id: 9,
        title: "New Internship Matched",
        message: "Frontend Developer Internship matches your profile.",
        createdAt: "2025-01-30T10:30:00Z",
        read: false
      },
      {
        id: 10,
        title: "Application Viewed",
        message: "Google viewed your internship application.",
        createdAt: "2025-01-29T08:15:00Z",
        read: true
      }]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // selected notification



  useEffect(() => {
    fetch("http://localhost:5000/api/notifications")
      .then(res => res.json())
      .then(res => {
        setList(res.data || []);
        updateCount(res.data.filter(n => !n.read).length);
        setLoading(false);
      });
  }, []);

  // Mark single notification as read
  const openNotification = (item) => {
    setActive(item);

    if (!item.read) {
      fetch(`http://localhost:5000/api/notifications/${item.id}/read`, {
        method: "PATCH",
      });

      setList(prev =>
        prev.map(n =>
          n.id === item.id ? { ...n, read: true } : n
        )
      );
      updateCount(c => c - 1);
    }
  };

  // Clear all notifications
  const clearAll = () => {
    setList([]);
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("recruiterToken") ||
      localStorage.getItem("adminToken");

    fetch("http://localhost:5000/api/notifications/clear-all", {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    updateCount(0);
    setActive(null);
  };

  return (
    <div className="absolute right-0 mt-2 pb-2 w-[360px] h-[60vh] h-max-[60vh]
      bg-white rounded-md shadow-2xl  z-50">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white-400">
        <div className="flex items-center gap-2">
          {active && (
            <button onClick={() => setActive(null)}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h3 className="text-sm font-semibold">
            {active ? "Notification Detail" : "Notifications"}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY */}
      <div className="max-h-[48vh] overflow-y-auto">

        {/* Loading */}
        {loading && (
          <p className="p-4 text-center text-sm text-slate-500">
            Loading...
          </p>
        )}

        {/* LIST VIEW */}
        {!loading && !active && list.length === 0 && (
          <div className="p-6 text-center flex flex-col items-center gap-2">
            <Zap size={32} className="text-slate-400" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        )}

        {!active && list.map(item => (
          <div
            key={item.id}
            onClick={() => openNotification(item)}
            className={`px-4 py-3 border-b cursor-pointer hover:bg-slate-50
            ${!item.read ? "bg-blue-50" : ""}`}
          >
            <div className="flex gap-3">
              {!item.read && (
                <span className="mt-2 w-2 h-2 bg-blue-600 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[260px]">
                  {item.message}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* DETAIL VIEW */}
        {active && (
          <div className="p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">
              {active.title}
            </h4>

            <p className="text-sm text-slate-600 leading-relaxed">
              {active.message}
            </p>

            <p className="text-xs text-slate-400">
              {new Date(active.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {!active && list.length > 0 && (
        <div className="flex justify-between items-center px-4 py-2 border-t">
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>

          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
