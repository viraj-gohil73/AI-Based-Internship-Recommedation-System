import React, { useState } from "react";
import { Link, useParams } from "react-router-dom"; // or use Next.js useSearchParams

export default function ResetPassword() {
  const { token } = useParams(); // optional, if you send token in URL like /reset-password/:token
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Check empty fields
  if (!formData.password.trim() || !formData.confirmPassword.trim()) {
    setError("Please fill all fields");
    return;
  }

  // ✅ Check password length
  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters long");
    return;
  }

  // ✅ Check password strength (optional but recommended)
  // Must contain at least one uppercase letter, one lowercase, one number
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!strongPassword.test(formData.password)) {
    setError("Password must contain uppercase, lowercase, and a number");
    return;
  }

  // ✅ Check both passwords match
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  // ✅ If everything is fine
  setError("");

  try {
    // 🔐 Call your backend API here
    // const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ password: formData.password }),
    // });

    console.log("Password reset successfully!");
    alert("Your password has been reset successfully!");
    setFormData({ password: "", confirmPassword: "" });
  } catch (err) {
    console.error(err);
    setError("Something went wrong. Try again later.");
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8  bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-7 lg:p-8">
        <h2 className="text-2xl font-bold text-center mb-3">Reset Password</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 text-white hover:bg-blue-700 rounded-lg font-medium cursor-pointer transition"
          >
            Reset Password
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
