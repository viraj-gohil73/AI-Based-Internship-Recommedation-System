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
    const role = params.get("role");

    if (!token || !role) {
      navigate("/auth/company/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ role }));

    if (role === "company") {
      navigate("/company/dashboard/dashboard", { replace: true });
    } else if (role === "student") {
      navigate("/student-dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <p>Logging in with Google...</p>;
};

export default GoogleSuccess;
