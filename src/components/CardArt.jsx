import React from 'react';
import { getCardArtwork } from '../data/cardArtwork.js';
import { TarotCard } from './cards/TarotCard.jsx';

// Compatibility adapter for all existing call sites and saved readings.
export const CardArt = React.memo(function CardArt({ card, isMini = false, showKeywords = true, size, priority = false }) {
  return <TarotCard card={card} artwork={getCardArtwork(card)} size={size || (isMini ? 'sm' : 'md')} showKeywords={showKeywords} priority={priority} />;
});
