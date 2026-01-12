import { useParams } from "react-router-dom";
import CompanyLayout from "../../../layout/CompnayLayout";
import InternshipView from "../../../components/InternshipView";

export default function CompanyInternshipView() {
  const { id } = useParams();

  // TEMP DATA (later API)
  const internship = {
    title: "Frontend Developer Intern",
    recruiterName: "Amit Sharma",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "8000",
    stipendMax: "12000",
    duration: "3 Months",
    openings: "4",
    status: "Active",
    skills: "HTML, CSS, React",
    description:
      "Work on real-world React projects and collaborate with the UI team.",
    startDate: "2026-01-01",
    endDate: "2026-02-15",
  };

  return (
    <CompanyLayout title="Internship Details">
      <InternshipView data={internship} role="company" />
    </CompanyLayout>
  );
}
