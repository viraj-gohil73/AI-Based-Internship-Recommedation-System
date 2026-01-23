import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";

export default function RecruiterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);

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
          throw new Error(data.message || "Failed to load recruiter");
        }

        setRecruiter(data.recruiter);
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiter();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading recruiter profile...
      </div>
    );
  }

  if (!recruiter) return null;

  const statusBadge = recruiter.isactive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="px-4 py-6">

      <div className="bg-white max-w-3xl mx-auto rounded-2xl border border-slate-200 shadow-sm p-6 ">

        {/* ================= CARD HEADER ================= */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <span className="text-xs text-gray-400">
            Recruiter Profile
          </span>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6 mb-8">

          {/* DP */}
          <div className="flex-shrink-0">
            <img
              src={
                recruiter.dp ||
                `https://ui-avatars.com/api/?name=${recruiter.name}`
              }
              alt="Recruiter DP"
              className="w-28 h-28 sm:w-24 sm:h-24 rounded-full border object-cover"
            />
          </div>

          {/* INFO */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800">
              {recruiter.name}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail size={14} />
                {recruiter.email}
              </span>

              <span className="hidden sm:block text-gray-300">•</span>

              <span className="flex items-center gap-1">
                <Phone size={14} />
                {recruiter.mobile}
              </span>
            </div>

            <span
              className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${statusBadge}`}
            >
              {recruiter.isactive ? "Active" : "Blocked"}
            </span>
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Role" value={recruiter.role} />
          <Detail label="Gender" value={recruiter.gender} />
          <Detail label="Can Post Jobs" value={recruiter.canpost ? "Yes" : "No"} />
          <Detail
            label="Joined On"
            value={new Date(recruiter.createdAt).toLocaleDateString()}
          />
          <Detail
            label="Last Login"
            value={
              recruiter.last_login
                ? new Date(recruiter.last_login).toLocaleString()
                : "Never"
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}
