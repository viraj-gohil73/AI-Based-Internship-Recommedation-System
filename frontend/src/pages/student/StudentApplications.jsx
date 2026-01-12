// StudentApplicationsPro.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  Eye,
  X,
  ChevronDown,
  Sliders,
  ChevronLeft,
} from "lucide-react";

/**
 * Professional Student Applications Page (single file)
 * - Tailwind + Framer Motion
 * - Responsive: sidebar on desktop, modal filters on mobile
 * - Slide-over application detail panel with timeline
 *
 * IMPORTANT: sampleAsset uses your uploaded local path (will be transformed to a URL).
 * File path used: /mnt/data/da22bf33-67c5-47d8-9e1c-655209219993.png
 */

const sampleAsset = "/mnt/data/da22bf33-67c5-47d8-9e1c-655209219993.png";

const ALL_STATUSES = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

const sampleApplications = [
  {
    id: "A-1024",
    title: "Frontend Developer Intern",
    company: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    appliedOn: "2025-01-18",
    status: "Interview",
    location: "Bengaluru, India",
    resumeViewed: true,
    deadline: "2025-02-05",
    progress: 3,
    recruiter: { name: "Rina Gupta", email: "rina@google.com" },
    notes: "Focus on React & performance. Portfolio required.",
  },
  {
    id: "A-1025",
    title: "AI/ML Intern",
    company: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    appliedOn: "2025-01-10",
    status: "Shortlisted",
    location: "Hyderabad, India",
    resumeViewed: false,
    deadline: "2025-02-10",
    progress: 2,
    recruiter: { name: "Amit Kumar", email: "amit@microsoft.com" },
    notes: "Strong math fundamentals necessary. Kaggle projects preferred.",
  },
  {
    id: "A-1026",
    title: "Backend Developer Intern",
    company: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    appliedOn: "2025-01-12",
    status: "Applied",
    location: "Remote",
    resumeViewed: false,
    deadline: "2025-02-03",
    progress: 1,
    recruiter: { name: "Neha Sharma", email: "neha@amazon.com" },
    notes: "Experience with Node.js/Go is a plus.",
  },
  {
    id: "A-1027",
    title: "UI/UX Design Intern",
    company: "Zomato",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
    appliedOn: "2025-01-05",
    status: "Selected",
    location: "Delhi, India",
    resumeViewed: true,
    deadline: "Closed",
    progress: 4,
    recruiter: { name: "Rajat Verma", email: "rajat@zomato.com" },
    notes: "Portfolio review done. Offer extended.",
  },
];

// Utility: human date formatting
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// Small Badge component
function StatusBadge({ status }) {
  const map = {
    Applied: "bg-purple-100 text-purple-700",
    Shortlisted: "bg-yellow-100 text-yellow-800",
    Interview: "bg-indigo-100 text-indigo-700",
    Selected: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function StudentApplicationsPro() {
  // UI state
  const [query, setQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState(new Set()); // multiple statuses
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent | deadline | status
  const [bookmarks, setBookmarks] = useState(new Set());
  const [viewMode, setViewMode] = useState("cards"); // cards | compact
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // data — in production this would come from API + pagination
  const applications = sampleApplications;

  // Filtering + sorting logic
  const filtered = useMemo(() => {
    let list = applications.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    if (statusFilters.size) {
      list = list.filter((a) => statusFilters.has(a.status));
    }

    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      list = list.filter((a) => a.location.toLowerCase().includes(loc));
    }

    if (sortBy === "recent") {
      list.sort((x, y) => new Date(y.appliedOn) - new Date(x.appliedOn));
    } else if (sortBy === "deadline") {
      list.sort((x, y) => new Date(x.deadline) - new Date(y.deadline));
    } else if (sortBy === "status") {
      const order = { Applied: 1, Shortlisted: 2, Interview: 3, Selected: 4, Rejected: 5 };
      list.sort((x, y) => (order[x.status] || 99) - (order[y.status] || 99));
    }

    return list;
  }, [applications, query, statusFilters, locationFilter, sortBy]);

  // Pagination (client-side demo)
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // handlers
  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters((prev) => {
      const s = new Set(prev);
      if (s.has(status)) s.delete(status);
      else s.add(status);
      setPage(1);
      return s;
    });
  };

  const clearFilters = () => {
    setStatusFilters(new Set());
    setLocationFilter("");
    setQuery("");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Left: Filters (desktop) */}
        <aside className="hidden md:block md:w-72 sticky top-6 self-start">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-2 flex flex-col gap-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatusFilter(s)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition ${
                      statusFilters.has(s) ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow" : "bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                className="mt-2 input-box text-sm"
                placeholder="e.g., Bengaluru, Remote"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-2 input-box text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="deadline">Deadline</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Quick Actions</h4>
            <div className="flex flex-col gap-2">
              <button className="text-sm px-3 py-2 rounded-md bg-purple-600 text-white flex items-center gap-2 justify-center">
                <ArrowRight size={14} /> Apply to new internships
              </button>
              <button className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50 flex items-center gap-2 justify-center">
                <Sliders size={14} /> Manage alerts
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top bar: search + view + filters (mobile) */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2 flex-1">
              <Search size={18} className="text-gray-500" />
              <input
                className="ml-3 outline-none text-sm w-full"
                placeholder="Search by role, company or application ID..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-2 items-center">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-2 rounded-md text-sm ${viewMode === "cards" ? "bg-gray-900 text-white" : "bg-white border"}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-3 py-2 rounded-md text-sm ${viewMode === "compact" ? "bg-gray-900 text-white" : "bg-white border"}`}
                >
                  Compact
                </button>
              </div>

              {/* mobile filters */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="px-3 py-2 rounded-md bg-white border flex items-center gap-2 text-sm md:hidden"
              >
                <Filter size={16} /> Filters
              </button>

              {/* sort */}
              <div className="hidden md:block">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-box text-sm">
                  <option value="recent">Most Recent</option>
                  <option value="deadline">Deadline</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Applications count + empty state */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Applications</h3>
              <p className="text-sm text-gray-500 mt-1">{filtered.length} results</p>
            </div>

            <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
          </div>

          {/* Applications list */}
          <div className="space-y-4">
            <AnimatePresence>
              {pageItems.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-500">
                  No applications found. Try changing filters or search.
                </motion.div>
              )}

              {pageItems.map((app) => (
                <motion.article
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="bg-white rounded-2xl border shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex items-center gap-4 md:w-2/3">
                    <img src={app.logo || sampleAsset} alt={`${app.company} logo`} className="w-12 h-12 object-contain rounded" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-md font-semibold text-gray-800 truncate">{app.title}</h4>
                          <div className="text-sm text-gray-500 mt-1">{app.company} · <span className="text-gray-400">{app.location}</span></div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end gap-2">
                          <div className="text-xs text-gray-500">Applied</div>
                          <div className="text-sm font-medium text-gray-700">{formatDate(app.appliedOn)}</div>
                        </div>
                      </div>

                      {/* extra row small */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} /> Deadline: {app.deadline}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {app.resumeViewed ? <Eye size={14} className="text-green-600" /> : <Eye size={14} className="text-gray-300" />}
                          <span>{app.resumeViewed ? "Viewed" : "Not viewed"}</span>
                        </div>
                      </div>

                      {/* progress bar (compact) */}
                      <div className="mt-3 md:mt-4">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(app.progress / 4) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full ${app.progress >= 3 ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gradient-to-r from-purple-400 to-purple-600"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between md:justify-end md:w-1/3">
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={app.status} />
                      <div className="text-sm text-gray-500">{app.id}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleBookmark(app.id)}
                        aria-label="bookmark"
                        className="p-2 rounded-md hover:bg-gray-50"
                      >
                        {bookmarks.has(app.id) ? <BookmarkCheck className="text-purple-600" /> : <Bookmark className="text-gray-400" />}
                      </button>

                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm flex items-center gap-2"
                      >
                        View <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">Showing {Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length} applications</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-md bg-white border hover:bg-gray-50"
              >
                Prev
              </button>
              <div className="px-3 py-2 text-sm">{page}</div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-md bg-white border hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Slide-over detail panel */}
      <AnimatePresence>
        {selectedApp && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-white shadow-2xl z-50"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedApp(null)} className="p-2 rounded-md hover:bg-gray-100">
                  <ChevronLeft size={18} />
                </button>
                <div>
                  <div className="text-lg font-semibold">{selectedApp.title}</div>
                  <div className="text-sm text-gray-500">{selectedApp.company} • {selectedApp.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={selectedApp.status} />
                <div className="text-sm text-gray-500">Applied {formatDate(selectedApp.appliedOn)}</div>
              </div>
            </div>

            <div className="p-5 overflow-auto h-[calc(100vh-88px)]">
              <div className="grid grid-cols-1 gap-4">
                {/* recruiter */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <img src={selectedApp.logo || sampleAsset} alt="company" className="w-14 h-14 object-contain rounded" />
                  <div>
                    <div className="font-medium text-gray-800">{selectedApp.recruiter?.name}</div>
                    <div className="text-sm text-gray-500">{selectedApp.recruiter?.email}</div>
                    <div className="text-sm text-gray-500 mt-2">Application ID: <span className="font-medium">{selectedApp.id}</span></div>
                  </div>
                </div>

                {/* timeline */}
                <div className="bg-white rounded-xl p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">Application Timeline</h4>
                    <div className="text-sm text-gray-500">Progress</div>
                  </div>

                  <ol className="space-y-3">
                    {["Applied", "Shortlisted", "Interview", "Selected"].map((step, idx) => {
                      const done = idx + 1 <= selectedApp.progress;
                      return (
                        <li key={step} className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${done ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className={`${done ? "text-gray-800 font-medium" : "text-gray-600"}`}>{step}</div>
                            <div className="text-xs text-gray-400">{done ? `${step} completed (${formatDate(selectedApp.appliedOn)})` : "Pending"}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* notes & resume */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Recruiter Notes</h5>
                    <p className="text-sm text-gray-600">{selectedApp.notes}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border flex items-center gap-4">
                    <img src={selectedApp.resumeViewed ? sampleAsset : sampleAsset} alt="resume" className="w-20 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Resume (uploaded)</div>
                      <div className="text-sm text-gray-500">Last viewed: {selectedApp.resumeViewed ? "Recruiter recently viewed" : "Not viewed yet"}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <a href={sampleAsset} target="_blank" rel="noreferrer" className="text-sm text-purple-600">Preview</a>
                      <button className="px-3 py-1 rounded-md bg-purple-600 text-white text-sm">Download</button>
                    </div>
                  </div>
                </div>

                {/* actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Message recruiter</button>
                  <button className="px-4 py-2 rounded-md border">Withdraw application</button>
                  <button onClick={() => toggleBookmark(selectedApp.id)} className="p-2 rounded-md border">
                    {bookmarks.has(selectedApp.id) ? <BookmarkCheck className="text-purple-600" /> : <Bookmark className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile filters modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-end md:hidden"
          >
            <motion.div initial={{ y: "30%" }} animate={{ y: 0 }} exit={{ y: "30%" }} className="w-full bg-white rounded-t-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Filters</h4>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-md"><X /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleStatusFilter(s)}
                        className={`px-3 py-2 rounded-md text-sm ${statusFilters.has(s) ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" : "bg-gray-50"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="input-box mt-2 text-sm" placeholder="e.g., Remote, Bengaluru" />
                </div>

                <div>
                  <label className="text-sm font-medium">Sort by</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-box mt-2 text-sm w-full">
                    <option value="recent">Most recent</option>
                    <option value="deadline">Closest deadline</option>
                    <option value="status">By status</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => { setMobileFiltersOpen(false); setPage(1);} } className="flex-1 px-4 py-2 rounded-md bg-purple-600 text-white">Apply</button>
                  <button onClick={() => { clearFilters(); setMobileFiltersOpen(false); }} className="flex-1 px-4 py-2 rounded-md border">Reset</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        .input-box {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fbfdff;
          border: 1px solid #eef2f7;
          outline: none;
          transition: box-shadow .15s, border-color .12s;
        }
        .input-box:focus {
          border-color: rgba(99,102,241,0.9);
          box-shadow: 0 10px 30px rgba(99,102,241,0.06);
        }
      `}</style>
    </div>
  );
}
