import { TAROT_DECK } from './tarotDeck.js';
import { LENORMAND_DECK } from './lenormandDeck.js';
import { t } from '../i18n/index.js';

export const DECKS = {
  tarot: { id: 'tarot', name: t('common.tarot'), subtitle: t('deckSel.tarotSubtitle'), cards: TAROT_DECK, reversals: true },
  lenormand: { id: 'lenormand', name: t('common.lenormand'), subtitle: t('deckSel.lenormandSubtitle'), cards: LENORMAND_DECK, reversals: false },
};
export function readDeckId() {
  try { return localStorage.getItem('lumina_deck') === 'lenormand' ? 'lenormand' : 'tarot'; }
  catch { return 'tarot'; }
}
