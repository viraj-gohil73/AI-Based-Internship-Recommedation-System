import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddRecruiter() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
const [dpUploading, setDpUploading] = useState(false);

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

  /* ================= UPLOADCARE WIDGET HANDLER ================= */

  const openUploader = () => {
    uploadRef.current?.click();
  };

  useEffect(() => {
  if (!uploadRef.current) return;

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
    if (!form.name.trim()) return alert("Full name is required");
    if (!emailRegex.test(form.email)) return alert("Invalid email");
    if (!form.password || form.password.length < 6)
      return alert("Password must be at least 6 characters");
    if (!mobileRegex.test(form.mobile))
      return alert("Invalid mobile number");

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

      alert("Recruiter created successfully");
      navigate("/company/dashboard/recruiters");
    } catch (err) {
      console.error(err);
      alert(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="flex justify-center">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-sm p-6">

        <h2 className="text-2xl font-semibold mb-6">Add Recruiter</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ================= DP ================= */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div
              onClick={openUploader}
              className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300
              flex items-center justify-center overflow-hidden bg-gray-50
              hover:border-blue-400 cursor-pointer"
            >
              {form.dp ? (
                <img src={form.dp} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-gray-400">Upload DP</span>
              )}
            </div>

            {/* Uploadcare Hidden Input */}
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

          {/* ================= FORM ================= */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password *</label>
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mobile *</label>
              <input
                className={inputClass}
                maxLength={10}
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="RECRUITER">Recruiter</option>
                <option value="HR">HR</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value })
                }
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 mt-2">
              <input
                type="checkbox"
                checked={form.canpost}
                onChange={(e) =>
                  setForm({ ...form, canpost: e.target.checked })
                }
              />
              <span className="text-sm">Can Post Jobs</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Create Recruiter
          </button>
        </div>
      </div>
    </div>
  );
}
