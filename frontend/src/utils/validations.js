export function validateAllTabs(data) {
  return (
    data.companyInfo?.name &&
    data.companyInfo?.industry &&
    data.companyInfo?.about?.length >= 100 &&
    data.companyInfo?.website &&
    data.contact?.email &&
    data.contact?.phone &&
    data.social?.linkedin
  );
}
