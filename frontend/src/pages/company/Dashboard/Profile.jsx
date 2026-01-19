import { useState, useEffect } from "react";
import TabsHeader from "../../../components/company/TabsHeader";
import CompanyInfo from "../../../components/company/CompanyInfo";
import ContactDetails from "../../../components/company/ContactDetails";
import Documents from "../../../components/company/Documents";
import { validateAllTabs } from "../../../utils/validations";
import { useCompany } from "../../../context/CompanyContext";
import toast from "react-hot-toast";
const tabs = ["Company Info", "Contact", "Documents"];

export default function CompanyProfile() {
  const { company, setCompany } = useCompany();
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const isLocked = company?.verificationStatus === "SUBMITTED";

  const [formData, setFormData] = useState({
    companyInfo: {},
    contact: {},
    reg_doc: null,
  });

  /* --------- SYNC DOC FROM COMPANY --------- */
  useEffect(() => {
    if (company) {
      setFormData((prev) => ({
        ...prev,
        reg_doc:
          typeof company.reg_doc === "string" ? company.reg_doc : null,
      }));
    }
  }, [company]);

  const isValid = validateAllTabs(formData);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!isValid) {
      alert("Please complete all required fields");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/company/submit-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // ✅ UPDATE CONTEXT (SOURCE OF TRUTH)
      setCompany((prev) => ({
        ...prev,
        verificationStatus: "SUBMITTED",
      }));

      toast.success("Profile submitted for verification");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto rounded-xl">
      {/* STATUS BANNER */}
      {company?.verificationStatus === "SUBMITTED" && (
        <div className="mb-3 px-4 py-2 rounded-md bg-blue-100 text-slate-800 text-sm">
          🔒 Profile submitted. Editing disabled until admin approval.
        </div>
      )}

      {/* TABS */}
      <TabsHeader
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === "Company Info" && (
          <CompanyInfo
            data={formData.companyInfo}
            setFormData={setFormData}
            disabled={isLocked}
          />
        )}

        {activeTab === "Contact" && (
          <ContactDetails
            data={formData.contact}
            setFormData={setFormData}
            disabled={isLocked}
          />
        )}

        {activeTab === "Documents" && (
          <Documents
            data={formData}
            setFormData={setFormData}
            disabled={isLocked}
          />
        )}
      </div>

      {/* FOOTER */}
      {activeTab === "Documents" && (
        <div className="border-t px-4 py-3 flex justify-end">
          <button
            disabled={!isValid || isLocked}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white ${
              isValid && !isLocked
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isLocked ? "Submitted" : "Submit for Verification"}
          </button>
        </div>
      )}
    </div>
  );
}
