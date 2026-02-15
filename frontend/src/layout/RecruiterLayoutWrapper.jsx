import { Outlet } from "react-router-dom";
import { RecruiterProvider } from "../context/RecruiterContext";
import RecruiterProtectedRoute from "../components/RecruiterProtectedRoute";

export default function RecruiterLayoutWrapper() {
  return (
    <RecruiterProvider>
      <RecruiterProtectedRoute>
        <Outlet />
      </RecruiterProtectedRoute>
    </RecruiterProvider>
  );
}
