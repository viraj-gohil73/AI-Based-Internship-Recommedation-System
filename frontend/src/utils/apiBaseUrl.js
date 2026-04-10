const LOCAL_API_BASE_URL = "http://localhost:5000";
const DEPLOYED_API_BASE_URL =
  "https://ai-based-internship-recommedation-system.onrender.com";

const trimTrailingSlash = (url) => url.replace(/\/+$/, "");

const isLocalHost = (hostname) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const resolveFallbackBaseUrl = () => {
  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return LOCAL_API_BASE_URL;
  }
  return DEPLOYED_API_BASE_URL;
};

export const API_BASE_URL = trimTrailingSlash(
  (import.meta.env.VITE_API_BASE_URL || "").trim() || resolveFallbackBaseUrl()
);

const LOCAL_API_PREFIX = `${trimTrailingSlash(LOCAL_API_BASE_URL)}/`;

const rewriteLocalhostUrl = (url) => {
  if (typeof url !== "string") return url;
  if (!url.startsWith(LOCAL_API_PREFIX)) return url;
  return `${API_BASE_URL}/${url.slice(LOCAL_API_PREFIX.length)}`;
};

export const installApiFetchInterceptor = () => {
  if (typeof window === "undefined" || window.__apiFetchInterceptorInstalled) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return originalFetch(rewriteLocalhostUrl(input), init);
    }

    if (input instanceof URL) {
      return originalFetch(rewriteLocalhostUrl(input.toString()), init);
    }

    if (input instanceof Request) {
      const rewritten = rewriteLocalhostUrl(input.url);
      if (rewritten !== input.url) {
        return originalFetch(new Request(rewritten, input), init);
      }
    }

    return originalFetch(input, init);
  };

  window.__apiFetchInterceptorInstalled = true;
};
