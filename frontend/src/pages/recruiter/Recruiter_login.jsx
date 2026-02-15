import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/recruiter/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save token & user
      localStorage.setItem("recruiterToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.recruiter));

      // ✅ Redirect
      navigate("/recruiter/dashboard", { replace: true });

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/80 p-5 sm:p-6 md:p-7 lg:p-8 py-5 shadow-2xl border border-gray-200">
        <h2 className="mb-4 text-center text-3xl font-bold text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-2">
         
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-gray-700 text-sm font-medium mb-1 block">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              maxLength={30}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 mt-3 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" > <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" > <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" /> </svg> )}
            </button>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 my-1 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login as Recruiter"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/choose-login"
            className="text-md text-blue-600 font-medium hover:underline"
          >
            Go Back
          </a>
        </div>
      </div>
    </div>
  );
}
