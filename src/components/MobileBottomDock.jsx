import React from 'react';
import { Layers, BookOpen, Bookmark, Palette, Oracle, Destiny } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';

export const MobileBottomDock = ({ 
  onScrollToAltar,
  onOpenDestiny,
  onOpenYesNo,
  onOpenGrimoire,
  onOpenHistory,
  onOpenThemes,
  historyCount = 0,
  currentTheme 
}) => {
  return (
    <nav 
      aria-label="Navegação Rápida Mobile"
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around px-3 py-2 rounded-sm bg-slate-950/90 backdrop-blur-lg border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {/* 1. Altar / Mesa */}
      <button
        type="button"
        onClick={() => {
          audio.playHover();
          if (onScrollToAltar) onScrollToAltar();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-300 transition-colors p-1"
      >
        <Layers className="w-4 h-4" />
        <span className="text-[9px] font-cinzel font-semibold">Altar</span>
      </button>

      {/* 2. Destino Wish */}
      <button
        type="button"
        onClick={() => {
          if (onOpenDestiny) onOpenDestiny();
        }}
        className="flex flex-col items-center gap-0.5 text-amber-300 p-1 relative -top-2 cursor-pointer active:scale-95"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[var(--color-obsidian)] to-[var(--color-obsidian)] border border-amber-400/80 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <Destiny className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-[10px] font-cormorant font-bold text-amber-300 tracking-wide">Destino</span>
      </button>

      {/* 3. Sim ou Não */}
      <button
        type="button"
        onClick={() => {
          audio.playHover();
          if (onOpenYesNo) onOpenYesNo();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-300 transition-colors p-1"
      >
        <Oracle className="w-4 h-4 text-amber-300/80" />
        <span className="text-[9px] font-cinzel font-semibold">Sim/Não</span>
      </button>

      {/* 4. Grimório */}
      <button
        type="button"
        onClick={() => {
          audio.playHover();
          if (onOpenGrimoire) onOpenGrimoire();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-300 transition-colors p-1"
      >
        <BookOpen className="w-4 h-4 text-amber-400" />
        <span className="text-[9px] font-cinzel font-semibold">Grimório</span>
      </button>

      {/* 5. Diário */}
      <button
        type="button"
        onClick={() => {
          audio.playHover();
          if (onOpenHistory) onOpenHistory();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-300 transition-colors p-1 relative"
      >
        <Bookmark className="w-4 h-4 text-amber-400" />
        <span className="text-[9px] font-cinzel font-semibold">Diário</span>
        {historyCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[8px] font-bold flex items-center justify-center">
            {historyCount}
          </span>
        )}
      </button>

      {/* 6. Temas */}
      <button
        type="button"
        onClick={() => {
          audio.playHover();
          if (onOpenThemes) onOpenThemes();
        }}
        className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-300 transition-colors p-1"
      >
        <Palette className="w-4 h-4 text-amber-300/80" />
        <span className="text-[9px] font-cinzel font-semibold">Temas</span>
      </button>
    </nav>
  );
};
