import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
    "w-full border px-3 py-2 rounded-lg mt-1 focus:ring-1 focus:ring-blue-500";

  return (
    <div className="p-4 sm:p-6 flex justify-center">
      <div className="bg-white w-full max-w-3xl border-2 border-slate-200 rounded-xl shadow p-4 sm:p-6">

        <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center sm:text-left">
          Edit Recruiter
        </h2>

        {/* ================= PROFILE PHOTO ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">

          <div
            onClick={openUploader}
            className="mx-auto sm:mx-0 w-24 h-24 sm:w-20 sm:h-20
            rounded-full border-2 border-dashed border-gray-300
            overflow-hidden flex items-center justify-center cursor-pointer
            hover:border-blue-400 transition"
          >
            {form.dp ? (
              <img
                src={form.dp}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-2">
                Upload DP
              </span>
            )}
          </div>

          <span className="text-sm text-gray-500 text-center sm:text-left">
            {dpUploading ? "Uploading image..." : "Tap to change photo"}
          </span>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mobile</label>
            <input
              className={inputClass}
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

          <div className="flex items-center gap-2 ">
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
  }/>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-row  justify-end gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={update}
            disabled={loading || dpUploading}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {dpUploading ? "Uploading..." : "Update "}
          </button>
        </div>
      </div>
    </div>
  );
}


function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-around gap-2 mt-6">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer
        transition-colors duration-300
        ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-300
          ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}
