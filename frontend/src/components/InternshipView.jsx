import { MapPin, Briefcase, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InternshipView({ data, role = "student" }) {
  const navigate = useNavigate();
  if (!data) return null;

  return (
    <div className="max-w-7xl mx-2 sm:mx-4 bg-white
    border-2 border-slate-300 rounded-xl
    p-4 space-y-8">

      {/* ===== HEADER ===== */}
      <div className="flex items-start gap-4 pb-4 border-b-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg
          border-2 border-slate-400
          hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            {data.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Posted by <span className="font-semibold">{data.recruiterName}</span>
          </p>
        </div>
      </div>

      {/* ===== META ===== */}
      <div className="flex flex-wrap gap-6 text-sm text-slate-700">
        <Meta icon={<MapPin size={15} />} label={data.location} />
        <Meta icon={<Briefcase size={15} />} label={data.internshipType} />
        <Meta
          icon={<Calendar size={15} />}
          label={`${data.startDate} – ${data.endDate}`}
        />
      </div>

      {/* ===== STATS ===== */}
      <div className="flex flex-wrap gap-3">
        <ThickBadge>₹{data.stipendMin} – ₹{data.stipendMax}</ThickBadge>
        <ThickBadge>{data.duration}</ThickBadge>
        <ThickBadge>{data.openings} Openings</ThickBadge>
        <StatusBadge status={data.status} />
      </div>

      {/* ===== SKILLS ===== */}
      {data.skills && (
        <Section title="Skills Required">
          <div className="flex flex-wrap gap-3">
            {data.skills.split(",").map((skill, i) => (
              <span
                key={i}
                className="px-4 py-1.5 text-sm rounded-full
                border-2 border-blue-200
                bg-blue-50 text-blue-700 font-medium"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ===== DESCRIPTION ===== */}
      <Section title="About the Internship">
        <p className="text-slate-800 leading-relaxed">
          {data.description}
        </p>
      </Section>

      {/* ===== STUDENT ACTION ===== */}
      {role === "student" && (
        <div className="pt-4 border-t-2">
          <button
            className="px-6 py-2.5 rounded-lg
            bg-blue-600 text-white font-semibold
            hover:bg-blue-700 transition"
          >
            Apply Now
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== HELPERS ===== */

const Section = ({ title, children }) => (
  <div className="pl-4 border-l-4 border-slate-300 space-y-2">
    <h2 className="text-sm font-bold text-slate-800">
      {title}
    </h2>
    {children}
  </div>
);

const ThickBadge = ({ children }) => (
  <span className="px-4 py-1.5 text-sm rounded-full
  border-2 border-slate-300
  bg-slate-100 text-slate-800 font-medium">
    {children}
  </span>
);

const StatusBadge = ({ status }) => (
  <span
    className={`px-4 py-1.5 text-sm rounded-full font-bold
    border-2
    ${
      status === "Active"
        ? "border-green-300 bg-green-50 text-green-700"
        : "border-red-300 bg-red-50 text-red-700"
    }`}
  >
    {status}
  </span>
);

const Meta = ({ icon, label }) => (
  <span className="flex items-center gap-2 font-medium">
    {icon}
    {label}
  </span>
);
