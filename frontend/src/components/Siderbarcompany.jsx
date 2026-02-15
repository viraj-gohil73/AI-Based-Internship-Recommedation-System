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
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-sm font-semibold transition-all duration-300 group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-100 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-red-00 before:rounded-r-lg"
                    : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-md"
                }`
              }
            >
              <item.icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="flex-1">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-blue-200 bg-gradient-to-b from-transparent via-blue-50 to-blue-50">
          {/* Profile Card */}
          <div className="p-4 m-3 flex items-center gap-3 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
            <div className="w-12 h-12 rounded-full border-2 border-blue-300 bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company.companyName}
                  className="w-full h-full object-cover"
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
              <p className="text-sm font-bold text-gray-900 truncate">
                {company?.companyName || "Company"}
              </p>
              <p className="text-xs text-gray-500 truncate group-hover:text-blue-600 transition-colors duration-300">
                {company?.email || "No email"}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            >
              <LogOut size={18} className="transition-transform duration-300 group-hover:rotate-180" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
