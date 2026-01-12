import { useState } from "react";
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
  const [open, setOpen] = useState(false); // For Mobile Sidebar

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "recommended", label: "Recommended", icon: Briefcase },
    { id: "browse", label: "Browse All", icon: Building2 },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <>
      {/* ---------------------- MOBILE TOP NAV ---------------------- */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
        <div>
          <h1 className="text-xl font-bold text-gray-900">InternMatch AI</h1>
          <p className="text-xs text-gray-500">Student Portal</p>
        </div>

        <button onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* ---------------------- MOBILE SIDEBAR ---------------------- */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-white p-6 z-50 shadow-lg animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">InternMatch AI</h1>
                <p className="text-sm text-gray-500">Student Portal</p>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
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
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition ${
                      isActive ? "bg-black text-white shadow" : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom User */}
            <div className="mt-auto absolute bottom-4 left-0 w-full px-6">

              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Student Name</p>
                  <p className="text-xs text-gray-500">student@gmail.com</p>
                </div>
              </div>

              <button
                onClick={() => console.log("Logout clicked")}
                className="w-full flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-100"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------- DESKTOP SIDEBAR ---------------------- */}
      <aside className="hidden md:flex w-64 h-screen bg-white border-r p-6 flex-col">
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">InternMatch AI</h1>
          <p className="text-sm text-gray-500">Student Portal</p>
        </div>

        <div className="border-b my-4"></div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive ? "bg-black text-white shadow" : "hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="mt-auto w-full border-t pt-4">
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Student Name</p>
              <p className="text-xs text-gray-500">student@gmail.com</p>
            </div>
          </div>

          <button
            onClick={() => console.log("Logout clicked")}
            className="w-full flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-100"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
