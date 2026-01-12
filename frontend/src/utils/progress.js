export function calculateProfileProgress(data) {
  let total = 6, done = 0;
  if (data.companyInfo?.name) done++;
  if (data.companyInfo?.industry) done++;
  if (data.companyInfo?.about?.length >= 100) done++;
  if (data.companyInfo?.website) done++;
  if (data.contact?.email) done++;
  if (data.social?.linkedin) done++;
  return Math.round((done / total) * 100);
}
