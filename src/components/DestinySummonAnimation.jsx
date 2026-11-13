import { useModalAccessibility } from '../utils/useModalAccessibility';
import { CelestialRing } from './CelestialRing';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FastForward } from './icons/ArcaneIcons';
import { CardArt } from './CardArt';
import { audio } from '../utils/audio';
import { t } from '../i18n';

export const DestinySummonAnimation = ({ 
  cardsToSummon, 
  spreadConfig, 
  onComplete,
  onCancel 
}) => {
  const [phase, setPhase] = useState('meteor'); // 'meteor' | 'burst' | 'cards'
  const modalRef = useModalAccessibility(true, onCancel);

  useEffect(() => {
    // 1. Start Wish Launch Audio
    audio.playWishLaunch();

    // 2. Timeline Orchestration
    const burstTimer = setTimeout(() => {
      setPhase('burst');
      audio.playStarImpact();
    }, 1100);

    const cardsTimer = setTimeout(() => {
      setPhase('cards');
      audio.playCardSummonCascade(cardsToSummon.length);
    }, 1600);

    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete(cardsToSummon);
      }
    }, 3800);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(cardsTimer);
      clearTimeout(completeTimer);
    };
  }, [cardsToSummon, onComplete]);

  const handleSkip = () => {
    audio.playSelect();
    onComplete?.(cardsToSummon);
  };

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label={t('ritual.dialog')} className="destiny-ritual">
      <CelestialRing className="destiny-instrument" />
      <div className="destiny-controls">
        <button type="button" className="ritual-button" onClick={onCancel}>{t('ritual.cancel')}</button>
        <button type="button" className="ritual-button" onClick={handleSkip}>{t('ritual.skip')} <FastForward size={15} /></button>
      </div>
      <div className="destiny-heading" aria-live="polite">
        <p className="micro-label">{t('ritual.kicker')}</p>
        <h2>{phase === 'cards' ? t('ritual.done') : t('ritual.aligning')}</h2>
        <p>{t('ritual.chosen', { count: cardsToSummon.length, spread: spreadConfig.name })}</p>
      </div>
      <div className="destiny-cards">
        {cardsToSummon.map((card, idx) => <motion.div key={card.id}
          initial={{ opacity: .1, rotateY: 90 }}
          animate={{ opacity: phase === 'cards' ? 1 : .1, rotateY: phase === 'cards' ? 0 : 90 }}
          transition={{ duration: 1, delay: idx * .05, ease: [.16,1,.3,1] }}
          className="destiny-card"><CardArt card={card} isMini={cardsToSummon.length > 5} priority showKeywords={false} /></motion.div>)}
      </div>
      {phase === 'cards' && <button type="button" className="ritual-button" onClick={handleSkip}>{t('ritual.toTable')}</button>}
    </div>
  );
};
