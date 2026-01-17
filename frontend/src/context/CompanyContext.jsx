// context/CompanyContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH COMPANY ---------------- */
  useEffect(() => {
    if (company) return; // 🔒 already fetched

    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/company/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

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
          gstNumber: data.data.gstNumber || "",
          secondaryEmail: data.data.secondaryEmail || "",
        mobile: data.data.mobile || "",
        reg_doc: data.data.reg_doc || {}
        });
      } catch (err) {
        console.error("Company fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  /* ---------------- UPDATE COMPANY ---------------- */
  const updateCompany = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/company/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // 🔄 Update context immediately
      setCompany((prev) => ({
        ...prev,
        ...updatedData,
      }));

      return data;
    } catch (error) {
      console.error("Company update error", error);
      throw error;
    }
  };

  return (
    <CompanyContext.Provider
      value={{ company, loading, updateCompany }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
