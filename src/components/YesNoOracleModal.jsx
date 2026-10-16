import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, RotateCcw, Feather, Dices, Lightbulb, Copy, Check, Compass } from './icons/ArcaneIcons';
import { CardArt } from './CardArt';
import { TarotCard } from './cards/TarotCard.jsx';
import { CardDetailModal } from './CardDetailModal';
import { TAROT_DECK } from '../data/tarotDeck';
import { getYesNoEvaluation, generateOfflineYesNoReading } from '../utils/yesNoOracle';
import { aiOracleService } from '../utils/aiOracle';
import { audio } from '../utils/audio';

const QUICK_QUESTIONS = [
  'Devo tomar essa iniciativa agora?',
  'É uma oportunidade favorável?',
  'Esse projeto vai dar certo?',
  'Devo ter cautela e esperar?',
  'Essa pessoa é sincera comigo?'
];

export const YesNoOracleModal = ({ 
  cards = TAROT_DECK,
  isOpen, 
  onClose,
  allowReversed = false 
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const [question, setQuestion] = useState('');
  const [drawnCard, setDrawnCard] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiReading, setAiReading] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  const handleDraw = async (chosenQuestion = question) => {
    if (isDrawing || isLoadingAi) return;
    audio.playShuffle();
    setIsDrawing(true);
    setAiReading(null);

    // Pick random card
    const randomIndex = Math.floor(Math.random() * cards.length);
    const isCardReversed = allowReversed ? Math.random() < 0.35 : false;
    const card = {
      ...cards[randomIndex],
      isReversed: isCardReversed
    };

    setDrawnCard(card);
    setIsDrawing(false);
    setIsLoadingAi(true);
    audio.playFlip();

    try {
      const result = await aiOracleService.generateYesNoAiReading({
        card,
        userQuestion: chosenQuestion
      });
      setAiReading(result);
      audio.playGrandReveal();
    } catch (err) {
      console.error('Failed to get Yes/No AI reading:', err);
      const fallback = generateOfflineYesNoReading({ card, userQuestion: chosenQuestion });
      setAiReading(fallback);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleReset = () => {
    audio.playSelect();
    setDrawnCard(null);
    setAiReading(null);
    setCopied(false);
  };

  const handleCopyResult = () => {
    if (!aiReading || !drawnCard) return;
    audio.playPaperRustle();
    const shareText = `🔮 LUMINA TAROT — SIM OU NÃO\n${question ? `Pergunta: "${question}"\n` : ''}Arcano: ${drawnCard.name} ${drawnCard.isReversed ? '(Invertida)' : ''}\nVeredito: ${aiReading.verdict}\n\nResposta: ${aiReading.answer}\n\n💡 Dica do Oráculo: ${aiReading.tip}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const evaluation = drawnCard ? (aiReading || getYesNoEvaluation(drawnCard, drawnCard.isReversed)) : null;

  return (
    <div className="mobile-modal-layer fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Outer Click Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <motion.div 
        ref={modalRef}
        aria-label="Oráculo sim ou não"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="responsive-dialog dialog-yesno relative z-10 w-full max-w-xl max-h-[92vh] flex flex-col rounded-sm bg-[var(--color-obsidian)] border border-amber-500/40 shadow-2xl overflow-y-auto p-4 sm:p-6 md:p-8 text-center scrollbar-thin scrollbar-thumb-amber-500/20"
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Fechar" onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer z-20"
        >
          <X aria-hidden="true" className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 border border-amber-500/30 text-amber-300 text-xs font-cinzel font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Reflexão simbólica com as cartas</span>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-black text-slate-100 gold-gradient-text tracking-wide">
            Oráculo do Sim ou Não
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Faça sua pergunta e explore uma orientação simbólica com conselhos práticos. O resultado não é uma certeza sobre os fatos.
          </p>
        </div>

        {/* Question Input Box & Suggestion Chips */}
        {!drawnCard && (
          <div className="yesno-question-step my-3 text-left">
            <div className="relative rounded-sm border border-amber-500/30 bg-slate-950/80 p-3 focus-within:border-amber-400/70 transition-all shadow-inner">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  aria-label="Pergunta para o oráculo sim ou não"
                  maxLength={1000}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDraw();
                  }}
                  placeholder="Mentalize ou digite sua pergunta objetiva..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  autoFocus
                />
                {question && (
                  <button
                    type="button"
                    onClick={() => setQuestion('')}
                    className="text-slate-500 hover:text-slate-300 text-xs p-1"
                  >
                    <X aria-hidden="true" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Question Chips */}
            <div className="mt-3">
              <span className="text-[10px] font-cinzel text-amber-400/80 font-semibold uppercase block mb-1.5">
                Sugestões Rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      audio.playSelect();
                      setQuestion(q);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-sm bg-stone-950/40 hover:bg-stone-900/60 border border-amber-500/20 hover:border-amber-400/40 text-slate-300 hover:text-amber-200 transition-all cursor-pointer text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Draw Action Button */}
            <button
              type="button"
              onClick={() => handleDraw()}
              disabled={isDrawing || isLoadingAi}
              className={`mt-5 w-full py-3.5 rounded-sm bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-cinzel font-black text-xs sm:text-sm tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2
                ${isDrawing || isLoadingAi ? 'animate-pulse opacity-80' : ''}
              `}
            >
              <Dices className={`w-5 h-5 ${isDrawing ? 'animate-spin' : ''}`} />
              <span>{isDrawing ? 'Embaralhando Arcanos...' : 'Tirar Carta & Consultar Oráculo'}</span>
            </button>
          </div>
        )}

        {/* AI Loading State */}
        {isLoadingAi && drawnCard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 flex flex-col items-center justify-center gap-4"
          >
            <div className="draw-deck-stack relative w-28 aspect-[7/12]">
              <TarotCard face="back" size="sm" />
            </div>
            <div className="space-y-1">
              <h4 className="font-cinzel text-base font-bold text-amber-300 animate-pulse">
                Sintonizando a energia das cartas...
              </h4>
              <p className="text-xs text-slate-400">
                Interpretando o arcano <span className="text-slate-200 font-semibold">{drawnCard.name}</span> para a sua dúvida
              </p>
            </div>
          </motion.div>
        )}

        {/* Revealed Result Display with AI Output */}
        {!isLoadingAi && drawnCard && evaluation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 my-1"
          >
            {/* Question Echo */}
            {question && (
              <div className="px-3 py-1.5 rounded-sm bg-stone-950/40 border border-amber-500/20 max-w-md">
                <span className="text-[10px] font-cinzel text-amber-400/80 font-bold uppercase block">
                  Sua Pergunta:
                </span>
                <p className="text-xs text-amber-100 italic font-cinzel">
                  "{question}"
                </p>
              </div>
            )}

            {/* Verdict Badge */}
            <div className={`px-6 py-2.5 rounded-sm border text-sm sm:text-base md:text-lg font-cinzel font-black tracking-widest shadow-xl flex items-center gap-2 ${evaluation.badgeBg} ${evaluation.color}`}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{evaluation.verdict}</span>
            </div>

            {/* Card Preview & Analysis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center w-full text-left my-1">
              {/* Card Thumbnail / Art */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedCardDetail(drawnCard)}
                  className="w-32 sm:w-36 aspect-[7/12] shadow-2xl rounded-sm cursor-pointer hover:scale-105 transition-transform group relative"
                  title="Clique para ver detalhes do Arcano"
                >
                  <CardArt card={drawnCard} isMini={false} showKeywords={false} />
                  <div className="absolute inset-0 rounded-sm bg-amber-400/0 group-hover:bg-amber-400/10 transition-colors border border-transparent group-hover:border-amber-400/50" />
                </button>
                <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-cinzel">
                  <Compass className="w-3 h-3 text-amber-400" />
                  {drawnCard.name} {drawnCard.isReversed ? '(Invertida)' : ''}
                </span>
              </div>

              {/* Direct Response & Actionable Tip */}
              <div className="sm:col-span-7 flex flex-col gap-2.5 text-xs">
                {/* Direct Answer Box */}
                <div className="p-3.5 rounded-sm bg-slate-900/90 border border-slate-700/80 shadow-md">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Resposta Direta do Oráculo:
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-normal">
                    {evaluation.answer || evaluation.summary}
                  </p>
                </div>

                {/* Practical Tip / Condition Callout */}
                <div className="p-3.5 rounded-sm bg-gradient-to-br from-stone-950/80 to-slate-950/90 border border-amber-500/40 shadow-md relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1 text-amber-300 font-cinzel font-bold text-[11px] uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Dica Prática / Condição:</span>
                  </div>
                  <p className="text-amber-100/90 italic leading-relaxed text-xs">
                    "{evaluation.tip || drawnCard.advice}"
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full mt-2 pt-3 border-t border-stone-900/30">
              <button
                type="button"
                onClick={handleCopyResult}
                className="flex-1 min-w-[130px] py-2.5 px-3 rounded-sm bg-stone-950/50 hover:bg-stone-900/70 border border-amber-500/30 text-amber-200 hover:text-amber-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'Copiado!' : 'Copiar Resposta'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 min-w-[130px] py-2.5 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Outra Pergunta</span>
              </button>

              <button
                type="button"
                aria-label="Fechar" onClick={handleClose}
                className="py-2.5 px-5 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
              >
                Concluir
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Card Detail Modal when user clicks to inspect */}
      {selectedCardDetail && (
        <CardDetailModal
          card={selectedCardDetail}
          positionInfo={{ name: 'Oráculo do Sim ou Não', meaning: 'Resposta Direta e Conselho' }}
          onClose={() => setSelectedCardDetail(null)}
        />
      )}
    </div>
  );
};
