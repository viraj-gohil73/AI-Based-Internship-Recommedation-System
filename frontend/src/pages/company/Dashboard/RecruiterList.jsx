import { useEffect, useState } from "react";
import { Eye, Pencil, Ban, CheckCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecruiterList() {
  const navigate = useNavigate();

  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH FROM BACKEND ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchRecruiters = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/company/recruiters",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const text = await res.text();

        if (text.startsWith("<")) {
          throw new Error("API not reached. HTML returned.");
        }

        const data = JSON.parse(text);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch recruiters");
        }

        setRecruiters(data.recruiters || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  /* ---------------- UI STATUS TOGGLE (TEMP) ---------------- */
  const toggleStatus = (id) => {
    setRecruiters((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, isactive: !r.isactive } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading recruiters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className=" sm:p-4 ">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Recruiters</h1>

        <button
          onClick={() => navigate("/company/dashboard/recruiters/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add Recruiter
        </button>
      </div>

      {/* ---------------- DESKTOP TABLE ---------------- */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[900px]">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-3 text-left">Recruiter</th>
      <th className="p-3">Email</th>
      <th className="p-3">Last Login</th>
      <th className="p-3">Can Post</th>
      <th className="p-3">Status</th>
      <th className="p-3 text-center">Actions</th>
    </tr>
  </thead>

  <tbody>
    {recruiters.map((r) => (
      <tr key={r._id} className="border-t hover:bg-gray-50">

        {/* Recruiter (DP + Name) */}
        <td className="p-3">
          <div className="flex items-center gap-3">
            <img
              src={
                r.dp ||
                `https://ui-avatars.com/api/?name=${r.name}&background=random`
              }
              className="w-9 h-9 rounded-full border object-cover"
              alt="dp"
            />
            <span className="font-medium">{r.name}</span>
          </div>
        </td>

        {/* Email */}
        <td className="p-3">{r.email}</td>

        {/* Last Login */}
        <td className="p-3 text-sm text-gray-600">
          {r.last_login ? (
            <>
              <div>{new Date(r.last_login).toLocaleDateString()}</div>
              <div className="text-xs text-gray-400">
                {new Date(r.last_login).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <span className="italic text-gray-400">Never</span>
          )}
        </td>

        {/* Can Post */}
        <td className="p-3 text-center">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              r.canpost
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {r.canpost ? "Yes" : "No"}
          </span>
        </td>

        {/* Status */}
        <td className="p-3 text-center">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              r.isactive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {r.isactive ? "Active" : "Blocked"}
          </span>
        </td>

        {/* Actions */}
        <td className="p-3">
          <div className="flex justify-center gap-2">
            <ActionButtons
              r={r}
              navigate={navigate}
              toggleStatus={toggleStatus}
            />
          </div>
        </td>
      </tr>
    ))}

    {recruiters.length === 0 && (
      <tr>
        <td colSpan="6" className="text-center py-6 text-gray-500">
          No recruiters found
        </td>
      </tr>
    )}
  </tbody>
</table>

      </div>

      {/* ---------------- MOBILE CARDS ---------------- */}
      <div className="md:hidden space-y-4">
        {recruiters.map((r) => (
          <div
            key={r._id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  r.dp ||
                  `https://ui-avatars.com/api/?name=${r.name}`
                }
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <p className="font-semibold text-sm sm:font-medium">{r.name}</p>
                <p className="text-sm text-gray-500">{r.email}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                    r.isactive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.isactive ? "Active" : "Blocked"}
                </span>
              </div>
            </div>

            <ActionButtons
              r={r}
              navigate={navigate}
              toggleStatus={toggleStatus}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- ACTION BUTTONS ---------------- */

function ActionButtons({ r, navigate, toggleStatus }) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row justify-center">
      <button
        onClick={() =>
          navigate(`/company/dashboard/recruiters/${r._id}`)
        }
        className="p-2 sm:2 bg-blue-100 text-blue-600 rounded-lg"
      >
        <Eye size={16} />
      </button>

      <button
        onClick={() =>
          navigate(`/company/dashboard/recruiters/${r._id}/edit`)
        }
        className="p-2 bg-amber-100 text-amber-600 rounded-lg"
      >
        <Pencil size={16} />
      </button>

      <button
        onClick={() => toggleStatus(r._id)}
        className={`p-2 rounded-lg ${
          r.isactive
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {r.isactive ? <Ban size={16} /> : <CheckCircle size={16} />}
      </button>
    </div>
  );
}
