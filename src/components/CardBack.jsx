import React from 'react';
import { motion } from 'framer-motion';
import { audio } from '../utils/audio';

export const CardBack = React.memo(({ card, onClick, isSelected = false, index }) => {
  const handleMouseEnter = () => {
    if (!isSelected) {
      audio.playCardHover();
    }
  };

  const handleClick = () => {
    if (!isSelected && onClick) {
      audio.playSelect();
      onClick(card);
    }
  };

  if (isSelected) {
    return (
      <div className="aspect-[2/3] w-full pointer-events-none opacity-0" />
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.4, y: -40, rotateZ: (index % 2 === 0 ? 15 : -15), transition: { duration: 0.35 } }}
      whileHover={{ 
        y: -9, 
        scale: 1.06, 
        transition: { type: "spring", stiffness: 450, damping: 22 } 
      }}
      whileTap={{ scale: 0.94 }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      aria-label={`Carta do baralho ${index + 1}`}
      className="group relative aspect-[2/3] w-full rounded-xl cursor-pointer select-none transform-gpu"
    >
      {/* Outer Glow Aura on Hover with Spring Fluidity */}
      <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-amber-400 to-indigo-600 opacity-0 group-hover:opacity-85 blur-md transition-opacity duration-300 pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[#120B2E] via-[#0A0F24] to-[#1A0B36] border border-amber-500/30 group-hover:border-amber-400 shadow-xl group-hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-colors duration-300 flex items-center justify-center p-1.5">
        
        {/* Subtle Stardust Texture */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#FDE68A_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

        {/* Intricate Dual Gold Frame Border */}
        <div className="relative w-full h-full rounded-lg border border-amber-400/40 p-1 flex items-center justify-center bg-gradient-to-b from-purple-950/40 to-slate-950/60">
          
          {/* Ornate Golden Corners */}
          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />

          {/* Inner Sacred Geometry Mandala SVG */}
          <svg viewBox="0 0 100 150" className="w-full h-full text-amber-400/80 group-hover:text-amber-200 transition-colors duration-300">
            {/* Celestial Geometry Guidelines */}
            <circle cx="50" cy="75" r="42" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
            <circle cx="50" cy="75" r="32" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
            <circle cx="50" cy="75" r="22" fill="#1E124A" stroke="currentColor" strokeWidth="1.2" />

            {/* 8-Pointed Star Center */}
            <polygon 
              points="50,45 54,66 75,66 58,78 64,99 50,86 36,99 42,78 25,66 46,66" 
              fill="#FDE68A" 
              stroke="#D97706" 
              strokeWidth="0.8"
              opacity="0.9"
            />

            {/* Sun & Moon Cosmic Rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <line 
                key={i}
                x1="50" 
                y1="75" 
                x2={50 + 38 * Math.cos((deg * Math.PI) / 180)} 
                y2={75 + 38 * Math.sin((deg * Math.PI) / 180)} 
                stroke="currentColor" 
                strokeWidth={i % 2 === 0 ? "1" : "0.5"}
                opacity="0.7"
              />
            ))}

            {/* Top & Bottom Constellation Triangles */}
            <polygon points="50,15 55,25 45,25" fill="#FBBF24" opacity="0.8" />
            <circle cx="50" cy="20" r="1.5" fill="#FFF" />
            <polygon points="50,135 55,125 45,125" fill="#FBBF24" opacity="0.8" />
            <circle cx="50" cy="130" r="1.5" fill="#FFF" />

            {/* Moon Crescents */}
            <path d="M 50 63 A 12 12 0 0 1 50 87 A 15 15 0 0 0 50 63" fill="#FDE68A" opacity="0.5" />
          </svg>

          {/* Shimmer Light Reflection Effect on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
});
