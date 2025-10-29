import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
//import githubLogo from "../assets/github-logo.svg";

// ✅ Schema Validation using Zod
const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    alert("Check console for form data. Authentication logic not implemented.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
       <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Create Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:gap-4">
          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className="w-full rounded-md bg-white border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="w-full rounded-md bg-white border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-700 text-sm sm:text-base font-medium mb-1 block">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              className="w-full rounded-md bg-white border border-gray-300 text-gray-900 px-3 py-2 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm ">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
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
  Already have an account?{" "}
  <a
    href="/login"
    className="text-indigo-600 font-medium hover:underline transition"
  >
    Login
  </a>
</p>
      </div>
    </div>
  );
}
