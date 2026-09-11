import { TAROT_DECK } from './tarotDeck.js';
import { LENORMAND_DECK } from './lenormandDeck.js';

export const DECKS = {
  tarot: { id: 'tarot', name: 'Tarot', subtitle: '78 cartas · Arcanos maiores e menores', cards: TAROT_DECK, reversals: true },
  lenormand: { id: 'lenormand', name: 'Baralho Cigano', subtitle: '36 cartas · Petit Lenormand', cards: LENORMAND_DECK, reversals: false },
};
export function readDeckId() {
  try { return localStorage.getItem('lumina_deck') === 'lenormand' ? 'lenormand' : 'tarot'; }
  catch { return 'tarot'; }
}
