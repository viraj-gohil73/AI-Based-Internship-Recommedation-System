import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.role.trim()) {
      alert("Please select your role");
      return;
    }

    console.log("Login Data:", formData);
    alert("Login Successful! (Check console for details)");

    setFormData({
      email: "",
      password: "",
      role: "",
    });
    // 🔐 Add your API or Firebase login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      {/* 🧊 Glassy Login Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/80 p-5 sm:p-6 md:p-7 lg:p-8 py-5  shadow-2xl border border-gray-200">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Role Dropdown */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Login as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md text-sm border cursor-pointer border-gray-300 p-2 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition"
              required
            >
              <option value="">Select Role</option>
              <option value="user">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 font-medium hover:underline transition hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or Login with</span>
          </div>
        </div>

        {/* Social Buttons */}
         <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-3">
          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="30" height="30" src="https://img.icons8.com/fluency/96/linkedin.png" alt="linkedin"/>
            LinkedIn
          </button>

          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="28" height="28" src="https://img.icons8.com/fluency/96/google-logo.png" alt="google-logo"/>
            Google
          </button>
        </div>

        <p className="text-center text-gray-700 mt-4 text-sm sm:text-base">
          Not have an account?{" "}
          <a
            href="/register"
            className="text-indigo-600 font-medium hover:underline transition"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
