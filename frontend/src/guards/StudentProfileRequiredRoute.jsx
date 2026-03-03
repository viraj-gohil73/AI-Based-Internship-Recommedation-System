import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const REQUIRED_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "gender", label: "Gender" },
  { key: "dob", label: "Date of Birth" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pincode", label: "Pincode" },
  { key: "preferredLocation", label: "Preferred Location" },
];

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
};

const getProfileCompletion = (profile) => {
  if (!profile) {
    return {
      complete: false,
      missingFields: REQUIRED_FIELDS.map((field) => field.label),
    };
  }

  const missingFields = [];

  REQUIRED_FIELDS.forEach(({ key, label }) => {
    if (String(profile[key] || "").trim().length === 0) {
      missingFields.push(label);
    }
  });

  const normalizedPhone = normalizePhone(profile.phone);
  if (normalizedPhone.length !== 10 && !missingFields.includes("Phone")) {
    missingFields.push("Phone");
  }

  const normalizedPincode = String(profile.pincode || "").replace(/\D/g, "");
  if (normalizedPincode.length !== 6 && !missingFields.includes("Pincode")) {
    missingFields.push("Pincode");
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.email || "").trim()) &&
    !missingFields.includes("Email")
  ) {
    missingFields.push("Email");
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
  };
};

export default function StudentProfileRequiredRoute({ children, requireCompletion = true }) {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    complete: false,
    missingFields: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({
        loading: false,
        authenticated: false,
        complete: false,
        missingFields: [],
      });
      return;
    }

    const controller = new AbortController();

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          const err = new Error("Profile fetch failed");
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then((data) => {
        const completion = getProfileCompletion(data?.profile);

        setState({
          loading: false,
          authenticated: true,
          complete: completion.complete,
          missingFields: completion.missingFields,
        });
      })
      .catch((error) => {
        if (error?.status === 401 || error?.status === 403) {
          setState({
            loading: false,
            authenticated: false,
            complete: false,
            missingFields: [],
          });
          return;
        }

        // Avoid hard redirecting to profile on transient API failures during refresh.
        setState({
          loading: false,
          authenticated: true,
          complete: true,
          missingFields: [],
        });
      });

    return () => controller.abort();
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
        Checking profile...
      </div>
    );
  }

  if (!state.authenticated) {
    return <Navigate to="/login-student" replace />;
  }

  if (requireCompletion && !state.complete) {
    return (
      <Navigate
        to="/student/profile"
        replace
        state={{
          profileRequired: true,
          from: location.pathname,
          missingFields: state.missingFields,
        }}
      />
    );
  }

  return children;
}
