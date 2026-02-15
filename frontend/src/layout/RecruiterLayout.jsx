import { useState } from "react";
import RecruiterHeader from "../components/HeaderRecruiter";
import SidebarRecruiter from "../components/SidebarRecruiter";
import { Outlet } from "react-router-dom";

export default function RecruiterLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <SidebarRecruiter open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30">
          <RecruiterHeader onMenuClick={() => setOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="bg-white shadow  min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
