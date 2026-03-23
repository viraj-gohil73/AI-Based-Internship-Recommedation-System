import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const registerRoles = [
  {
    role: "student",
    title: "Sign up as Candidate",
    subtitle: "Apply to internships and track your applications",
    icon: "https://img.icons8.com/fluency/48/student-male.png",
    label: "Talent",
  },
  {
    role: "recruiter",
    title: "Sign up as Company",
    subtitle: "Post roles, shortlist profiles, and hire faster",
    icon: "https://img.icons8.com/3d-fluency/50/company.png",
    label: "Employer",
  },
];

export default function ChooseUserType() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    const routes = {
      student: "/register-student",
      recruiter: "/auth/company/register",
    };

    if (!selectedRole) return;
    navigate(routes[selectedRole]);
  };

  const OptionCard = ({ role, title, subtitle, icon, label, index }) => {
    const isActive = selectedRole === role;

    return (
      <motion.button
        type="button"
        onClick={() => setSelectedRole(role)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.08 }}
        className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
          ${
            isActive
              ? "border-blue-500 bg-blue-50 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.8)]"
              : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
          }`}
      >
        <div className="pr-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700/80">
            {label}
          </p>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {isActive && <CheckCircle className="h-5 w-5 text-blue-600" />}
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition
              ${isActive ? "border-blue-200 bg-white" : "border-gray-200 bg-gray-50"}`}
          >
            <img src={icon} alt={role} className="h-8 w-8" />
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_40px_100px_-45px_rgba(59,130,246,0.7)] backdrop-blur"
      >
        <div className="relative hidden md:flex md:w-5/12">
          <img
            src="https://img.freepik.com/premium-photo/character-illustration_961307-36813.jpg?w=1480"
            alt="Register illustration"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent p-8 text-white" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              Quick Setup
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight">
              Start in minutes and switch between candidate or company workflows.
            </h2>
          </div>
        </div>

        <div className="w-full p-6 sm:p-8 md:w-7/12 lg:p-10">
          <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            New Account
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose how you want to join
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Pick your role and continue to the correct registration flow.
          </p>

          <div className="mt-6 grid gap-3">
            {registerRoles.map((item, index) => (
              <OptionCard key={item.role} index={index} {...item} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/choose-login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Login
              </Link>
            </p>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
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
