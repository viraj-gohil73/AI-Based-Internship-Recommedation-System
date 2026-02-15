import { Bell, Search, Menu } from "lucide-react";
import { useState } from "react";
import { useRecruiter } from "../context/RecruiterContext";
export default function RecruiterHeader({ title, onMenuClick }) {
  const [count] = useState(4);
  const { recruiter } = useRecruiter();

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg">
            <Search size={18} />
            <input
              className="ml-2 bg-transparent outline-none text-sm"
              placeholder="Search"
            />
          </div> */}

          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-[11px]
              bg-blue-600 text-white rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          
          <div className="w-9 h-9 lg:hidden rounded-full bg-blue-100
            flex items-center justify-center
            font-semibold text-blue-600">
            <img
              src={recruiter?.dp || "/default-avatar.png"}
              alt="Recruiter Avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
        </div>

         
      </div>
    </header>
  );
}
