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
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-300 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg font-semibold truncate">
            {title}
          </h1>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 relative" ref={ref}>

          {/* SEARCH */}
          <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg">
            <Search size={18} className="text-slate-500" />
            <input
              className="ml-2 bg-transparent outline-none text-sm"
              placeholder="Search internships"
            />
          </div>

          {/* 🔔 NOTIFICATION BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-lg hover:bg-slate-100"
          >
            <Bell size={22} />

            {/* 🔢 UNREAD COUNT BADGE */}
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1
                w-5 h-5 text-[11px]
                bg-blue-600 text-white rounded-full
                flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </button>

          {/* 🔔 NOTIFICATION POPUP */}
          {open && (
    <div className="absolute right-0 top-full mt-2 z-50">
      <NotificationPopup
        onClose={() => setOpen(false)}
        updateCount={setCount}
      />
    </div>
          )}


          {/* PROFILE */}
          <div className="lg:hidden w-9 h-9 rounded-full bg-blue-100
            flex items-center justify-center
            font-semibold text-blue-600">
            <div className=" w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm overflow-hidden">
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
