import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", formData);
    alert("Login Successful! (Check console for details)");

    setFormData({
      email: "",
      password: "",
      role: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-6 px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow-lg">
            Welcome Back
          </h2>
        </div>

        <div className="p-6 sm:p-7 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="relative">
              <label className="text-gray-700 text-sm font-medium mb-1 block">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                maxLength={30}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 mt-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 my-1 font-medium hover:underline transition hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md"
            >
              Login
            </button>
          </form>

          <div className="relative mt-6 mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or login with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-3">

            <button
              type="button"
              className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base font-semibold shadow-sm"
            >
              <img width="28" height="28" src="https://img.icons8.com/fluency/96/google-logo.png" alt="google-logo" />
              Google
            </button>
          </div>

          <p className="text-center text-gray-700 mt-6 text-sm sm:text-base">
            Don't have an account?{" "}
            <a href="/register-student" className="text-indigo-600 font-medium hover:underline transition">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
