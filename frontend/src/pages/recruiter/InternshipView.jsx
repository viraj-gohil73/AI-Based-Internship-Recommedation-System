import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3, Briefcase, IndianRupee } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function RecruiterInternshipView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internship, setInternship] = useState(null);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch(`http://localhost:5000/api/recruiter/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch internship");
        setInternship(data);
      } catch (err) {
        setError(err.message || "Failed to fetch internship");
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading internship details...</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!internship) return <div className="p-6 text-sm text-slate-600">Internship not found.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{internship.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Detailed internship overview for recruiters.</p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/recruiter/internships"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
            <Link
              to={`/recruiter/internships/edit/${internship._id}`}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Internship
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Briefcase size={16} />
            Work Setup
          </div>
          <p className="text-sm text-slate-600">Mode: {internship.workmode || "-"}</p>
          <p className="text-sm text-slate-600">Type: {internship.employment_type || "-"}</p>
          <p className="text-sm text-slate-600">Location: {internship.location || "-"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock3 size={16} />
            Timeline
          </div>
          <p className="text-sm text-slate-600">Duration: {internship.duration || 0} months</p>
          <p className="text-sm text-slate-600">Start: {formatDate(internship.starting_date)}</p>
          <p className="text-sm text-slate-600">Deadline: {formatDate(internship.deadline_at)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <IndianRupee size={16} />
            Compensation
          </div>
          <p className="text-sm text-slate-600">
            Stipend: {formatMoney(internship.stipend_min)} - {formatMoney(internship.stipend_max)}
          </p>
          <p className="text-sm text-slate-600">Openings: {internship.openings || 0}</p>
          <p className="text-sm text-slate-600">Status: {internship.intern_status || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">About Work</h2>
          <p className="text-sm leading-6 text-slate-600">{internship.about_work || "-"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Who Can Apply</h2>
          <p className="text-sm leading-6 text-slate-600">{internship.who_can_apply || "-"}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Other Requirements</h2>
        <p className="text-sm leading-6 text-slate-600">{internship.other_req || "-"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {(internship.skill_req || []).length ? (
              internship.skill_req.map((skill) => (
                <span key={skill} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No skills listed.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Perks</h2>
          <div className="flex flex-wrap gap-2">
            {(internship.perks || []).length ? (
              internship.perks.map((perk) => (
                <span key={perk} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {perk}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No perks listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
