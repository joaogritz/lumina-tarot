import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from './icons/ArcaneIcons';
import { CelestialRing } from './CelestialRing';
import { BackgroundStars } from './BackgroundStars';
import { CardArt } from './CardArt';
import { TAROT_DECK } from '../data/tarotDeck';
import { audio } from '../utils/audio';

export const LoadingScreen = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8s progression

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = useCallback(() => {
    audio.init();
    audio.playTempleEntry();
    onLoaded?.();
  }, [onLoaded]);

  useEffect(() => {
    const keydown = e => {
      if (isReady && ['Enter', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [isReady, handleEnter]);

  const getStatusText = () => {
    if (progress < 30) return 'Sintonizando o Oráculo Sagrado...';
    if (progress < 65) return 'Preparando os baralhos...';
    if (progress < 95) return 'Alinhando as Constelações & Energias...';
    return 'O Santuário dos Arcanos Está Aberto';
  };

  return (
    <motion.main className="sanctuary-entry" initial={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: .8 } }}>
      <BackgroundStars />
      <div className="entry-nav"><span className="entry-wordmark">✧ LUMINA</span><span className="micro-label">TAROT & BARALHO CIGANO</span></div>
      <div className="entry-composition">
        <div className="entry-copy">
          <p className="micro-label"><span className="gold-rule" /> SANTUÁRIO DOS ARCANOS</p>
          <h1>Lumina<br /><em>Tarot.</em></h1>
          <p className="entry-description">Sua jornada começa com uma pergunta e uma escolha.</p>
          <div className="entry-action" aria-live="polite">
            {isReady ? <button type="button" className="ritual-button" onClick={handleEnter}>Entrar no Santuário <ArrowRight size={17} /></button> : <div className="entry-progress" role="progressbar" aria-label="Preparando o santuário" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>}
            <p className="entry-status">{getStatusText()}</p>
          </div>
        </div>
        <div className="entry-art">
          <CelestialRing />
          <span className="instrument-caption micro-label">FIG. XVII — O ORÁCULO</span>
          <div className="entry-card"><CardArt card={TAROT_DECK.find(card => card.number === 17 && card.arcana === 'Major')} size="hero" priority showKeywords={false} /></div>
          <span className="instrument-note micro-label">AS ABOVE · SO BELOW</span>
        </div>
      </div>
      <div className="entry-footer"><span>Sabedoria Ancestral & Arcanos do Destino</span><span className="micro-label">UM INSTANTE DE SILÊNCIO. UMA NOVA PERSPECTIVA.</span></div>
    </motion.main>
  );
};
