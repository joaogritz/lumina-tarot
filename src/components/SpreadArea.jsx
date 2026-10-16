import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpreadSlot } from './SpreadSlot';
import { CardArt } from './CardArt';
import { Sparkles, BookOpen, RotateCcw, CheckCircle2, ArrowRight, Crown, Star, Compass, X } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';

export const SpreadArea = ({ 
  spreadConfig, 
  chosenCards, 
  onCardClick, 
  onRemoveCard, 
  onOpenInterpretation,
  onResetSpread 
}) => {
  const totalSlots = spreadConfig.positions.length;
  const filledSlotsCount = chosenCards.filter(Boolean).length;
  const isComplete = filledSlotsCount === totalSlots;

  const handleOpenInterpretation = () => {
    audio.playGrandReveal();
    if (onOpenInterpretation) {
      onOpenInterpretation();
    }
  };

  // Helper to render a specific slot with props
  const renderSlot = (index, size = 'md', isCrossing = false, showLabel = true) => {
    const pos = spreadConfig.positions[index];
    if (!pos) return null;
    const card = chosenCards[index];
    const isNextActive = index === filledSlotsCount;

    return (
      <SpreadSlot
        key={index}
        slotIndex={index}
        positionInfo={pos}
        card={card}
        isActive={isNextActive}
        size={size}
        isCrossing={isCrossing}
        showLabel={showLabel}
        onCardClick={onCardClick}
        onRemoveCard={onRemoveCard}
      />
    );
  };

  // Celtic Cross Center Intersection (Card 1 Vertical + Card 2 Horizontal on top)
  const renderCelticCenter = () => {
    const card1 = chosenCards[0];
    const card2 = chosenCards[1];
    const pos1 = spreadConfig.positions[0];
    const pos2 = spreadConfig.positions[1];
    const isSlot1Active = filledSlotsCount === 0;
    const isSlot2Active = filledSlotsCount === 1;

    return (
      <div className="relative flex flex-col items-center justify-center p-1">
        {/* Double Label Header */}
        <div className="mb-2 flex items-center justify-center gap-1.5 z-30">
          <div className="px-2 py-0.5 rounded-full bg-stone-950/90 border border-amber-500/40 text-[10px] font-cinzel font-semibold text-amber-300 shadow">
            1. Cerne
          </div>
          <div className="px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500/50 text-[10px] font-cinzel font-semibold text-red-300 shadow">
            2. Desafio (Cruzada)
          </div>
        </div>

        {/* Center Canvas with Card 1 under, Card 2 across on top */}
        <div className="relative w-24 sm:w-28 md:w-32 lg:w-36 aspect-[7/12] flex items-center justify-center">
          
          {/* Card 1 (Vertical Layer Base) */}
          <div className="absolute inset-0 z-10 transition-all duration-300">
            <SpreadSlot
              slotIndex={0}
              positionInfo={pos1}
              card={card1}
              isActive={isSlot1Active}
              size="sm"
              showLabel={false}
              onCardClick={onCardClick}
              onRemoveCard={onRemoveCard}
            />
          </div>

          {/* Card 2 (Horizontal Layer Overlay - Rotated 90deg on Top) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 0.92, opacity: 1 }}
              whileHover={{ scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
              className="pointer-events-auto transform rotate-90 shadow-[0_10px_35px_rgba(0,0,0,0.9)] rounded-sm"
            >
              {card2 ? (
                <div 
                  className="w-24 sm:w-28 md:w-32 lg:w-36 aspect-[7/12] cursor-pointer relative transform-gpu animate-card-reveal group/cross"
                >
                  <button type="button" className="card-inspect-action" aria-label={`Ver detalhes de ${card2.name}`} onClick={() => onCardClick?.(card2, pos2)}>
                  <CardArt card={card2} isMini={true} showKeywords={false} />
                  
                  {/* Crossing Marker Badge */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-red-950/95 border border-red-400 text-[8px] font-cinzel text-red-200 font-bold uppercase tracking-wider shadow-md">
                    Cruzada
                  </div>

                  </button>

                  {/* Remove Card Button - Enlarged & Hover-Expanded */}
                  {onRemoveCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.playRemoveCard();
                        onRemoveCard(1);
                      }}
                      title="Remover carta cruzada"
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 border-red-500/80 text-red-300 hover:text-white hover:bg-red-900 hover:border-red-400 hover:scale-125 hover:shadow-[0_0_16px_rgba(239,68,68,0.85)] flex items-center justify-center shadow-xl transition-all duration-200 ease-out z-30 cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              ) : isSlot2Active ? (
                /* Slot 2 Waiting for pick - Horizontal Pulsing Receptor */
                <div className="w-24 sm:w-28 md:w-32 lg:w-36 aspect-[7/12] rounded-sm border-2 border-dashed border-amber-400 bg-amber-500/20 shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-gold-pulse flex flex-col items-center justify-center p-1 text-center">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin mb-1" style={{ animationDuration: '4s' }} />
                  <span className="font-cinzel text-[9px] text-amber-200 font-bold">2. Cruzar</span>
                </div>
              ) : (
                /* Slot 2 Inactive Ghost receptor outline */
                <div className="w-24 sm:w-28 md:w-32 lg:w-36 aspect-[7/12] rounded-sm border border-dashed border-red-400/25 bg-red-950/10 pointer-events-none opacity-40" />
              )}
            </motion.div>
          </div>

        </div>
      </div>
    );
  };

  // 1. Authentic Celtic Cross Layout (Cross on Left + Staff Column on Right)
  const renderCelticCrossLayout = () => {
    return (
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 py-4">
        
        {/* Left Section: A Cruz Sagrada (The Sacred Cross 6 Cards) */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-cinzel text-amber-300 font-bold uppercase tracking-wider">
              A Cruz Sagrada (Presente & Circunstâncias)
            </span>
          </div>

          <div className="celtic-cross-grid grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 items-center justify-items-center max-w-xl">
            
            {/* Row 1: Top (Position 5: A Coroa / Objetivo) */}
            <div className="col-start-2 flex justify-center">
              {renderSlot(4, 'sm', false, true)}
            </div>

            {/* Row 2: Left (Position 4: Passado Recente) */}
            <div className="col-start-1 row-start-2 flex justify-center">
              {renderSlot(3, 'sm', false, true)}
            </div>

            {/* Center: Position 1 (Cerne) & Position 2 (Desafio Cruzada na Horizontal) */}
            <div className="col-start-2 row-start-2 flex items-center justify-center">
              {renderCelticCenter()}
            </div>

            {/* Row 2: Right (Position 6: Futuro Próximo) */}
            <div className="col-start-3 row-start-2 flex justify-center">
              {renderSlot(5, 'sm', false, true)}
            </div>

            {/* Row 3: Bottom (Position 3: A Raiz / Subconsciente) */}
            <div className="col-start-2 row-start-3 flex justify-center">
              {renderSlot(2, 'sm', false, true)}
            </div>

          </div>
        </div>

        {/* Right Section: O Báculo / Coluna de Ascensão (The Staff 4 Cards) */}
        <div className="flex flex-col items-center border-t lg:border-t-0 lg:border-l border-amber-500/20 pt-6 lg:pt-0 lg:pl-10">
          <div className="text-center mb-3">
            <span className="text-xs font-cinzel text-amber-300 font-bold uppercase tracking-wider">
              O Báculo (Caminho do Destino)
            </span>
          </div>

          {/* Stack of 4 cards: From 10 (top) down to 7 (bottom) */}
          <div className="flex flex-col items-center gap-3">
            {renderSlot(9, 'sm', false, true)}
            {renderSlot(8, 'sm', false, true)}
            {renderSlot(7, 'sm', false, true)}
            {renderSlot(6, 'sm', false, true)}
          </div>
        </div>

      </div>
    );
  };

  // 2. Decision Triangle Layout (Situação, Ação, Desfecho)
  const renderTriangleLayout = () => {
    return (
      <div className="flex flex-col items-center gap-6 py-4 max-w-2xl mx-auto">
        {/* Top Apex: Desfecho */}
        <div className="flex flex-col items-center">
          <div className="mb-1 flex items-center gap-1 text-emerald-400 text-xs font-cinzel font-bold">
            <Crown className="w-3.5 h-3.5" />
            <span>Vértice: Resultado</span>
          </div>
          {renderSlot(2, 'md', false, true)}
        </div>

        {/* Bottom Base: Situação & Ação */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {renderSlot(0, 'md', false, true)}
          <div className="hidden sm:flex items-center text-amber-400/60 font-cinzel text-xs">
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>
          {renderSlot(1, 'md', false, true)}
        </div>
      </div>
    );
  };

  // 3. Trinity Column Layout (Mente, Espírito, Corpo)
  const renderTrinityLayout = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-4">
        {spreadConfig.positions.map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            {renderSlot(index, 'md', false, true)}
          </div>
        ))}
      </div>
    );
  };

  // 4. Timeline Layout (Passado, Presente, Futuro)
  const renderTimelineLayout = () => {
    return (
      <div className="spread-timeline flex items-start justify-center gap-3 sm:gap-6 lg:gap-8 py-4">
        {spreadConfig.positions.map((_, index) => (
          <React.Fragment key={index}>
            {renderSlot(index, 'md', false, true)}
            {index < spreadConfig.positions.length - 1 && (
              <div className="hidden lg:flex items-center text-amber-400/40">
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // 5. Single Card Focal Altar Layout
  const renderSingleLayout = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-600/30 to-amber-500/20 blur-2xl pointer-events-none" />
          {renderSlot(0, 'lg', false, true)}
        </div>
      </div>
    );
  };

  // 6. Love & Relationship Diamond Layout
  const renderLoveLayout = () => {
    return (
      <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 max-w-3xl mx-auto animate-fade-in">
        {/* Top: Futuro / Destino Afetivo */}
        <div className="flex flex-col items-center">
          {renderSlot(3, 'md', false, true)}
        </div>

        {/* Middle: Você (Left) & O Outro (Right) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {renderSlot(0, 'md', false, true)}
          <div className="hidden sm:flex items-center text-pink-400">
            <Sparkles className="w-5 h-5 animate-pulse text-pink-400" />
          </div>
          {renderSlot(1, 'md', false, true)}
        </div>

        {/* Bottom: Desafios & Dinâmica */}
        <div className="flex flex-col items-center">
          {renderSlot(2, 'md', false, true)}
        </div>
      </div>
    );
  };

  // 7. Career & Prosperity Cross Layout
  const renderCareerLayout = () => {
    return (
      <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 max-w-3xl mx-auto animate-fade-in">
        {/* Top: Caminho de Maior Prosperidade */}
        <div className="flex flex-col items-center">
          {renderSlot(3, 'md', false, true)}
        </div>

        {/* Middle: Momento Atual (Left) & Oportunidades (Right) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {renderSlot(0, 'md', false, true)}
          <div className="hidden sm:flex items-center text-amber-400">
            <Compass className="w-5 h-5 animate-pulse text-amber-400" />
          </div>
          {renderSlot(1, 'md', false, true)}
        </div>

        {/* Bottom: Riscos & Cautela */}
        <div className="flex flex-col items-center">
          {renderSlot(2, 'md', false, true)}
        </div>
      </div>
    );
  };

  // 8. Pentagram / 5 Elements Star Layout
  const renderPentagramLayout = () => {
    return (
      <div className="flex flex-col items-center gap-4 py-4 max-w-4xl mx-auto animate-fade-in">
        {/* Top: 2. Fogo (Ação) */}
        <div className="flex flex-col items-center">
          {renderSlot(1, 'md', false, true)}
        </div>

        {/* Middle row: 4. Ar (Left), 1. Espírito (Center), 3. Água (Right) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {renderSlot(3, 'md', false, true)}
          <div className="scale-105">
            {renderSlot(0, 'md', false, true)}
          </div>
          {renderSlot(2, 'md', false, true)}
        </div>

        {/* Bottom: 5. Terra (Matéria) */}
        <div className="flex flex-col items-center">
          {renderSlot(4, 'md', false, true)}
        </div>
      </div>
    );
  };

  // Dispatch layout based on spreadConfig.layoutType
  const renderLayoutContent = () => {
    switch (spreadConfig.layoutType) {
      case 'celtic_cross':
        return renderCelticCrossLayout();
      case 'triangle':
        return renderTriangleLayout();
      case 'trinity':
        return renderTrinityLayout();
      case 'free':
        return totalSlots === 1 ? renderSingleLayout() : (
          <div className="spread-free-grid" style={{ '--free-columns': Math.min(totalSlots, 5) }}>
            {spreadConfig.positions.map((_, index) => renderSlot(index, 'md', false, true))}
          </div>
        );
      case 'single':
        return renderSingleLayout();
      case 'love':
        return renderLoveLayout();
      case 'career':
        return renderCareerLayout();
      case 'pentagram':
        return renderPentagramLayout();
      case 'timeline':
      default:
        return renderTimelineLayout();
    }
  };

  return (
    <section data-layout={spreadConfig.layoutType} aria-label="Mesa de leitura" className="reading-area w-full max-w-6xl mx-auto mb-10">
      {/* Altar Velvet Mat Container */}
      <div className="altar-surface relative p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl border border-amber-500/30">
        
        {/* Sacred Altar Background Glow */}
        <div className="hidden absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-48 bg-gradient-to-b from-amber-600/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Altar Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-4 mb-4 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="font-cinzel text-lg md:text-2xl font-bold text-amber-200 tracking-wide">
                {spreadConfig.name}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              {spreadConfig.description}
            </p>
          </div>

          {/* Progress Indicator and Reset */}
          <div className="flex items-center gap-3">
            <div className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors
              ${isComplete 
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                : 'bg-stone-950/60 border-amber-500/40 text-amber-200'
              }
            `}>
              {isComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
              <span>{filledSlotsCount} de {totalSlots} cartas na mesa</span>
            </div>

            {filledSlotsCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  audio.playClearTable();
                  onResetSpread();
                }}
                className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Limpar mesa"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Mesa</span>
              </button>
            )}
          </div>
        </div>

        {['timeline', 'celtic_cross', 'pentagram'].includes(spreadConfig.layoutType) && (
          <p className="mobile-spread-guidance md:hidden">Deslize a mesa para explorar todas as posições. Toque nas cartas reveladas para ampliar.</p>
        )}
        {/* Dynamic Sacred Mat Spatial Layout */}
        <div className="relative z-10 min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={spreadConfig.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="w-full flex items-center justify-center"
            >
              <div className="spread-layout-container">{renderLayoutContent()}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {spreadConfig.layoutType === 'celtic_cross' && (
          <div className="mobile-celtic-focus md:hidden">
            <h3>As dez posições</h3>
            <p>O mapa acima preserva a cruz e o bastão. Explore cada posição abaixo; toque em uma carta para ampliar ou use × para recolhê-la.</p>
            <div className="mobile-celtic-positions">{spreadConfig.positions.map((_, index) => renderSlot(index))}</div>
          </div>
        )}
        {/* Action Reveal Button when Spread is Complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
              className="relative z-10 mt-8 pt-6 border-t border-amber-500/20 flex flex-col items-center justify-center"
            >
              <div className="relative group">
                <div className="hidden" />
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleOpenInterpretation}
                  className="ritual-button"
                >
                  {/* Sweep Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <BookOpen className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="font-outfit text-xs uppercase tracking-widest">
                    Revelar interpretação
                  </span>
                  <Compass className="w-5 h-5 text-amber-400/90 group-hover:rotate-90 transition-transform duration-700 shrink-0" />
                </motion.button>
              </div>

              <p className="text-sm text-amber-200/80 mt-2.5 font-almendra italic text-center tracking-wide">
                Todas as {totalSlots} cartas foram consagradas na mesa. Consulte a síntese do oráculo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
