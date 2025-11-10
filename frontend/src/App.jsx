import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import RegisterStudent from "./pages/student/Register_student";
import RegisterCompany from "./pages/company/Register_company";
import Temp from './pages/Register_student'
import LoginComapny from "./pages/company/Login_Company";
import LoginStudent from "./pages/student/Login_Student";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChooseUserType from "./pages/ChooseUserType";
import OtpVerify from "./pages/OtpVerify";
import Home from "./pages/Home";
import Student_Dashboard from "./pages/student/Student_dashboard";
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
        <Route path="/register-company" element={<RegisterCompany />} />

        <Route path="/login-company" element={<LoginComapny />} />
        <Route path="/login-student" element={<LoginStudent />} />
        <Route path="/login-recruiter" element={<LoginRecruiter />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        <Route path="/student-dashboard" element={<Student_Dashboard />} />

        <Route  path="/reg" element={<Temp />} />
         <Route path="/otp" element={<OtpVerify />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
