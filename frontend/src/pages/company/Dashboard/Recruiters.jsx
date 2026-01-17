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
import { useVerification } from "../../../context/VerificationContext";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
const ITEMS_PER_PAGE = 15;

export default function CompanyRecruiterManagement() {
  const { status } = useVerification();
  const isLocked = status === "SUBMITTED";

  const [recruiters, setRecruiters] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------------- ACTIONS ---------------- */

  const addRecruiter = (data) => {
    if (isLocked) return;

    setRecruiters((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...data,
        status: "Pending",
        joined: new Date().toLocaleDateString(),
      },
    ]);
  };

  const toggleStatus = () => {
    if (isLocked) return;

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

  const totalPages = Math.ceil(filteredRecruiters.length / ITEMS_PER_PAGE);

  const paginatedRecruiters = filteredRecruiters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 min-h-screen p-2 sm:p-6">

      {/* 🔒 VERIFICATION MESSAGE */}
      {isLocked && (
        <UnderReviewAlert
    message="Your company profile is under admin review."
  />
      )}

      {/* Header */}
      <div className="flex flex-col mt-2 sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          disabled={isLocked}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80 px-4 py-2 border border-slate-400 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 disabled:cursor-not-allowed"
        />

        <button
          onClick={() => !isLocked && setShowAdd(true)}
          disabled={isLocked}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Add Recruiter
        </button>
      </div>

      {/* TABLE */}
      <div className={`bg-white rounded-xl shadow overflow-x-auto ${isLocked ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Recruiter</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecruiters.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-center">
                  <ActionButtons
                    recruiter={r}
                    locked={isLocked}
                    onView={setViewProfile}
                    onToggle={setConfirmAction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showAdd && !isLocked && (
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

      {confirmAction && !isLocked && (
        <ConfirmModal
          recruiter={confirmAction}
          onCancel={() => setConfirmAction(null)}
          onConfirm={toggleStatus}
        />
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function ActionButtons({ recruiter, onView, onToggle, locked }) {
  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={() => onView(recruiter)}
        className="p-2 rounded-lg bg-blue-100 text-blue-600"
      >
        <Eye size={16} />
      </button>

      <button
        disabled={locked}
        onClick={() => !locked && onToggle(recruiter)}
        className={`p-2 rounded-lg ${
          recruiter.status === "Active"
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {recruiter.status === "Active" ? <Ban size={16} /> : <CheckCircle size={16} />}
      </button>
    </div>
  );
}

/* ---------- MODALS & INPUT (UNCHANGED) ---------- */

function AddRecruiterModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = () => {
    if (!form.name || !form.email || !form.password) return;
    onAdd(form);
    onClose();
  };

  return (
    <Modal title="Add Recruiter" onClose={onClose}>
      <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={submit} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Create</button>
    </Modal>
  );
}

function ProfileModal({ recruiter, onClose }) {
  return (
    <Modal title="Recruiter Profile" onClose={onClose}>
      <p><b>Name:</b> {recruiter.name}</p>
      <p><b>Email:</b> {recruiter.email}</p>
      <p><b>Status:</b> {recruiter.status}</p>
    </Modal>
  );
}

function ConfirmModal({ recruiter, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p className="mb-4">
        Are you sure you want to {recruiter.status === "Active" ? "block" : "unblock"} {recruiter.name}?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="w-full border py-2 rounded-lg">Cancel</button>
        <button onClick={onConfirm} className="w-full bg-blue-600 text-white py-2 rounded-lg">Confirm</button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border rounded-lg px-3 py-2 mb-2 outline-none"
    />
  );
}
