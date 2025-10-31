import React, { useState } from "react";
import { Link } from "react-router-dom"; // or "next/link" if you're using Next.js

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Enter your email");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    setError("Enter a valid email address");
    return;
  }
  
    setError("");

    try {
      // ✅ Call your backend API here
      // const res = await fetch("http://localhost:5000/api/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.email }),
      // });

      console.log("Reset link sent to:", formData.email);
      alert("Reset link sent to your email!");
      setFormData({ email: "" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center px-4 sm:px-6 lg:px-8  min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-3">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 text-white hover:bg-blue-700 rounded-lg font-medium cursor-pointer transition"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
