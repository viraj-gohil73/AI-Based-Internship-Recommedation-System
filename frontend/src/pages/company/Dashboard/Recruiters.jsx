import { useState } from "react";
import {
  Plus,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  User,
  Lock,
} from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function CompanyRecruiterManagement() {
  const [recruiters, setRecruiters] = useState([
    { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com", status: "Active", joined: "1/8/2026", avatar: null },
  { id: 2, name: "Bob Smith", email: "bob.smith@example.com", status: "Active", joined: "1/8/2026", avatar: null },
  { id: 3, name: "Charlie Davis", email: "charlie.davis@example.com", status: "Inactive", joined: "12/15/2025", avatar: null },
  { id: 4, name: "Diana Prince", email: "diana.p@example.com", status: "Active", joined: "1/2/2026", avatar: null },
  { id: 5, name: "Ethan Hunt", email: "e.hunt@example.com", status: "Pending", joined: "1/7/2026", avatar: null },
  { id: 6, name: "Fiona Gallagher", email: "fiona.g@example.com", status: "Active", joined: "11/20/2025", avatar: null },
  { id: 7, name: "George Miller", email: "george.m@example.com", status: "Active", joined: "1/5/2026", avatar: null },
  { id: 8, name: "Hannah Abbott", email: "hannah.a@example.com", status: "Inactive", joined: "10/12/2025", avatar: null },
  { id: 9, name: "Ian Wright", email: "ian.w@example.com", status: "Active", joined: "1/3/2026", avatar: null },
  { id: 10, name: "Julia Roberts", email: "julia.r@example.com", status: "Active", joined: "12/28/2025", avatar: null },
  { id: 11, name: "Kevin Hart", email: "kevin.h@example.com", status: "Pending", joined: "1/8/2026", avatar: null },
  { id: 12, name: "Laura Palmer", email: "laura.p@example.com", status: "Active", joined: "9/14/2025", avatar: null },
  { id: 13, name: "Michael Scott", email: "michael.s@example.com", status: "Inactive", joined: "8/22/2025", avatar: null },
  { id: 14, name: "Nina Simone", email: "nina.s@example.com", status: "Active", joined: "1/6/2026", avatar: null },
  { id: 15, name: "Oscar Wilde", email: "oscar.w@example.com", status: "Active", joined: "12/01/2025", avatar: null },
  { id: 16, name: "Peter Parker", email: "spidey@example.com", status: "Active", joined: "1/4/2026", avatar: null },
  { id: 17, name: "Quinn Fabray", email: "quinn.f@example.com", status: "Pending", joined: "1/7/2026", avatar: null },
  { id: 18, name: "Riley Reid", email: "riley.r@example.com", status: "Active", joined: "11/30/2025", avatar: null },
  { id: 19, name: "Steven Strange", email: "dr.strange@example.com", status: "Active", joined: "1/1/2026", avatar: null },
  { id: 20, name: "Tina Fey", email: "tina.f@example.com", status: "Inactive", joined: "12/10/2025", avatar: null },
  { id: 21, name: "Uma Thurman", email: "uma.t@example.com", status: "Active", joined: "1/5/2026", avatar: null },
  { id: 22, name: "Victor Stone", email: "cyborg@example.com", status: "Active", joined: "1/2/2026", avatar: null },
  { id: 23, name: "Wanda Maximoff", email: "wanda.m@example.com", status: "Active", joined: "12/24/2025", avatar: null },
  { id: 24, name: "Xavier Renegade", email: "x.renegade@example.com", status: "Pending", joined: "1/8/2026", avatar: null },
  { id: 25, name: "Yara Shahidi", email: "yara.s@example.com", status: "Active", joined: "10/05/2025", avatar: null },
  { id: 26, name: "Zane Grey", email: "zane.g@example.com", status: "Inactive", joined: "9/18/2025", avatar: null },
  { id: 27, name: "Arthur Morgan", email: "outlaw@example.com", status: "Active", joined: "1/7/2026", avatar: null },
  { id: 28, name: "Bella Swan", email: "bella.s@example.com", status: "Active", joined: "1/3/2026", avatar: null },
  { id: 29, name: "Chris Pratt", email: "c.pratt@example.com", status: "Pending", joined: "1/8/2026", avatar: null },
  { id: 30, name: "David Bowie", email: "starman@example.com", status: "Active", joined: "12/12/2025", avatar: null },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const addRecruiter = (data) => {
    setRecruiters((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...data,
        status: "pending",
        joined: new Date().toLocaleDateString(),
      },
    ]);
  };

  const toggleStatus = () => {
    setRecruiters((prev) =>
      prev.map((r) =>
        r.id === confirmAction.id
          ? {
              ...r,
              status: r.status === "Active" ? "Blocked" : "Active",
            }
          : r
      )
    );
    setConfirmAction(null);
  };

  /* ---------- SEARCH + PAGINATION ---------- */

  const filteredRecruiters = recruiters.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredRecruiters.length / ITEMS_PER_PAGE
  );

  const paginatedRecruiters = filteredRecruiters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
      <div className="bg-gray-50 min-h-screen p-2 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
           {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
          className="w-full sm:w-80 mb-2 px-4 py-2 border border-slate-400 rounded-lg outline-none focus:ring-1 focus:ring-blue-400"
        />

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 mb-2 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Recruiter
          </button>
        

       
</div>
        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full min-w-[800px] divide-y divide-gray-200">
            <thead className="bg-gray-100 text-sm text-gray-700 ">
              <tr>
                <th className="px-4 py-3 text-left">Recruiter</th>
                <th className="px-4 py-3 ">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecruiters.map((r) => (
                <tr key={r.id} className="border-t border-slate-300 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          r.avatar ||
                          `https://ui-avatars.com/api/?name=${r.name}`
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-gray-500">
                          Joined {r.joined}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 flex items-center gap-2 justify-start ">
                    <Mail size={15} className="mt-1" />
                    {r.email}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-3">
                    <ActionButtons
                      recruiter={r}
                      onView={setViewProfile}
                      onToggle={setConfirmAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedRecruiters.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              No recruiters found.
            </p>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {paginatedRecruiters.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    r.avatar ||
                    `https://ui-avatars.com/api/?name=${r.name}`
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    Joined {r.joined}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} />
                {r.email}
              </div>

              <StatusBadge status={r.status} />

              <ActionButtons
                recruiter={r}
                onView={setViewProfile}
                onToggle={setConfirmAction}
              />
            </div>
          ))}

          {paginatedRecruiters.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              No recruiters found.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Modals */}
        {showAdd && (
          <AddRecruiterModal
            onClose={() => setShowAdd(false)}
            onAdd={addRecruiter}
          />
        )}

        {viewProfile && (
          <ProfileModal
            recruiter={viewProfile}
            onClose={() => setViewProfile(null)}
          />
        )}

        {confirmAction && (
          <ConfirmModal
            recruiter={confirmAction}
            onCancel={() => setConfirmAction(null)}
            onConfirm={toggleStatus}
          />
        )}
      </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
  );
}

function ActionButtons({ recruiter, onView, onToggle }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onView(recruiter)}
        className="p-2 rounded-lg bg-blue-100 text-blue-600"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() => onToggle(recruiter)}
        className={`p-2 rounded-lg ${
          recruiter.status === "Active"
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {recruiter.status === "Active" ? (
          <Ban size={16} />
        ) : (
          <CheckCircle size={16} />
        )}
      </button>
    </div>
  );
}

function AddRecruiterModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
    avatarPreview: null,
  });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      avatar: file,
      avatarPreview: URL.createObjectURL(file),
    });
  };

  const submit = () => {
    if (!form.name || !form.email || !form.password) return;

    onAdd({
      name: form.name,
      email: form.email,
      password: form.password,
      avatar: form.avatarPreview,
    });

    onClose();
  };

  return (
    <Modal title="Add Recruiter" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={
              form.avatarPreview ||
              "https://ui-avatars.com/api/?name=Recruiter"
            }
            className="w-16 h-16 rounded-full object-cover border"
          />
          <label className="text-sm text-blue-600 cursor-pointer">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImage}
            />
          </label>
        </div>

        <Input
          icon={<User size={16} />}
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        <Input
          icon={<Mail size={16} />}
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <Input
          icon={<Lock size={16} />}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="w-full border py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ProfileModal({ recruiter, onClose }) {
  return (
    <Modal title="Recruiter Profile" onClose={onClose}>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={
            recruiter.avatar ||
            `https://ui-avatars.com/api/?name=${recruiter.name}`
          }
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{recruiter.name}</p>
          <p className="text-sm text-gray-500">
            {recruiter.email}
          </p>
        </div>
      </div>

      <p className="text-sm"><b>Status:</b> {recruiter.status}</p>
      <p className="text-sm"><b>Joined:</b> {recruiter.joined}</p>
    </Modal>
  );
}

function ConfirmModal({ recruiter, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p className="text-sm text-gray-600">
        Are you sure you want to{" "}
        <b>{recruiter.status === "Active" ? "block" : "unblock"}</b>{" "}
        <b>{recruiter.name}</b>?
      </p>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="w-full border py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`w-full py-2 rounded-lg text-white ${
            recruiter.status === "Active"
              ? "bg-red-600"
              : "bg-green-600"
          }`}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ icon, ...props }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
      {icon}
      <input {...props} className="w-full outline-none" />
    </div>
  );
}
