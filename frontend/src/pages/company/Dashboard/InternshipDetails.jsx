import { useParams } from "react-router-dom";

export default function InternshipDetails() {
  const { id } = useParams();

  // Dummy data (API se aayega)
  const internship = {
    title: "Frontend Developer Intern",
    recruiter: "Amit Sharma",
    location: "Remote",
    stipend: "₹8,000 - ₹12,000",
    duration: "3 Months",
    skills: ["HTML", "CSS", "React"],
    openings: 4,
    description:
      "Work with frontend team to build modern UI using React and Tailwind.",
    otherRequirements:
      "Basic Git knowledge required.",
    status: "Active",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {internship.title}
      </h1>

      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
        <p>
          <strong>Recruiter:</strong> {internship.recruiter}
        </p>
        <p>
          <strong>Location:</strong> {internship.location}
        </p>
        <p>
          <strong>Stipend:</strong> {internship.stipend}
        </p>
        <p>
          <strong>Duration:</strong> {internship.duration}
        </p>
        <p>
          <strong>Openings:</strong> {internship.openings}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="text-green-600 font-medium">
            {internship.status}
          </span>
        </p>

        <div>
          <strong>Required Skills:</strong>
          <div className="flex gap-2 mt-2 flex-wrap">
            {internship.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <strong>About the Work:</strong>
          <p className="text-gray-600 mt-1">
            {internship.description}
          </p>
        </div>

        <div>
          <strong>Other Requirements:</strong>
          <p className="text-gray-600 mt-1">
            {internship.otherRequirements}
          </p>
        </div>
      </div>
    </div>
  );
}
