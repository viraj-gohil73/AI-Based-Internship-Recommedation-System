import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    toast.error("Email and password required");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    const fallbackAdmin = {
      name: formData.email.split("@")[0] || "Admin",
      email: formData.email,
    };
    localStorage.setItem(
      "adminUser",
      JSON.stringify(data.admin || fallbackAdmin)
    );
    toast.success("Admin login successful");

    setTimeout(() => {
      navigate("/admin/dashboard");
    }, 800);
  } catch (err) {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="admin-ui min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow-lg">
            Admin Login
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Dashboard access for administrators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">
              Official Email
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
              className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 mt-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.204 6.357 18 12 18c5.643 0 8.774-2.796 10.066-6a10.477 10.477 0 00-2.046-3.777M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                  />
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
            disabled={loading}
            className="w-full cursor-pointer rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md mt-2 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>

        </form>

        <div className="relative mt-1 px-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">quick access</span>
          </div>
        </div>

        <div className="mt-4 mb-6 text-center">
          <a
            href="/choose-login"
            className="text-md text-blue-600 font-medium hover:underline transition hover:text-blue-700"
          >
            Go Back
          </a>
        </div>

      </div>
    </div>
  );
}
