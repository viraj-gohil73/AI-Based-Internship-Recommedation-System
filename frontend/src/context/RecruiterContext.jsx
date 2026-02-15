import { createContext, useContext, useEffect, useState } from "react";

const RecruiterContext = createContext(null);


export function RecruiterProvider({ children }) {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH RECRUITER ================= */
  const fetchRecruiter = async () => {
    try {
      const token = localStorage.getItem("recruiterToken");

      if (!token) {
        setRecruiter(null);
        return;
      }

      const res = await fetch("http://localhost:5000/api/recruiter/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result?.data) {
        throw new Error(result.message || "Failed to fetch recruiter");
      }

      const r = result.data;

      setRecruiter({
        dp: r.dp || "",
        id: r._id,
        name: r.name,
        email: r.email,
        role: "RECRUITER",
        avatar: r.avatar || "",
        mobile: r.mobile || "",
        designation: r.designation || "",
        companyId: r.companyId,
        status: r.status,
        createdAt: r.createdAt,
      });
    } catch (err) {
      console.error("Recruiter fetch error:", err);
      setRecruiter(null);
      localStorage.removeItem("recruiterToken");
    } finally {
      setLoading(false);
    }
  };

  /* ========== AUTO FETCH ON APP LOAD ========== */
  useEffect(() => {
    fetchRecruiter();
  }, []);

  /* ================= UPDATE RECRUITER ================= */
  const updateRecruiter = async (updatedData) => {
    try {
      const token = localStorage.getItem("recruiterToken");
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/recruiter/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();

      if (!res.ok || !result?.recruiter) {
        throw new Error(result.message || "Recruiter update failed");
      }

      setRecruiter((prev) => ({ ...prev, ...result.recruiter }));

      return result.recruiter;
    } catch (err) {
      console.error("Recruiter update error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
  const logoutRecruiter = () => {
    localStorage.removeItem("recruiterToken");
    setRecruiter(null);
  };

  return (
    <RecruiterContext.Provider
      value={{
        recruiter,
        loading,
        fetchRecruiter,   // ✅ important
        updateRecruiter,
        logoutRecruiter,
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
}

/* ================= SAFE HOOK ================= */
export const useRecruiter = () => {
  const ctx = useContext(RecruiterContext);
  if (!ctx) {
    throw new Error("useRecruiter must be used inside RecruiterProvider");
  }
  return ctx;
};
