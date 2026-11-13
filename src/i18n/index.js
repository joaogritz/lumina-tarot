// Interface language. Chosen once per page load from, in order: the visitor's explicit choice
// (menu), the browser's preferred languages (which follow the visitor's country and language),
// and English for any language the site does not offer. Portuguese is the source language.
import pt from './messages/pt.js';
import en from './messages/en.js';
import es from './messages/es.js';
import fr from './messages/fr.js';

export const LOCALES = [
  { id: 'pt', label: 'Português', htmlLang: 'pt-BR', dateLocale: 'pt-BR' },
  { id: 'en', label: 'English', htmlLang: 'en', dateLocale: 'en-US' },
  { id: 'es', label: 'Español', htmlLang: 'es', dateLocale: 'es-ES' },
  { id: 'fr', label: 'Français', htmlLang: 'fr', dateLocale: 'fr-FR' },
];
const MESSAGES = { pt, en, es, fr };
const STORAGE_KEY = 'lumina_locale';
const FALLBACK = 'en';

export function detectLocale(preferred = [], saved = null) {
  if (saved && MESSAGES[saved]) return saved;
  for (const tag of preferred) {
    const base = String(tag || '').toLowerCase().split('-')[0];
    if (MESSAGES[base]) return base;
  }
  return preferred.length ? FALLBACK : 'pt';
}

function initialLocale() {
  if (typeof window === 'undefined') return 'pt';
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* storage may be blocked */ }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  return detectLocale(preferred.filter(Boolean), saved);
}

let current = initialLocale();
if (typeof document !== 'undefined') {
  document.documentElement.lang = LOCALES.find(l => l.id === current).htmlLang;
}

export const getLocale = () => current;
export const getLocaleInfo = () => LOCALES.find(l => l.id === current);

/** Saves the visitor's choice and reloads so every module (cards, spreads) uses it. */
export function setLocale(id) {
  if (!MESSAGES[id]) return;
  try { localStorage.setItem(STORAGE_KEY, id); } catch { /* storage may be blocked */ }
  if (typeof window !== 'undefined') window.location.reload();
}

/** For tests: switch language without a reload. */
export function _setLocaleForTests(id) { current = id; }

const lookup = (table, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), table);

/**
 * Translates a key, filling {name} placeholders from vars. A `count` var selects the
 * `one`/`other` form when the entry is an object. Falls back to Portuguese, then to the key.
 */
export function t(key, vars = {}) {
  let entry = lookup(MESSAGES[current], key);
  if (entry == null) entry = lookup(pt, key);
  if (entry == null) return key;
  if (typeof entry === 'object' && !Array.isArray(entry)) entry = vars.count === 1 ? entry.one : entry.other;
  if (Array.isArray(entry)) return entry;
  // A var passed as undefined/null (e.g. no deck chosen yet) renders empty, never as "{name}".
  return String(entry).replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name] ?? '') : `{${name}}`));
}

const PRIVACY_PAGES = { pt: 'privacidade.html', en: 'privacy.html', es: 'privacidad.html', fr: 'confidentialite.html' };
/** The privacy policy page in the interface language. */
export const privacyUrl = () => `./${PRIVACY_PAGES[current]}`;

/** Long date in the interface language, e.g. "10 de novembro de 2026" / "November 10, 2026". */
export const formatDate = (date = new Date(), options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  date.toLocaleDateString(getLocaleInfo().dateLocale, options);
