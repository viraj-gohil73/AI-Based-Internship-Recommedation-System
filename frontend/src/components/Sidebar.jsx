import {
  Brain, Search, GraduationCap,
  FileText, Bookmark, User, MessageSquare,
  Settings, LogOut, X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const getInitialStudent = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const mergeProfile = (base = {}, profile = {}) => {
    const firstName = profile.firstName || profile.fname || base.firstName || base.fname || "";
    const lastName = profile.lastName || profile.lname || base.lastName || base.lname || "";
    const name = (
      profile.name ||
      `${firstName} ${lastName}`.trim() ||
      base.name ||
      ""
    ).trim();

    return {
      ...base,
      ...profile,
      firstName,
      lastName,
      fname: firstName,
      lname: lastName,
      name,
      email: profile.email || base.email || "",
      dp: profile.dp || profile.avatar || base.dp || base.avatar || "",
    };
  };

  const [student, setStudent] = useState(() => {
    return getInitialStudent();
  });

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
          const merged = mergeProfile(prev, profile);
          localStorage.setItem("user", JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const syncFromStorage = () => setStudent(getInitialStudent());
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("student-profile-updated", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("student-profile-updated", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login-student", { replace: true });
  };

  const menu = [
    { name: "Smart Recommendations", icon: Brain, path: "/student/ai-recommend" },
    { name: "Browse Internships", icon: Search, path: "/student/explore" },
    { name: "My  Applications", icon: GraduationCap, path: "/student/applied" },
    { name: "Feedback History", icon: MessageSquare, path: "/student/feedback-history" },
    // { name: "My Resume", icon: FileText, path: "/student/resume" },
    { name: "Saved Intenship", icon: Bookmark, path: "/student/watchlist" },
    { name: "My Profile", icon: User, path: "/student/profile" },
    { name: "Settings", icon: Settings, path: "/student/settings" },
  ];

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static z-50 w-72 h-screen bg-white border-r border-slate-200 shadow-lg flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between p-5">
          <span className="text-lg font-bold text-blue-600">Student Panel</span>
          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {menu.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-300 group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-r-lg"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                }`
              }
            >
              <item.icon
                size={20}
                className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="flex-1">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-blue-200 bg-gradient-to-b from-transparent via-blue-50 to-blue-50">
          <div className="p-2 m-3 flex items-center gap-3 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="w-12 h-12 rounded-full border-2 border-blue-300 bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-md">
              {studentDp ? (
                <img src={studentDp} alt="Student profile" className="w-full h-full object-cover" />
              ) : (
                studentInitials
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{studentName}</p>
              <p className="text-xs text-gray-500 truncate group-hover:text-blue-600 transition-colors duration-300">
                {studentEmail}
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

