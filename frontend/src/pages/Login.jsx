import React, { useState } from "react";
import { Link } from "react-router-dom"; // optional if you’re using React Router
//import { FcGoogle } from "react-icons/fc";
//import { FaGithub } from "react-icons/fa";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    // 🔐 Add your API or Firebase login logic here
  };

  const handleGoogleLogin = () => {
    console.log("Google Login Clicked");
  };

  const handleGithubLogin = () => {
    console.log("GitHub Login Clicked");
  };

  return (
    <div className="flex min-h-screen items-center justify-center  p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-200">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
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

          <div className="flex items-center  justify-end">
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

    {/* Social Login Buttons */}

    
       <div className="relative mt-3 ">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-3">
          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="34" height="34" src="https://img.icons8.com/sf-black-filled/64/github.png" alt="github"/>
            GitHub
          </button>

          <button
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 border text-gray-800 border-gray-300 rounded-lg py-2 sm:py-1 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            <img width="26" height="26" src="https://img.icons8.com/fluency/50/google-logo.png" alt="google-logo"/>
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
