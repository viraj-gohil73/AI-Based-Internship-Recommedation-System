import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MONTHLY_COMPANY_INTERNSHIP_LIMIT = 5;

export default function PostInternship() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [monthlyLimit, setMonthlyLimit] = useState(MONTHLY_COMPANY_INTERNSHIP_LIMIT);
  const [monthlyPostedCount, setMonthlyPostedCount] = useState(0);

  const [details, setDetails] = useState({
    description: "",
    skills: "",
    openings: "",
  });

  useEffect(() => {
    const fetchMonthlyPostedCount = async () => {
      try {
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch("http://localhost:5000/api/recruiter/subscription/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) return;

        setMonthlyLimit(
          data?.entitlements?.limits?.monthlyInternshipsPerCompany ??
            MONTHLY_COMPANY_INTERNSHIP_LIMIT
        );
        setMonthlyPostedCount(data?.usage?.monthlyInternshipsCount ?? 0);
      } catch {
        setMonthlyLimit(MONTHLY_COMPANY_INTERNSHIP_LIMIT);
        setMonthlyPostedCount(0);
      }
    };

    fetchMonthlyPostedCount();
  }, []);

  const handleSubmit = async () => {
    try {
      if (monthlyPostedCount >= monthlyLimit) {
        return toast.error(`Monthly internship limit reached (${monthlyPostedCount}/${monthlyLimit})`);
      }

      const payload = { ...state, ...details };
      const token = localStorage.getItem("recruiterToken");

      const res = await fetch("http://localhost:5000/api/recruiter/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to post internship");
      }

      toast.success("Internship submitted successfully");
      navigate("/recruiter/internships");
    } catch (error) {
      toast.error(error.message || "Failed to post internship");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Post Internship</h1>
      <p className="mb-3 text-sm text-slate-600">
        Monthly company limit: {monthlyPostedCount}/{monthlyLimit}
      </p>

      <textarea
        placeholder="Description"
        className="w-full border p-2 rounded mb-3"
        onChange={(e) =>
          setDetails({ ...details, description: e.target.value })
        }
      />

      <input
        placeholder="Required Skills"
        className="w-full border p-2 rounded mb-3"
        onChange={(e) =>
          setDetails({ ...details, skills: e.target.value })
        }
      />

      <input
        placeholder="Openings"
        className="w-full border p-2 rounded mb-3"
        onChange={(e) =>
          setDetails({ ...details, openings: e.target.value })
        }
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Post Internship
      </button>
    </div>
  );
}
