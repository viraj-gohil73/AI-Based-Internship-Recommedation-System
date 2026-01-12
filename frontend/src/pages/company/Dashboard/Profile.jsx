import { useState } from "react";
import TabsHeader from "../../../components/company/TabsHeader";
import CompanyInfo from "../../../components/company/CompanyInfo";
import ContactDetails from "../../../components/company/ContactDetails";
import Documents from "../../../components/company/Documents";
import useAutoSave from "../../../hooks/useAutoSave";
import { validateAllTabs } from "../../../utils/validations";
import CompanyLayout from "../../../layout/CompnayLayout";

const tabs = ["Company Info", "Contact", "Documents"];

export default function CompanyProfile() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const [verificationStatus, setVerificationStatus] = useState(
    localStorage.getItem("companyVerificationStatus") || "DRAFT"
  );

  const isLocked = verificationStatus === "SUBMITTED";

  const [formData, setFormData] = useState(
    JSON.parse(localStorage.getItem("companyProfileDraft")) || {
      companyInfo: {},
      contact: {},
      documents: {},
    }
  );

  useAutoSave(formData);
  const isValid = validateAllTabs(formData);

  const handleSubmit = async () => {
    if (!isValid) return;

    await fetch("/api/company/submit-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setVerificationStatus("SUBMITTED");
    localStorage.setItem("companyVerificationStatus", "SUBMITTED");
  };

  return (
    <CompanyLayout title="Profile">
      <div className="max-w-7xl mx-auto rounded-xl">

        {/* STATUS BANNER */}
        {verificationStatus === "SUBMITTED" && (
          <div className="mb-3 px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 text-sm">
            🔒 Profile submitted. You can view details but editing is disabled until admin approval.
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
              data={formData.documents}
              setFormData={setFormData}
              disabled={isLocked}
            />
          )}
        </div>

        {/* FOOTER */}
        {activeTab === "Documents" && (<div className="border-t px-4 py-3 flex justify-end">
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
    </CompanyLayout>
  );
}
