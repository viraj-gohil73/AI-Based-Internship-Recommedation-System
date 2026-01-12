import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast  from 'react-hot-toast';

export default function RegisterCompany() {
    const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName :"",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const { companyName, email, password } = formData;

  // ---------- Company Name ----------
  if (!companyName.trim()) {
    toast.error("Company name is required");
    return;
  }

  if (companyName.trim().length < 3) {
    toast.error("Company name must be at least 3 characters");
    return;
  }

  // ---------- Email ----------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    toast.error("Email is required");
    return;
  }

  if (!emailRegex.test(email)) {
    toast.error("Enter a valid email address");
    return;
  }

  // ---------- Password ----------
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

  if (!password.trim()) {
    toast.error("Password is required");
    return;
  }

  if (!passwordRegex.test(password)) {
    toast.error(
      "Password must be 8+ chars with uppercase, lowercase, number & special character"
    );
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password,
        role: "company",
      }),
    });

    const data = await res.json();
console.log(data);
    if (!res.ok) {
      toast.error(data.message || "Something went wrong");
      return;
    }

    toast.success(data.message);

    navigate("/otp", {
  state: {
    email,
    password,
    companyName,
    role: "company",
  },
});
       } catch (err) {
    toast.error("Server not responding");
  }
};


  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/company/google/company";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      
      <div className="w-full max-w-sm  bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-7 lg:p-6 shadow-xl">
        <h3 className="mb-6 text-center text-3xl font-semibold tracking-tight text-gray-800">
          Create Account
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            
            <div className="flex-1 mt-3 sm:mt-0">
                <label className="text-gray-700 text-sm  font-medium mb-1 block">
                Company Name
                </label>
                <input
  type="text"
  name="companyName"
  maxLength={30}
  placeholder="Enter Company Name"
  value={formData.companyName}
  onChange={(e) => {
    let value = e.target.value;

    // Remove leading spaces
    value = value.replace(/^\s+/, "");

    // Replace multiple spaces with single space
    value = value.replace(/\s{2,}/g, " ");

    setFormData({ ...formData, companyName: value });
  }}
  onKeyDown={(e) => {
    // Prevent space as first character
    if (e.key === " " && formData.companyName.length === 0) {
      e.preventDefault();
    }
  }}
  className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none"
  required
/>

            </div>
            </div>

          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">
              Official Email
            </label>
            <input
  type="email"
  name="email"
  maxLength={40}
  placeholder="Enter your official email"
  value={formData.email}
  onChange={(e) => {
    const value = e.target.value.replace(/\s/g, ""); // ❌ remove spaces
    setFormData({ ...formData, email: value });
  }}
  onKeyDown={(e) => {
    if (e.key === " ") e.preventDefault(); // ❌ block space key
  }}
  className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none"
  required
/>

          </div>

          {/* Password with Show/Hide toggle */}
<div className="relative">
  <label className="text-gray-700 text-sm  font-medium mb-1 block">
    Password
  </label>
  <input
  type={showPassword ? "text" : "password"}
  name="password"
  maxLength={30}
  placeholder="Enter your password"
  value={formData.password}
  onChange={(e) => {
    const value = e.target.value.replace(/\s/g, ""); // ❌ remove all spaces
    setFormData({ ...formData, password: value });
  }}
  onKeyDown={(e) => {
    if (e.key === " ") e.preventDefault(); // ❌ block space key
  }}
  className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
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
        className="w-5 h-5"
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
        className="w-5 h-5"
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

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Register as Company
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
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-3">
          {/* <button
            type="button"
            onClick={linkedinLogin}
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="30" height="30" src="https://img.icons8.com/fluency/96/linkedin.png" alt="linkedin"/>
            LinkedIn
          </button> */}

          <button
            type="button"
            onClick={googleLogin}
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="28" height="28" src="https://img.icons8.com/fluency/96/google-logo.png" alt="google-logo"/>
            Continue with  Google
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-gray-700 mt-4 text-sm sm:text-base">
          Already have an account?{" "}
          <a
            href="/auth/company/login"
            className="text-indigo-600 font-medium hover:underline transition"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
