import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import ChooseUserType from "./pages/ChooseUserType";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import OtpVerify from "./pages/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Student
import RegisterStudent from "./pages/student/Register_student";
import LoginStudent from "./pages/student/Login_Student";
import SavedInternshipsPro from "./pages/student/SavedInternshipsPro";

// Company Auth
import RegisterCompany from "./pages/company/Login/Register_company";
import LoginComapny from "./pages/company/Login/Login_Company";

// Company Dashboard Pages
import Overview from "./pages/company/Dashboard/overview";
import Settings from "./pages/company/Dashboard/Settings";
import Subscription from "./pages/company/Dashboard/Subscription";
import Profile from "./pages/company/Dashboard/Profile";
import InternshipList from "./pages/company/Dashboard/Internship";
import CompanyInternshipView from "./pages/company/Dashboard/CompanyInternshipView";
import Recruiter from "./pages/company/Dashboard/Recruiters";

// Other
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/Login_Admin";
import GoogleSuccess from "./pages/GoogleSuccess";

import CompanyLayoutWrapper from "./layout/CompanyLayoutWrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/choose-register" element={<ChooseUserType />} />
        <Route path="/choose-login" element={<ChooseUserLogin />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Student */}
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/login-student" element={<LoginStudent />} />
        <Route path="/student-dashboard" element={<SavedInternshipsPro />} />

        {/* Company Auth */}
        <Route path="/auth/company/register" element={<RegisterCompany />} />
        <Route path="/auth/company/login" element={<LoginComapny />} />

        {/* Recruiter & Admin */}
        <Route path="/login-recruiter" element={<LoginRecruiter />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* ================= COMPANY DASHBOARD ================= */}
        <Route element={<CompanyLayoutWrapper />}>
          <Route path="/company/dashboard/overview" element={<Overview />} />
          <Route path="/company/dashboard/profile" element={<Profile />} />
          <Route path="/company/dashboard/settings" element={<Settings />} />
          <Route path="/company/dashboard/subscription" element={<Subscription />} />
          <Route path="/company/dashboard/internships" element={<InternshipList />} />
          <Route path="/company/dashboard/recruiters" element={<Recruiter />} />
          <Route path="/company/dashboard/internships/:id" element={<CompanyInternshipView />} />
        </Route>

        {/* Google */}
        <Route path="/company/google-success" element={<GoogleSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
