import { useModalAccessibility } from '../utils/useModalAccessibility';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Check, Sparkles, Moon, Sun, Flame } from './icons/ArcaneIcons';
import { ALTAR_THEMES } from '../utils/theme';
import { audio } from '../utils/audio';

const ICON_MAP = {
  Sparkles,
  Moon,
  Sun,
  Flame,
};

export const ThemeSelectorModal = ({ 
  isOpen, 
  currentTheme, 
  onSelectTheme, 
  onClose 
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  const handleSelect = (theme) => {
    audio.playThemeChange();
    onSelectTheme(theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Outer Click Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <motion.div 
        ref={modalRef}
        aria-label="Temas"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-sm bg-[var(--color-obsidian)] border border-amber-500/40 shadow-2xl p-4 sm:p-6 text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-300">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100 gold-gradient-text">
              Estilos do Santuário & Altar
            </h3>
          </div>

          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-4">
          Personalize a frequência cromática, nebulosas e iluminação do seu templo de tiragem:
        </p>

        {/* Theme List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALTAR_THEMES.map((theme) => {
            const isSelected = currentTheme.id === theme.id;
            const Icon = ICON_MAP[theme.icon] || Sparkles;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme)}
                className={`relative p-3.5 rounded-sm border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden group
                  ${isSelected
                    ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)] bg-slate-900/90 ring-1 ring-amber-400/50'
                    : 'border-slate-800/80 bg-slate-950/60 hover:border-amber-500/40 hover:bg-slate-900/60'
                  }
                `}
                style={{ backgroundColor: isSelected ? undefined : `${theme.bgColor}CC` }}
              >
                {/* Visual Top Preview */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${theme.previewDot} flex items-center justify-center shadow-md`}>
                      <Icon className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span className="font-cinzel text-sm font-bold text-slate-100">
                      {theme.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-amber-400 text-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                  {theme.subtitle}
                </span>

                {/* Subtle Ambient Color Glow Bar */}
                <div 
                  className="w-full h-1 rounded-full mt-3 opacity-70"
                  style={{ backgroundColor: theme.textAccent.replace('text-', '') }}
                />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-900/30 flex justify-end">
          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="px-5 py-2 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
          >
            Aplicar Santuário
          </button>
        </div>
      </motion.div>
    </div>
  );
};
