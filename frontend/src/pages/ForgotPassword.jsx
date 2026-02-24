import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

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
      console.log("Reset link sent to:", formData.email);
      toast.success("A password reset link has been sent. Please check your email to reset your password.");
      setFormData({ email: "" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-6 px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white drop-shadow-lg">
            Forgot Password
          </h2>
        </div>

        <div className="p-6 sm:p-7 lg:p-8">
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your registered email to receive a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-white hover:from-indigo-700 hover:to-blue-700 rounded-lg font-semibold cursor-pointer transition-all shadow-md"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

