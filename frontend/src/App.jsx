/*import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import RegisterStudent from "./pages/student/Register_student";
import RegisterCompany from "./pages/company/Register_company";
import Temp from './pages/Register_student'
import LoginComapny from "./pages/company/Login_Company";
import LoginStudent from "./pages/student/Login_Student";
import SavedInternshipsPro from "./pages/student/SavedInternshipsPro";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChooseUserType from "./pages/ChooseUserType";
import OtpVerify from "./pages/OtpVerify";
import Home from "./pages/Home";
import Student_Dashboard from "./pages/student/StudentDashboard";
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/Login_Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/"  element={<Home />}/>
        <Route path="/choose-register" element={<ChooseUserType />} />
        <Route path="/choose-login" element={<ChooseUserLogin />} />

        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/company/register" element={<RegisterCompany />} />

        <Route path="/login-company" element={<LoginComapny />} />
        <Route path="/login-student" element={<LoginStudent />} />
        <Route path="/login-recruiter" element={<LoginRecruiter />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        <Route path="/student-dashboard" element={<SavedInternshipsPro />} />

        <Route  path="/reg" element={<Temp />} />
         <Route path="/otp" element={<OtpVerify />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/company/Dashboard/overview";
import Settings from "./pages/company/Dashboard/Settings";
import Subscription from "./pages/company/Dashboard/Subscription";
import Profile from "./pages/company/Dashboard/Profile";
import InternshipList from "./pages/company/Dashboard/Internship";
import InternshipDetails from "./pages/company/Dashboard/InternshipDetails";
import EditInternship from "./pages/company/Dashboard/Internship";
import CompanyInternshipView from "./pages/company/Dashboard/CompanyInternshipView";
import Recruiter from "./pages/company/Dashboard/Recruiters";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/company/dashboard/overview" element={<Dashboard />} />
        <Route path="/company/dashboard/settings" element={<Settings />} />
        <Route path="/company/dashboard/subscription" element={<Subscription />} />
        <Route path="/company/dashboard/profile" element={<Profile />} />
        <Route path="/company/dashboard/internships" element={<InternshipList />} />
        {/* <Route path="/company/dashboard/internships/:id" element={<InternshipDetails />} /> */}
        <Route path="/company/dashboard/internships/edit/:id" element={<EditInternship />} />
        <Route path="/company/dashboard/recruiters" element={<Recruiter />} />
        <Route
  path="/company/dashboard/internships/:id"
  element={<CompanyInternshipView />}
/>

      </Routes>
    </BrowserRouter>
  );
}
