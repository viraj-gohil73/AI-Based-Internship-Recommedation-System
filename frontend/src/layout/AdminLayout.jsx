import { Outlet } from "react-router-dom";
import Sidebaradmin from "../components/Sidebaradmin";
import Headeradmin from "../components/Headeradmin";
import { useState } from "react";
export default function AdminLayout() {
    const [open, setOpen] = useState(false);
  return (
    <div className="admin-ui flex h-screen bg-slate-50 overflow-hidden">
      <Sidebaradmin open={open} onClose={() => setOpen(false)}/>

      <div className="flex-1 flex flex-col">
              <div className="sticky top-0 z-30">
                <Headeradmin onMenuClick={() => setOpen(true)} />
              </div>
      
              <main className="flex-1 overflow-y-auto">
                <div className="bg-white shadow p-4 min-h-full">
                  <Outlet /> {/* 👈 yahin page render hoga */}
                </div>
              </main>
            </div>
    </div>
  );
}
