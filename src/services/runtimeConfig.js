// src/services/runtimeConfig.js
const RUNTIME_API_BASE = (typeof window !== 'undefined' && window.__API_BASE_URL__) || null;
const RUNTIME_SOCKET_BASE = (typeof window !== 'undefined' && window.__SOCKET_BASE_URL__) || null;

const ENV_API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || null;
const ENV_SOCKET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_BASE_URL) || null;

const isLocalhost = (typeof window !== 'undefined') && /localhost|127\.0\.0\.1/.test(window.location.hostname);

exports.API_BASE = RUNTIME_API_BASE || ENV_API_BASE || (isLocalhost ? 'http://localhost:5001/api' : ((typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '') + '/api'));
exports.SOCKET_BASE = RUNTIME_SOCKET_BASE || ENV_SOCKET_BASE || (isLocalhost ? 'http://localhost:5001' : (typeof window !== 'undefined' ? window.location.origin : ''));