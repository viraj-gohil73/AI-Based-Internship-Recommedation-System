import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function StudentLayout({ children, title }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30">
          <Header title={title} onMenuClick={() => setOpen(true)} />
        </div>

        <main ref={bodyRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="bg-white shadow min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
