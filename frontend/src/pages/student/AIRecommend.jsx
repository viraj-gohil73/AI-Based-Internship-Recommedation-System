import StudentLayout from "../../layout/StudentLayout";

export default function AIRecommend() {
  return (
    <StudentLayout>
      <h1 className="text-xl font-semibold text-slate-800">
        AI Internship Recommendations
      </h1>
      <p className="text-slate-500 mt-2">
        Personalized internships based on your skills & resume.
      </p>
    </StudentLayout>
  );
}
