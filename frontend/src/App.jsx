import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login"; // optional
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChooseUserType from "./pages/ChooseUserType";
import OtpVerify from "./pages/OtpVerify";
function App() {
  return (
    <BrowserRouter>
      <Routes path="/" element={<ChooseUserType />}>
      <Route path="/" element={<ChooseUserType />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
         <Route path="/otp" element={<OtpVerify />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
