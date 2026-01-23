import { useParams, useNavigate } from "react-router-dom";

export default function RecruiterProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Later API se aayega
  const recruiter = {
    id,
    name: "Amit Sharma",
    email: "amit@company.com",
    role: "RECRUITER",
    gender: "Male",
    status: "Active",
    joined: "12 Jan 2024",
    lastLogin: "22 Jan 2026, 10:05 AM",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-4"
      >
        ← Back to list
      </button>

      <div className="bg-white max-w-xl rounded-xl shadow p-6">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${recruiter.name}`}
            className="w-20 h-20 rounded-full border"
          />

          <div>
            <h2 className="text-lg font-semibold">
              {recruiter.name}
            </h2>
            <p className="text-gray-600">{recruiter.email}</p>

            <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              {recruiter.status}
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Detail label="Role" value={recruiter.role} />
          <Detail label="Gender" value={recruiter.gender} />
          <Detail label="Joined On" value={recruiter.joined} />
          <Detail label="Last Login" value={recruiter.lastLogin} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
