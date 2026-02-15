import { Bell, Search, Menu } from "lucide-react";
import { useState, useRef } from "react";
import NotificationPopup from "./NotificationPopup";
import { useCompany } from "../context/CompanyContext";
export default function Header({ title, onMenuClick }) {

  // ✅ STATES (ONLY ONCE, INSIDE COMPONENT)
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(4);
  const { company, loading } = useCompany();
  const ref = useRef(null);
  if (loading) return null;


  


  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-white via-blue-50 to-white border-b border-blue-200 shadow-md px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition-all duration-200"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent truncate">
            {title}
          </h1>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4 relative" ref={ref}>

          {/* SEARCH */}
          <div className="hidden md:flex items-center bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
            <Search size={18} className="text-gray-500" />
            <input
              className="ml-3 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 focus:placeholder-gray-400 w-40"
              placeholder="Search internships..."
            />
          </div>


          {/* 🔔 NOTIFICATION BUTTON */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Show notifications"
            className="relative p-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition-all duration-300 group shadow-sm"
          >
            <span className="relative flex items-center justify-center">
              <Bell size={22} className="group-hover:scale-110 transition-transform duration-300" />
              {/* Bell pulse effect */}
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold shadow-lg border-2 border-white">{count}</span>
                </span>
              )}
            </span>
          </button>

          {/* 🔔 NOTIFICATION POPUP */}
          {open && (
            <div className="absolute right-0 top-full mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-xl shadow-2xl border border-blue-100 bg-white min-w-[320px] max-w-xs overflow-hidden">
                <NotificationPopup
                  onClose={() => setOpen(false)}
                  updateCount={setCount}
                />
              </div>
            </div>
          )}


          {/* PROFILE */}
          <div className="lg:hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
              {company?.logo ? (
                <img
                  src={company?.logo}
                  alt={company?.companyName}
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
          </div>

        </div>
      </div>
    </header>
  );
}
