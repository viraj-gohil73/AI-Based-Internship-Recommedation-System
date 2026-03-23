import { createContext, useContext, useEffect, useState } from "react";

const CompanyContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/company/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data?.data) {
          throw new Error(data.message || "Failed to fetch company");
        }

        setCompany({
          logo: data.data.logo || "",
          companyName: data.data.companyName || "",
          email: data.data.email || "",
          tagline: data.data.tagline || "",
          industry: data.data.industry || "",
          companySize: data.data.companySize || "",
          foundedYear: data.data.foundedYear || "",
          website: data.data.website || "",
          about: data.data.about || "",
          address1: data.data.address1 || "",
          address2: data.data.address2 || "",
          city: data.data.city || "",
          state: data.data.state || "",
          pincode: data.data.pincode || "",
          gst_no: data.data.gst_no || "",
          secondaryEmail: data.data.secondaryEmail || "",
          mobile: data.data.mobile || "",
          reg_doc: data.data.reg_doc || "",
          verificationStatus: data.data.verificationStatus || "DRAFT",
          verification: data.data.verification || {},
        });
      } catch (err) {
        console.error("Company fetch error", err);
        if (err instanceof TypeError) {
          console.error(
            "Network error while fetching company profile. Check backend server, API URL, and CORS."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [company]);

  const updateCompany = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/company/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (!res.ok || !data?.company) {
        throw new Error(data.message || "Update failed");
      }

      setCompany((prev) => ({
        ...prev,
        ...data.company,
      }));

      return data.company;
    } catch (error) {
      console.error("Company update error", error);
      if (error instanceof TypeError) {
        throw new Error(
          "Network error: backend not reachable. Check if API server is running and VITE_API_BASE_URL is correct."
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyContext.Provider value={{ company, loading, updateCompany, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error("useCompany must be used inside CompanyProvider");
  }
  return ctx;
};
