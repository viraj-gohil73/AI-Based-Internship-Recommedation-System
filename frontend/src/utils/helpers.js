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
