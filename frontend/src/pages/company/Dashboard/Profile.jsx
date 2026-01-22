import { useState, useEffect } from "react";
import TabsHeader from "../../../components/company/TabsHeader";
import CompanyInfo from "../../../components/company/CompanyInfo";
import ContactDetails from "../../../components/company/ContactDetails";
import Documents from "../../../components/company/Documents";
import { useCompanyValidation } from "../../../utils/validations";
import { useCompany } from "../../../context/CompanyContext";
import toast from "react-hot-toast";
import UnderReviewAlert from "../../../components/UnderReviewAlert";

const tabs = ["Company Info", "Contact", "Documents"];

export default function CompanyProfile() {
  const { company, setCompany } = useCompany();

  const {
    isValid,
    companyInfoValid,
    contactValid,
    documentValid,
  } = useCompanyValidation();

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const status = company?.verificationStatus || "DRAFT";

  const isUnderReview = status === "SUBMITTED";
  const isResubmission = status === "RESUBMISSION";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";

  /* 🔒 EDIT RULE */
  const isEditable = !isUnderReview && !isRejected;

  /* 📤 SUBMIT RULE */
  const canSubmit =
    status === "DRAFT" || status === "RESUBMISSION";

  const [formData, setFormData] = useState({
    companyInfo: {},
    contact: {},
    reg_doc: null,
  });

  /* ---------- SYNC DOCUMENT ---------- */
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      reg_doc:
        typeof company?.reg_doc === "string"
          ? company.reg_doc
          : null,
    }));
  }, [company?.reg_doc]);

  /* ---------- FINAL SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!isValid) {
      if (!companyInfoValid) setActiveTab("Company Info");
      else if (!contactValid) setActiveTab("Contact");
      else if (!documentValid) setActiveTab("Documents");

      toast.error("Please fix highlighted errors");
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

      setCompany((prev) => ({
        ...prev,
        verificationStatus: "SUBMITTED",
      }));

      toast.success(
        isResubmission
          ? "Profile resubmitted successfully"
          : "Profile submitted for verification"
      );
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* ================= STATUS ALERTS ================= */}

      {isUnderReview && (
        <UnderReviewAlert
  status="SUBMITTED"
  message="Your company profile is under admin review."
  subMessage="Editing is disabled until review is completed."
/>

      )}

      {isResubmission && (
        <UnderReviewAlert
  status="RESUBMISSION"
  message="Admin requested changes in your profile."
  subMessage="Please update details and resubmit."
/>

      )}

      {isApproved && (
        <UnderReviewAlert
  status="APPROVED"
  message="Your company profile is approved."
  subMessage="All features are now enabled."
/>

      )}

      {isRejected && (
  <UnderReviewAlert
    status="REJECTED"
    message="Your company profile has been rejected by admin."
    subMessage="Please contact support for further clarification."
  />
)}

      {/* ================= TABS ================= */}
      <TabsHeader
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* ================= CONTENT ================= */}
      <div className="p-2 md:p-4">
        {activeTab === "Company Info" && (
          <CompanyInfo
            setFormData={setFormData}
            disabled={!isEditable}
          />
        )}

        {activeTab === "Contact" && (
          <ContactDetails
            setFormData={setFormData}
            disabled={!isEditable}
          />
        )}

        {activeTab === "Documents" && (
          <Documents
            data={formData}
            setFormData={setFormData}
            disabled={!isEditable}
          />
        )}
      </div>

      {/* ================= SUBMIT ================= */}
      {activeTab === "Documents" && canSubmit && (
        <div className="border-t px-4 py-3 flex justify-end">
          <button
            disabled={!isValid}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isResubmission
              ? "Resubmit for Verification"
              : "Submit for Verification"}
          </button>
        </div>
      )}
    </div>
  );
}
