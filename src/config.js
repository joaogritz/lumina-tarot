// Public interpretation endpoint (custom domain of the Cloudflare Worker), used when
// VITE_ORACLE_API_URL is not set at build time.
// Shared by the app and by the Content-Security-Policy generated in vite.config.js.
export const DEFAULT_ORACLE_URL = 'https://api.luminatarot.app';
