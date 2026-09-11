import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shuffle, Moon, Sun } from 'lucide-react';
import { CardBack } from './CardBack';

export const DeckShuffleAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('cut'); // 'cut' | 'riffle' | 'fan' | 'gather'

  useEffect(() => {
    // Stage 1: Cut & Split (0ms to 500ms)
    const t1 = setTimeout(() => {
      setPhase('riffle');
    }, 550);

    // Stage 2: Riffle Cascades (550ms to 1500ms)
    const t2 = setTimeout(() => {
      setPhase('fan');
    }, 1550);

    // Stage 3: Celestial Fan & Gather (1550ms to 2300ms)
    const t3 = setTimeout(() => {
      setPhase('gather');
    }, 2300);

    // Complete (2600ms)
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Array of 16 simulated cards for the 3D riffle animation
  const leftCards = Array.from({ length: 8 }, (_, i) => i);
  const rightCards = Array.from({ length: 8 }, (_, i) => i);
  const fanCards = Array.from({ length: 14 }, (_, i) => i);

  return (
    <div className="relative w-full h-[450px] flex flex-col items-center justify-center overflow-hidden select-none my-4">
      
      {/* Background Sacred Geometry Mandala Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-80 h-80 rounded-full border-2 border-amber-400/40 animate-[spin_30s_linear_infinite]" />
        <div className="absolute w-64 h-64 rounded-full border border-dashed border-purple-500/50 animate-[spin_20s_linear_infinite_reverse]" />
      </div>

      {/* Floating Golden Stardust Glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-r from-amber-500/15 via-purple-600/25 to-amber-400/15 blur-3xl rounded-full pointer-events-none animate-pulse" />

      {/* Status HUD Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="font-cinzel text-xs md:text-sm font-bold text-amber-200 tracking-wider">
          {phase === 'cut' && 'Cortando o Baralho Arcano...'}
          {phase === 'riffle' && 'Embaralhando as Forças do Destino...'}
          {phase === 'fan' && 'Alinhando as cartas...'}
          {phase === 'gather' && 'Consagração Concluída!'}
        </span>
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
      </motion.div>

      {/* 3D Shuffle Arena */}
      <div className="relative w-72 sm:w-96 h-64 flex items-center justify-center perspective-1000">

        {/* Phase 1 & 2: Split Decks & Dynamic Riffle */}
        {(phase === 'cut' || phase === 'riffle') && (
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Left Deck Pile (8 Cards) */}
            {leftCards.map((idx) => {
              const isRiffle = phase === 'riffle';
              const delay = idx * 0.05;

              return (
                <motion.div
                  key={`left-${idx}`}
                  initial={{ x: 0, y: 0, rotateZ: 0, rotateY: 0 }}
                  animate={isRiffle ? {
                    x: [ -120 + idx * 4, 0, 0 ],
                    y: [ -idx * 2, -35 + idx * 3, 0 ],
                    rotateZ: [ -18, -4, 0 ],
                    rotateY: [ 15, 0, 0 ],
                    scale: [ 1, 1.05, 1 ],
                    zIndex: idx * 2,
                  } : {
                    x: -120 + idx * 3,
                    y: -idx * 2,
                    rotateZ: -16,
                    rotateY: 20,
                    scale: 1,
                    zIndex: idx,
                  }}
                  transition={isRiffle ? {
                    duration: 0.85,
                    delay: delay,
                    ease: "easeInOut"
                  } : {
                    duration: 0.45,
                    ease: "easeOut"
                  }}
                  className="absolute w-28 sm:w-32 aspect-[2/3] rounded-xl shadow-2xl"
                >
                  <div className="w-full h-full rounded-xl overflow-hidden border border-amber-400/80 bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] p-1 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    <div className="w-full h-full rounded-lg border border-amber-400/40 bg-purple-950/40 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-amber-300/70" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Right Deck Pile (8 Cards) */}
            {rightCards.map((idx) => {
              const isRiffle = phase === 'riffle';
              const delay = idx * 0.05 + 0.025; // slightly offset from left for true interlacing

              return (
                <motion.div
                  key={`right-${idx}`}
                  initial={{ x: 0, y: 0, rotateZ: 0, rotateY: 0 }}
                  animate={isRiffle ? {
                    x: [ 120 - idx * 4, 0, 0 ],
                    y: [ -idx * 2, -35 + idx * 3, 0 ],
                    rotateZ: [ 18, 4, 0 ],
                    rotateY: [ -15, 0, 0 ],
                    scale: [ 1, 1.05, 1 ],
                    zIndex: idx * 2 + 1,
                  } : {
                    x: 120 - idx * 3,
                    y: -idx * 2,
                    rotateZ: 16,
                    rotateY: -20,
                    scale: 1,
                    zIndex: idx,
                  }}
                  transition={isRiffle ? {
                    duration: 0.85,
                    delay: delay,
                    ease: "easeInOut"
                  } : {
                    duration: 0.45,
                    ease: "easeOut"
                  }}
                  className="absolute w-28 sm:w-32 aspect-[2/3] rounded-xl shadow-2xl"
                >
                  <div className="w-full h-full rounded-xl overflow-hidden border border-amber-400/80 bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] p-1 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    <div className="w-full h-full rounded-lg border border-amber-400/40 bg-purple-950/40 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-purple-300/70" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

          </div>
        )}

        {/* Phase 3: Cosmic Arc Fan */}
        {phase === 'fan' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {fanCards.map((idx) => {
              const total = fanCards.length;
              const angle = ((idx - total / 2) / total) * 90; // Spread from -45deg to +45deg
              const xOffset = (idx - total / 2) * 16;
              const yOffset = Math.abs(idx - total / 2) * 4;

              return (
                <motion.div
                  key={`fan-${idx}`}
                  initial={{ x: 0, y: 0, rotateZ: 0, scale: 0.95 }}
                  animate={{
                    x: xOffset,
                    y: -15 + yOffset,
                    rotateZ: angle,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-28 sm:w-32 aspect-[2/3] rounded-xl shadow-2xl origin-bottom"
                  style={{ zIndex: idx }}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden border border-amber-400 bg-gradient-to-br from-[#1E124A] via-[#0A0F24] to-[#2D1B69] p-1 shadow-[0_0_25px_rgba(251,191,36,0.3)]">
                    <div className="w-full h-full rounded-lg border border-amber-400/60 bg-purple-950/60 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Phase 4: Unified Gather & Glow */}
        {phase === 'gather' && (
          <motion.div
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: [1.1, 1, 1.05], opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="relative w-32 sm:w-36 aspect-[2/3] rounded-xl shadow-2xl flex items-center justify-center"
          >
            {/* Radiant Beacon Burst */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-300 rounded-2xl blur-xl opacity-80 animate-pulse" />
            
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-amber-400 bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] p-1.5 shadow-2xl z-10">
              <div className="w-full h-full rounded-lg border border-amber-300 bg-purple-950/80 flex flex-col items-center justify-center text-center p-2">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin mb-1" style={{ animationDuration: '3s' }} />
                <span className="font-cinzel text-[11px] font-bold text-amber-200 uppercase tracking-widest">
                  Baralho Consagrado
                </span>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
