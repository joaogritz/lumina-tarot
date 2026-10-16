import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TarotCard } from './cards/TarotCard.jsx';
import { audio } from '../utils/audio';

export const CardBack = React.memo(({ card, onClick, isSelected = false, index = 0 }) => {
  const handleClick = () => {
    if (!isSelected && onClick) { audio.playSelect(); onClick(card); }
  };
  return <div className="deck-card-cell" data-selected={isSelected} inert={isSelected} aria-hidden={isSelected || undefined}>
    <AnimatePresence>
      {!isSelected && <motion.button
        key="card"
        type="button"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24, scale: 1.02 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        whileHover={{ y: -10, transition: { duration: .45 } }}
        whileTap={{ scale: .98 }}
        onClick={handleClick}
        onMouseEnter={() => audio.playCardHover()}
        aria-label={`Carta do baralho ${index + 1}`}
        className="ritual-card-back"
      >
        <TarotCard face="back" size="sm" />
      </motion.button>}
    </AnimatePresence>
  </div>;
});
