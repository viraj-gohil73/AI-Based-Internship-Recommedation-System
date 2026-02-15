import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, User, Calendar, LogIn, CheckCircle2, XCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">

      <div className="bg-white max-w-3xl mx-auto rounded-2xl border border-blue-100 shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">

        {/* ================= CARD HEADER ================= */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Recruiter Profile
          </span>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6 mb-10 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">

          {/* DP */}
          <div className="flex-shrink-0 relative">
            <div className="w-32 h-32 sm:w-28 sm:h-28 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-400 overflow-hidden shadow-lg">
              <img
                src={
                  recruiter.dp ||
                  `https://ui-avatars.com/api/?name=${recruiter.name}`
                }
                alt="Recruiter DP"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${recruiter.isactive ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>

          {/* INFO */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">
              {recruiter.name}
            </h2>

            <div className="flex flex-col gap-2 mt-3 text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <Mail size={16} className="text-blue-600" />
                {recruiter.email}
              </span>

              <span className="flex items-center gap-2 text-gray-700">
                <Phone size={16} className="text-blue-600" />
                {recruiter.mobile}
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  recruiter.isactive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {recruiter.isactive ? (
                  <><CheckCircle2 size={16} />Active</>
                ) : (
                  <><XCircle size={16} />Blocked</>
                )}
              </span>
              {recruiter.canpost && (
                <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  Can Post Jobs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail icon={User} label="Role" value={recruiter.role} />
          <Detail icon={User} label="Gender" value={recruiter.gender} />
          <Detail icon={CheckCircle2} label="Post Permission" value={recruiter.canpost ? "Yes" : "No"} />
          <Detail
            icon={Calendar}
            label="Joined On"
            value={new Date(recruiter.createdAt).toLocaleDateString()}
          />
          <Detail
            icon={LogIn}
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

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-blue-600" />}
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-semibold text-gray-900 text-base">{value || "—"}</p>
    </div>
  );
}
