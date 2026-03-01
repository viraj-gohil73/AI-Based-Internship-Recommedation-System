import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, Send } from "lucide-react";
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

  const hasDocument =
    typeof company?.reg_doc === "string" && company.reg_doc.trim().length > 0;
  const rawStatus = company?.verificationStatus || "DRAFT";
  const status =
    rawStatus === "RESUBMISSION" && !hasDocument ? "DRAFT" : rawStatus;

  const isUnderReview = status === "SUBMITTED";
  const isResubmission = status === "RESUBMISSION";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const statusMeta = {
    DRAFT: {
      label: "Draft",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    },
    SUBMITTED: {
      label: "Under Review",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    RESUBMISSION: {
      label: "Changes Requested",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    APPROVED: {
      label: "Approved",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    REJECTED: {
      label: "Rejected",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    },
  };
  const statusBadge =
    statusMeta[status] || statusMeta.DRAFT;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= STATUS ALERTS ================= */}

        {/* STATUS ALERTS (with cancel btn) */}
        {isUnderReview && (
          <UnderReviewAlert
            status="SUBMITTED"
            message="Under Review"
            subMessage="Your company profile is under admin review. Editing is disabled until review is completed."
          />
        )}
        {isResubmission && (
          <UnderReviewAlert
            status="RESUBMISSION"
            message="Changes Requested"
            subMessage="Admin requested changes in your profile. Please update details and resubmit."
          />
        )}
        {isApproved && (
          <UnderReviewAlert
            status="APPROVED"
            message="Approved"
            subMessage="Your company profile is approved. All features are now enabled."
          />
        )}
        {isRejected && (
          <UnderReviewAlert
            status="REJECTED"
            message="Rejected"
            subMessage="Your company profile has been rejected by admin. Please contact support for further clarification."
          />
        )}

        {/* ================= TABS ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Company Profile
                </h1>
                <p className="text-sm text-slate-600">
                  Keep your information up to date to unlock platform features.
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur">
            <TabsHeader
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* ================= CONTENT ================= */}
          <div>
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

          {/* ================= SUBMIT BUTTON ================= */}
          {activeTab === "Documents" && canSubmit && (
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-4 md:px-8 py-5 flex justify-end">
              <button
                disabled={!isValid}
                onClick={handleSubmit}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                  isValid
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
                }`}
              >
                <Send size={18} />
                {isResubmission
                  ? "Resubmit for Verification"
                  : "Submit for Verification"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
