import React, { useState, useRef, useEffect } from "react";
import toast  from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

export default function OtpVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, password, role } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    try {
      //sendotp();
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      let data = await res.json();
      if (data.success) {
        toast.success(" OTP Verified Successfully!");

        if(role == "student")
        {
          // 🔹 Now create user in DB
          const registerRes = await fetch("http://localhost:5000/api/auth/student/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
          });
          data = await registerRes.json();
        }
        if(role == "company")
        {
            const registerRes = await fetch("http://localhost:5000/api/auth/company/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, role }),
            });
            data = await registerRes.json();
        }
        
        //const data = await registerRes.json(); // ✅ must parse JSON first

        if (data.success) {
          toast.success("Account Created Successfully!");
          navigate("/login");
        } else {
          toast.error(data.message || "Failed to create account.");
        }
      } else if(enteredOtp < 6){
        toast.error(" Invalid OTP!");
      }
      else{
        toast.error("expired OTP!");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

const handleResendOtp = async () => {
    setLoading(false);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email,role }), // 👈 same email bhejna zaruri hai
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New OTP sent successfully ✅");
      } else {
        toast.error(data.message || "Failed to resend OTP ");
      }
    } catch (err) {
      toast.error("Server error ");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 ">
      <div className="bg-white shadow-lg rounded-2xl p-8 sm:p-10 w-full max-w-sm">
        <h2 className="text-2xl  font-bold text-center text-gray-800 mb-2">
          OTP Verification
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">
         Send verification code to 
          <span className="text-sm text-blue-700"> {email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex justify-between w-full max-w-sm mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-8 sm:w-10 h-10  caret-black text-center border-2 rounded-md focus:border-blue-500 focus:outline-none text-md font-semibold text-gray-700"
              />
            ))}
          </div>
          {msg && (
            <p className="text-center mb-2 text-sm text-red-500 font-medium">
              {msg}
            </p>
          )}
          

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white py-2 rounded-lg text-md font-medium transition-all duration-200`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          
        </form>

        <div className="text-center mt-6 text-sm text-gray-500">
          Didn’t receive the code?{" "}
          <button
            type="button"
            className="text-blue-600 cursor-pointer hover:underline font-medium"
            onClick={handleResendOtp}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}
