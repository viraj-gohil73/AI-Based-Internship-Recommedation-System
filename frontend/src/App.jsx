import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChooseUserLogin from "./pages/ChooseUserLogin";
import RegisterStudent from "./pages/student/Register_student";
import RegisterCompany from "./pages/company/Register_company";

import LoginComapny from "./pages/company/Login_Company";
import LoginStudent from "./pages/student/Login_Student";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChooseUserType from "./pages/ChooseUserType";
import OtpVerify from "./pages/OtpVerify";




function App() {
  return (
    <BrowserRouter>
      <Routes path="/" element={<ChooseUserType />}>
      <Route path="/" element={<ChooseUserType />} />
        <Route path="/choose-register" element={<ChooseUserType />} />
        <Route path="/choose-login" element={<ChooseUserLogin />} />

        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/register-company" element={<RegisterCompany />} />

        <Route path="/login-company" element={<LoginComapny />} />
        <Route path="/login-student" element={<LoginStudent />} />

         <Route path="/otp" element={<OtpVerify />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
