import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function OtpVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/"); // safety
    return null;
  }

  const { email, password, role, fname, lname, companyName } = state;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

  if (enteredOtp.length !== 6) {
    toast.error("Please enter 6 digit OTP");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp: enteredOtp,
        role, // ✅ REQUIRED
      }),
    });

    const verifyData = await res.json();

    if (!verifyData.success) {
      toast.error(verifyData.message || "Invalid OTP");
      return;
    }

    toast.success("OTP verified successfully");

    let registerUrl = "";
    let payload = { email, password };

    if (role === "student") {
      registerUrl = "http://localhost:5000/api/auth/student/register";
      payload = { ...payload, fname, lname };
    }

    if (role === "company") {
      registerUrl = "http://localhost:5000/api/auth/company/register";
      payload = { ...payload, companyName };
    }

    if (role === "recruiter") {
      registerUrl = "http://localhost:5000/api/auth/recruiter/register";
    }

    const registerRes = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const registerData = await registerRes.json();

    if (registerData.success) {
      toast.success("Account created successfully");
      navigate(`/auth/${role}/login`);
    } else {
      toast.error(registerData.message || "Registration failed");
    }
  } catch (err) {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};


const handleResendOtp = async () => {
  if (!email) {
    toast.error("Email not found. Please register again.");
    return;
  }

  const toastId = toast.loading("Sending OTP...");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role, // ✅ IMPORTANT (student / company / recruiter)
      }),
    });

    const data = await res.json();
    toast.dismiss(toastId);

    if (data.success) {
      toast.success("New OTP sent successfully");
      setOtp(["", "", "", "", "", ""]); // ✅ clear old OTP
      inputsRef.current[0]?.focus();    // ✅ focus first box
    } else {
      toast.error(data.message || "Failed to resend OTP");
    }
  } catch (err) {
    toast.dismiss(toastId);
    toast.error("Server not responding");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-2">
          OTP Verification
        </h2>

        <p className="text-center text-sm text-gray-600 mb-4">
          Verification code sent to{" "}
          <span className="text-blue-700 font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-10 text-center border-2 rounded-md text-lg font-semibold"
              />
            ))}
          </div>

          <button
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResendOtp}
            className="text-blue-600 font-medium hover:underline"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}
