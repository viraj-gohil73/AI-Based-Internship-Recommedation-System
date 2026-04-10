import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast  from 'react-hot-toast';
import { API_BASE_URL } from "../../utils/apiBaseUrl";

export default function RegisterStudent() {
    const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fname :"",
    lname :"",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password.trim()) {
      setError("Enter Passwords ");
      return;
    }
    setError("");
    try{
    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        role: "student",
      }),
    });
  
    const data = await res.json();

    if (data.success) {
      toast.success(data.message);
      navigate("/otp", {
  state: {
    email: formData.email,
    password: formData.password,
    fname: formData.fname,
    lname: formData.lname,
    role: "student",
  },
});
    } else {
      toast.error(data.message);
    }
    }
  catch(error)
  {
    toast.error("Server not responding");
  }
};

 const handleGoogleLogin = async () => {
 window.location.href = `${API_BASE_URL}/api/auth/google/student`;
};

  const linkedinLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/linkedin`;
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-0 shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-6 px-6 text-center">
          <h3 className="text-3xl font-semibold tracking-tight text-white drop-shadow-lg">Create Account</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4  px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <div className="flex-1">
                <label className="text-gray-700 text-sm  font-medium mb-1 block">
                First Name
                </label>
                <input
                type="text"
                name="fname"
                maxLength={15}
                placeholder="Enter First Name"
                value={formData.fname}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 text-gray-900 px-2 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                />
            </div>

            <div className="flex-1 mt-3 sm:mt-0">
                <label className="text-gray-700 text-sm  font-medium mb-1 block">
                Last Name
                </label>
                <input
                type="text"
                name="lname"
                    maxLength={15}
                placeholder="Enter Last Name"
                value={formData.lname}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                />
            </div>
            </div>

          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm font-medium mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              maxLength={40}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mx-8 sm:mt-3">
          

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base font-semibold shadow-sm"
          >
            <img width="28" height="28" src="https://img.icons8.com/fluency/96/google-logo.png" alt="google-logo"/>
            Google
          </button>
        </div>

        {/* Already have an account */}
        <p className="text-center text-gray-700 my-4 text-sm sm:text-base">
          Already have an account?{" "}
          <a
            href="/login-student"
            className="text-indigo-600 font-medium hover:underline transition"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}


