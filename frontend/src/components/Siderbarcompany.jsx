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
import { useCompany } from "../context/CompanyContext";

export default function Sidebar_company({ open, onClose }) {
  const { company, loading } = useCompany();
  const navigate = useNavigate();

  const menu = [
    { name: "Overview", icon: LayoutDashboard, path: "/company/dashboard/overview" },
    { name: "Recruiters", icon: Users, path: "/company/dashboard/recruiters" },
    { name: "Internships", icon: Briefcase, path: "/company/dashboard/internships" },
    { name: "Analytics", icon: BarChart3, path: "/company/dashboard/analytics" },
    { name: "Review & Ratings", icon: Bell, path: "/company/dashboard/reviews" },
    { name: "Subscription", icon: CreditCard, path: "/company/dashboard/subscription" },
    { name: "Company Profile", icon: Building2, path: "/company/dashboard/profile" },
    { name: "Settings", icon: Settings, path: "/company/dashboard/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/company/login", { replace: true });
  };

  // 🔒 SAFE GUARD (VERY IMPORTANT)
  if (loading) {
    return null; // or skeleton
  }

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
        className={`fixed lg:static z-50 w-72 h-screen bg-white border-r-2 border-slate-300 shadow-lg flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <span className="text-lg font-bold text-blue-600">
            {company?.companyName || "Company"}
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
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="w-full h-full object-cover "
                />
              ) : (
                <span>
                  {company?.companyName
                    ? company.companyName.charAt(0).toUpperCase()
                    : "C"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {company?.companyName || "Company"}
              </p>
              <p className="text-xs text-gray-500">
                {company?.email || "No email"}
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
