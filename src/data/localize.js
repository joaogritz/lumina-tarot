// Card, spread and suit texts in other languages. Portuguese is written in the data files
// themselves; for any other language main.jsx loads that language's texts (src/data/i18n/<id>)
// once, before the first render, and applies them to the shared data objects in place.
import { TAROT_DECK, SUITS } from './tarotDeck.js';
import { LENORMAND_DECK } from './lenormandDeck.js';
import { SPREAD_TYPES, FREE_SPREAD_TEXT, FREE_SPREAD_ID } from './spreads.js';

const LOADERS = {
  en: () => import('./i18n/en/index.js'),
  es: () => import('./i18n/es/index.js'),
  fr: () => import('./i18n/fr/index.js'),
};

const fill = (template, text) => template.replace('{text}', text);

function minorName(card, terms) {
  if (!terms.rankNames) return card.nameEn;
  const court = card.id.split('_')[1];
  const rank = terms.courtNames[court] || terms.rankNames[card.number - 1];
  return `${rank} ${terms.suitOf[card.suit]}`;
}

export function applyDataOverlay(o) {
  const { terms } = o;

  for (const card of TAROT_DECK) {
    const row = o.tarot[card.id];
    if (!row) continue;
    if (card.arcana === 'Major') {
      const [name, planet, archetype, keywords, light, shadow, past, present, future, advice] = row;
      Object.assign(card, { name, planet, archetype, keywords, light, shadow, past, present, future, advice });
    } else {
      const [archetype, keywords, light, shadow, past, present, future, advice] = row;
      Object.assign(card, { name: minorName(card, terms), archetype, keywords, light, shadow, past, present, future, advice });
      card.roman = terms.ranks[card.roman] || card.roman;
    }
    card.element = terms.elements[card.element] || card.element;
  }

  LENORMAND_DECK.forEach((card, i) => {
    const row = o.lenormand[i];
    if (!row) return;
    const [name, words, light, shadow, advice] = row;
    Object.assign(card, {
      name, nameEn: name, archetype: words, keywords: words.split(', '), light, shadow, advice,
      past: fill(terms.lenormandPast, light), present: light, future: fill(terms.lenormandFuture, light),
      element: terms.lenormandElement,
    });
  });

  for (const [key, [name, element]] of Object.entries(o.suits)) {
    if (SUITS[key]) Object.assign(SUITS[key], { name, element });
  }

  Object.assign(FREE_SPREAD_TEXT, o.free);
  for (const spread of SPREAD_TYPES) {
    if (spread.id === FREE_SPREAD_ID) {
      Object.assign(spread, { name: o.free.name, shortName: o.free.name, compactName: o.free.compactName, description: o.free.description });
      spread.positions.forEach((p, i) => { p.ptName = p.name; p.name = o.free.position.replace('{n}', String(i + 1)); });
      continue;
    }
    const row = o.spreads[spread.id];
    if (!row) continue;
    const [name, shortName, compactName, description, positions] = row;
    Object.assign(spread, { name, shortName, compactName, description });
    spread.positions.forEach((p, i) => {
      if (!positions[i]) return;
      // CardDetailModal reads position meanings from the Portuguese names.
      p.ptName = p.name;
      [p.name, p.subtitle] = positions[i];
    });
  }
}

export async function loadDataLocale(locale) {
  const load = LOADERS[locale];
  if (!load) return;
  const mod = await load();
  applyDataOverlay(mod.default);
}
