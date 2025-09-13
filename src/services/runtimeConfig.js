// src/services/runtimeConfig.js
// Runtime + env config (ES module named exports)

// Read window-injected runtime values (if app injects them before boot)
const RUNTIME_WINDOW_API = (typeof window !== 'undefined' && (window.__API_BASE_URL__ || null)) || null;
const RUNTIME_WINDOW_SOCKET = (typeof window !== 'undefined' && (window.__SOCKET_BASE_URL__ || null)) || null;

// Read Vite env variables (if built with Vite and VITE_API_BASE_URL is provided)
const ENV_API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || null;
const ENV_SOCKET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_BASE_URL) || null;

// Try to require a CommonJS runtimeConfig if present (for some dev setups).
// If you don't need this, you can remove the try/catch — it's defensive.
let cjsRuntime = null;
try {
  // Only run require in node-like environments (should be ignored by browser bundlers)
  // eslint-disable-next-line no-undef
  if (typeof require !== 'undefined') {
    /* eslint-disable global-require */
    cjsRuntime = require && require('./runtimeConfig');
    /* eslint-enable global-require */
  }
} catch (e) {
  cjsRuntime = null;
}

// Determine whether we're on localhost
const isLocalhost = (typeof window !== 'undefined') && /localhost|127\.0\.0\.1/.test(window.location.hostname);

// Resolve API base in priority:
// 1. cjsRuntime.API_BASE (if a CommonJS file exists and exported it)
// 2. window injected runtime (window.__API_BASE_URL__)
// 3. Vite env variable (VITE_API_BASE_URL)
// 4. localhost fallback or origin-based production
const RESOLVED_API_BASE = (
  (cjsRuntime && (cjsRuntime.API_BASE || cjsRuntime.default?.API_BASE)) ||
  RUNTIME_WINDOW_API ||
  ENV_API_BASE ||
  (isLocalhost ? 'http://localhost:5001/api' : (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}/api` : ''))
);

// Resolve socket base similarly
const RESOLVED_SOCKET_BASE = (
  (cjsRuntime && (cjsRuntime.SOCKET_BASE || cjsRuntime.default?.SOCKET_BASE)) ||
  RUNTIME_WINDOW_SOCKET ||
  ENV_SOCKET_BASE ||
  (isLocalhost ? 'http://localhost:5001' : (typeof window !== 'undefined' ? window.location.origin : ''))
);

// Normalize helper (remove trailing slash)
function normalizeBase(url) {
  if (!url) return '';
  return url.replace(/\/+$/, '');
}

export const API_BASE = normalizeBase(RESOLVED_API_BASE);
export const SOCKET_BASE = normalizeBase(RESOLVED_SOCKET_BASE);

// Also export defaults for compatibility (optional)
export default {
  API_BASE,
  SOCKET_BASE
};