import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ChooseUserLogin() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;

    const routes = {
      student: "/login-student",
      company: "/auth/company/login",
      recruiter: "/login-recruiter",
      admin: "/login-admin",
    };

    navigate(routes[selectedRole]);
  };

  const RoleCard = ({ role, title, subtitle, icon }) => {
    const active = selectedRole === role;

    return (
      <div
        onClick={() => setSelectedRole(role)}
        className={`cursor-pointer mb-4 border rounded-xl px-4 py-3  flex items-center justify-between transition-all
          ${
            active
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-gray-200 hover:bg-gray-50"
          }`}
      >
        <div>
          <h3 className="font-semibold text-md">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {active && (
          <img
            src={icon}
            alt={role}
            className="w-9 h-9"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4">
      <div className="flex lg:w-[900px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Left Image */}
        <div className="relative w-md hidden md:flex flex-col justify-center text-white ml-2">
          <img
            src="https://img.freepik.com/premium-vector/candidate-hr-manager-having-job-interview_179970-134.jpg?w=1080"
            alt="Interview"
            className="object-cover"
            width="460"
            height="520"
            
          />
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Login to Your Account
            </h2>

            <RoleCard
              role="student"
              title="Login as Candidate"
              subtitle="Apply for Internships"
              icon="https://img.icons8.com/fluency/48/student-male.png"
            />

            <RoleCard
              role="recruiter"
              title="Login as Recruiter"
              subtitle="Post Internship Opportunities"
              icon="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/50/external-recruiter-recruitment-agency-flaticons-lineal-color-flat-icons-2.png"
            />

            <RoleCard
              role="company"
              title="Login as Company"
              subtitle="Manage Job Postings"
              
              icon="https://img.icons8.com/3d-fluency/50/company.png"
              
            />
            

            <RoleCard
              role="admin"
              title="Login as Admin"
              subtitle="Manage Platform Operations"
              icon="https://img.icons8.com/doodle/50/settings--v2.png"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <a
                href="/choose-register"
                className="text-blue-600 font-semibold"
              >
                Register
              </a>
            </p>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-6 py-2 ml-2 rounded-lg text-white transition
                ${
                  selectedRole
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
