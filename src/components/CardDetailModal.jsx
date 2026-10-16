import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardArt } from './CardArt';
import { X, Sparkles, Compass, RotateCw } from './icons/ArcaneIcons';
import { SUITS } from '../data/tarotDeck';
import { audio } from '../utils/audio';

export const CardDetailModal = ({ 
  card, 
  positionInfo, 
  onClose 
}) => {
  const modalRef = useModalAccessibility(Boolean(card), onClose);
  if (!card) return null;

  const suitConfig = SUITS[card.suit?.toUpperCase()] || SUITS.MAJOR;

  useEffect(() => {
    if (card) {
      audio.playCardElementalSound(card);
    }
  }, [card?.id]);

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  // Determine if this is a single card / non-positional inspection
  const isSingleCardMode = !positionInfo || positionInfo.name === 'O Conselho do Oráculo';

  // Get specific positional context message if applicable
  const getPositionalMessage = () => {
    if (!positionInfo || isSingleCardMode) return null;

    if (positionInfo.name.includes('Passado')) return card.past || card.light;
    if (positionInfo.name.includes('Presente')) return card.present || card.light;
    if (positionInfo.name.includes('Futuro')) return card.future || card.light;
    if (positionInfo.name.includes('Desafio')) return card.shadow;
    if (positionInfo.name.includes('Ação')) return card.advice;
    if (positionInfo.name.includes('Desfecho')) return card.future || card.light;
    if (positionInfo.name.includes('Mental')) return card.light;
    if (positionInfo.name.includes('Espiritual')) return card.light;
    if (positionInfo.name.includes('Físico')) return card.light;

    return null;
  };

  const positionalMessage = getPositionalMessage();

  return (
    <div className="mobile-modal-layer fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      {/* Outer Click Backdrop with Fluid Fade */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={handleClose} 
      />

      {/* Modal Dialog Card with Spring Physics */}
      <motion.div 
        ref={modalRef}
        aria-label={`Detalhes de ${card.name}`}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="responsive-dialog dialog-detail relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-sm bg-[var(--color-obsidian)] border border-amber-500/40 shadow-2xl p-4 sm:p-6 md:p-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar detalhes da carta"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badges Bar (Position & Reversed) */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {positionInfo && !isSingleCardMode && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/80 border border-amber-500/30 text-amber-300 text-xs font-cinzel font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Posição: {positionInfo.name}</span>
            </div>
          )}

          {card.isReversed && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-xs font-cinzel font-bold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Carta Invertida</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
          
          {/* Card Visual Column */}
          <div className="md:col-span-5 flex justify-center">
            <motion.div 
              className="w-56 sm:w-64 md:w-72 aspect-[7/12] transform-gpu"
            >
              <CardArt card={card} size="lg" priority showKeywords={false} />
            </motion.div>
          </div>

          {/* Card Information Column */}
          <div className="md:col-span-7 flex flex-col gap-3 text-left">
            <div>
              <span className="text-[11px] font-cinzel tracking-widest uppercase text-amber-400 font-bold">
                {card.deckId === 'lenormand' ? `Baralho Cigano · Carta ${card.number}` : (card.arcana === 'Major' ? `Arcano Maior ${card.roman}` : suitConfig.name)}
              </span>
              <h2 className="font-cinzel text-2xl font-black text-slate-100 mt-0.5">
                {card.name} {card.isReversed && <span className="text-sm text-red-400 font-normal">(Invertida)</span>}
              </h2>
              <p className="text-xs font-cinzel text-amber-300/80">
                {card.nameEn} • {card.archetype}
              </p>
            </div>

            {/* Astrological & Alchemical Correspondences */}
            <div className="flex flex-wrap items-center gap-2">
              {card.astroGlyph && (
                <span className="text-xs px-2.5 py-0.5 rounded-sm bg-amber-950/70 border border-amber-500/40 text-amber-300 font-medium flex items-center gap-1.5">
                  <span className="text-sm font-serif">{card.astroGlyph}</span>
                  <span>{card.planet || card.element}</span>
                </span>
              )}
              {(card.alchemySymbol || suitConfig.alchemySymbol) && (
                <span className="text-xs px-2.5 py-0.5 rounded-sm bg-stone-950/70 border border-amber-500/30 text-amber-200 font-medium flex items-center gap-1.5">
                  <span className="text-sm">{card.alchemySymbol || suitConfig.alchemySymbol}</span>
                  <span>{card.element || suitConfig.element}</span>
                </span>
              )}
            </div>

            {/* Keywords */}
            {card.keywords && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {card.keywords.map((kw, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-stone-950/70 border border-amber-500/30 text-amber-200">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Position Meaning ONLY when meaningful in multi-card spreads */}
            {positionalMessage && (
              <div className="mt-1 p-3 rounded-sm bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-xs font-cinzel font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Influência na Posição ({positionInfo.name})</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {positionalMessage}
                </p>
              </div>
            )}

            {/* Light & Shadow Interpretations */}
            <div className="space-y-2 text-xs">
              <div className={`p-2.5 rounded-sm border ${card.isReversed ? 'bg-slate-900/40 border-slate-700 opacity-70' : 'bg-slate-900/70 border-emerald-500/30'}`}>
                <span className="font-semibold text-emerald-400 block mb-0.5">Luz & Potencial Positivo:</span>
                <p className="text-slate-300 leading-relaxed">{card.light}</p>
              </div>

              <div className={`p-2.5 rounded-sm border ${card.isReversed ? 'bg-red-950/50 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900/70 border-red-500/30'}`}>
                <span className="font-semibold text-red-400 block mb-0.5">
                  {card.isReversed ? '⚡ Manifestação Invertida (Sombra & Bloqueio Ativo):' : 'Sombra & Ponto de Atenção:'}
                </span>
                <p className="text-slate-200 leading-relaxed">{card.shadow}</p>
              </div>
            </div>

            {/* Advice */}
            <div className="p-3 rounded-sm bg-stone-950/50 border border-amber-500/40">
              <span className="font-cinzel text-xs font-bold text-amber-300 block mb-0.5">
                Conselho do Oráculo:
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "{card.advice}"
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
