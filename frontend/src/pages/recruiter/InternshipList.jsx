import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Ban, Search, Plus, MoreVertical, Briefcase, Globe, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InternshipList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [hoveredId, setHoveredId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // dummy data (replace with API)
  const internships = [
    { id: 1, title: "Frontend Intern", type: "Remote", status: "ACTIVE", mode: "Remote", applicants: 12 },
    { id: 2, title: "Backend Intern", type: "Onsite", status: "DISABLED", mode: "Onsite", applicants: 8 },
    { id: 3, title: "Full Stack Developer", type: "Hybrid", status: "ACTIVE", mode: "Hybrid", applicants: 15 },
    { id: 4, title: "UI/UX Designer", type: "Remote", status: "ACTIVE", mode: "Remote", applicants: 5 },
  ];

  const filtered = internships.filter((i) => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "ALL" || i.status === status;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    return status === "ACTIVE" 
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-red-100 text-red-700 border-red-300";
  };

  const getModeIcon = (mode) => {
    switch(mode) {
      case "Remote": return <Globe size={16} />;
      case "Onsite": return <MapPin size={16} />;
      case "Hybrid": return <Briefcase size={16} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Internship Listings
              </h1>
              <p className="text-gray-600">Manage and track your internship postings</p>
            </div>
            <Link
              to="/recruiter/internships/create"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-md"
            >
              <Plus size={20} />
              Post Internship
            </Link>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-white border border-blue-200 rounded-lg shadow-sm p-3"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2 text-blue-400" size={18} />
              <input
                type="text"
                placeholder="Search internship by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer transition bg-white font-medium text-gray-700"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Internship Title</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Mode</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Applicants</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {filtered.length > 0 ? (
                    filtered.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`border-t border-blue-100 transition text-sm ${
                          hoveredId === item.id ? "bg-blue-50" : "hover:bg-blue-25"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <Briefcase className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                              <p className="text-xs text-gray-500">ID: #{item.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm">
                            {getModeIcon(item.mode)}
                            {item.mode}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs"
                          >
                            {item.applicants}
                          </motion.div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`inline-block px-3 py-1 rounded-full font-semibold text-xs border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </motion.span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                              title="Disable"
                            >
                              <Ban size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center"
                        >
                          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                            <Briefcase className="text-blue-600" size={28} />
                          </div>
                          <p className="text-gray-600 font-medium text-lg">No internships found</p>
                          <p className="text-gray-500 text-sm mb-4">Try adjusting your search filters</p>
                          <Link
                            to="/recruiter/internships/create"
                            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold"
                          >
                            Post First Internship
                          </Link>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          {filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center text-sm text-gray-700"
            >
              <span className="font-medium">
                Showing <span className="text-blue-600 font-bold">{filtered.length}</span> of{" "}
                <span className="text-blue-600 font-bold">{internships.length}</span> internships
              </span>
              <span>
                Active: <span className="text-blue-600 font-bold">{internships.filter(i => i.status === "ACTIVE").length}</span>
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
