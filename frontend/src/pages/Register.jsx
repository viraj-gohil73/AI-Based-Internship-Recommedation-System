import React, { useState } from "react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.password.trim()) {
      setError("Enter Passwords ");
      return;
    }

    setError("");
    console.log("Form Data:", formData);
    alert("Account created successfully! (Check console for data)");
    setFormData({
      email: "",
      password: "",
      role: "",
    });
    // 🔐 Add your backend API call here
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      
      <div className="w-full max-w-sm  bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-xl">
        <h3 className="mb-4 text-center text-3xl font-bold text-gray-800">
          Create Account
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Register as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md text-sm border cursor-pointer border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select Role</option>
              <option value="user">Student</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>


          {/* Role Dropdown */}
          

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-3">
          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img
              width="30"
              height="30"
              src="https://img.icons8.com/sf-black-filled/64/github.png"
              alt="github"
            />
            GitHub
          </button>

          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img
              width="24"
              height="24"
              src="https://img.icons8.com/fluency/50/google-logo.png"
              alt="google-logo"
            />
            Google
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-gray-700 mt-4 text-sm sm:text-base">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 font-medium hover:underline transition"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
