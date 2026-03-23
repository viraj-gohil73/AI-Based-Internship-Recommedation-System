import { useEffect, useMemo, useState } from "react";
import { Send, MessageSquareText } from "lucide-react";
import TabsHeader from "../../../components/company/TabsHeader";
import CompanyInfo from "../../../components/company/CompanyInfo";
import ContactDetails from "../../../components/company/ContactDetails";
import Documents from "../../../components/company/Documents";
import { useCompanyValidation } from "../../../utils/validations";
import { useCompany } from "../../../context/CompanyContext";
import toast from "react-hot-toast";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import {
  getCompanyVerificationStatusLabel,
  normalizeCompanyVerificationStatus,
} from "../../../utils/companyVerificationStatus";

const tabs = ["Company Info", "Contact", "Documents"];

export default function CompanyProfile() {
  const { company, setCompany } = useCompany();

  const { isValid, companyInfoValid, contactValid, documentValid } = useCompanyValidation();

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const rawStatus = company?.verificationStatus || "DRAFT";
  const status = useMemo(() => normalizeCompanyVerificationStatus(rawStatus), [rawStatus]);

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

  const statusBadge = statusMeta[status] || {
    label: getCompanyVerificationStatusLabel(status),
    className: "border-slate-200 bg-slate-100 text-slate-700",
  };

  const isEditable = !isUnderReview && !isRejected;
  const canSubmit = status === "DRAFT" || status === "RESUBMISSION";

  const [formData, setFormData] = useState({
    companyInfo: {},
    contact: {},
    reg_doc: null,
  });

  const decisionReason = String(company?.verification?.adminDecisionReason || "").trim();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      reg_doc: typeof company?.reg_doc === "string" ? company.reg_doc : null,
    }));
  }, [company?.reg_doc]);

  const handleSubmit = async () => {
    if (!isValid) {
      if (!companyInfoValid) setActiveTab("Company Info");
      else if (!contactValid) setActiveTab("Contact");
      else if (!documentValid) setActiveTab("Documents");

      toast.error("Please fix highlighted errors");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/company/submit-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCompany((prev) => ({
        ...prev,
        verificationStatus: "SUBMITTED",
      }));

      toast.success(isResubmission ? "Profile resubmitted successfully" : "Profile submitted for verification");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {isUnderReview ? (
          <UnderReviewAlert
            status="SUBMITTED"
            message="Under Review"
            subMessage="Your company profile is under admin review. Editing is disabled until review is completed."
          />
        ) : null}

        {isResubmission ? (
          <UnderReviewAlert
            status="RESUBMISSION"
            message="Changes Requested"
            subMessage="Admin requested changes in your profile. Please update details and resubmit."
          />
        ) : null}

        {isApproved ? (
          <UnderReviewAlert
            status="APPROVED"
            message="Approved"
            subMessage="Your company profile is approved. All features are now enabled."
          />
        ) : null}

        {isRejected ? (
          <UnderReviewAlert
            status="REJECTED"
            message="Rejected"
            subMessage="Your company profile has been rejected by admin. Please review guidance and contact support if needed."
          />
        ) : null}

        {decisionReason ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700">
                <MessageSquareText size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Reason from admin</p>
                <p className="mt-1 text-sm text-amber-800">{decisionReason}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Company Profile</h1>
                <p className="text-sm text-slate-600">Keep your information up to date to unlock platform features.</p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur">
            <TabsHeader tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div>
            {activeTab === "Company Info" ? <CompanyInfo setFormData={setFormData} disabled={!isEditable} /> : null}
            {activeTab === "Contact" ? <ContactDetails setFormData={setFormData} disabled={!isEditable} /> : null}
            {activeTab === "Documents" ? <Documents data={formData} setFormData={setFormData} disabled={!isEditable} /> : null}
          </div>

          {activeTab === "Documents" && canSubmit ? (
            <div className="flex justify-end border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-5 md:px-8">
              <button
                disabled={!isValid}
                onClick={handleSubmit}
                className={`inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-md transition-all duration-300 hover:shadow-lg ${
                  isValid
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    : "cursor-not-allowed bg-gray-300 text-gray-500 opacity-75"
                }`}
              >
                <Send size={18} />
                {isResubmission ? "Resubmit for Verification" : "Submit for Verification"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
