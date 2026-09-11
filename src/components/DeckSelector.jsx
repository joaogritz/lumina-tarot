import React, { useEffect, useRef } from 'react';
import { DECKS } from '../data/decks';

export function DeckSelector({ activeDeck, pendingDeckId, onSelect, onConfirm, onCancel, disabled }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (pendingDeckId) dialog.current?.showModal();
    else dialog.current?.close();
  }, [pendingDeckId]);
  return <section className="deck-selector" aria-label="Escolha do baralho">
    <div><span className="deck-eyebrow">SEU ORÁCULO</span><h2>Qual baralho guia sua leitura?</h2></div>
    <div className="deck-options">
      {Object.values(DECKS).map(deck => <button key={deck.id} type="button" disabled={disabled}
        aria-pressed={activeDeck.id === deck.id} onClick={() => onSelect(deck.id)}>
        <span aria-hidden="true" className="deck-emblem">{deck.id === 'tarot' ? '✦' : '✿'}</span>
        <span><strong>{deck.name}</strong><small>{deck.subtitle}</small></span>
        <span className="deck-check" aria-hidden="true">{activeDeck.id === deck.id ? '✓' : '○'}</span>
      </button>)}
    </div>
    <p className="deck-hint" aria-live="polite">{activeDeck.id === 'lenormand'
      ? 'Leia os símbolos em conjunto, da esquerda para a direita. Neste baralho, as cartas são sempre diretas.'
      : 'Explore os arquétipos do Tarot. Escolha uma tiragem e, se desejar, ative as cartas invertidas.'}</p>
    <dialog ref={dialog} className="deck-dialog" aria-labelledby="deck-dialog-title" onCancel={onCancel}>
      <h2 id="deck-dialog-title">Trocar para {DECKS[pendingDeckId]?.name}?</h2>
      <p>As cartas na mesa serão recolhidas. Leituras salvas no diário serão preservadas.</p>
      <div>
        <button type="button" autoFocus onClick={onCancel} className="deck-dialog-cancel">Continuar leitura</button>
        <button type="button" onClick={onConfirm} className="deck-dialog-confirm">Trocar baralho</button>
      </div>
    </dialog>
  </section>;
}
