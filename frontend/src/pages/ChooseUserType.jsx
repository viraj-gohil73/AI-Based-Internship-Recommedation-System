import React, { useState } from "react";

export default function ChooseUserType() {
  const [selectedRole, setSelectedRole] = useState("student");

  const handleContinue = () => {
    if (!selectedRole) {
      alert("Please select an option!");
      return;
    }

    if (selectedRole === "student") {
      window.location.href = "/register-student";
    } else {
      window.location.href = "/register-company";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 py-8">
      <div className="flex lg:w-[900px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Left Section (Hidden on small devices) */}
         <div className="relative w-md hidden md:flex flex-col justify-center text-white">
  {/* Image */}
  <img
 
    src="https://img.freepik.com/premium-photo/character-illustration_961307-36813.jpg?w=1480"
    alt="Job Interview"
    //className="w-full h-full mx-2"
    width="460"
    height="520"

  />

</div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center lg:text-left">
              Create a New Account
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base text-center lg:text-left">
              Join and find your dream job or recruit talented candidates
            </p>

            {/* Student Option */}
            <div
              onClick={() => setSelectedRole("student")}
              className={`cursor-pointer mb-4 border rounded-xl p-4 sm:p-5 flex items-center justify-between transition ${
                selectedRole === "student"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  Sign up as a Candidate
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Apply for Internships
                </p>
              </div>
              {selectedRole === "student" && (
                <img
                  width="36"
                  height="36"
                  src="https://img.icons8.com/fluency/48/student-male.png"
                  alt="student"
                  className="w-8 sm:w-9"
                />
              )}
            </div>

            {/* Company Option */}
            <div
              onClick={() => setSelectedRole("recruiter")}
              className={`cursor-pointer border rounded-xl p-4 sm:p-5 flex items-center justify-between transition ${
                selectedRole === "recruiter"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  Sign up as a Company
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Hire Talented Candidates
                </p>
              </div>
              {selectedRole === "recruiter" && (
                <img
                  width="36"
                  height="36"
                  src="https://img.icons8.com/3d-fluency/50/company.png"
                   alt="company-male"
                  className="w-8 sm:w-9"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-3">
            <p className="text-gray-500 text-sm text-center sm:text-left">
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
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
