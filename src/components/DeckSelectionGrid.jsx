import React, { useState, useMemo } from 'react';
import { DeckSelectionRow } from './DeckSelectionRow';
import { CardBack } from './CardBack';
import { DeckShuffleAnimation } from './DeckShuffleAnimation';
import { Sparkles, Flame, Droplets, Wind, Mountain, Search, Shuffle, Layers, Destiny } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';

export const DeckSelectionGrid = ({ 
  deck, 
  activeDeckId = 'tarot',
  layoutMode = 'classic',
  onChangeLayoutMode,
  onSwitchDeck,
  onSelectCard, 
  onRandomPick, 
  onShuffleDeck,
  canSelectMore = true,
  remainingToPick = 3 
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  const filterTabs = deck[0]?.deckId === 'lenormand' ? [{ id: 'all', label: 'Todas', count: deck.length, icon: Layers }] : [
    { id: 'all', label: 'Todas', count: deck.length, icon: Layers },
    { id: 'major', label: 'Maiores', count: 22, icon: Sparkles, color: 'text-amber-400' },
    { id: 'wands', label: 'Paus', count: 14, icon: Flame, color: 'text-orange-400' },
    { id: 'cups', label: 'Copas', count: 14, icon: Droplets, color: 'text-cyan-400' },
    { id: 'swords', label: 'Espadas', count: 14, icon: Wind, color: 'text-slate-300' },
    { id: 'pentacles', label: 'Ouros', count: 14, icon: Mountain, color: 'text-emerald-400' },
  ];

  const filteredCards = useMemo(() => {
    return deck.filter((card) => {
      // Filter by suit / arcana
      if (activeFilter === 'major' && card.arcana !== 'Major') return false;
      if (activeFilter !== 'all' && activeFilter !== 'major' && card.suit !== activeFilter) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesEn = card.nameEn.toLowerCase().includes(query);
        const matchesArchetype = card.archetype ? card.archetype.toLowerCase().includes(query) : false;
        return matchesName || matchesEn || matchesArchetype;
      }

      return true;
    });
  }, [deck, activeFilter, searchQuery]);

  const availableCount = deck.filter(c => !c.estaEscolhida).length;

  const handleShuffle = () => {
    if (isShuffling) return;
    audio.playShuffle();
    setIsShuffling(true);
  };

  const handleShuffleFinished = () => {
    if (onShuffleDeck) {
      onShuffleDeck();
    }
    setIsShuffling(false);
  };

  const handleRandomPick = () => {
    if (!canSelectMore || isShuffling) return;
    audio.playSelect();
    if (onRandomPick) {
      onRandomPick();
    }
  };

  return (
    <section aria-label="Seleção de cartas" className="deck-selection w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Grid Controls & Header */}
      <div className="deck-controls relative z-10 rounded-sm p-4 sm:p-5 md:p-6 mb-6 border border-amber-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Title & Guidance */}
          <div className="text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <h3 className="font-cinzel text-base sm:text-lg md:text-xl font-bold text-amber-200">
                Seu baralho ({availableCount} de {deck.length} cartas)
              </h3>
              {onSwitchDeck && (
                <button
                  type="button"
                  onClick={onSwitchDeck}
                  disabled={isShuffling}
                  title={activeDeckId === 'tarot' ? 'Trocar para o Baralho Cigano (Petit Lenormand)' : 'Trocar para o Tarot Tradicional (78 Cartas)'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gradient-to-r from-stone-950/90 via-slate-900 to-emerald-950/90 hover:from-stone-900 hover:to-emerald-900 border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white text-xs font-cinzel font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{activeDeckId === 'tarot' ? 'Trocar para Baralho Cigano' : 'Trocar para Tarot'}</span>
                </button>
              )}
              <div className="deck-layout-switch" role="group" aria-label="Disposição do baralho">
                {[['classic', 'Clássica'], ['row', 'Fileira única']].map(([mode, label]) => (
                  <button key={mode} type="button" aria-pressed={layoutMode === mode} disabled={isShuffling}
                    title={mode === 'row' ? 'Uma fileira que embaralha a cada carta puxada' : 'Distribuir cartas em várias fileiras'}
                    onClick={() => { audio.playTabSwitch(); onChangeLayoutMode(mode); }}>
                    {mode === 'row' ? <Shuffle className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p role="status" className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isShuffling 
                ? 'Embaralhando as cartas...'
                : canSelectMore 
                  ? layoutMode === 'row'
                    ? `Puxe uma carta da fileira. Faltam ${remainingToPick} carta(s).`
                    : `Passe o mouse ou toque para escolher mais ${remainingToPick} carta(s).`
                  : 'Todos os slots foram preenchidos! Veja a interpretação acima.'
              }
            </p>
          </div>

          {/* Quick Actions (Embaralhar & Destino) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShuffle}
              disabled={isShuffling}
              className={`px-4 py-2 rounded-sm border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer
                ${isShuffling 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
                  : 'bg-stone-950/80 hover:bg-stone-900 border-amber-500/40 hover:border-amber-400/60 text-amber-200 hover:text-amber-200'
                }
              `}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Embaralhando...' : 'Embaralhar Baralho'}</span>
            </button>

            {canSelectMore && !isShuffling && (
              <button
                type="button"
                onClick={handleRandomPick}
                className="ritual-button"
              >
                {/* Subtle light streak */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <Destiny className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform duration-300 shrink-0" />
                <span className="font-outfit text-xs uppercase tracking-widest">
                  Tiragem do Destino
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-cinzel font-semibold">
                  {remainingToPick}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Search (visible when not shuffling) */}
        {!isShuffling && layoutMode === 'classic' && (
          <div className="mt-4 pt-4 border-t border-stone-900/40 flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-in">
            
            {/* Suit / Arcana Filter Tabs (Scrollable on Mobile, Flex on Desktop) */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0 touch-pan-x flex-nowrap md:flex-wrap">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    aria-pressed={isActive}
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

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Buscar carta por nome"
                placeholder="Buscar carta por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-slate-950/70 border border-amber-500/30 focus:border-amber-400/70 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Area: Either 3D Shuffle Animation Arena OR the 78-Card Deck Grid */}
      <div className="relative min-h-[420px]">
        {layoutMode === 'row' ? (
          <DeckSelectionRow deck={deck} canSelectMore={canSelectMore} isShuffling={isShuffling}
            onSelectCard={onSelectCard} onStartShuffle={handleShuffle} onShuffleComplete={handleShuffleFinished} />
        ) : isShuffling ? (
          /* 3D Cinematic Shuffle Experience */
          <div className="w-full rounded-sm glass-panel-subtle border border-amber-500/30 p-4 sm:p-6 shadow-2xl animate-fade-in flex items-center justify-center">
            <DeckShuffleAnimation onComplete={handleShuffleFinished} />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-cinzel">
            Nenhuma carta encontrada para os filtros selecionados.
          </div>
        ) : (
          /* Overlapping rows retain every card, including filtered catalogs. */
          <div className="ritual-deck">
            {filteredCards.map((card, idx) => (
              <CardBack
                key={card.id}
                card={card}
                index={idx}
                isSelected={card.estaEscolhida}
                onClick={() => canSelectMore && onSelectCard(card)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
