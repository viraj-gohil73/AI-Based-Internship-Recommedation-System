import React, { useState } from "react";

export default function ChooseUserType() {
  const [selectedRole, setSelectedRole] = useState("student");

  const handleContinue = () => {
    if (!selectedRole) {
      alert("Please select an option!");
      return;
    }

    if (selectedRole === "student") {
      window.location.href = "/register-student"; // redirect to student signup
    } else {
      window.location.href = "/register-recruiter"; // redirect to recruiter signup
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="flex w-[900px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')] bg-cover bg-center flex flex-col justify-end p-6 text-white">
          <div className="bg-black/40 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Assessments</h2>
            <p className="text-sm">
              Evaluate skills with tailored tests for candidates alike.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6">Create a new account</h2>
            <p className="text-gray-500 mb-8">
              Join and find your dream job or recruit talented candidates
            </p>

            {/* Candidate Option */}
            <div
              onClick={() => setSelectedRole("student")}
              className={`cursor-pointer mb-4 border rounded-xl p-4 flex items-center justify-between transition ${
                selectedRole === "student"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-lg">Sign up as a Candidate</h3>
                <p className="text-sm text-gray-500">
                  Apply For Internships
                </p>
              </div>
              {selectedRole === "student" && (
                <span className="text-yellow-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/fluency/48/student-male.png" alt="student-male"/></span>
              )}
            </div>

            {/* Recruiter Option */}
            <div
              onClick={() => setSelectedRole("recruiter")}
              className={`cursor-pointer border rounded-xl p-4 flex items-center justify-between transition ${
                selectedRole === "recruiter"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-lg">Sign up as a Company</h3>
                <p className="text-sm text-gray-500">
                  Hire Talented Candidates
                </p>
              </div>
              {selectedRole === "recruiter" && (
                <span className="text-blue-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/color/48/permanent-job.png" alt="permanent-job"/></span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 font-semibold">
                Login
              </a>
            </p>
            <button
              onClick={handleContinue}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
