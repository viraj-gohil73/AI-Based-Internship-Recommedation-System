import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import StudentProfile from "./pages/student/Profile";
import SavedInternshipsPro from "./pages/student/SavedInternshipsPro";
import AIRecommend from "./pages/student/AIRecommend";
import ExploreInternships from "./pages/student/ExploreInternships";
import InternshipDetails from "./pages/student/InternshipDetails";
import AppliedInternships from "./pages/student/AppliedInternships";
import MyResume from "./pages/student/MyResume";
import StudentSettings from "./pages/student/Settings";

/* ================= COMPANY AUTH ================= */
import RegisterCompany from "./pages/company/Login/Register_company";
import LoginComapny from "./pages/company/Login/Login_Company";

/* ================= COMPANY DASHBOARD ================= */
import Overview from "./pages/company/Dashboard/overview";
import Profile from "./pages/company/Dashboard/Profile";
import Settings from "./pages/company/Dashboard/Settings";
import Subscription from "./pages/company/Dashboard/Subscription";
import InternshipList from "./pages/company/Dashboard/InternshipList";
import CompanyInternshipView from "./pages/company/Dashboard/CompanyInternshipView";
import Recruiter from "./pages/company/Dashboard/RecruiterList";
import CompanyLayoutWrapper from "./layout/CompanyLayoutWrapper";
import CompanyApprovals from "./pages/admin/CompanyApprovals";
import AddRecruiter from "./pages/company/Dashboard/AddRecruiter";
import EditRecruiter from "./pages/company/Dashboard/EditRecruiter";  
import Detail from "./pages/company/Dashboard/RecruiterProfile";
/* ================= OTHER ================= */
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/LoginAdmin";
import GoogleSuccess from "./pages/GoogleSuccess";
import AdminLayout from "./layout/AdminLayout"
import Dashboard from "./pages/admin/Dashboard";
import Companies from "./pages/admin/Companies";
import CompanyDetails from "./pages/admin/CompanyDetails";
import AdminSettings from "./pages/admin/AdminSettings";
import Recruiters from "./pages/admin/Recruiters";
import Students from "./pages/admin/Students";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import PlansManagement from "./pages/admin/PlansManagement";
import AdminUsers from "./pages/admin/AdminUsers";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminAuthRedirect from "./guards/AdminAuthRedirect";
import AdminProtectedRoute from "./guards/AdminProtectedRoute";
import StudentProfileRequiredRoute from "./guards/StudentProfileRequiredRoute";
import RecruiterLayout from "./layout/RecruiterLayout";
import Recuiter_Dashboard from "./pages/recruiter/Dashboard";
import RecruiterLayoutWrapper from "./layout/RecruiterLayoutWrapper";
import InternshipListr from "./pages/recruiter/InternshipList";
import CreateInternship from "./pages/recruiter/CreateInternship";
import PostInternship from "./pages/recruiter/PostInternship";
import RecruiterSettings from "./pages/recruiter/Settings";
import RecruiterApplicants from "./pages/recruiter/Applicants";



function App() {
  return (
    <VerificationProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<RecruiterLayoutWrapper />}>
  <Route element={<RecruiterLayout />}>
    <Route
      path="/recruiter/dashboard"
      element={<Recuiter_Dashboard />}
    />
<Route path="/recruiter/internships" element={<InternshipListr />} />
<Route path="/recruiter/internships/create" element={<CreateInternship />} />
<Route path="/recruiter/internships/post" element={<PostInternship />} />
<Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
<Route path="/recruiter/settings" element={<RecruiterSettings />} />

    {/* future routes */}
    {/* <Route path="/recruiter/internships" element={<Internships />} /> */}
  </Route>
</Route>



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
          <Route
            path="/student-dashboard"
            element={
              <StudentProfileRequiredRoute>
                <Navigate to="/student/watchlist" replace />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/ai-recommend"
            element={
              <StudentProfileRequiredRoute>
                <AIRecommend />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/explore"
            element={
              <StudentProfileRequiredRoute>
                <ExploreInternships />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/explore/:id"
            element={
              <StudentProfileRequiredRoute>
                <InternshipDetails />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/applied"
            element={
              <StudentProfileRequiredRoute>
                <AppliedInternships />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/resume"
            element={
              <StudentProfileRequiredRoute>
                <MyResume />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/watchlist"
            element={
              <StudentProfileRequiredRoute>
                <SavedInternshipsPro />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <StudentProfileRequiredRoute requireCompletion={false}>
                <StudentProfile />
              </StudentProfileRequiredRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <StudentProfileRequiredRoute>
                <StudentSettings />
              </StudentProfileRequiredRoute>
            }
          />
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
            <Route path="/company/dashboard/recruiters/add" element={<AddRecruiter />} />
            <Route path="/company/dashboard/recruiters/:id/edit" element={<EditRecruiter />} />
            <Route path="/company/dashboard/recruiters/:id" element={<Detail />} />
            <Route
              path="/company/dashboard/internships/:id"
              element={<CompanyInternshipView />}
            />
          </Route>

          {/* ========== OTHER ========== */}
          <Route path="/auth/recruiter/login" element={<LoginRecruiter />} />


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
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="students" element={<Students />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="plans" element={<PlansManagement />} />
            <Route path="admins" element={<AdminUsers />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            {/* <Route path="recruiters" element={<Recruiters />}/> */}
            {/* 
            <Route path="students" element={<Students />} />
             
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
