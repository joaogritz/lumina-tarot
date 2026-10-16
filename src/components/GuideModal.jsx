import { useModalAccessibility } from '../utils/useModalAccessibility';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass, Layers, Flame, Droplets, Wind, Mountain, Eye, HelpCircle } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';

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
        aria-label="Guia de leitura"
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
          aria-label="Fechar" onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer z-20"
        >
          <X aria-hidden="true" className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
            Guia do Oráculo Lumina
          </h3>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          O Tarot é um espelho arquetípico da consciência humana. Ao mentalizar sua questão e escolher as cartas, seu subconsciente e as sincronias do universo guiam a escolha.
        </p>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-sm bg-emerald-950/40 border border-emerald-500/30">
            <h4 className="font-bold text-emerald-200 mb-2">Baralho Cigano · Petit Lenormand</h4>
            <p>Selecione o baralho antes da tiragem. Suas 36 cartas usam símbolos cotidianos e são lidas sem inversões. Na linha de três cartas, leia também os pares vizinhos como uma sequência; na carta única, use o símbolo como foco de reflexão. A Torre representa estruturas e autonomia; a Lua, emoção e reconhecimento. Seus significados diferem do Tarot. Aqui, Sim ou Não é uma adaptação simbólica, não uma probabilidade.</p>
          </div>
          
          <div className="p-3.5 rounded-sm bg-stone-950/40 border border-amber-500/30">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>1. Como Mentalizar sua Pergunta</span>
            </h4>
            <p className="leading-relaxed text-slate-300">
              Prefira perguntas abertas que convidem à reflexão: <em>"Quais energias devo cultivar para resolver este impasse?"</em> ou <em>"O que preciso compreender sobre esta fase?"</em>.
            </p>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-900/60 border border-amber-500/20">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>2. A Estrutura das 78 Cartas</span>
            </h4>
            <ul className="space-y-1.5 mt-2">
              <li className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>22 Arcanos Maiores:</strong> Grandes lições kármicas, marcos espirituais e transformações profundas de vida.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span><strong>14 de Paus (Fogo):</strong> Vontade, energia criativa, paixão, trabalho e novos projetos.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>14 de Copas (Água):</strong> Emoções, amor, intuição, família e relacionamentos.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Wind className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                <span><strong>14 de Espadas (Ar):</strong> Clareza mental, desafios, verdade, justiça e decisões intelectuais.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>14 de Ouros (Terra):</strong> Prosperidade material, finanças, saúde física e paciência na colheita.</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-900/60 border border-amber-500/20">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>3. A Tiragem de 3 Cartas (Padrão)</span>
            </h4>
            <p className="leading-relaxed text-slate-300">
              Na leitura de 3 cartas, a primeira representa as <strong>raízes e causas passadas</strong>; a segunda o <strong>momento presente e suas forças ativas</strong>; e a terceira a <strong>tendência futura e conselho de ação</strong>.
            </p>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-amber-500/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-colors active:scale-95 text-center"
          >
            Compreendi, Voltar à Mesa
          </button>
        </div>
      </motion.div>
    </div>
  );
};
