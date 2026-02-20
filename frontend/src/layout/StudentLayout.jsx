import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function StudentLayout({ children, title }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR (FIXED / STICKY) */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* HEADER (STICKY) */}
        <div className="sticky top-0 z-30">
          <Header title={title} onMenuClick={() => setOpen(true)} />
        </div>

        {/* BODY (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto ">
          <div className="bg-white  shadow min-h-full">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
