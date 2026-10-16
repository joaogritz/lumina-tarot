import { useModalAccessibility } from '../utils/useModalAccessibility';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Search, Layers, Flame, Droplets, Wind, Mountain } from './icons/ArcaneIcons';
import { CardArt } from './CardArt';
import { TAROT_DECK, SUITS } from '../data/tarotDeck';
import { audio } from '../utils/audio';

export const GrimoireModal = ({ 
  cards = TAROT_DECK,
  isOpen, 
  onClose,
  onOpenCardDetail 
}) => {
  const modalRef = useModalAccessibility(isOpen, onClose);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = cards[0]?.deckId === 'lenormand' ? [{ id: 'all', label: 'Todas as 36', count: 36, icon: Layers }] : [
    { id: 'all', label: 'Todas as 78', count: 78, icon: Layers },
    { id: 'major', label: '22 Maiores', count: 22, icon: Sparkles, color: 'text-amber-400' },
    { id: 'wands', label: 'Paus (Fogo)', count: 14, icon: Flame, color: 'text-orange-400' },
    { id: 'cups', label: 'Copas (Água)', count: 14, icon: Droplets, color: 'text-cyan-400' },
    { id: 'swords', label: 'Espadas (Ar)', count: 14, icon: Wind, color: 'text-slate-300' },
    { id: 'pentacles', label: 'Ouros (Terra)', count: 14, icon: Mountain, color: 'text-emerald-400' },
  ];

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (activeFilter === 'major' && card.arcana !== 'Major') return false;
      if (activeFilter !== 'all' && activeFilter !== 'major' && card.suit !== activeFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesEn = card.nameEn.toLowerCase().includes(query);
        const matchesArchetype = card.archetype ? card.archetype.toLowerCase().includes(query) : false;
        const matchesKeywords = card.keywords ? card.keywords.some(k => k.toLowerCase().includes(query)) : false;
        return matchesName || matchesEn || matchesArchetype || matchesKeywords;
      }

      return true;
    });
  }, [activeFilter, searchQuery, cards]);

  if (!isOpen) return null;

  const handleClose = () => {
    audio.playCloseModal();
    onClose();
  };

  return (
    <div className="mobile-modal-layer fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Outer Click Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={handleClose}
      />

      {/* Modal Dialog Card with Solid High-Contrast Background */}
      <motion.div 
        ref={modalRef}
        aria-label="Grimório"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
        className="responsive-dialog dialog-grimoire relative z-10 w-full max-w-5xl h-[88vh] flex flex-col rounded-sm bg-[var(--color-obsidian)] border border-amber-500/40 shadow-2xl overflow-hidden p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-xl md:text-2xl font-bold text-slate-100 gold-gradient-text">
                Grimório · {cards.length} cartas
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Enciclopédia de sabedoria ancestral, correspondências astrológicas e simbologia sagrada
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar" onClick={handleClose}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="my-3 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 touch-pan-x flex-nowrap md:flex-wrap">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    audio.playTabSwitch();
                    setActiveFilter(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer
                    ${isActive
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-amber-500/30'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${tab.color || ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Buscar no grimório" placeholder="Buscar por nome, arquétipo ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-sm bg-slate-950/70 border border-amber-500/30 focus:border-amber-400/70 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>
        </div>

        {/* 78 Cards Grid with Full Visibility and Fixed Heights */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-cinzel text-sm">
              Nenhuma carta encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 p-1">
              {filteredCards.map((card) => (
                <button type="button" aria-label={`Ver detalhes de ${card.name}`}
                  key={card.id}
                  onClick={() => {
                    audio.playInspectZoom();
                    if (onOpenCardDetail) onOpenCardDetail(card, null);
                  }}
                  className="grimoire-card relative w-full aspect-[7/12] cursor-pointer rounded-sm shadow-lg transform-gpu transition-all duration-200 hover:-translate-y-1.5 hover:scale-105 group"
                >
                  <CardArt card={card} isMini={true} showKeywords={false} />
                  
                  {/* Subtle Hover Lens Badge */}
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex flex-col items-center justify-center gap-1 pointer-events-none p-2 text-center z-20">
                    <span className="text-[11px] font-cinzel text-amber-200 font-bold uppercase tracking-wider">
                      {card.name}
                    </span>
                    <span className="text-[9px] text-amber-200 italic line-clamp-2">
                      {card.archetype}
                    </span>
                    <span className="text-[8.5px] text-amber-400/90 mt-1 font-sans">
                      Clique para inspecionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
