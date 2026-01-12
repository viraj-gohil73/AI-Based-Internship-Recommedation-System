import { Navigate } from "react-router-dom";

export default function CompanyProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token || user?.role !== "company") {
    return <Navigate to="/auth/company/login" replace />;
  }

  return children;
}
