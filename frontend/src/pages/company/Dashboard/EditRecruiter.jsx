import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
export default function EditRecruiter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const uploadRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [dpUploading, setDpUploading] = useState(false);

  const [form, setForm] = useState({
    dp: "",
    name: "",
    email: "",
    role: "RECRUITER",
    gender: "MALE",
    mobile: "",
    isactive: true,
    canpost: true,
  });

  /* ================= FETCH RECRUITER ================= */
  useEffect(() => {
    const fetchRecruiter = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/company/recruiter/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch recruiter");
        }

        setForm({
          dp: data.recruiter.dp || "",
          name: data.recruiter.name,
          email: data.recruiter.email,
          role: data.recruiter.role,
          gender: data.recruiter.gender,
          mobile: data.recruiter.mobile,
          isactive: data.recruiter.isactive,
          canpost: data.recruiter.canpost,
        });
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    };

    fetchRecruiter();
  }, [id]);

  /* ================= UPLOADCARE DP ================= */
  const openUploader = () => {
    uploadRef.current?.click();
  };

  useEffect(() => {
    if (!uploadRef.current || !window.uploadcare) return;

    const widget = window.uploadcare.Widget(uploadRef.current);

    widget.onChange(() => {
      setDpUploading(true);
    });

    widget.onUploadComplete((fileInfo) => {
      setDpUploading(false);
      setForm((prev) => ({
        ...prev,
        dp: fileInfo.cdnUrl,
      }));
    });
  }, []);

  /* ================= UPDATE ================= */
  const update = async () => {
    if (dpUploading) {
      alert("Please wait for image upload to complete");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/company/recruiter/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update recruiter");
      }

      toast.success("Recruiter Details updated successfully");
      navigate("/company/dashboard/recruiters");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-md"
        >
          <div className="px-4 md:px-8 pt-5 pb-3 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
              Edit Recruiter
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
              Update recruiter account details and permissions.
            </p>
          </div>

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 border border-gray-200 rounded-xl p-4 bg-gradient-to-b from-gray-50 to-blue-50"
            >
              <p className="text-sm font-semibold text-gray-800 mb-4">Profile</p>
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={openUploader}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-blue-300 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-500 transition bg-white"
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
              <div className="flex justify-center m-1">
                <input
                  ref={uploadRef}
                  type="hidden"
                  role="uploadcare-uploader"
                  data-public-key={import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY}
                  data-images-only="true"
                  data-crop="1:1"
                  data-image-shrink="512x512"
                />
              </div>
              

              <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
                <Toggle
                  label="Active Account"
                  checked={form.isactive}
                  onChange={(val) =>
                    setForm({ ...form, isactive: val })
                  }
                />
                <Toggle
                  label="Can Post Jobs"
                  checked={form.canpost}
                  onChange={(val) =>
                    setForm({ ...form, canpost: val })
                  }
                />
              </div>

              
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
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
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Mobile</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className={inputClass}
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
          </div>

          {/* ACTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border border-gray-300 px-7 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={update}
              disabled={loading || dpUploading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {dpUploading ? "Uploading..." : "Update"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}


function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-white border border-gray-200">
      <span className="text-sm font-semibold text-gray-700">
        {label}
      </span>

      <motion.button
        type="button"
        onClick={() => onChange(!checked)}
        whileTap={{ scale: 0.95 }}
        className={`relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer
        transition-all duration-300
        ${checked ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gray-300"}`}
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
