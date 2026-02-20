import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const loginRoles = [
  {
    role: "student",
    title: "Login as Candidate",
    subtitle: "Apply for internships and track progress",
    icon: "https://img.icons8.com/fluency/48/student-male.png",
    label: "Most used",
  },
  {
    role: "recruiter",
    title: "Login as Recruiter",
    subtitle: "Post internships and review applicants",
    icon: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/50/external-recruiter-recruitment-agency-flaticons-lineal-color-flat-icons-2.png",
    label: "Hiring flow",
  },
  {
    role: "company",
    title: "Login as Company",
    subtitle: "Manage job postings and teams",
    icon: "https://img.icons8.com/3d-fluency/50/company.png",
    label: "Organization",
  },
  {
    role: "admin",
    title: "Login as Admin",
    subtitle: "Control platform settings and operations",
    icon: "https://img.icons8.com/doodle/50/settings--v2.png",
    label: "Restricted",
  },
];

export default function ChooseUserLogin() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;

    const routes = {
      student: "/login-student",
      company: "/auth/company/login",
      recruiter: "/auth/recruiter/login",
      admin: "/login-admin",
    };

    navigate(routes[selectedRole]);
  };

  const RoleCard = ({ role, title, subtitle, icon, label, index }) => {
    const isActive = selectedRole === role;

    return (
      <motion.button
        type="button"
        onClick={() => setSelectedRole(role)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className={`group flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${
            isActive
              ? "border-blue-500 bg-blue-50 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.8)]"
              : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
          }`}
      >
        <div className="pr-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700/80">
            {label}
          </p>
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
          <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {isActive && <CheckCircle className="h-4 w-4 text-blue-600" />}
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition
              ${isActive ? "border-blue-200 bg-white" : "border-gray-200 bg-gray-50"}`}
          >
            <img src={icon} alt={role} className="h-7 w-7" />
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute left-0 top-8 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_40px_100px_-45px_rgba(59,130,246,0.7)] backdrop-blur"
      >
        <div className="w-full p-5 sm:p-6 lg:p-7">
          <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Secure Login
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Choose your account type
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select the role you want to continue with.
          </p>

          <div className="mt-5 grid gap-2.5">
            {loginRoles.map((item, index) => (
              <RoleCard key={item.role} index={index} {...item} />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Need a new account?{" "}
              <Link
                to="/choose-register"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register
              </Link>
            </p>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
