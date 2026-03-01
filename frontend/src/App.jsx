import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import CompanyEditInternship from "./pages/company/Dashboard/EditInternship";
import Recruiter from "./pages/company/Dashboard/RecruiterList";
import CompanyReviews from "./pages/company/Dashboard/Reviews";
import CompanyAnalytics from "./pages/company/Dashboard/Analytics";
import CompanyLayoutWrapper from "./layout/CompanyLayoutWrapper";
import CompanyApprovals from "./pages/admin/CompanyApprovals";
import AddRecruiter from "./pages/company/Dashboard/AddRecruiter";
import EditRecruiter from "./pages/company/Dashboard/EditRecruiter";
import Detail from "./pages/company/Dashboard/RecruiterProfile";

/* ================= OTHER ================= */
import LoginRecruiter from "./pages/recruiter/Recruiter_login";
import LoginAdmin from "./pages/admin/LoginAdmin";
import GoogleSuccess from "./pages/GoogleSuccess";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Companies from "./pages/admin/Companies";
import CompanyDetails from "./pages/admin/CompanyDetails";
import AdminSettings from "./pages/admin/AdminSettings";
import Recruiters from "./pages/admin/Recruiters";
import Internships from "./pages/admin/Internships";
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
import RecruiterInternshipView from "./pages/recruiter/InternshipView";
import RecruiterEditInternship from "./pages/recruiter/EditInternship";
import RecruiterApplicantDetail from "./pages/recruiter/ApplicantDetail";
import RecruiterInterviews from "./pages/recruiter/Interviews";
import RecruiterAnalytics from "./pages/recruiter/Analytics";

const APP_NAME = "InternVision";

const ROLE_THEME = {
  admin: { label: "Admin", bg: "#dc2626", fg: "#ffffff", glyph: "A" },
  student: { label: "Student", bg: "#2563eb", fg: "#ffffff", glyph: "S" },
  company: { label: "Company", bg: "#059669", fg: "#ffffff", glyph: "C" },
  recruiter: { label: "Recruiter", bg: "#7c3aed", fg: "#ffffff", glyph: "R" },
  public: { label: "Public", bg: "#334155", fg: "#ffffff", glyph: "I" },
};

const getRouteMeta = (pathname = "") => {
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/dashboard") return { role: "admin", page: "Dashboard" };
    if (pathname === "/admin/approvals") return { role: "admin", page: "Approvals" };
    if (pathname === "/admin/companies") return { role: "admin", page: "Companies" };
    if (/^\/admin\/companies\/[^/]+$/.test(pathname)) return { role: "admin", page: "Company Details" };
    if (pathname === "/admin/recruiters") return { role: "admin", page: "Recruiters" };
    if (pathname === "/admin/internships") return { role: "admin", page: "Internships" };
    if (pathname === "/admin/students") return { role: "admin", page: "Students" };
    if (pathname === "/admin/subscriptions") return { role: "admin", page: "Subscriptions" };
    if (pathname === "/admin/plans") return { role: "admin", page: "Plans" };
    if (pathname === "/admin/admins") return { role: "admin", page: "Admin Users" };
    if (pathname === "/admin/reports") return { role: "admin", page: "Reports" };
    if (pathname === "/admin/audit-logs") return { role: "admin", page: "Audit Logs" };
    if (pathname === "/admin/settings") return { role: "admin", page: "Settings" };
    return { role: "admin", page: "Portal" };
  }

  if (pathname.startsWith("/student")) {
    if (pathname === "/student/watchlist") return { role: "student", page: "Watchlist" };
    if (pathname === "/student/explore") return { role: "student", page: "Explore Internships" };
    if (/^\/student\/explore\/[^/]+$/.test(pathname)) return { role: "student", page: "Internship Details" };
    if (pathname === "/student/applied") return { role: "student", page: "Applied Internships" };
    if (pathname === "/student/resume") return { role: "student", page: "My Resume" };
    if (pathname === "/student/profile") return { role: "student", page: "Edit Profile" };
    if (pathname === "/student/settings") return { role: "student", page: "Settings" };
    if (pathname === "/student/ai-recommend") return { role: "student", page: "AI Recommend" };
    return { role: "student", page: "Dashboard" };
  }

  if (pathname.startsWith("/company/dashboard")) {
    if (pathname === "/company/dashboard/dashboard") return { role: "company", page: "Dashboard" };
    if (pathname === "/company/dashboard/profile") return { role: "company", page: "Profile" };
    if (pathname === "/company/dashboard/settings") return { role: "company", page: "Settings" };
    if (pathname === "/company/dashboard/subscription") return { role: "company", page: "Subscription" };
    if (pathname === "/company/dashboard/internships") return { role: "company", page: "Internships" };
    if (pathname === "/company/dashboard/recruiters") return { role: "company", page: "Recruiters" };
    if (pathname === "/company/dashboard/analytics") return { role: "company", page: "Analytics" };
    if (pathname === "/company/dashboard/reviews") return { role: "company", page: "Reviews" };
    if (pathname === "/company/dashboard/recruiters/add") return { role: "company", page: "Add Recruiter" };
    if (/^\/company\/dashboard\/recruiters\/[^/]+\/edit$/.test(pathname)) return { role: "company", page: "Edit Recruiter" };
    if (/^\/company\/dashboard\/recruiters\/[^/]+$/.test(pathname)) return { role: "company", page: "Recruiter Profile" };
    if (/^\/company\/dashboard\/internships\/[^/]+\/edit$/.test(pathname)) return { role: "company", page: "Edit Internship" };
    if (/^\/company\/dashboard\/internships\/[^/]+$/.test(pathname)) return { role: "company", page: "Internship Details" };
    return { role: "company", page: "Portal" };
  }

  if (pathname.startsWith("/recruiter")) {
    if (pathname === "/recruiter/dashboard") return { role: "recruiter", page: "Dashboard" };
    if (pathname === "/recruiter/internships") return { role: "recruiter", page: "Internships" };
    if (pathname === "/recruiter/internships/create") return { role: "recruiter", page: "Create Internship" };
    if (pathname === "/recruiter/internships/post") return { role: "recruiter", page: "Post Internship" };
    if (/^\/recruiter\/internships\/edit\/[^/]+$/.test(pathname)) return { role: "recruiter", page: "Edit Internship" };
    if (/^\/recruiter\/internships\/[^/]+$/.test(pathname)) return { role: "recruiter", page: "Internship Details" };
    if (pathname === "/recruiter/applicants") return { role: "recruiter", page: "Applicants" };
    if (/^\/recruiter\/applicants\/[^/]+\/[^/]+$/.test(pathname)) return { role: "recruiter", page: "Applicant Details" };
    if (pathname === "/recruiter/interviews") return { role: "recruiter", page: "Interviews" };
    if (pathname === "/recruiter/analytics") return { role: "recruiter", page: "Analytics" };
    if (pathname === "/recruiter/settings") return { role: "recruiter", page: "Settings" };
    return { role: "recruiter", page: "Portal" };
  }

  if (pathname === "/login-admin") return { role: "admin", page: "Login" };
  if (pathname === "/login-student") return { role: "student", page: "Login" };
  if (pathname === "/register-student") return { role: "student", page: "Register" };
  if (pathname === "/auth/company/login") return { role: "company", page: "Login" };
  if (pathname === "/auth/company/register") return { role: "company", page: "Register" };
  if (pathname === "/auth/recruiter/login") return { role: "recruiter", page: "Login" };
  if (pathname === "/otp") return { role: "public", page: "OTP Verification" };
  if (pathname === "/forgot-password") return { role: "public", page: "Forgot Password" };
  if (pathname === "/reset-password") return { role: "public", page: "Reset Password" };
  if (pathname === "/choose-register") return { role: "public", page: "Choose Register Role" };
  if (pathname === "/choose-login") return { role: "public", page: "Choose Login Role" };

  return { role: "public", page: pathname === "/" ? "Home" : "Page" };
};

const buildFaviconDataUrl = (theme) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${theme.bg}"/><text x="32" y="41" font-size="30" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" fill="${theme.fg}">${theme.glyph}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

function RouteMetaManager() {
  const location = useLocation();

  useEffect(() => {
    const { role } = getRouteMeta(location.pathname);
    const theme = ROLE_THEME[role] || ROLE_THEME.public;
    document.title = `${theme.label} | ${APP_NAME}`;

    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      document.head.appendChild(favicon);
    }

    favicon.setAttribute("type", "image/svg+xml");
    favicon.setAttribute("href", buildFaviconDataUrl(theme));
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <VerificationProvider>
      <BrowserRouter>
        <RouteMetaManager />
        <Routes>
          <Route element={<RecruiterLayoutWrapper />}>
            <Route element={<RecruiterLayout />}>
              <Route path="/recruiter/dashboard" element={<Recuiter_Dashboard />} />
              <Route path="/recruiter/internships" element={<InternshipListr />} />
              <Route path="/recruiter/internships/create" element={<CreateInternship />} />
              <Route path="/recruiter/internships/post" element={<PostInternship />} />
              <Route path="/recruiter/internships/:id" element={<RecruiterInternshipView />} />
              <Route path="/recruiter/internships/edit/:id" element={<RecruiterEditInternship />} />
              <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
              <Route path="/recruiter/applicants/:internshipId/:studentId" element={<RecruiterApplicantDetail />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
              <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
              <Route path="/recruiter/settings" element={<RecruiterSettings />} />
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
          <Route path="/student-dashboard" element={<StudentProfileRequiredRoute><Navigate to="/student/watchlist" replace /></StudentProfileRequiredRoute>} />
          <Route path="/student/ai-recommend" element={<StudentProfileRequiredRoute><AIRecommend /></StudentProfileRequiredRoute>} />
          <Route path="/student/explore" element={<StudentProfileRequiredRoute><ExploreInternships /></StudentProfileRequiredRoute>} />
          <Route path="/student/explore/:id" element={<StudentProfileRequiredRoute><InternshipDetails /></StudentProfileRequiredRoute>} />
          <Route path="/student/applied" element={<StudentProfileRequiredRoute><AppliedInternships /></StudentProfileRequiredRoute>} />
          <Route path="/student/resume" element={<StudentProfileRequiredRoute><MyResume /></StudentProfileRequiredRoute>} />
          <Route path="/student/watchlist" element={<StudentProfileRequiredRoute><SavedInternshipsPro /></StudentProfileRequiredRoute>} />
          <Route path="/student/profile" element={<StudentProfileRequiredRoute requireCompletion={false}><StudentProfile /></StudentProfileRequiredRoute>} />
          <Route path="/student/settings" element={<StudentProfileRequiredRoute><StudentSettings /></StudentProfileRequiredRoute>} />

          {/* ========== COMPANY AUTH ROUTES ========== */}
          <Route path="/auth/company/register" element={<RegisterCompany />} />
          <Route path="/auth/company/login" element={<LoginComapny />} />

          {/* ========== COMPANY DASHBOARD (LOCKED LOGIC HERE) ========== */}
          <Route element={<CompanyLayoutWrapper />}>
            <Route path="/company/dashboard/overview" element={<Navigate to="/company/dashboard/dashboard" replace />} />
            <Route path="/company/dashboard/dashboard" element={<Overview />} />
            <Route path="/company/dashboard/profile" element={<Profile />} />
            <Route path="/company/dashboard/settings" element={<Settings />} />
            <Route path="/company/dashboard/subscription" element={<Subscription />} />
            <Route path="/company/dashboard/internships" element={<InternshipList />} />
            <Route path="/company/dashboard/recruiters" element={<Recruiter />} />
            <Route path="/company/dashboard/analytics" element={<CompanyAnalytics />} />
            <Route path="/company/dashboard/reviews" element={<CompanyReviews />} />
            <Route path="/company/dashboard/recruiters/add" element={<AddRecruiter />} />
            <Route path="/company/dashboard/recruiters/:id/edit" element={<EditRecruiter />} />
            <Route path="/company/dashboard/recruiters/:id" element={<Detail />} />
            <Route path="/company/dashboard/internships/:id" element={<CompanyInternshipView />} />
            <Route path="/company/dashboard/internships/:id/edit" element={<CompanyEditInternship />} />
          </Route>

          {/* ========== OTHER ========== */}
          <Route path="/auth/recruiter/login" element={<LoginRecruiter />} />
          <Route path="/login-admin" element={<AdminAuthRedirect><LoginAdmin /></AdminAuthRedirect>} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="approvals" element={<CompanyApprovals />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetails />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="internships" element={<Internships />} />
            <Route path="students" element={<Students />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="plans" element={<PlansManagement />} />
            <Route path="admins" element={<AdminUsers />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/company/google-success" element={<GoogleSuccess />} />
        </Routes>
      </BrowserRouter>
    </VerificationProvider>
  );
}

export default App;


