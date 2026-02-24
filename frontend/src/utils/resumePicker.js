const getFileNameFromUrl = (url = "") => {
  if (!url) return "resume";
  const cleanUrl = String(url).split("?")[0];
  const parts = cleanUrl.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "resume");
};

const normalizeResumeOptions = (profile = {}) => {
  const list = Array.isArray(profile?.resumes) ? profile.resumes : [];
  const seen = new Set();

  const options = list
    .map((item) => {
      const url = String(item?.url || item || "").trim();
      if (!url || seen.has(url)) return null;
      seen.add(url);
      return {
        url,
        name: String(item?.name || getFileNameFromUrl(url)).trim() || getFileNameFromUrl(url),
      };
    })
    .filter(Boolean);

  const legacyResumeUrl = String(profile?.resume || "").trim();
  if (legacyResumeUrl && !seen.has(legacyResumeUrl)) {
    options.unshift({
      url: legacyResumeUrl,
      name: getFileNameFromUrl(legacyResumeUrl),
    });
  }

  return options;
};

export const fetchResumeOptions = async (apiBaseUrl, token) => {
  const response = await fetch(`${apiBaseUrl}/api/student/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load resumes");
  }

  return normalizeResumeOptions(data?.profile || {});
};
