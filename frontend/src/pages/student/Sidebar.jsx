import { useEffect, useMemo, useState } from "react";
import {
  User,
  LogOut,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({ active, setActive }) {
  const [open, setOpen] = useState(false);
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const [student, setStudent] = useState(() => getStoredUser());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();

    fetch("http://localhost:5000/api/student/profile", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const profile = data?.profile || data?.user;
        if (!profile) return;

        setStudent((prev) => {
          const firstName = profile.firstName || profile.fname || prev?.firstName || prev?.fname || "";
          const lastName = profile.lastName || profile.lname || prev?.lastName || prev?.lname || "";
          const merged = {
            ...(prev || {}),
            ...profile,
            firstName,
            lastName,
            fname: firstName,
            lname: lastName,
            name:
              profile.name ||
              `${firstName} ${lastName}`.trim() ||
              prev?.name ||
              "",
            email: profile.email || prev?.email || "",
            dp: profile.dp || profile.avatar || prev?.dp || prev?.avatar || "",
            avatar: profile.avatar || profile.dp || prev?.avatar || prev?.dp || "",
          };

          localStorage.setItem("user", JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const sync = () => setStudent(getStoredUser());

    window.addEventListener("storage", sync);
    window.addEventListener("student-profile-updated", sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("student-profile-updated", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const studentName = useMemo(() => {
    const fullName =
      student?.name?.trim() ||
      `${student?.firstName || student?.fname || ""} ${student?.lastName || student?.lname || ""}`.trim();
    return fullName || student?.email?.split("@")?.[0] || "Student";
  }, [student]);

  const studentEmail = student?.email?.trim() || "No email";
  const studentDp = student?.dp || student?.avatar || "";
  const studentInitials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "ST";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "recommended", label: "Recommended", icon: Briefcase },
    { id: "browse", label: "Browse All", icon: Building2 },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-900">InternMatch AI</h1>
          <p className="text-xs text-gray-500">Student Portal</p>
        </div>

        <button onClick={() => setOpen(true)} aria-label="Open sidebar">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-50 w-64 h-screen bg-white border-r border-slate-200 shadow-lg flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-5">
          <div>
            <h1 className="text-lg font-bold text-blue-600">Student Panel</h1>
            <p className="text-xs text-gray-500">InternMatch AI</p>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left font-semibold transition-all duration-300 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-blue-200 bg-gradient-to-b from-transparent via-blue-50 to-blue-50">
          <div className="p-2 m-3 flex items-center gap-3 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full border-2 border-blue-300 bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-md">
              {studentDp ? (
                <img src={studentDp} alt="Student profile" className="w-full h-full object-cover" />
              ) : (
                studentInitials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {studentName}
              </p>
              <p className="text-xs text-gray-500 truncate">{studentEmail}</p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={() => console.log("Logout clicked")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
