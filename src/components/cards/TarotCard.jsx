import React, { useEffect, useRef, useState } from 'react';
import { artworkUrl } from '../../data/cardArtwork.js';
import './tarot-card.css';

let tiltMedia;
const supportsTilt = () => {
  tiltMedia ??= window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  return tiltMedia.matches;
};

function ArtworkImage({ artwork, name, priority, size }) {
  const [status, setStatus] = useState('loading');
  return (
    <div className="tarot-artwork-window" data-status={status}>
      <div className="tarot-image-placeholder" aria-hidden="true">
        <img src={artworkUrl('tarot/backs/lumina-observatory.svg')} alt="" draggable={false} />
        {status === 'error' && <span>Arte indisponível</span>}
      </div>
      <img
        className="tarot-artwork-image"
        src={artworkUrl(artwork.src)}
        srcSet={artwork.thumbnail ? `${artworkUrl(artwork.thumbnail)} ${artwork.thumbnailWidth}w, ${artworkUrl(artwork.src)} ${artwork.width}w` : undefined}
        sizes={priority ? (size === 'sm' ? '160px' : '(max-width: 767px) 70vw, 400px') : size === 'sm' ? 'auto, (max-width: 767px) 42vw, 200px' : 'auto, (max-width: 767px) 70vw, 400px'}
        width={artwork.width} height={artwork.height}
        alt={`${name} — ${artwork.deckName}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async" draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}

/** Presentation only: selection, inspection, shuffle and reveal belong to the caller. */
export const TarotCard = React.memo(function TarotCard({
  card, artwork = card?.artwork, face = 'front', size = 'md', priority = false, showKeywords = false,
}) {
  const surfaceRef = useRef(null);
  const frameRef = useRef(null);
  const pointRef = useRef(null);
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const resetTilt = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const element = surfaceRef.current;
    if (!element) return;
    for (const [key, value] of Object.entries({ '--card-rx': '0deg', '--card-ry': '0deg', '--card-px': '0', '--card-py': '0', '--foil-x': '50%', '--foil-y': '50%' })) element.style.setProperty(key, value);
    element.dataset.lit = 'false';
  };
  // React delegates pointer events; coordinates are committed once per animation frame,
  // without rerendering the card or its parent on mousemove.
  const moveTilt = event => {
    if ((size === 'sm' && face !== 'back') || !supportsTilt() || event.pointerType === 'touch') return;
    pointRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const element = surfaceRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (pointRef.current.x - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointRef.current.y - rect.top) / rect.height * 2 - 1));
      element.style.setProperty('--card-rx', `${-y * 4}deg`);
      element.style.setProperty('--card-ry', `${x * 5}deg`);
      element.style.setProperty('--card-px', String(x));
      element.style.setProperty('--card-py', String(y));
      element.style.setProperty('--foil-x', `${(x + 1) * 50}%`);
      element.style.setProperty('--foil-y', `${(y + 1) * 50}%`);
      element.dataset.lit = 'true';
    });
  };

  const rank = card?.roman || (card?.number != null ? String(card.number) : '');
  return (
    <div className={`tarot-card-object tarot-card-size-${size}`} data-reversed={Boolean(card?.isReversed)}>
      <div ref={surfaceRef} className="physical-tarot-card" data-face={face}
        onPointerMove={moveTilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
        <div className="tarot-card-frame" aria-hidden="true" />
        {face === 'back' ? (
          <div className="tarot-card-backface" aria-hidden="true">
            <img src={artworkUrl('tarot/backs/lumina-observatory.svg')} alt="" draggable={false} decoding="async" />
          </div>
        ) : (
          <div className="tarot-card-frontface">
            <div className="tarot-card-numeral">{rank}</div>
            <div className="tarot-card-picture" data-reversed={Boolean(card?.isReversed)}>
              {artwork ? <ArtworkImage key={artwork.src} artwork={artwork} name={card?.name || 'Carta'} priority={priority} size={size} /> : (
                <div className="tarot-image-placeholder tarot-image-missing" role="img" aria-label={`Artwork de ${card?.name || 'carta'} indisponível`}>
                  <img src={artworkUrl('tarot/backs/lumina-observatory.svg')} alt="" draggable={false} />
                  <span>Arte indisponível</span>
                </div>
              )}
            </div>
            <div className="tarot-card-caption">
              <span className="tarot-card-name">{card?.name}</span>
              {showKeywords && size === 'lg' && <span className="tarot-card-keywords">{card?.keywords?.slice(0, 2).join(' · ')}</span>}
            </div>
          </div>
        )}
        <div className="tarot-card-grain" aria-hidden="true" />
        <div className="tarot-card-foil" aria-hidden="true" />
        <div className="tarot-card-light" aria-hidden="true" />
      </div>
      {face === 'front' && <div className="tarot-card-flip-back" aria-hidden="true">
        <img src={artworkUrl('tarot/backs/lumina-observatory.svg')} alt="" draggable={false} />
      </div>}
    </div>
  );
});
