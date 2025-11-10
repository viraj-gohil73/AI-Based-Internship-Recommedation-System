import React, { useState } from "react";

export default function ChooseUserLogin() {
  const [selectedRole, setSelectedRole] = useState("student");

  const handleContinue = () => {
    if (!selectedRole) {
      alert("Please select an option!");
      return;
    }

    if (selectedRole === "student") {
      window.location.href = "/login-student"; // redirect to student login
    } 
    else if(selectedRole === "Company"){
      window.location.href = "/login-company"; // redirect to company login
    }
    else if(selectedRole === "recruiter"){
      window.location.href = "/login-recruiter"; // redirect to recruiter login
    }
    else if(selectedRole === "admin"){
      window.location.href = "/login-admin"; // redirect to admin login
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="flex lg:w-[900px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Section */}
        <div className="relative w-md hidden md:flex flex-col justify-center text-white">
  {/* Image */}
  <img
 
    src="https://img.freepik.com/premium-vector/candidate-hr-manager-having-job-interview_179970-134.jpg?w=1080"
    alt="Job Interview"
    //className="w-full h-full mx-2"
    width="460"
    height="520"

  />

</div>


        {/* Right Section */}
        <div className="md:w-1/2 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6">Login Your Account</h2>
        
            {/* Candidate Option */}
            <div
              onClick={() => setSelectedRole("student")}
              className={`cursor-pointer  mb-4 border rounded-xl px-4 py-2 flex items-center justify-between transition ${
                selectedRole === "student"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-md">Login as Candidate</h3>
                <p className="text-sm text-gray-500">
                  Apply For Internships
                </p>
              </div>
              {selectedRole === "student" && (
                <span className="text-yellow-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/fluency/48/student-male.png" alt="student-male"/></span>
              )}
            </div>

              <div
              onClick={() => setSelectedRole("Company")}
              className={`cursor-pointer mb-4 border rounded-xl px-4 py-2 flex items-center justify-between transition ${
                selectedRole === "Company"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-md">Login as Company</h3>
                <p className="text-sm text-gray-500">
                  Post Internship Opportunities
                </p>
              </div>
              {selectedRole === "Company" && (
                <span className="text-yellow-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/3d-fluency/50/company.png" alt="company-male"/></span>
              )}
            </div>

            <div
              onClick={() => setSelectedRole("recruiter")}
              className={`cursor-pointer mb-4 border rounded-xl px-4 py-2 flex items-center justify-between transition ${
                selectedRole === "recruiter"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-md">Login as Recruiter</h3>
                <p className="text-sm text-gray-500">
                  Manage Job Postings
                </p>
              </div>
              {selectedRole === "recruiter" && (
                <span className="text-yellow-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/50/external-recruiter-recruitment-agency-flaticons-lineal-color-flat-icons-2.png" alt="external-recruiter-recruitment-agency-flaticons-lineal-color-flat-icons-2"/></span>
              )}
            </div>

            {/* Recruiter Option */}
            <div
              onClick={() => setSelectedRole("admin")}
              className={`cursor-pointer border rounded-xl px-4 py-2 flex items-center justify-between transition ${
                selectedRole === "admin"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-semibold text-md">Login as Admin</h3>
                <p className="text-sm text-gray-500">
                 Manage Platform Operations
                </p>
              </div>
              {selectedRole === "admin" && (
                <span className="text-blue-500 text-2xl"><img width="36" height="36" src="https://img.icons8.com/doodle/50/settings--v2.png" alt="settings--v2"/></span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <a href="/choose-register" className="text-blue-600 font-semibold">
                Register
              </a>
            </p>
            <button
              onClick={handleContinue}
              className="bg-blue-600 text-white mx-4 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
