import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth & General Pages
import Home from "./pages/Home";
import ChooseUserType from "./pages/ChooseUserType";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import OtpVerify from "./pages/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Student Pages
import RegisterStudent from "./pages/student/Register_student";
import LoginStudent from "./pages/student/Login_Student";
import SavedInternshipsPro from "./pages/student/SavedInternshipsPro"; // Ensure this file exists

// Company Pages
import RegisterCompany from "./pages/company/Login/Register_company";
import LoginComapny from "./pages/company/Login/Login_Company";
import Dashboard from "./pages/company/Dashboard/overview";
import Settings from "./pages/company/Dashboard/Settings";
import Subscription from "./pages/company/Dashboard/Subscription";
import Profile from "./pages/company/Dashboard/Profile";
import InternshipList from "./pages/company/Dashboard/Internship"; 
import CompanyInternshipView from "./pages/company/Dashboard/CompanyInternshipView";
import Recruiter from "./pages/company/Dashboard/Recruiters";

// Other Roles
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/Login_Admin";
import GoogleSuccess from "./pages/GoogleSuccess";
// Temp / Development
import Temp from './pages/Register_student';
import CompanyProtectedRoute from "./components/company/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/choose-register" element={<ChooseUserType />} />
        <Route path="/choose-login" element={<ChooseUserLogin />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reg" element={<Temp />} />

        {/* Student Routes */}
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/login-student" element={<LoginStudent />} />
        <Route path="/student-dashboard" element={<SavedInternshipsPro />} />

        {/* Company Auth */}
        <Route path="/auth/company/register" element={<RegisterCompany />} />
        <Route path="/auth/company/login" element={<LoginComapny />} />

        {/* Recruiter & Admin Auth */}
        <Route path="/login-recruiter" element={<LoginRecruiter />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Company Dashboard (Nested Paths) */}
        
        <Route path="/company/dashboard/overview" element={<CompanyProtectedRoute><Dashboard /></CompanyProtectedRoute>} />
        <Route path="/company/dashboard/settings" element={<CompanyProtectedRoute><Settings /></CompanyProtectedRoute>} />
        <Route path="/company/dashboard/subscription" element={<CompanyProtectedRoute><Subscription /></CompanyProtectedRoute>} />
        <Route path="/company/dashboard/profile" element={<CompanyProtectedRoute><Profile /></CompanyProtectedRoute>} />
        <Route path="/company/dashboard/internships" element={<CompanyProtectedRoute><InternshipList /></CompanyProtectedRoute>} />
        <Route path="/company/dashboard/recruiters" element={<CompanyProtectedRoute><Recruiter /></CompanyProtectedRoute>} />
        {/* Fixed: Unique path for View vs Edit if they use different components */}
        <Route path="/company/dashboard/internships/:id" element={<CompanyInternshipView />} />
        <Route path="/company/dashboard/internships/edit/:id" element={<InternshipList />} /> 

        <Route
  path="/company/google-success"
  element={<GoogleSuccess />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;