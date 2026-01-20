import { useState } from "react";
import Sidebarcompany from "../components/Siderbarcompany";
import Headercompany from "../components/Headercompany";
import { Outlet } from "react-router-dom";

export default function CompanyLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <Sidebarcompany open={open} onClose={() => setOpen(false)} />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col ">
        <div className="sticky top-0 z-30">
          <Headercompany onMenuClick={() => setOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto ">
          <div className="bg-white shadow p-4 min-h-full ">
            <Outlet /> {/* 👈 yahin page render hoga */}
          </div>
        </main>
      </div>
    </div>
  );
}
