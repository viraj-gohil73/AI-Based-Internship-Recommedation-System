// layout/CompanyLayoutWrapper.jsx
import { CompanyProvider } from "../context/CompanyContext";
import CompanyLayout from "../layout/CompnayLayout";
import CompanyProtectedRoute from "../components/company/ProtectedRoute";
import { SubscriptionProvider } from "../context/SubscriptionContext";

export default function CompanyLayoutWrapper() {
  return (
    <CompanyProtectedRoute>
      <CompanyProvider>
        <SubscriptionProvider>
          <CompanyLayout />
        </SubscriptionProvider>
      </CompanyProvider>
    </CompanyProtectedRoute>
  );
}
