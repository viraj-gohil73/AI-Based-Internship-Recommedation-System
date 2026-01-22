import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VerificationProvider } from "./context/VerificationContext";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";
import ChooseUserType from "./pages/ChooseUserType";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import OtpVerify from "./pages/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ================= STUDENT ================= */
import RegisterStudent from "./pages/student/Register_student";
import LoginStudent from "./pages/student/Login_Student";
import SavedInternshipsPro from "./pages/student/SavedInternshipsPro";

/* ================= COMPANY AUTH ================= */
import RegisterCompany from "./pages/company/Login/Register_company";
import LoginComapny from "./pages/company/Login/Login_Company";

/* ================= COMPANY DASHBOARD ================= */
import Overview from "./pages/company/Dashboard/overview";
import Profile from "./pages/company/Dashboard/Profile";
import Settings from "./pages/company/Dashboard/Settings";
import Subscription from "./pages/company/Dashboard/Subscription";
import InternshipList from "./pages/company/Dashboard/Internship";
import CompanyInternshipView from "./pages/company/Dashboard/CompanyInternshipView";
import Recruiter from "./pages/company/Dashboard/Recruiters";
import CompanyLayoutWrapper from "./layout/CompanyLayoutWrapper";
import CompanyApprovals from "./pages/admin/CompanyApprovals";
/* ================= OTHER ================= */
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/LoginAdmin";
import GoogleSuccess from "./pages/GoogleSuccess";
import AdminLayout from "./layout/AdminLayout"
import Dashboard from "./pages/admin/Dashboard";
import Companies from "./pages/admin/Companies";
import CompanyDetails from "./pages/admin/CompanyDetails";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuthRedirect from "./guards/AdminAuthRedirect";
import AdminProtectedRoute from "./guards/AdminProtectedRoute";
function App() {
  return (
    <VerificationProvider>
      <BrowserRouter>
        <Routes>

          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/choose-register" element={<ChooseUserType />} />
          <Route path="/choose-login" element={<ChooseUserLogin />} />
          <Route path="/otp" element={<OtpVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ========== STUDENT ROUTES ========== */}
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/login-student" element={<LoginStudent />} />
          <Route path="/student-dashboard" element={<SavedInternshipsPro />} />

          {/* ========== COMPANY AUTH ROUTES ========== */}
          <Route path="/auth/company/register" element={<RegisterCompany />} />
          <Route path="/auth/company/login" element={<LoginComapny />} />

          {/* ========== COMPANY DASHBOARD (LOCKED LOGIC HERE) ========== */}
          <Route element={<CompanyLayoutWrapper />}>
            <Route path="/company/dashboard/overview" element={<Overview />} />
            <Route path="/company/dashboard/profile" element={<Profile />} />
            <Route path="/company/dashboard/settings" element={<Settings />} />
            <Route path="/company/dashboard/subscription" element={<Subscription />} />
            <Route path="/company/dashboard/internships" element={<InternshipList />} />
            <Route path="/company/dashboard/recruiters" element={<Recruiter />} />
            <Route
              path="/company/dashboard/internships/:id"
              element={<CompanyInternshipView />}
            />
          </Route>

          {/* ========== OTHER ========== */}
          <Route path="/login-recruiter" element={<LoginRecruiter />} />


          <Route
  path="/admin/login"
  element={
    <AdminAuthRedirect>
      <LoginAdmin />
    </AdminAuthRedirect>
  }
/>
          <Route path="/admin" element={<AdminLayout />}>
          <Route
  path="/admin/companies/:id"
  element={<CompanyDetails />}
/>

            <Route path="dashboard" element={<AdminProtectedRoute>
      <Dashboard />
    </AdminProtectedRoute>} />
            <Route path="approvals" element={<AdminProtectedRoute><CompanyApprovals /></AdminProtectedRoute>} />
            <Route path="companies" element={<Companies />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* 
            <Route path="students" element={<Students />} />
            <Route path="recruiters" element={<Recruiters />} />
             />
            <Route path="settings" element={<Settings />} /> */}
          </Route>


          <Route path="/company/google-success" element={<GoogleSuccess />} />

        </Routes>
      </BrowserRouter>
    </VerificationProvider>
  );
}

export default App;
