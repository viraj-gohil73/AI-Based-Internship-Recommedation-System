import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  CreditCard,
  Bell,
  Building2,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecruiter  } from "../context/RecruiterContext";

export default function SidebarRecruiter({ open, onClose }) {
  //const [company , setcompany] = [];
  const navigate = useNavigate();
  const { recruiter } = useRecruiter ();

  const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/recruiter/dashboard",
  },
  {
    name: "Internships",
    icon: Briefcase,
    path: "/recruiter/internships",
  },
  {
    name: "Applicants",
    icon: Users,
    path: "/recruiter/applicants",
  },
  {
  name: "Analytics",
  icon: BarChart3,
  path: "/recruiter/analytics",
},
  {
    name: "Settings",
    icon: Settings,
    path: "/recruiter/settings",
  },
];


  const handleLogout = () => {
    localStorage.removeItem("recruiterToken");
    navigate("/auth/recruiter/login", { replace: true });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static z-50 w-72 h-screen bg-white border-r-2 border-slate-200 shadow-lg flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <span className="text-lg font-bold text-blue-600">
            {recruiter?.name || "Company"}
          </span>
          <button onClick={onClose} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 mb-2 px-4 py-2 rounded-lg text-md font-medium
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-300">
          {/* Profile */}
          <div className="p-2 pt-3 pb-0 flex items-center gap-3 ">
            <div className="w-11 h-11 ml-3 rounded-full border border-slate-400 bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm overflow-hidden ">
              {recruiter?.dp ? (
                <img
                  src={recruiter.dp}
                  alt={recruiter.name}
                  className="w-full h-full object-cover "
                />
              ) : (
                <span>
                  {recruiter?.name
                    ? recruiter.name.charAt(0).toUpperCase()
                    : "C"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {recruiter?.name || "Company"}
              </p>
              <p className="text-xs text-gray-500">
                {recruiter?.email || "No email"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
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
