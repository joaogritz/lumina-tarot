// Whether readings may be sent to the online interpretation service (Worker + Google Gemini).
// Online is the default; choosing local mode keeps questions and cards on this device.
const KEY = 'lumina_online_ai';
const EVENT = 'lumina_privacy_changed';

export function isOnlineEnabled() {
  try {
    return globalThis.localStorage?.getItem(KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setOnlineEnabled(enabled) {
  try { globalThis.localStorage?.setItem(KEY, String(Boolean(enabled))); } catch { /* storage blocked: keep default */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT));
}

export function onPrivacyChange(listener) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export const PRIVACY_POLICY_URL = './privacidade.html';
