const STATUS_ALIAS_MAP = Object.freeze({
  AUTO_APPROVED: "APPROVED",
  AUTO_REJECT: "REJECTED",
  AUTO_RESUBMIT: "RESUBMISSION",
  MANUAL_APPROVAL: "SUBMITTED",
  PENDING_VERIFICATION: "SUBMITTED",
});

const STATUS_LABEL_MAP = Object.freeze({
  DRAFT: "Draft",
  SUBMITTED: "Under Review",
  RESUBMISSION: "Changes Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

export const normalizeCompanyVerificationStatus = (status) => {
  const raw = String(status || "DRAFT").trim().toUpperCase();
  return STATUS_ALIAS_MAP[raw] || raw || "DRAFT";
};

export const getCompanyVerificationStatusLabel = (status) => {
  const normalized = normalizeCompanyVerificationStatus(status);
  return STATUS_LABEL_MAP[normalized] || normalized;
};
