// utils/helpers.js

export function isValidURL(url = "") {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatYear(year) {
  const y = Number(year);
  return y >= 1900 && y <= new Date().getFullYear();
}

export function debounce(fn, delay = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const DEFAULT_KEYWORD_ALIASES = {
  "express js": "express",
  expressjs: "express",
  nodejs: "node js",
  "node.js": "node js",
  "react.js": "react",
  "next.js": "nextjs",
};

export function normalizeKeywords(input = [], aliases = DEFAULT_KEYWORD_ALIASES) {
  const source = Array.isArray(input) ? input : String(input || "").split(",");
  const aliasMap = Object.entries(aliases || {}).reduce((acc, [key, value]) => {
    acc[String(key).trim().toLowerCase()] = String(value).trim().toLowerCase();
    return acc;
  }, {});

  const unique = new Set();

  source.forEach((item) => {
    const normalized = String(item || "").trim().toLowerCase();
    if (!normalized) return;
    unique.add(aliasMap[normalized] || normalized);
  });

  return Array.from(unique);
}
