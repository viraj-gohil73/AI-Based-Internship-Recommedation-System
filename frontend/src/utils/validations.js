import { useCompany } from "../context/CompanyContext";

export function useCompanyValidation() {
  const { company } = useCompany();

  /* ---------- COMPANY INFO ---------- */
  const companyInfoValid =
    company?.companyName?.trim().length > 0 &&
    company?.industry?.trim().length > 0 &&
    company?.about?.trim().length >= 50 &&
    company?.address1?.trim().length > 0 &&
    company?.city?.trim().length > 0 &&
    company?.state?.trim().length > 0 &&
    String(company?.pincode || "").length === 6;

  /* ---------- CONTACT ---------- */
  const contactValid =
    /^[6-9]\d{9}$/.test(company?.mobile || "") &&
    company?.secondaryEmail?.includes("@");

  /* ---------- DOCUMENT ---------- */
  const documentValid =
    typeof company?.reg_doc === "string"

  /* ---------- FINAL ---------- */
  return {
    isValid: companyInfoValid && contactValid && documentValid,
    companyInfoValid,
    contactValid,
    documentValid,
  };
}
