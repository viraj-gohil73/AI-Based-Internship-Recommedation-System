import { useCompany } from "../context/CompanyContext";

export function useCompanyValidation() {
  const { company } = useCompany();

  /* ================= COMPANY INFO ================= */
  const companyInfoErrors = {
    companyName:
      !company?.companyName ||
      company.companyName.trim().length === 0
        ? "Company name is required"
        : null,

    industry:
      !company?.industry || company.industry.trim().length === 0
        ? "Industry is required"
        : null,

    about:
      !company?.about || company.about.trim().length < 50
        ? "About must be at least 50 characters"
        : null,

    address1:
      !company?.address1 || company.address1.trim().length === 0
        ? "Address is required"
        : null,

    city:
      !company?.city || company.city.trim().length === 0
        ? "City is required"
        : null,

    state:
      !company?.state || company.state.trim().length === 0
        ? "State is required"
        : null,

    pincode:
      !/^[1-9][0-9]{5}$/.test(String(company?.pincode || ""))
        ? "Enter valid 6-digit pincode"
        : null,
  };

  const companyInfoValid = Object.values(companyInfoErrors).every(
    (err) => err === null
  );

  /* ================= CONTACT ================= */
  const contactErrors = {
    mobile:
      !/^[6-9]\d{9}$/.test(String(company?.mobile || ""))
        ? "Enter valid 10-digit mobile number"
        : null,

    secondaryEmail:
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(company?.secondaryEmail || "")
      )
        ? "Enter valid email address"
        : null,
  };

  const contactValid = Object.values(contactErrors).every(
    (err) => err === null
  );

  /* ================= DOCUMENT ================= */
  const documentErrors = {
    reg_doc:
      typeof company?.reg_doc !== "string" ||
      company.reg_doc.trim().length === 0
        ? "Registration document is required"
        : null,
  };

  const documentValid = Object.values(documentErrors).every(
    (err) => err === null
  );

  /* ================= FINAL ================= */
  const isValid = companyInfoValid && contactValid && documentValid;

  return {
    /* overall */
    isValid,

    /* section flags */
    companyInfoValid,
    contactValid,
    documentValid,

    /* detailed errors */
    errors: {
      companyInfo: companyInfoErrors,
      contact: contactErrors,
      document: documentErrors,
    },
  };
}
