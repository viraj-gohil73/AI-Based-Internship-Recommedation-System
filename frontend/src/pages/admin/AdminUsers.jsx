import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  RefreshCcw,
  Mail,
  UserCog,
  Ban,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState({ name: "", email: "", role: "ADMIN" });
  const [confirmAction, setConfirmAction] = useState(null);
  const [createdPassword, setCreatedPassword] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load admins");
      }

      const list = Array.isArray(data) ? data : data.data || [];
      setAdmins(list);
    } catch (error) {
      toast.error(error.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filtered = useMemo(() => {
    return admins.filter((admin) => {
      const matchSearch =
        admin.name?.toLowerCase().includes(search.toLowerCase()) ||
        admin.email?.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "ACTIVE"
          ? admin.active
          : !admin.active;

      return matchSearch && matchFilter;
    });
  }, [admins, search, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("http://localhost:5000/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to create admin");
      }

      setForm({ name: "", email: "", role: "ADMIN" });
      setCreatedPassword(data.tempPassword || null);
      toast.success("Admin created");
      fetchAdmins();
    } catch (error) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const requestStatusChange = (admin) => {
    setConfirmAction(admin);
  };

  const closeConfirm = () => setConfirmAction(null);

  const confirmStatusChange = async () => {
    if (!confirmAction) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/admin/${confirmAction._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ active: !confirmAction.active }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      toast.success(confirmAction.active ? "Admin blocked" : "Admin unblocked");
      fetchAdmins();
    } catch (error) {
      toast.error(error.message || "Action failed");
    } finally {
      closeConfirm();
    }
  };

  const getStatusLabel = (admin) => (admin.active ? "Active" : "Blocked");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Admin Users</h1>
                <p className="text-sm text-slate-500">
                  Create and manage admin accounts and roles.
                </p>
              </div>
            </div>
            <button
              onClick={fetchAdmins}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1.2fr_0.8fr_auto]">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Admin name"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Admin email"
              type="email"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="AUDITOR">Auditor</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <UserPlus size={16} />
              {creating ? "Adding..." : "Add Admin"}
            </button>
          </form>

          {createdPassword && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Temporary password: <b>{createdPassword}</b>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search admin or email"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">Admin</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Updated</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    No admins found.
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((admin) => (
                  <tr key={admin._id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{admin.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail size={12} />
                        {admin.email}
                      </p>
                    </td>
                    <td className="p-4 text-slate-700">{admin.role}</td>
                    <td className="p-4 text-slate-600">
                      {admin.updatedAt
                        ? new Date(admin.updatedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${statusBadge(getStatusLabel(admin))}`}>
                        {getStatusLabel(admin)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                          title="Security review"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          onClick={() => requestStatusChange(admin)}
                          className={`p-2 rounded-lg text-white ${
                            admin.active
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {admin.active ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmAction.active ? "Block admin?" : "Unblock admin?"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirmAction.active
                ? "This admin will lose access to the platform."
                : "This admin will regain access to the platform."}
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {confirmAction.name}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`rounded-lg px-4 py-2 text-sm text-white ${
                  confirmAction.active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {confirmAction.active ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statusBadge(status) {
  return status === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-rose-100 text-rose-700";
}
