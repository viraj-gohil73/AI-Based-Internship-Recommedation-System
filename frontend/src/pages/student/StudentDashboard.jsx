import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, Settings, HelpCircle, LogOut } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
            IA
          </div>
          <h1 className="text-xl font-semibold">InternAI</h1>
        </motion.div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-[350px]">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search internships, companies..."
            className="bg-transparent outline-none ml-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 relative">
        {/* Notification Icon */}
        <motion.div 
          whileHover={{ scale: 1.15 }} 
          transition={{ duration: 0.2 }}
          className="relative cursor-pointer"
        >
          <Bell size={22} className="text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </motion.div>

        {/* Profile Avatar */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold cursor-pointer"
        >
          SJ
        </motion.div>

        {/* Dropdown Animation */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 w-60 bg-white shadow-xl rounded-xl border p-3 z-50"
            >
              <div className="p-3 border-b">
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-500">sarah.j@university.edu</p>
              </div>

              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                className="py-2 text-sm"
              >
                {[
                  { icon: User, label: "Profile" },
                  { icon: Settings, label: "Settings" },
                  { icon: HelpCircle, label: "Help & Support" },
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                  >
                    <item.icon size={18} /> {item.label}
                  </motion.li>
                ))}

                {/* Logout item */}
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0 },
                  }}
                  whileHover={{ scale: 1.03, backgroundColor: "#fee2e2" }}
                  className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg cursor-pointer"
                >
                  <LogOut size={18} /> Log Out
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
