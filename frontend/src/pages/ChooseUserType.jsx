import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function ChooseUserType() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === "student") {
      navigate("/register-student");
    } else if (selectedRole === "recruiter") {
      navigate("/register-company");
    }
  };

  const OptionCard = ({ role, title, subtitle, icon }) => {
    const isActive = selectedRole === role;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedRole(role)}
        onKeyDown={(e) => e.key === "Enter" && setSelectedRole(role)}
        className={`cursor-pointer mb-4 border rounded-xl p-5 flex items-center justify-between transition-all duration-200
          ${
            isActive
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-gray-200 hover:bg-gray-50"
          }`}
      >
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {isActive && <CheckCircle className="text-blue-600 w-6 h-6" />}
          <img src={icon} alt={role} className="w-8 h-8" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 py-8">
      <div className="flex lg:w-[900px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Left Illustration */}
        <div className="hidden md:flex">
          <img
            src="https://img.freepik.com/premium-photo/character-illustration_961307-36813.jpg?w=1480"
            alt="Interview"
            className="object-cover"
            width="460"
            height="520"
          />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Create a New Account
            </h2>
            <p className="text-gray-500 mb-8">
              Join to apply for internships or hire talented candidates
            </p>

            <OptionCard
              role="student"
              title="Sign up as a Candidate"
              subtitle="Apply for Internships"
              icon="https://img.icons8.com/fluency/48/student-male.png"
            />

            <OptionCard
              role="recruiter"
              title="Sign up as a Company"
              subtitle="Hire Talented Candidates"
              icon="https://img.icons8.com/3d-fluency/50/company.png"
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a
                href="/choose-login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </a>
            </p>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-6 py-2 rounded-lg text-white transition
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
