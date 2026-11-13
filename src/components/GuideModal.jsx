import { useModalAccessibility } from '../utils/useModalAccessibility';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass, Layers, Flame, Droplets, Wind, Mountain, Eye, HelpCircle } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';
import { t } from '../i18n';

export const GuideModal = ({ isOpen, onClose }) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  return (
    <div className="mobile-modal-layer fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={handleClose}
      />

      <motion.div 
        ref={modalRef}
        aria-label={t('guide.dialog')}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="responsive-dialog dialog-guide relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-sm glass-panel border border-amber-500/40 shadow-2xl p-4 sm:p-6 md:p-8"
      >
        <button
          type="button"
          aria-label={t('common.close')} onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer z-20"
        >
          <X aria-hidden="true" className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
            {t('guide.title')}
          </h3>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          {t('guide.intro')}
        </p>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-sm bg-emerald-950/40 border border-emerald-500/30">
            <h4 className="font-bold text-emerald-200 mb-2">{t('guide.lenormandTitle')}</h4>
            <p>{t('guide.lenormandText')}</p>
          </div>
          
          <div className="p-3.5 rounded-sm bg-stone-950/40 border border-amber-500/30">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>{t('guide.q.title')}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">
              {t('guide.q.text')} <em>{t('guide.q.ex1')}</em> {t('guide.q.or')} <em>{t('guide.q.ex2')}</em>
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-900/60 border border-amber-500/20">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{t('guide.s.title')}</span>
            </h4>
            <ul className="space-y-1.5 mt-2">
              <li className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>{t('guide.s.major')}</strong> {t('guide.s.majorText')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>{t('guide.s.wands')}</strong> {t('guide.s.wandsText')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>{t('guide.s.cups')}</strong> {t('guide.s.cupsText')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Wind className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                <span><strong>{t('guide.s.swords')}</strong> {t('guide.s.swordsText')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>{t('guide.s.pentacles')}</strong> {t('guide.s.pentaclesText')}</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-900/60 border border-amber-500/20">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{t('guide.t.title')}</span>
            </h4>
            <p className="leading-relaxed text-slate-300">
              {t('guide.t.a')} <strong>{t('guide.t.b')}</strong>{t('guide.t.c')} <strong>{t('guide.t.d')}</strong>{t('guide.t.e')} <strong>{t('guide.t.f')}</strong>.
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-amber-500/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-colors active:scale-95 text-center"
          >
            {t('guide.done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
