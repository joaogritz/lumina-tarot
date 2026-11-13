import React, { useEffect, useRef } from 'react';
import { DECKS } from '../data/decks';
import { t } from '../i18n';

export function DeckSelector({ activeDeck, pendingDeckId, onSelect, onConfirm, onCancel, disabled }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (pendingDeckId) dialog.current?.showModal();
    else dialog.current?.close();
  }, [pendingDeckId]);
  return <section className="deck-selector" aria-label={t('deckSel.label')}>
    <div><span className="deck-eyebrow">{t('deckSel.eyebrow')}</span><h2>{t('deckSel.title')}</h2></div>
    <div className="deck-options">
      {Object.values(DECKS).map(deck => <button key={deck.id} type="button" disabled={disabled}
        aria-pressed={activeDeck.id === deck.id} onClick={() => onSelect(deck.id)}>
        <span aria-hidden="true" className="deck-emblem">{deck.id === 'tarot' ? '✦' : '✿'}</span>
        <span><strong>{deck.name}</strong><small>{deck.subtitle}</small></span>
        <span className="deck-check" aria-hidden="true">{activeDeck.id === deck.id ? '✓' : '○'}</span>
      </button>)}
    </div>
    <p className="deck-hint" aria-live="polite">{activeDeck.id === 'lenormand'
      ? t('deckSel.hintLenormand')
      : t('deckSel.hintTarot')}</p>
    <dialog ref={dialog} className="deck-dialog" aria-labelledby="deck-dialog-title" onCancel={onCancel}>
      <h2 id="deck-dialog-title">{t('deckSel.switchTitle', { name: DECKS[pendingDeckId]?.name })}</h2>
      <p>{t('deckSel.switchText')}</p>
      <div>
        <button type="button" autoFocus onClick={onCancel} className="deck-dialog-cancel">{t('deckSel.keep')}</button>
        <button type="button" onClick={onConfirm} className="deck-dialog-confirm">{t('deckSel.switch')}</button>
      </div>
    </dialog>
  </section>;
}
