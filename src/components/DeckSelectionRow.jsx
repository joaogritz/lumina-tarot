import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TarotCard } from './cards/TarotCard';
import { ChevronLeft, ChevronRight } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';
import './deck-selection-row.css';

/** A single physical ribbon; drawing still uses the table's normal selection rules. */
export function DeckSelectionRow({ deck, canSelectMore, isShuffling, onSelectCard, onStartShuffle, onShuffleComplete }) {
  const reducedMotion = useReducedMotion();
  const rowRef = useRef(null);
  const drawLock = useRef(false);
  const drawnIndex = useRef(null);
  const completeRef = useRef(onShuffleComplete);
  completeRef.current = onShuffleComplete;
  const cards = deck.filter(card => !card.estaEscolhida);

  useEffect(() => {
    if (!isShuffling) { drawLock.current = false; return; }
    const timer = window.setTimeout(() => completeRef.current(), reducedMotion ? 180 : 1100);
    return () => window.clearTimeout(timer);
  }, [isShuffling, reducedMotion]);

  useEffect(() => {
    if (isShuffling || drawnIndex.current === null) return;
    // Restore keyboard position only when the user hasn't moved to another control.
    if (document.activeElement === rowRef.current) {
      const buttons = rowRef.current.querySelectorAll('button:not(:disabled)');
      buttons[Math.min(drawnIndex.current, buttons.length - 1)]?.focus({ preventScroll: true });
    }
    drawnIndex.current = null;
  }, [isShuffling]);

  const draw = (card, index) => {
    if (!canSelectMore || isShuffling || drawLock.current) return;
    drawLock.current = true;
    drawnIndex.current = index;
    rowRef.current?.focus({ preventScroll: true });
    audio.playSelect();
    onSelectCard(card);
    onStartShuffle();
  };

  const scrollRow = direction => rowRef.current?.scrollBy({
    left: direction * rowRef.current.clientWidth * .7,
    behavior: reducedMotion ? 'instant' : 'smooth',
  });

  return <div className="single-row-deck" data-shuffling={isShuffling}>
    <div className="single-row-nav">
      <button type="button" aria-label="Ver cartas anteriores" onClick={() => scrollRow(-1)}><ChevronLeft className="w-4 h-4" /></button>
      <p className="single-row-guidance" id="single-row-guidance">
      Deslize a fileira para explorar. Puxe uma carta; as restantes se reorganizam.
      </p>
      <button type="button" aria-label="Ver próximas cartas" onClick={() => scrollRow(1)}><ChevronRight className="w-4 h-4" /></button>
    </div>
    <div ref={rowRef} className="single-row-scroll" role="group" aria-label="Baralho em fileira única" aria-describedby="single-row-guidance" aria-busy={isShuffling} tabIndex={-1}>
      <div className="single-row-ribbon">
        {cards.map((card, index) => <motion.div
          layout={!reducedMotion}
          key={card.id}
          className="single-row-cell" data-card-id={card.id}
          animate={isShuffling && !reducedMotion ? {
            x: [0, index % 2 ? 32 : -32, index % 2 ? -18 : 18, 0],
            y: [0, index % 3 === 0 ? -18 : 12, -6, 0],
            rotate: [0, index % 2 ? 5 : -5, 0],
          } : { x: 0, y: 0, rotate: 0 }}
          transition={{ duration: reducedMotion ? 0 : 1.05, layout: { duration: .55, ease: [.16, 1, .3, 1] } }}
        >
          <button type="button" className="single-row-card" disabled={!canSelectMore || isShuffling}
            aria-label={`Puxar carta da fileira ${index + 1}`}
            onClick={() => draw(card, index)} onMouseEnter={() => !isShuffling && audio.playCardHover()}>
            <TarotCard face="back" size="sm" />
          </button>
        </motion.div>)}
      </div>
    </div>
  </div>;
}
