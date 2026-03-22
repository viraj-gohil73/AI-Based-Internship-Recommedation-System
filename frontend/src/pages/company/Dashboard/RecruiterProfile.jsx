import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, User, Calendar, LogIn, CheckCircle2, XCircle } from "lucide-react";

export default function RecruiterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-md px-4 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
              Recruiter Profile
            </h1>
            <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
              View recruiter details, activity, and account permissions.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-md">
          <div className="p-4 md:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6 mb-8 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="flex-shrink-0 relative">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-blue-300 overflow-hidden shadow-sm bg-white">
                  <img
                    src={
                      recruiter.dp ||
                      `https://ui-avatars.com/api/?name=${recruiter.name}`
                    }
                    alt="Recruiter DP"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${recruiter.isactive ? "bg-green-500" : "bg-red-500"}`} />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {recruiter.name}
                </h2>

                <div className="flex flex-col gap-2 mt-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <Mail size={16} className="text-blue-600" />
                    {recruiter.email}
                  </span>

                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-blue-600" />
                    {recruiter.mobile}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full ${
                      recruiter.isactive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {recruiter.isactive ? (
                      <>
                        <CheckCircle2 size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Blocked
                      </>
                    )}
                  </span>
                  {recruiter.canpost && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      Can Post Jobs
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <Detail icon={User} label="Role" value={recruiter.role} />
              <Detail icon={User} label="Gender" value={recruiter.gender} />
              <Detail icon={CheckCircle2} label="Post Permission" value={recruiter.canpost ? "Yes" : "No"} />
              <Detail
                icon={Calendar}
                label="Joined On"
                value={new Date(recruiter.createdAt).toLocaleDateString("en-IN")}
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
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-blue-600" />}
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-semibold text-gray-900 text-base">{value || "N/A"}</p>
    </div>
  );
}

