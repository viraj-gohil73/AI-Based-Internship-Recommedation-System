import { createContext, useContext, useState, useEffect } from "react";

const VerificationContext = createContext();

export const VerificationProvider = ({ children }) => {
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    const saved = localStorage.getItem("companyVerificationStatus");
    if (saved) setStatus(saved);
  }, []);

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    localStorage.setItem("companyVerificationStatus", newStatus);
  };

  return (
    <VerificationContext.Provider value={{ status, updateStatus }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => useContext(VerificationContext);
