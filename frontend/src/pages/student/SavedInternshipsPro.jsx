// SavedInternshipsPro_Upgraded.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  BookmarkX,
  Bookmark,
  Briefcase,
  Clock,
  ArrowRight,
  Calendar,
  X,
  MapPin,
  ChevronLeft,
  Trash2,
} from "lucide-react";

/**
 * Upgraded Saved Internships Page
 * - Confirmation centered modal (Popup A)
 * - Material-style bottom snackbar with Undo (Snackbar 1)
 * - Smooth remove animation + exit
 * - Radio buttons for "Type" filter (single-select)
 * - Fully responsive
 *
 * Uses uploaded sample asset path as sample image URL:
 * "/mnt/data/da22bf33-67c5-47d8-9e1c-655209219993.png"
 */

const sampleAsset = "/mnt/data/da22bf33-67c5-47d8-9e1c-655209219993.png";

const INITIAL_SAVED = [
  {
    id: "S-2001",
    title: "React Frontend Intern",
    company: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo.svg",
    location: "Remote",
    type: "Full-time",
    stipend: "₹25,000 / month",
    postedOn: "2025-01-12",
    deadline: "2025-02-10",
  },
  {
    id: "S-2002",
    title: "Python Backend Intern",
    company: "Flipkart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Flipkart_logo.png",
    location: "Bangalore",
    type: "Part-time",
    stipend: "₹20,000 / month",
    postedOn: "2025-01-18",
    deadline: "2025-02-15",
  },
  {
    id: "S-2003",
    title: "AI/ML Research Intern",
    company: "OpenAI",
    logo: "",
    location: "Hyderabad",
    type: "Remote",
    stipend: "₹30,000 / month",
    postedOn: "2025-01-22",
    deadline: "2025-02-12",
  },
  {
    id: "S-2004",
    title: "UI/UX Design Intern",
    company: "Swiggy",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png",
    location: "Delhi",
    type: "Hybrid",
    stipend: "₹18,000 / month",
    postedOn: "2025-01-10",
    deadline: "2025-02-05",
  },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SavedInternshipsProUpgraded() {
  // main data state (saved list)
  const [savedList, setSavedList] = useState(INITIAL_SAVED);

  // filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All"); // radio: All / Remote / Full-time / Part-time / Hybrid
  const [locationFilter, setLocationFilter] = useState("");

  // UI
  const [viewMode, setViewMode] = useState("compact"); // cards | compact
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemoveId, setToRemoveId] = useState(null);

  // undo snackbar
  const [snackbar, setSnackbar] = useState({ open: false, item: null });
  const undoTimerRef = useRef(null);

  // compute filtered list
  const filtered = useMemo(() => {
    let list = savedList.slice();
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "All") {
      list = list.filter((i) => i.type === typeFilter);
    }
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      list = list.filter((i) => i.location.toLowerCase().includes(loc));
    }
    return list;
  }, [savedList, search, typeFilter, locationFilter]);

  // ---------- Handlers ----------
  function handleRequestRemove(id) {
    // open confirmation modal
    setToRemoveId(id);
    setConfirmOpen(true);
  }

  function confirmRemove() {
    if (!toRemoveId) {
      setConfirmOpen(false);
      return;
    }
    // find item and remove from list, but keep copy for undo
    const removedItem = savedList.find((s) => s.id === toRemoveId);
    setSavedList((prev) => prev.filter((s) => s.id !== toRemoveId));

    // show snackbar with undo
    setSnackbar({ open: true, item: removedItem });

    // auto-dismiss snackbar after 6s and clear undo data
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setSnackbar({ open: false, item: null });
      undoTimerRef.current = null;
    }, 6000);

    // close modal
    setConfirmOpen(false);
    setToRemoveId(null);
  }

  function cancelRemove() {
    setConfirmOpen(false);
    setToRemoveId(null);
  }

  function handleUndo() {
    // restore item if exists
    if (snackbar.item) {
      setSavedList((prev) => [snackbar.item, ...prev]);
    }
    // hide snackbar and clear timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setSnackbar({ open: false, item: null });
  }

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // remove permanently (if wanted) - in this demo, removal is immediate; undo restores client state
  // In real app integrate backend remove call and support optimistic updates & rollback.

  // helper to toggle saved state (bookmarks) - here simply remove
  function handleUnsave(id) {
    handleRequestRemove(id);
  }

  // mobile filter modal close helper
  function applyMobileFilters() {
    setFilterOpen(false);
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* LEFT FILTER (DESKTOP) */}
        <aside className="hidden md:block col-span-1 sticky top-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              <button
                onClick={() => {
                  setTypeFilter("All");
                  setLocationFilter("");
                  setSearch("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                className="mt-2 input-box text-sm"
                placeholder="e.g., Bangalore"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Internship Type</label>

              {/* Radio buttons */}
              <div className="mt-2 flex flex-col gap-2">
                {["All", "Remote", "Full-time", "Part-time", "Hybrid"].map((t) => (
                  <label key={t} className="inline-flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="typeFilter"
                      value={t}
                      checked={typeFilter === t}
                      onChange={() => setTypeFilter(t)}
                      className="form-radio h-4 w-4 accent-purple-600"
                    />
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="col-span-3">
          {/* Top controls */}
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
            <div className="flex items-center bg-white shadow rounded-xl px-4 py-2 flex-1">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                className="ml-2 w-full outline-none text-sm"
                placeholder="Search saved internships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
            

              <button
                onClick={() => setFilterOpen(true)}
                className="px-4 py-2 border rounded-xl flex md:hidden items-center gap-2 text-sm"
              >
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Saved Internships</h3>
            <p className="text-gray-500 text-sm">{filtered.length} results</p>
          </div>

          {/* List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center border rounded-xl bg-white shadow-sm text-gray-500">
                  No saved internships found.
                </motion.div>
              )}

              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, height: 0, margin: 0, padding: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`bg-white border rounded-2xl shadow-sm p-4 ${viewMode === "compact" ? "flex items-center justify-between" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={item.logo || sampleAsset} alt={item.company} className="w-12 h-12 object-contain rounded" />
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.company}</p>

                      <div className="flex gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex gap-1 items-center"><MapPin size={14} /> {item.location}</span>
                        <span className="flex gap-1 items-center"><Briefcase size={14} /> {item.type}</span>
                        <span className="flex gap-1 items-center"><Clock size={14} /> {formatDate(item.postedOn)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <button
                      onClick={() => setSelected(item)}
                      className="hidden md:flex px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm items-center gap-2"
                    >
                      View <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => handleUnsave(item.id)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-red-50"
                      aria-label="Remove saved internship"
                      title="Remove saved internship"
                    >
                      <BookmarkX className="text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Slide-over detail */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50">
            <div className="border-b p-5 flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft size={18} /></button>
              <div>
                <h3 className="text-lg font-semibold">{selected.title}</h3>
                <p className="text-sm text-gray-500">{selected.company}</p>
              </div>
            </div>

            <div className="p-5 overflow-auto h-[calc(100vh-80px)]">
              <img src={selected.logo || sampleAsset} className="w-20 h-20 object-contain mb-2" alt="" />
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-gray-700"><MapPin size={16} /> {selected.location}</p>
                <p className="flex items-center gap-2 text-gray-700"><Briefcase size={16} /> {selected.type}</p>
                <p className="text-gray-600 text-sm">Posted: {formatDate(selected.postedOn)}</p>
                <p className="flex items-center gap-2 text-gray-700"><Calendar size={16} /> Deadline: {formatDate(selected.deadline)}</p>

                <div className="bg-gray-50 border rounded-xl p-3">
                  <h4 className="font-semibold mb-1">Stipend</h4>
                  <p className="text-gray-800">{selected.stipend}</p>
                </div>

                <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium">Apply Now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centered Confirmation Modal (Popup A) */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* blurred backdrop */}
            <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to remove this internship from your saved list? You can undo this action for a short time.</p>

              <div className="flex items-center justify-end gap-3">
                <button onClick={cancelRemove} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
                <button onClick={confirmRemove} className="px-4 py-2 rounded-md bg-red-600 text-white text-sm">Yes, Remove</button>
              </div>

              {/* small close button top-right */}
              <button onClick={cancelRemove} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100">
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material-style bottom snackbar with Undo */}
      <AnimatePresence>
        {snackbar.open && snackbar.item && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(640px,calc(100%-32px))]"
          >
            <div className="bg-white border shadow-lg rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md overflow-hidden">
                  <img src={snackbar.item.logo || sampleAsset} alt="removed" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Saved internship removed</div>
                  <div className="text-sm text-gray-500">{snackbar.item.title} • {snackbar.item.company}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleUndo} className="px-3 py-1 rounded-md bg-gray-100 text-sm">Undo</button>
                <button onClick={() => { setSnackbar({ open: false, item: null }); if (undoTimerRef.current) { clearTimeout(undoTimerRef.current); undoTimerRef.current = null; } }} className="px-3 py-1 rounded-md border text-sm">Dismiss</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile filters modal */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 md:hidden">
            <motion.div initial={{ y: "30%" }} animate={{ y: 0 }} exit={{ y: "30%" }} className="absolute bottom-0 w-full bg-white rounded-t-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Filters</h4>
                <button onClick={() => setFilterOpen(false)} className="p-2"><X /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input className="input-box mt-2 text-sm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-2 flex flex-col gap-2">
                    {["All", "Remote", "Full-time", "Part-time", "Hybrid"].map((t) => (
                      <label key={t} className="inline-flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="typeMobile" value={t} checked={typeFilter === t} onChange={() => setTypeFilter(t)} className="form-radio h-4 w-4 accent-purple-600" />
                        <span className="text-sm text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { applyMobileFilters(); }} className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Apply</button>
                  <button onClick={() => { setTypeFilter("All"); setLocationFilter(""); setFilterOpen(false); }} className="flex-1 py-3 rounded-lg border">Reset</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small styles */}
      <style>{`
        .input-box {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fbfdff;
          border: 1px solid #e5e8ef;
          outline: none;
          transition: border .15s, box-shadow .15s;
        }
        .input-box:focus {
          border-color: #6b46ff;
          box-shadow: 0 8px 30px rgba(99,102,241,.06);
        }
        .form-radio { /* ensure visible on older browsers */
          -webkit-appearance: none;
          appearance: none;
          border: 1px solid #cbd5e1;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: inline-block;
          position: relative;
        }
        .form-radio:checked {
          background: linear-gradient(90deg,#6b46ff,#4f46e5);
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}
