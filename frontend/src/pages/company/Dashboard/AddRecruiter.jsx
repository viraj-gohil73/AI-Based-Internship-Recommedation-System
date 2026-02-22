import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Camera, Lock, UserPlus, UsersRound } from "lucide-react";
import { useSubscription } from "../../../context/SubscriptionContext";

export default function AddRecruiter() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const [dpUploading, setDpUploading] = useState(false);
  const { entitlements, usage, current } = useSubscription();

  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    dp: "",
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
    gender: "MALE",
    mobile: "",
    canpost: true,
  });
  const accessKnown = entitlements !== null;
  const hardLocked = accessKnown && !entitlements?.accessAllowed;
  const seatLimit = current?.totalRecruiterSeats ?? 0;
  const usedSeats = usage?.recruitersCount ?? 0;
  const seatLimitReached =
    entitlements?.accessAllowed && seatLimit !== null && usedSeats >= seatLimit;

  /* ================= UPLOADCARE WIDGET HANDLER ================= */

  const openUploader = () => {
    uploadRef.current?.click();
  };

  useEffect(() => {
    if (!uploadRef.current || !window.uploadcare) return;

    const widget = window.uploadcare.Widget(uploadRef.current);

    widget.onUploadComplete((fileInfo) => {
      setDpUploading(false);
      setForm((prev) => ({
        ...prev,
        dp: fileInfo.cdnUrl,
      }));
    });

    widget.onChange(() => {
      setDpUploading(true);
    });
  }, []);


  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (hardLocked) {
      return toast.error("Active approved subscription is required.");
    }
    if (seatLimitReached) {
      return toast.error("Recruiter seat limit reached. Upgrade your plan.");
    }

    if (!form.name.trim()) return toast.error("Full name is required");
    if (!emailRegex.test(form.email)) return toast.error("Invalid email");
    if (!form.password || form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (!mobileRegex.test(form.mobile))
      return toast.error("Invalid mobile number");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/company/recruiter/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create recruiter");
      }

      toast.success("Recruiter created successfully");
      navigate("/company/dashboard/recruiters");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition bg-white";

  const seatsLeft = Math.max((seatLimit || 0) - (usedSeats || 0), 0);
  const statusTone = hardLocked
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : seatLimitReached
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dff6ff,_#f8fbff_42%,_#eef5ff)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Team Management
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Add Recruiter</h1>
              <p className="mt-2 text-sm text-slate-600">
                Create recruiter access with role, permissions, and profile details.
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 text-sm ${statusTone}`}>
              <div className="flex items-center gap-2 font-semibold">
                {hardLocked ? <Lock size={16} /> : <UsersRound size={16} />}
                {hardLocked ? "Creation blocked" : `Seats: ${usedSeats}/${seatLimit}`}
              </div>
              {!hardLocked && (
                <p className="mt-1 text-xs">
                  {seatLimitReached ? "No recruiter seats left" : `${seatsLeft} seat(s) remaining`}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
        >
          {hardLocked && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Recruiter creation is blocked. Company must be approved and subscription must be active/trial.
            </div>
          )}
          {!hardLocked && seatLimitReached && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Seat limit reached ({usedSeats}/{seatLimit}). Buy extra recruiter seats to continue.
            </div>
          )}

          <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">
            Recruiter Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 rounded-2xl border border-cyan-100 p-5 bg-gradient-to-b from-cyan-50 to-white"
            >
              <p className="mb-4 text-sm font-semibold text-slate-800">Profile & Access</p>
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={openUploader}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-cyan-300 bg-cyan-50 transition hover:border-cyan-500"
                >
                  {form.dp ? (
                    <img
                      src={form.dp}
                      className="w-full h-full object-cover"
                      alt="Recruiter profile"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs font-medium text-cyan-600">
                      <Camera size={16} className="mx-auto mb-1" />
                      Upload
                    </span>
                  )}
                </motion.div>

                <p className="text-center text-sm text-slate-600">
                  {dpUploading ? (
                    <span className="font-semibold text-cyan-700">Uploading image...</span>
                  ) : (
                    "Click photo to upload"
                  )}
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Role defines access scope for postings and candidate management.
              </div>

              <div className="mt-5 border-t border-cyan-100 pt-5">
                <Toggle
                  label="Can Post Jobs"
                  checked={form.canpost}
                  onChange={(val) =>
                    setForm({ ...form, canpost: val })
                  }
                />
              </div>

              <input
                ref={uploadRef}
                type="hidden"
                role="uploadcare-uploader"
                data-public-key={import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY}
                data-images-only="true"
                data-crop="1:1"
                data-image-shrink="512x512"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name *</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email *</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password *</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    className={inputClass}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile *</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
                  <motion.select
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option value="RECRUITER">Recruiter</option>
                    <option value="HR">HR</option>
                    <option value="MANAGER">Manager</option>
                  </motion.select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                  <motion.select
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </motion.select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ================= ACTIONS ================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading || dpUploading || hardLocked || seatLimitReached}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50 sm:w-auto"
            >
              <UserPlus size={16} />
              {loading ? "Creating..." : "Create Recruiter"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <motion.button
        type="button"
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
        className={`relative inline-flex h-8 w-14 cursor-pointer items-center rounded-full
        transition-all duration-300
        ${checked ? "bg-gradient-to-r from-cyan-600 to-blue-700" : "bg-slate-300"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md
          ${checked ? "translate-x-7" : "translate-x-1"}`}
        />
      </motion.button>
    </div>
  );
}
