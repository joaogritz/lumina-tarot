import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelestialRing } from './CelestialRing';
import { CardArt } from './CardArt';
import { CardDetailModal } from './CardDetailModal';
import { X, Sparkles, BookOpen, Share2, Copy, Bookmark, RotateCcw, Check, Flame, Droplets, Wind, Mountain, Feather, Star, ZoomIn } from './icons/ArcaneIcons';
import { SUITS } from '../data/tarotDeck';
import { audio } from '../utils/audio';
import { historyService } from '../utils/history';
import { aiOracleService } from '../utils/aiOracle';

export const InterpretationModal = ({ 
  spreadConfig, 
  chosenCards, 
  userQuestion, 
  onClose, 
  onResetReading 
}) => {
  const modalRef = useModalAccessibility(true, onClose);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiReading, setAiReading] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [selectedCardDetail, setSelectedCardDetail] = useState(null);
  const [shareNotice, setShareNotice] = useState(false);

  // Compute elemental and arcana balance
  const stats = {
    majorCount: chosenCards.filter(c => c.arcana === 'Major').length,
    wandsCount: chosenCards.filter(c => c.suit === 'wands').length,
    cupsCount: chosenCards.filter(c => c.suit === 'cups').length,
    swordsCount: chosenCards.filter(c => c.suit === 'swords').length,
    pentaclesCount: chosenCards.filter(c => c.suit === 'pentacles').length,
  };

  useEffect(() => {
    // Generate real AI reading via Cloudflare Worker Proxy
    const loadInterpretation = async () => {
      setIsLoadingAi(true);
      try {
        const result = await aiOracleService.generateRealAiReading({
          spreadConfig,
          chosenCards,
          userQuestion
        });
        setAiReading(result);
      } catch (err) {
        console.error('Error generating AI reading:', err);
        setAiReading(aiOracleService.generateOfflineFallback({ spreadConfig, chosenCards, userQuestion }));
      } finally {
        setIsLoadingAi(false);
      }
    };

    loadInterpretation();
  }, [spreadConfig, chosenCards, userQuestion]);

  const getReadingText = () => {
    const lines = [
      `🔮 LUMINA TAROT - LEITURA ORACULAR`,
      `Tiragem: ${spreadConfig.name}`,
      userQuestion ? `Intenção / Pergunta: "${userQuestion}"` : '',
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `----------------------------------------`,
      ...chosenCards.map((c, i) => {
        const pos = spreadConfig.positions[i];
        return `[${i + 1}] ${pos ? pos.name : 'Posição ' + (i + 1)}: ${c.name} (${c.roman})${c.isReversed ? ' [Invertida]' : ''}\n• Luz: ${c.light}\n• Conselho: "${c.advice}"\n`;
      }),
      `----------------------------------------`,
      `🌌 SÍNTESE SAGRADA DO ORÁCULO:`,
      aiReading?.text || 'Interpretação profunda revelada pelos arcanos.',
      `\nLumina Tarot • Sabedoria Ancestral & Arcanos do Destino`
    ];
    return lines.filter(Boolean).join('\n');
  };

  // Copy full reading text to clipboard with authentic paper rustle sound
  const handleCopyReading = () => {
    audio.playPaperRustle();
    navigator.clipboard.writeText(getReadingText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareReading = async () => {
    audio.playSelect();
    const text = getReadingText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lumina Tarot - ${spreadConfig.name}`,
          text: text
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(text);
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2500);
  };

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  const handleReset = () => {
    audio.playSelect();
    if (onResetReading) onResetReading();
    onClose();
  };

  const handleConclude = () => {
    audio.playConcludeReading();
    if (onResetReading) onResetReading();
    onClose();
  };

  const handleInspectCard = (card, pos) => {
    audio.playInspectZoom();
    setSelectedCardDetail({ card, positionInfo: pos });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Outer Click Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <motion.div 
        ref={modalRef}
        aria-label="Interpretação da leitura"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-sm bg-[var(--color-obsidian)] border border-amber-500/40 shadow-[0_0_50px_rgba(147,51,234,0.3)] overflow-hidden text-left"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 flex items-center justify-between bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-cinzel text-xs uppercase tracking-widest font-semibold text-amber-300/80">
              {chosenCards[0]?.deckId === 'lenormand' ? 'Oráculo Cigano · Petit Lenormand' : 'Oráculo dos 78 Arcanos'}
            </span>
          </div>

          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto min-h-0 space-y-6">
          
          {/* Main Title & Intention */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-cinzel mb-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Conselho Sagrado Revelado</span>
            </div>

            <h2 className="font-cinzel text-2xl md:text-4xl font-black text-slate-100 gold-gradient-text tracking-wide">
              Interpretação Completa da Tiragem
            </h2>

            <p className="font-cinzel text-xs md:text-sm text-amber-200/80 mt-1">
              {spreadConfig.name} • {chosenCards.length} Cartas Reveladas
            </p>

            {userQuestion && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-xl mx-auto p-3 rounded-sm bg-stone-950/60 border border-amber-500/40 text-xs md:text-sm text-amber-200 italic shadow-lg text-left"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-bold not-italic mb-0.5 font-cinzel text-xs">
                  <Feather className="w-3.5 h-3.5" />
                  <span>Sua Pergunta / Intenção:</span>
                </div>
                "{userQuestion}"
              </motion.div>
            )}
          </div>

          {/* Authentic Mystical Oracle Synthesis Box */}
          <div className="interpretation-prose relative p-5 sm:p-7">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 gold-gradient-text">
                Interpretação da sua Leitura
              </h3>
            </div>

            {/* Loading State or Structured Sections */}
            {isLoadingAi ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <CelestialRing className="oracle-loading-instrument" />
                <p className="font-cinzel text-xs sm:text-sm text-amber-200 animate-pulse">
                  Analisando as cartas e preparando uma resposta clara para você...
                </p>
              </div>
            ) : aiReading?.diagnosis ? (
              <div className="space-y-3.5 animate-fade-in text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
                {/* 1. O que as cartas mostram */}
                <div className="p-3.5 sm:p-4 rounded-sm bg-slate-900/80 border border-amber-500/30">
                  <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                    <span>🔍 O que as cartas estão mostrando</span>
                  </span>
                  <p className="text-slate-300">{aiReading.diagnosis}</p>
                </div>

                {/* 2. O que está acontecendo */}
                <div className="p-3.5 sm:p-4 rounded-sm bg-slate-900/80 border border-amber-500/30">
                  <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                    <span>💡 O que está acontecendo por trás</span>
                  </span>
                  <p className="text-slate-300">{aiReading.dynamics}</p>
                </div>

                {/* 3. Conselho Prático */}
                <div className="p-3.5 sm:p-4 rounded-sm bg-stone-950/70 border border-amber-400/40">
                  <span className="font-cinzel text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                    <span>🧭 Conselho prático para você</span>
                  </span>
                  <p className="text-amber-100/95 font-medium">{aiReading.advice}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-line animate-fade-in font-sans">
                {aiReading?.text}
              </div>
            )}
          </div>

          {/* Card Cards Row in the Reading (Clickable to Inspect) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>As Cartas em suas Posições no Altar</span>
              </h3>
              <span className="text-[11px] text-amber-300/80 font-cinzel flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Clique em qualquer carta para inspecionar</span>
              </span>
            </div>

            <div className={`grid gap-4 sm:gap-6 ${
              chosenCards.length === 1
                ? 'grid-cols-1'
                : chosenCards.length > 5
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
            }`}>
              {chosenCards.map((card, idx) => {
                const pos = spreadConfig.positions[idx];
                const suitConf = SUITS[card.suit?.toUpperCase()] || SUITS.MAJOR;

                return (
                  <motion.button 
                    key={card.id || idx}
                    type="button"
                    onClick={() => handleInspectCard(card, pos)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="reading-editorial group cursor-pointer rounded-sm border border-amber-500/20 p-4 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all duration-300 text-left relative"
                  >
                    {/* Position Header & Inspect Prompt */}
                    <div className="w-full flex items-center justify-between gap-1 mb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-950 border border-amber-500/40 text-amber-300 font-cinzel text-[11px] font-bold">
                        <span className="truncate">{pos ? pos.name : `Carta ${idx + 1}`}</span>
                      </div>
                      <span className="text-[10px] text-amber-400/70 group-hover:text-amber-300 flex items-center gap-1 font-cinzel transition-colors">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver carta</span>
                      </span>
                    </div>

                    {pos && (
                      <p className="text-[11px] text-slate-400 mb-2 truncate">
                        {pos.subtitle}
                      </p>
                    )}

                    {/* Card Art Preview with Hover Zoom Effect */}
                    <div className="reading-artwork aspect-[7/12] mx-auto my-2">
                      <CardArt card={card} size="md" showKeywords={false} />
                    </div>

                    {/* Card Title & Position Meaning */}
                    <div className="reading-card-text mt-3 text-left w-full">
                      <h4 className="font-cinzel text-base font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-amber-200 transition-colors">
                        <span>{card.name}</span>
                        {card.isReversed && (
                          <span className="text-[10px] text-red-400 font-normal">(Invertida)</span>
                        )}
                      </h4>
                      <span className="text-[11px] text-amber-300/80 font-cinzel block mb-2">
                        {card.deckId === 'lenormand' ? `Baralho Cigano · Carta ${card.number}` : (card.arcana === 'Major' ? `Arcano Maior ${card.roman}` : suitConf.name)}
                      </span>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {card.isReversed ? (card.shadow || card.light) : card.light}
                      </p>

                      <div className="p-2.5 rounded-sm bg-slate-900/80 border border-amber-500/20 text-[11px] text-amber-200 italic group-hover:border-amber-500/40 transition-colors">
                        <span className="font-bold text-amber-300 not-italic block mb-0.5 font-cinzel">
                          Conselho da carta:
                        </span>
                        "{card.advice}"
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Elemental & Arcana Distribution Bar */}
          {chosenCards[0]?.deckId !== 'lenormand' && <div className="p-4 rounded-sm glass-panel-subtle border border-amber-500/30">
            <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-widest mb-3">
              Balanço Elemental da Tiragem
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {stats.majorCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-950/60 border border-amber-400/40 text-amber-300 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{stats.majorCount} Arcanos Maiores (Destino)</span>
                </div>
              )}
              {stats.wandsCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-orange-950/60 border border-orange-400/40 text-orange-300 text-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{stats.wandsCount} Fogo / Paus (Ação & Paixão)</span>
                </div>
              )}
              {stats.cupsCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-950/60 border border-cyan-400/40 text-cyan-300 text-xs">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{stats.cupsCount} Água / Copas (Coração & Intuição)</span>
                </div>
              )}
              {stats.swordsCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-slate-900 border border-slate-400/40 text-slate-200 text-xs">
                  <Wind className="w-3.5 h-3.5" />
                  <span>{stats.swordsCount} Ar / Espadas (Mente & Verdade)</span>
                </div>
              )}
              {stats.pentaclesCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>{stats.pentaclesCount} Terra / Ouros (Matéria & Prática)</span>
                </div>
              )}
            </div>
          </div>}

        </div>

        {/* Bottom Actions Bar - Full Mobile Width */}
        <div className="p-4 sm:p-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyReading}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-sm bg-stone-950/80 hover:bg-stone-900 border border-amber-500/40 text-amber-200 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiada!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareReading}
              title="Compartilhar leitura no WhatsApp ou outros aplicativos"
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-sm bg-slate-900 hover:bg-stone-950/80 border border-amber-500/40 text-amber-200 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {shareNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
              <span>{shareNotice ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              type="button"
              disabled={isLoadingAi || saved}
              onClick={() => {
                audio.playSelect();
                const result = historyService.saveReading({
                  spreadConfig, 
                  chosenCards, 
                  userQuestion,
                  aiReading 
                });
                setSaved(!!result);
                setSaveError(!result);
                setTimeout(() => setSaved(false), 3000);
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-sm border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95
                ${saved 
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300' 
                  : 'glass-panel-subtle hover:border-amber-400/60 text-amber-300'
                }
              `}
            >
              {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-amber-400" />}
              <span>{saveError ? 'Falha ao salvar. Tente novamente.' : saved ? 'Salvo!' : 'Salvar no Diário'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nova Tiragem</span>
            </button>

            <button
              type="button"
              onClick={handleConclude}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-cinzel font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95"
            >
              Concluir Leitura
            </button>
          </div>
        </div>
      </motion.div>

      {/* Nested Single Card Inspector Modal */}
      {selectedCardDetail && (
        <CardDetailModal
          card={selectedCardDetail.card}
          positionInfo={selectedCardDetail.positionInfo}
          onClose={() => setSelectedCardDetail(null)}
        />
      )}
    </div>
  );
};
