import { Navigate, Outlet } from "react-router-dom";
import { useRecruiter } from "../context/RecruiterContext";

export default function RecruiterProtectedRoute() {
  const { recruiter, loading } = useRecruiter();

  // ⏳ Wait until recruiter data is fetched
  if (loading) {
    return null; // ya spinner laga sakte ho
  }

  // ❌ Not logged in
  if (!recruiter) {
    return <Navigate to="/auth/recruiter/login" replace />;
  }

  // ✅ Logged in
  return <Outlet />;
}
