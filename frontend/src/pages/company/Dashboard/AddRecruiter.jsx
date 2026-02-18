import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
    "w-full border-2 border-blue-200 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-2 border-blue-200 rounded-xl shadow-lg p-6 sm:p-8"
        >
          {hardLocked && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Recruiter creation is blocked. Company must be approved and subscription must be active/trial.
            </div>
          )}
          {!hardLocked && seatLimitReached && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Seat limit reached ({usedSeats}/{seatLimit}). Buy extra recruiter seats to continue.
            </div>
          )}

          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 text-center sm:text-left">
            Add Recruiter
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 border-2 border-blue-100 rounded-xl p-5 bg-gradient-to-b from-blue-50 to-white"
            >
              <p className="text-sm font-semibold text-gray-800 mb-4">Profile</p>
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={openUploader}
                  className="w-24 h-24 rounded-full border-4 border-dashed border-blue-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-500 transition bg-blue-50"
                >
                  {form.dp ? (
                    <img
                      src={form.dp}
                      className="w-full h-full object-cover"
                      alt="Recruiter profile"
                    />
                  ) : (
                    <span className="text-xs text-blue-400 text-center px-2 font-medium">
                      Upload DP
                    </span>
                  )}
                </motion.div>

                <p className="text-sm text-gray-600 text-center">
                  {dpUploading ? (
                    <span className="text-blue-600 font-semibold">Uploading image...</span>
                  ) : (
                    "Click photo to upload"
                  )}
                </p>
              </div>

              <div className="mt-5 pt-5 border-t border-blue-100">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name *</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Email *</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Password *</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Mobile *</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Role</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Gender</label>
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
            className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t-2 border-blue-100"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border-2 border-gray-300 px-5 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading || dpUploading || hardLocked || seatLimitReached}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
            >
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
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-blue-50 border-2 border-blue-200">
      <span className="text-sm font-semibold text-gray-700">
        {label}
      </span>

      <motion.button
        type="button"
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
        className={`relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer
        transition-all duration-300
        ${checked ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-300"}`}
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
