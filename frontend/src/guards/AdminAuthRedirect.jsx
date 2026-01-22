import { Navigate } from "react-router-dom";

export default function AdminAuthRedirect({ children }) {
  const token = localStorage.getItem("adminToken");

  // Agar admin already login hai
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Agar login nahi hai to page dikhao
  return children;
}
