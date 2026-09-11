import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, Star, Compass, ArrowRight, Wand2 } from 'lucide-react';
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

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleEnter = useCallback(() => {
    // Unlock AudioContext via gesture & play majestic opening sound
    audio.init();
    audio.playTempleEntry();
    if (onLoaded) {
      onLoaded();
    }
  }, [onLoaded]);

  // Keyboard shortcut listener (Enter / Space to enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isReady && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady, handleEnter]);

  // Dynamic mystical loading messages based on progress
  const getStatusText = () => {
    if (progress < 30) return 'Sintonizando o Oráculo Sagrado...';
    if (progress < 65) return 'Preparando os baralhos...';
    if (progress < 95) return 'Alinhando as Constelações & Energias...';
    return 'O Santuário dos Arcanos Está Aberto';
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)', transition: { duration: 0.55, ease: 'easeInOut' } }}
      onClick={() => isReady && handleEnter()}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A18] text-slate-100 overflow-hidden select-none cursor-pointer"
    >
      {/* Drifting Nebula & Ambient Cosmic Lights */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-purple-900/30 via-amber-500/15 to-indigo-900/30 blur-3xl rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Rotating Sacred Geometry Mandalas */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center mb-6">
        
        {/* Outer Ring Spinning Clockwise */}
        <div className="absolute inset-0 rounded-full border border-amber-400/30 border-dashed animate-[spin_28s_linear_infinite]" />
        
        {/* Middle Ring with Rune Points Counter-Clockwise */}
        <div className="absolute inset-4 rounded-full border-2 border-purple-500/30 animate-[spin_18s_linear_infinite_reverse]" />
        
        {/* Inner Golden Ring */}
        <div className="absolute inset-10 rounded-full border border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.25)] animate-pulse" />

        {/* 3 Hovering Mystical Cards Triad */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          
          {/* Card Left (The Moon) */}
          <motion.div
            animate={{ y: [0, -10, 0], rotateZ: [-14, -10, -14] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-2 sm:left-2 w-20 sm:w-24 aspect-[2/3] rounded-xl border border-purple-500/60 bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] p-1 shadow-2xl"
          >
            <div className="w-full h-full rounded-lg border border-purple-400/30 bg-purple-950/40 flex flex-col items-center justify-center text-center">
              <Moon className="w-5 h-5 text-purple-300 mb-1" />
              <span className="text-[8px] font-cinzel text-purple-200">XVIII • Lua</span>
            </div>
          </motion.div>

          {/* Card Center (The Star - Highest Elevation) */}
          <motion.div
            animate={{ y: [-8, 4, -8], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute z-20 w-24 sm:w-28 aspect-[2/3] rounded-xl border-2 border-amber-400 bg-gradient-to-br from-[#1E124A] via-[#0A0F24] to-[#2D1B69] p-1.5 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            <div className="w-full h-full rounded-lg border border-amber-300/60 bg-purple-950/60 flex flex-col items-center justify-center text-center">
              <Star className="w-7 h-7 text-amber-300 animate-spin mb-1" style={{ animationDuration: '8s' }} />
              <span className="text-[9px] font-cinzel font-bold text-amber-200">XVII • Estrela</span>
            </div>
          </motion.div>

          {/* Card Right (The Sun) */}
          <motion.div
            animate={{ y: [0, -10, 0], rotateZ: [14, 10, 14] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-2 sm:right-2 w-20 sm:w-24 aspect-[2/3] rounded-xl border border-amber-500/60 bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] p-1 shadow-2xl"
          >
            <div className="w-full h-full rounded-lg border border-amber-400/30 bg-purple-950/40 flex flex-col items-center justify-center text-center">
              <Sun className="w-5 h-5 text-amber-300 mb-1" />
              <span className="text-[8px] font-cinzel text-amber-200">XIX • Sol</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Brand Title with Glowing Golden Shimmer */}
      <div className="relative z-10 text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-cinzel tracking-widest text-amber-300/80 uppercase">
            Portal Oracular
          </span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>

        <h1 className="font-cinzel-dec text-3xl sm:text-4xl md:text-5xl font-black gold-gradient-text tracking-wider">
          LUMINA TAROT
        </h1>
      </div>

      {/* Interaction Center (Progress Bar OR Glowing Entry Button) */}
      <div className="relative z-10 w-72 sm:w-84 flex flex-col items-center min-h-[70px]">
        <AnimatePresence mode="wait">
          {!isReady ? (
            /* Progress State */
            <motion.div 
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center"
            >
              {/* Track Bar */}
              <div className="w-full h-2 rounded-full bg-slate-900/90 border border-purple-900/60 p-0.5 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>

              {/* Status Text & Percentage */}
              <div className="w-full flex items-center justify-between mt-3 text-xs font-cinzel">
                <span className="text-purple-200/80 animate-pulse truncate max-w-[210px]">
                  {getStatusText()}
                </span>
                <span className="text-amber-300 font-bold ml-2 shrink-0">
                  {progress}%
                </span>
              </div>
            </motion.div>
          ) : (
            /* Ready State: Portal Entry Button that guarantees user audio unlock */
            <motion.div
              key="enter"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="w-full flex flex-col items-center"
            >
              <div className="relative group w-full flex justify-center">
                {/* Subtle Amber Halo */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/40 via-purple-600/30 to-amber-500/40 blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnter();
                  }}
                  className="relative px-9 py-3.5 rounded-2xl bg-gradient-to-b from-[#1C103B] via-[#100726] to-[#080417] hover:from-[#281854] hover:to-[#110729] border-2 border-amber-400/70 hover:border-amber-300 text-amber-100 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(251,191,36,0.4)] flex items-center justify-center gap-3.5 transition-all duration-300 cursor-pointer active:scale-95 group/btn overflow-hidden"
                >
                  {/* Sweep Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  
                  <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-700 shrink-0" />
                  <span className="font-almendra text-2xl font-bold tracking-wider shimmer-gold-text">
                    Entrar no Santuário
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
                </button>
              </div>

              <span className="text-xs text-amber-200/70 font-almendra italic mt-2.5 tracking-wider">
                Toque para despertar a mesa oracular
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle Bottom Watermark */}
      <div className="absolute bottom-6 text-[11px] font-cinzel text-slate-600 tracking-widest uppercase">
        Tarot & Baralho Cigano • Sabedoria Ancestral
      </div>

    </motion.div>
  );
};
