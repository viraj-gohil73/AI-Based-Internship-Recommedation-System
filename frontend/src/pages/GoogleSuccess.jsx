import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role"); // ✅ FIXED

    console.log("GOOGLE TOKEN 👉", token);
    console.log("GOOGLE ROLE 👉", role);

    if (!token || !role) {
      console.log("Missing token or role, redirecting to login");
      navigate("/auth/company/login", { replace: true });
      return;
    }

    // ✅ SAVE BOTH (MANDATORY)
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ role })
    );

    console.log("TOKEN SAVED 👉", localStorage.getItem("token"));
    console.log("USER SAVED 👉", localStorage.getItem("user"));

    // ✅ ROLE BASED REDIRECT
    if (role === "company") {
      navigate("/company/dashboard/overview", { replace: true });
    } else if (role === "student") {
      navigate("/student-dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <p>Logging in with Google...</p>;
};

export default GoogleSuccess;
