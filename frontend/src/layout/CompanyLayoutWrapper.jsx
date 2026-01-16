// layout/CompanyLayoutWrapper.jsx
import { CompanyProvider } from "../context/CompanyContext";
import CompanyLayout from "../layout/CompnayLayout";
import CompanyProtectedRoute from "../components/company/ProtectedRoute";

export default function CompanyLayoutWrapper() {
  return (
    <CompanyProtectedRoute>
      <CompanyProvider>
        <CompanyLayout />
      </CompanyProvider>
    </CompanyProtectedRoute>
  );
}
