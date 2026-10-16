import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TarotCard } from './cards/TarotCard';
import { audio } from '../utils/audio';
import './deck-selection-row.css';

/** All remaining cards fit in the fan; drawing uses the table's selection rules. */
export function DeckSelectionRow({ deck, canSelectMore, isShuffling, onSelectCard, onStartShuffle, onShuffleComplete }) {
  const reducedMotion = useReducedMotion();
  const rowRef = useRef(null);
  const drawLock = useRef(false);
  const drawnIndex = useRef(null);
  const gesture = useRef(null);
  const completeRef = useRef(onShuffleComplete);
  const [activeIndex, setActiveIndex] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [geometry, setGeometry] = useState({ width: 0, cardWidth: 112 });
  completeRef.current = onShuffleComplete;
  const cards = deck.filter(card => !card.estaEscolhida);
  const blocked = !canSelectMore || isShuffling;
  const focused = Math.min(focusIndex, Math.max(0, cards.length - 1));
  const active = activeIndex === null ? null : Math.min(activeIndex, cards.length - 1);

  useEffect(() => {
    const row = rowRef.current;
    const measure = () => setGeometry({ width: row.clientWidth, cardWidth: row.querySelector('button')?.offsetWidth || 112 });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isShuffling) { drawLock.current = false; return; }
    setActiveIndex(null);
    const timer = window.setTimeout(() => completeRef.current(), reducedMotion ? 180 : 1100);
    return () => window.clearTimeout(timer);
  }, [isShuffling, reducedMotion]);

  useEffect(() => {
    if (isShuffling || drawnIndex.current === null) return;
    if (document.activeElement === rowRef.current) {
      const buttons = rowRef.current.querySelectorAll('button:not(:disabled)');
      buttons[Math.min(drawnIndex.current, buttons.length - 1)]?.focus({ preventScroll: true });
    }
    drawnIndex.current = null;
  }, [isShuffling]);

  const highlight = index => {
    if (blocked) return;
    if (active !== index) audio.playCardHover();
    setActiveIndex(index);
    setFocusIndex(index);
  };

  const draw = (card, index) => {
    if (blocked || drawLock.current) return;
    drawLock.current = true;
    drawnIndex.current = index;
    rowRef.current?.focus({ preventScroll: true });
    audio.playSelect();
    onSelectCard(card);
    onStartShuffle();
  };

  // Map the pointer to the complete deck, independently of animated card positions.
  const indexAt = clientX => {
    const rect = rowRef.current.getBoundingClientRect();
    const start = geometry.cardWidth / 2 + 36;
    const span = Math.max(1, rect.width - start * 2);
    return Math.max(0, Math.min(cards.length - 1, Math.round((clientX - rect.left - start) / span * (cards.length - 1))));
  };

  const onPointerDown = event => {
    if (blocked || event.button !== 0) return;
    if (!event.target.closest('.single-row-card')) return;
    event.preventDefault();
    const index = indexAt(event.clientX);
    gesture.current = { x: event.clientX, y: event.clientY, index, previous: active, moved: false, touch: event.pointerType !== 'mouse' };
    highlight(index);
    if (event.pointerType !== 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = event => {
    if (blocked || (event.pointerType !== 'mouse' && !gesture.current)) return;
    if (gesture.current && Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 8) gesture.current.moved = true;
    highlight(indexAt(event.clientX));
  };

  const onPointerUp = event => {
    const current = gesture.current;
    gesture.current = null;
    if (!current || blocked) return;
    const index = indexAt(event.clientX);
    // A drag explores; a second tap on the highlighted card confirms the draw.
    if (!current.moved && (!current.touch || current.previous === index)) draw(cards[index], index);
  };

  const onKeyDown = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = Math.min(cards.length - 1, index + 1);
    else if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cards.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    rowRef.current.querySelectorAll('button')[next]?.focus({ preventScroll: true });
  };

  const span = Math.max(0, geometry.width - geometry.cardWidth - 72);
  return <div className="single-row-deck" data-shuffling={isShuffling}>
    <p className="single-row-guidance" id="single-row-guidance">
      Explore o leque com o mouse e clique para puxar. No celular, arraste para explorar e toque na carta destacada para confirmar.
    </p>
    <div ref={rowRef} className="single-row-fan" role="group" aria-label="Baralho em leque" aria-describedby="single-row-guidance" aria-busy={isShuffling} tabIndex={-1}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onPointerCancel={() => { gesture.current = null; }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') { gesture.current = null; setActiveIndex(null); } }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null); }}>
      {cards.map((card, index) => {
        const position = cards.length === 1 ? .5 : index / (cards.length - 1);
        const distance = active === null ? 0 : index - active;
        const spread = active === null ? 0 : Math.sign(distance) * 44 * Math.exp(-Math.abs(distance) / 7) * Math.sin(Math.PI * position);
        const x = 36 + span * position + spread;
        const selected = active === index && !blocked;
        const arc = Math.pow(position * 2 - 1, 2) * 24;
        return <motion.div key={card.id} className="single-row-cell" data-card-id={card.id} data-active={selected}
          style={{ zIndex: selected ? cards.length + 1 : index + 1, visibility: geometry.width ? 'visible' : 'hidden' }}
          initial={false}
          animate={{
            x: Math.max(36, Math.min(36 + span, x)),
            y: isShuffling && !reducedMotion ? [arc, arc - 14, arc + 8, arc] : arc - (selected ? 42 : 0),
            rotate: selected ? 0 : (position * 2 - 1) * 7,
          }}
          transition={{ duration: reducedMotion ? 0 : isShuffling ? 1.05 : .18, ease: 'easeOut' }}>
          <button type="button" className="single-row-card" disabled={blocked} tabIndex={index === focused ? 0 : -1}
            aria-label={`Puxar carta ${index + 1} de ${cards.length} do leque`}
            onFocus={() => highlight(index)} onKeyDown={event => onKeyDown(event, index)}
            onClick={event => { if (event.detail === 0) draw(card, index); }}>
            <TarotCard face="back" size="sm" />
          </button>
        </motion.div>;
      })}
    </div>
    <div className="single-row-status" aria-live="polite" aria-atomic="true">
      {isShuffling ? 'Reorganizando o leque…' : active !== null && !blocked ? `Carta ${active + 1} de ${cards.length}` : `${cards.length} cartas no leque`}
    </div>
    <p className="single-row-keyboard">Teclado: ← → para explorar · Home / End para ir às pontas · Enter para puxar</p>
  </div>;
}
