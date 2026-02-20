import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, ShieldCheck } from "lucide-react";

const loginRoutes = {
  student: "/login-student",
  company: "/auth/company/login",
};

const roleLabels = {
  student: "Student",
  company: "Company",
};

const registerConfigByRole = {
  student: {
    url: "http://localhost:5000/api/auth/student/register",
    buildPayload: ({ email, password, fname, lname }) => ({
      email,
      password,
      role: "student",
      fname,
      lname,
      name: `${fname || ""} ${lname || ""}`.trim(),
    }),
  },
  company: {
    url: "http://localhost:5000/api/auth/company/register",
    buildPayload: ({ email, password, companyName }) => ({
      email,
      password,
      companyName,
    }),
  },
};

const postJson = async (url, payload) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: "Unexpected server response" };
  }

  return { ok: res.ok, status: res.status, data };
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;

  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0] || ""}***@${domain}`;

  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
};

export default function OtpVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email || "";
  const password = state?.password || "";
  const role = state?.role || "";
  const fname = state?.fname || "";
  const lname = state?.lname || "";
  const companyName = state?.companyName || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  useEffect(() => {
    if (!email || !role) {
      toast.error("Session expired. Please register again.");
      navigate("/choose-register", { replace: true });
    }
  }, [email, role, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email || !role) return null;

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 1) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text") || "";
    const digits = pasted.replace(/\D/g, "").slice(0, 6).split("");

    if (!digits.length) return;

    e.preventDefault();

    const nextOtp = ["", "", "", "", "", ""];
    digits.forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    inputsRef.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting || resending) return;

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter 6 digit OTP");
      return;
    }

    const registerConfig = registerConfigByRole[role];
    if (!registerConfig) {
      toast.error("Unsupported role. Please register again.");
      return;
    }

    try {
      setSubmitting(true);

      const verifyRes = await postJson("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp: enteredOtp,
        role,
      });

      if (!verifyRes.ok || !verifyRes.data?.success) {
        toast.error(verifyRes.data?.message || "OTP verification failed");
        return;
      }

      const registerRes = await postJson(
        registerConfig.url,
        registerConfig.buildPayload({
          email,
          password,
          fname,
          lname,
          companyName,
        })
      );

      if (!registerRes.ok || !registerRes.data?.success) {
        toast.error(registerRes.data?.message || "Registration failed");
        return;
      }

      toast.success(registerRes.data?.message || "Account created successfully");
      navigate(loginRoutes[role] || "/choose-login", { replace: true });
    } catch {
      toast.error("Server error while verifying OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resending || submitting || cooldown > 0) return;

    const toastId = toast.loading("Sending OTP...");

    try {
      setResending(true);

      const resendRes = await postJson("http://localhost:5000/api/auth/send-otp", {
        email,
        role,
      });

      toast.dismiss(toastId);

      if (!resendRes.ok || !resendRes.data?.success) {
        toast.error(resendRes.data?.message || "Failed to resend OTP");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setCooldown(30);
      inputsRef.current[0]?.focus();
      toast.success("New OTP sent successfully");
    } catch {
      toast.dismiss(toastId);
      toast.error("Server not responding");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 py-8">
      <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_35px_80px_-45px_rgba(79,70,229,0.7)] backdrop-blur sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              OTP Verification
            </p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Verify Your Email</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter the 6-digit code sent to <span className="font-medium text-slate-700">{maskedEmail}</span>
            </p>
          </div>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {roleLabels[role] || role}
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <Mail className="h-4 w-4 text-indigo-600" />
          Check inbox and spam folder for your OTP mail.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`h-12 w-11 rounded-xl border text-center text-xl font-semibold text-slate-900 outline-none transition sm:w-12 ${
                  digit
                    ? "border-indigo-400 bg-indigo-50/70"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || resending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
          >
            {submitting ? "Verifying..." : "Verify and Create Account"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            to="/choose-register"
            className="inline-flex items-center gap-1 font-medium text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Change details
          </Link>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || submitting || cooldown > 0}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
