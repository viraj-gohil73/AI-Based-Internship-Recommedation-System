import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PostInternship() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [details, setDetails] = useState({
    description: "",
    skills: "",
    openings: "",
  });

  const handleSubmit = async () => {
    const payload = { ...state, ...details };

    // API call
    await fetch("http://localhost:5000/api/recruiter/internships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    navigate("/recruiter/internships");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Post Internship</h1>

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
