import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, ArrowRight } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';

export const ConfirmSpreadChangeModal = ({ 
  isOpen, 
  targetSpread, 
  currentSpread, 
  onConfirm, 
  onCancel 
}) => {
  const modalRef = useModalAccessibility(isOpen, onCancel);
  useEffect(() => {
    if (isOpen) {
      audio.playHover();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen || !targetSpread) return null;

  const handleConfirm = () => {
    audio.playSelect();
    onConfirm();
  };

  const handleCancel = () => {
    audio.playCloseModal();
    onCancel();
  };

  return (
    <div className="mobile-modal-layer fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Outer Click Backdrop with Fluid Fade */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" 
        onClick={handleCancel} 
      />

      {/* Modal Dialog Box with Spring Physics */}
      <motion.div 
        ref={modalRef}
        aria-label="Trocar tiragem"
        role="dialog" 
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="responsive-dialog dialog-confirm relative z-10 w-full max-w-md rounded-sm glass-panel border border-amber-500/40 shadow-2xl p-6 sm:p-8 text-center"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancelar troca de tiragem"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
        >
          <X aria-hidden="true" className="w-4 h-4" />
        </button>

        {/* Mystic Icon */}
        <div className="mx-auto w-14 h-14 rounded-sm bg-gradient-to-tr from-stone-900/80 to-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          <Layers className="w-7 h-7 text-amber-300 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="font-cinzel text-xl font-bold text-slate-100 gold-gradient-text mb-2">
          Alterar Tipo de Tiragem
        </h3>

        {/* Subtitle / Transition Info */}
        <div className="my-3 px-3 py-2 rounded-sm bg-stone-950/50 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-cinzel text-amber-200">
          <span className="truncate">{currentSpread.shortName}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-amber-300 font-bold truncate">{targetSpread.shortName}</span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          As cartas consagradas na mesa serão recolhidas e o baralho será reembaralhado para o novo formato de leitura. Deseja prosseguir?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            Manter Mesa Atual
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-sm bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 border border-amber-300/60"
          >
            Confirmar Mudança
          </button>
        </div>
      </motion.div>
    </div>
  );
};
