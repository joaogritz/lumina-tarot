import { CelestialRing } from './CelestialRing';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DECKS, readDeckId } from '../data/decks';
import { SPREAD_TYPES, FREE_SPREAD_ID, createFreeSpread } from '../data/spreads';
import { Header } from './Header';
import { SpreadSelector } from './SpreadSelector';
import { SpreadArea } from './SpreadArea';
import { DeckSelectionGrid } from './DeckSelectionGrid';
import { MobileBottomDock } from './MobileBottomDock';
import { BackgroundStars } from './BackgroundStars';
import { historyService } from '../utils/history';
import { themeService } from '../utils/theme';
import { bgMusicService } from '../utils/bgMusic';
import { audio } from '../utils/audio';

// Resilient Lazy Loader that automatically recovers from stale chunk hashes on new deployments
const lazyWithRetry = (componentImport) =>
  React.lazy(async () => {
    let pageHasBeenRefreshed = false;
    try { pageHasBeenRefreshed = sessionStorage.getItem('lumina_chunk_recovered') === 'true'; } catch {}

    try {
      const component = await componentImport();
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('lumina_chunk_recovered', 'false'); } catch {}
      }
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed && typeof window !== 'undefined') {
        // Chunk hash mismatch on new GitHub Pages deployment -> Auto-refresh to load new assets
        try { sessionStorage.setItem('lumina_chunk_recovered', 'true'); } catch { throw error; }
        window.location.reload();
        return new Promise(() => {}); // Wait for page refresh
      }
      throw error;
    }
  });

// Lazy-loaded Modals with Auto-Recovery
const CardDetailModal = lazyWithRetry(() => import('./CardDetailModal').then(m => ({ default: m.CardDetailModal })));
const InterpretationModal = lazyWithRetry(() => import('./InterpretationModal').then(m => ({ default: m.InterpretationModal })));
const GuideModal = lazyWithRetry(() => import('./GuideModal').then(m => ({ default: m.GuideModal })));
const GrimoireModal = lazyWithRetry(() => import('./GrimoireModal').then(m => ({ default: m.GrimoireModal })));
const ReadingHistoryModal = lazyWithRetry(() => import('./ReadingHistoryModal').then(m => ({ default: m.ReadingHistoryModal })));
const DailyCardModal = lazyWithRetry(() => import('./DailyCardModal').then(m => ({ default: m.DailyCardModal })));
const ThemeSelectorModal = lazyWithRetry(() => import('./ThemeSelectorModal').then(m => ({ default: m.ThemeSelectorModal })));
const YesNoOracleModal = lazyWithRetry(() => import('./YesNoOracleModal').then(m => ({ default: m.YesNoOracleModal })));
const DestinySummonAnimation = lazyWithRetry(() => import('./DestinySummonAnimation').then(m => ({ default: m.DestinySummonAnimation })));
const ConfirmSpreadChangeModal = lazyWithRetry(() => import('./ConfirmSpreadChangeModal').then(m => ({ default: m.ConfirmSpreadChangeModal })));

// Fisher-Yates Deck Shuffle Utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const TarotTable = () => {
  const [deckId, setDeckId] = useState(readDeckId);
  const [pendingDeckId, setPendingDeckId] = useState(null);
  const [deckLayout, setDeckLayout] = useState('classic');
  const activeDeck = DECKS[deckId];
  const altarRef = useRef(null);
  const deckDialogRef = useRef(null);

  useEffect(() => {
    if (pendingDeckId) {
      deckDialogRef.current?.showModal();
    } else {
      deckDialogRef.current?.close();
    }
  }, [pendingDeckId]);

  // 1. Theme state (Noite Cósmica, Luar Místico, Alquimia Solar, Veludo Carmesim)
  const [currentTheme, setCurrentTheme] = useState(() => themeService.getCurrentTheme());

  // 2. Deck state (78 cards with estaEscolhida boolean)
  const [deck, setDeck] = useState(() => {
    const initialDeck = activeDeck.cards.map(card => ({
      ...card,
      estaEscolhida: false,
      isReversed: false,
    }));
    return shuffleArray(initialDeck);
  });

  // 3. Active spread type (Default: 3 cards - Passado, Presente & Futuro)
  const [activeSpread, setActiveSpread] = useState(SPREAD_TYPES[0]);
  const [freeCardCount, setFreeCardCount] = useState(3);
  const availableSpreads = useMemo(() => SPREAD_TYPES
    .filter(spread => deckId !== 'lenormand' || ['three_cards', 'single_card', FREE_SPREAD_ID].includes(spread.id))
    .map(spread => spread.id === FREE_SPREAD_ID ? createFreeSpread(freeCardCount) : spread), [deckId, freeCardCount]);

  // 4. Chosen cards in spread slots (Array matching spread length)
  const [chosenCards, setChosenCards] = useState(() => 
    new Array(SPREAD_TYPES[0].positions.length).fill(null)
  );

  // 5. Question / Intent state
  const [userQuestion, setUserQuestion] = useState('');

  // 6. Reversed cards mode toggle (Default: false)
  const [allowReversed, setAllowReversed] = useState(false);

  // 7. Modal & Animation states
  const [inspectingCardData, setInspectingCardData] = useState(null);
  const [isInterpretationOpen, setIsInterpretationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);
  const [isYesNoOpen, setIsYesNoOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [destinySummonData, setDestinySummonData] = useState(null);
  const [pendingSpreadChange, setPendingSpreadChange] = useState(null);
  const [historyCount, setHistoryCount] = useState(() => historyService.getReadings().length);

  const refreshHistoryCount = useCallback(() => {
    setHistoryCount(historyService.getReadings().length);
  }, []);

  const handleSelectTheme = useCallback((theme) => {
    themeService.setThemeId(theme.id);
    setCurrentTheme(theme);
  }, []);

  const changeDeck = (id) => {
    setDeckId(id);
    try { localStorage.setItem('lumina_deck', id); } catch {}
    setDeck(shuffleArray(DECKS[id].cards.map(card => ({ ...card, estaEscolhida: false, isReversed: false }))));
    setChosenCards(new Array(SPREAD_TYPES[0].positions.length).fill(null));
    setActiveSpread(SPREAD_TYPES[0]);
    setAllowReversed(false);
    setDestinySummonData(null);
    setPendingDeckId(null);
  };

  // Remaining cards to pick for current spread
  const filledCount = chosenCards.filter(Boolean).length;
  const totalSlots = activeSpread.positions.length;
  const canSelectMore = filledCount < totalSlots;
  const remainingToPick = totalSlots - filledCount;

  // Shuffle Deck Handler
  const handleShuffleDeck = useCallback(() => {
    setDeck(prevDeck => {
      // Re-shuffle while maintaining unchosen state
      const refreshed = activeDeck.cards.map(card => {
        const alreadyChosen = chosenCards.some(c => c && c.id === card.id);
        return {
          ...card,
          estaEscolhida: alreadyChosen,
          isReversed: false,
        };
      });
      return shuffleArray(refreshed);
    });
  }, [chosenCards, activeDeck]);

  // Reset entire spread, restore deck, and clear question
  const handleResetSpread = useCallback(() => {
    setChosenCards(new Array(activeSpread.positions.length).fill(null));
    setDeck(prevDeck => prevDeck.map(card => ({ ...card, estaEscolhida: false, isReversed: false })));
    setUserQuestion('');
  }, [activeSpread]);

  // Spread Change Request Handler (Checks if table has cards to show custom overlay)
  const handleSelectSpreadRequest = useCallback((newSpread) => {
    if (newSpread.id === activeSpread.id) return;
    
    if (filledCount > 0) {
      setPendingSpreadChange(newSpread);
    } else {
      setActiveSpread(newSpread);
      setChosenCards(new Array(newSpread.positions.length).fill(null));
      setDeck(prevDeck => prevDeck.map(card => ({ ...card, estaEscolhida: false, isReversed: false })));
    }
  }, [activeSpread, filledCount]);

  // Confirm Spread Change via Custom Modal
  const handleConfirmSpreadChange = useCallback(() => {
    if (!pendingSpreadChange) return;
    setActiveSpread(pendingSpreadChange);
    setChosenCards(new Array(pendingSpreadChange.positions.length).fill(null));
    setDeck(prevDeck => prevDeck.map(card => ({ ...card, estaEscolhida: false, isReversed: false })));
    setPendingSpreadChange(null);
  }, [pendingSpreadChange]);

  // Resize only empty positions: drawn cards and their order remain intact.
  const minimumFreeCount = Math.max(1, chosenCards.findLastIndex(Boolean) + 1);
  const handleFreeCountChange = (value) => {
    const count = Number(value);
    if (activeSpread.id !== FREE_SPREAD_ID || !Number.isInteger(count) || count < minimumFreeCount || count > 10) return;
    setFreeCardCount(count);
    setActiveSpread(createFreeSpread(count));
    setChosenCards(previous => Array.from({ length: count }, (_, index) => previous[index] || null));
  };

  // Single Card Selection Handler (Click from Grid)
  const handleSelectCard = useCallback((card) => {
    if (!canSelectMore || card.estaEscolhida) return;

    // 1. Find next available empty slot index
    const nextSlotIndex = chosenCards.findIndex(c => c === null);
    if (nextSlotIndex === -1) return;

    const isCardReversed = allowReversed ? (Math.random() < 0.35) : false;

    // 2. Mark card as chosen in deck
    setDeck(prevDeck => 
      prevDeck.map(c => c.id === card.id ? { ...c, estaEscolhida: true, isReversed: isCardReversed } : c)
    );

    // 3. Place card into chosen spread slot
    setChosenCards(prevChosen => {
      const updated = [...prevChosen];
      updated[nextSlotIndex] = { ...card, estaEscolhida: true, isReversed: isCardReversed };
      return updated;
    });
  }, [allowReversed, canSelectMore, chosenCards]);

  // Remove Card from Spread Slot Handler
  const handleRemoveCard = useCallback((slotIndex) => {
    const cardToRemove = chosenCards[slotIndex];
    if (!cardToRemove) return;

    // Unmark in deck
    setDeck(prevDeck => 
      prevDeck.map(c => c.id === cardToRemove.id ? { ...c, estaEscolhida: false, isReversed: false } : c)
    );

    // Remove from spread
    setChosenCards(prevChosen => {
      const updated = [...prevChosen];
      updated[slotIndex] = null;
      return updated;
    });
  }, [chosenCards]);

  // Full Cinematic Destiny Draw (Tiragem Inteira Guiada pelo Destino com Estrela Cadente Genshin)
  const handleFullDestinyDraw = useCallback(() => {
    if (!canSelectMore) return;

    const available = deck.filter(c => !c.estaEscolhida);
    if (available.length === 0) return;

    const shuffledAvailable = shuffleArray(available);
    const pickedCards = shuffledAvailable.slice(0, remainingToPick).map(card => ({
      ...card,
      estaEscolhida: true,
      isReversed: allowReversed ? (Math.random() < 0.35) : false
    }));

    setDestinySummonData(pickedCards);
  }, [allowReversed, canSelectMore, deck, remainingToPick]);

  // Complete Destiny Summon Sequence and place cards into altar slots
  const handleDestinySummonComplete = useCallback((summonedCards) => {
    setChosenCards(prevChosen => {
      const updated = [...prevChosen];
      let summonIdx = 0;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i] === null && summonIdx < summonedCards.length) {
          updated[i] = summonedCards[summonIdx];
          summonIdx++;
        }
      }
      return updated;
    });

    const summonedIds = new Set(summonedCards.map(c => c.id));
    setDeck(prevDeck => prevDeck.map(c => {
      if (summonedIds.has(c.id)) {
        const found = summonedCards.find(sc => sc.id === c.id);
        return { ...c, estaEscolhida: true, isReversed: found?.isReversed || false };
      }
      return c;
    }));

    setDestinySummonData(null);
  }, []);

  // Inspect Card Details (Play dedicated mystical zoom sound)
  const handleInspectCard = useCallback((card, positionInfo) => {
    audio.playInspectZoom();
    setInspectingCardData({ card, positionInfo });
  }, []);

  const scrollToAltar = useCallback(() => {
    if (altarRef.current) {
      altarRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || document.activeElement?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) return;
      if (document.querySelector('[aria-modal="true"], dialog[open]') || pendingDeckId || destinySummonData) return;
      if (e.key !== 'Escape' && (inspectingCardData || isInterpretationOpen || isGuideOpen || isGrimoireOpen || isHistoryOpen || isDailyOpen || isThemesOpen || isYesNoOpen || pendingSpreadChange)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        audio.playShuffle();
        handleShuffleDeck();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleFullDestinyDraw();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        audio.playHover();
        setIsGrimoireOpen(prev => !prev);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        audio.playHover();
        setIsHistoryOpen(prev => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        audio.playHover();
        setIsThemesOpen(prev => !prev);
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        bgMusicService.toggle();
      } else if (e.key === 'Escape') {

        setInspectingCardData(null);
        setIsInterpretationOpen(false);
        setIsGuideOpen(false);
        setIsGrimoireOpen(false);
        setIsHistoryOpen(false);
        setIsDailyOpen(false);
        setIsThemesOpen(false);
        setIsYesNoOpen(false);
        setPendingSpreadChange(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFullDestinyDraw, handleShuffleDeck, inspectingCardData, isInterpretationOpen, isGuideOpen, isGrimoireOpen, isHistoryOpen, isDailyOpen, isThemesOpen, isYesNoOpen, pendingSpreadChange, pendingDeckId, destinySummonData]);

  return (
    <div 
      className="sanctuary-table relative min-h-screen flex flex-col text-slate-100 selection:bg-amber-400/30 selection:text-amber-200 transition-colors duration-700"
      style={{ backgroundColor: currentTheme.bgColor }}
    >
      {/* Background Animated Celestial Stars Canvas matching active Theme */}
      <BackgroundStars theme={currentTheme} />
      <a className="skip-link" href="#reading-altar">Ir para a mesa de leitura</a>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-28 md:pb-20">
        
        {/* Header with Title, Features & Controls */}
        <Header
          reversalsSupported={activeDeck.reversals}
          userQuestion={userQuestion}
          setUserQuestion={setUserQuestion}
          allowReversed={allowReversed}
          setAllowReversed={setAllowReversed}
          currentTheme={currentTheme}
          onOpenThemes={() => setIsThemesOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenGrimoire={() => setIsGrimoireOpen(true)}
          onOpenHistory={() => {
            refreshHistoryCount();
            setIsHistoryOpen(true);
          }}
          onOpenDaily={() => setIsDailyOpen(true)}
          onOpenYesNo={() => setIsYesNoOpen(true)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
          historyCount={historyCount}
        />

        {/* Spread Selector Navigation (Visible when not in Zen Mode) */}
        {!isZenMode && (
          <SpreadSelector
            spreads={availableSpreads}
            currentSpread={activeSpread}
            onSelectSpread={handleSelectSpreadRequest}
            onFreeCountChange={handleFreeCountChange}
            minimumFreeCount={minimumFreeCount}
          />
        )}

        {/* The Spread Reading Altar (Slots Area) */}
        <div ref={altarRef} id="reading-altar" className="altar-scene">
          <CelestialRing className="altar-instrument" />
          <SpreadArea
            spreadConfig={activeSpread}
            chosenCards={chosenCards}
            onCardClick={handleInspectCard}
            onRemoveCard={handleRemoveCard}
            onOpenInterpretation={() => {
              refreshHistoryCount();
              setIsInterpretationOpen(true);
            }}
            onResetSpread={handleResetSpread}
          />
        </div>

        {/* The Card Deck Selection Grid (Visible when not in Zen Mode) */}
        {!isZenMode && (
          <DeckSelectionGrid
            key={deckId}
            deck={deck}
            activeDeckId={deckId}
            layoutMode={deckLayout}
            onChangeLayoutMode={setDeckLayout}
            onSwitchDeck={() => {
              const targetDeck = deckId === 'tarot' ? 'lenormand' : 'tarot';
              if (filledCount > 0) {
                setPendingDeckId(targetDeck);
              } else {
                changeDeck(targetDeck);
              }
            }}
            onSelectCard={handleSelectCard}
            onRandomPick={handleFullDestinyDraw}
            onShuffleDeck={handleShuffleDeck}
            canSelectMore={canSelectMore}
            remainingToPick={remainingToPick}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="sanctuary-footer relative z-10 py-6 text-center text-xs text-slate-500 border-t border-stone-900/30 glass-panel-subtle mt-auto hidden md:block">
        <CelestialRing className="footer-instrument" />
        <p className="font-cinzel tracking-wider text-amber-200/60">
          Lumina Tarot • Sabedoria Ancestral & Arcanos do Destino
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Atalhos: [Espaço] Embaralhar • [D] Destino • [G] Grimório • [H] Diário • [T] Temas • [Z] Zen • [Esc] Fechar
        </p>
      </footer>

      {/* Mobile Floating Bottom Dock */}
      <MobileBottomDock
        onScrollToAltar={scrollToAltar}
        onOpenDestiny={handleFullDestinyDraw}
        onOpenYesNo={() => setIsYesNoOpen(true)}
        onOpenGrimoire={() => setIsGrimoireOpen(true)}
        onOpenHistory={() => {
          refreshHistoryCount();
          setIsHistoryOpen(true);
        }}
        onOpenThemes={() => setIsThemesOpen(true)}
        historyCount={historyCount}
        currentTheme={currentTheme}
      />

      {/* Lazy Modals Suspense Boundary */}
      <React.Suspense fallback={null}>
        {/* Single Card Inspector Modal */}
        {inspectingCardData && (
          <CardDetailModal
            card={inspectingCardData.card}
            positionInfo={inspectingCardData.positionInfo}
            onClose={() => setInspectingCardData(null)}
          />
        )}

        {/* Full Reading Interpretation Modal */}
        {isInterpretationOpen && (
          <InterpretationModal
            spreadConfig={activeSpread}
            chosenCards={chosenCards.filter(Boolean)}
            userQuestion={userQuestion}
            onClose={() => {
              refreshHistoryCount();
              setIsInterpretationOpen(false);
            }}
            onResetReading={handleResetSpread}
          />
        )}

        {/* Oracle Guide Modal */}
        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        {/* Grimoire Codex Modal (78 cards encyclopedia) */}
        <GrimoireModal key={`grimoire-${deckId}`} cards={activeDeck.cards}
          isOpen={isGrimoireOpen}
          onClose={() => setIsGrimoireOpen(false)}
          onOpenCardDetail={(card) => setInspectingCardData({ card, positionInfo: null })}
        />

        {/* Reading Journal History Modal */}
        <ReadingHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => {
            refreshHistoryCount();
            setIsHistoryOpen(false);
          }}
          onOpenCardDetail={(card, pos) => setInspectingCardData({ card, positionInfo: pos })}
        />

        {/* Daily Card Modal */}
        <DailyCardModal key={`daily-${deckId}`} cards={activeDeck.cards}
          isOpen={isDailyOpen}
          onClose={() => setIsDailyOpen(false)}
          onOpenCardDetail={(card) => setInspectingCardData({ card, positionInfo: null })}
        />

        {/* Sanctuary Altar Theme Selector Modal */}
        <ThemeSelectorModal
          isOpen={isThemesOpen}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsThemesOpen(false)}
        />

        {/* Yes / No Oracle Direct Modal */}
        <YesNoOracleModal key={`yesno-${deckId}`} cards={activeDeck.cards}
          isOpen={isYesNoOpen}
          allowReversed={allowReversed}
          onClose={() => setIsYesNoOpen(false)}
        />

        {/* Full Cinematic Genshin-style Shooting Star Destiny Summon Animation Overlay */}
        {destinySummonData && (
          <DestinySummonAnimation
            cardsToSummon={destinySummonData}
            spreadConfig={activeSpread}
            onComplete={handleDestinySummonComplete}
            onCancel={() => setDestinySummonData(null)}
          />
        )}

        {/* Custom Mystical Confirm Spread Change Overlay Modal */}
        <ConfirmSpreadChangeModal
          isOpen={Boolean(pendingSpreadChange)}
          targetSpread={pendingSpreadChange}
          currentSpread={activeSpread}
          onConfirm={handleConfirmSpreadChange}
          onCancel={() => setPendingSpreadChange(null)}
        />

        {/* Deck Switch Confirmation Modal */}
        <dialog 
          ref={deckDialogRef} 
          className="deck-dialog" 
          aria-labelledby="deck-dialog-title" 
          onCancel={() => setPendingDeckId(null)}
        >
          <h2 id="deck-dialog-title" className="font-cinzel text-lg font-bold text-amber-200 mb-2">
            Trocar para {DECKS[pendingDeckId]?.name}?
          </h2>
          <p className="text-slate-300 text-sm">
            As cartas na mesa serão recolhidas. Leituras salvas no diário serão preservadas.
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <button 
              type="button" 
              autoFocus 
              onClick={() => setPendingDeckId(null)} 
              className="deck-dialog-cancel"
            >
              Continuar leitura
            </button>
            <button 
              type="button" 
              onClick={() => {
                const target = pendingDeckId;
                setPendingDeckId(null);
                changeDeck(target);
              }} 
              className="deck-dialog-confirm"
            >
              Trocar baralho
            </button>
          </div>
        </dialog>
      </React.Suspense>
    </div>
  );
};
