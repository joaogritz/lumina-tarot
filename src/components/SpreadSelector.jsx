import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SPREAD_TYPES } from '../data/spreads';
import { 
  Layers, Sparkles, Compass, HeartHandshake, 
  PlusCircle, Heart, Briefcase, Star, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { audio } from '../utils/audio';

const ICONS_MAP = {
  Layers,
  Sparkles,
  Compass,
  HeartHandshake,
  PlusCircle,
  Heart,
  Briefcase,
  Star
};

export const SpreadSelector = ({ 
  spreads = SPREAD_TYPES,
  currentSpread, 
  onSelectSpread 
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [spreads]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    audio.playHover();
    const distance = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  const handleSelect = (spread, event) => {
    if (spread.id === currentSpread.id) return;
    audio.playSpreadSwitch ? audio.playSpreadSwitch() : audio.playSelect();
    onSelectSpread(spread);

    // Scroll selected button smoothly into center
    if (event?.currentTarget && scrollRef.current) {
      const container = scrollRef.current;
      const button = event.currentTarget;
      const scrollLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Seletor de Tipo de Tiragem" className="w-full max-w-6xl mx-auto mb-8 px-2 sm:px-4">
      <div className="flex items-center gap-1.5 sm:gap-2.5 w-full">
        {/* Left Navigation Chevron Button (separated from pills) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            title="Ver tiragens anteriores"
            className="shrink-0 w-8 h-8 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Scroll Rail with Snap Alignment & Theme Compatibility */}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center gap-2 md:gap-3 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar snap-x"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {spreads.map((spread) => {
            const Icon = ICONS_MAP[spread.icon] || Sparkles;
            const isSelected = spread.id === currentSpread.id;

            return (
              <button
                key={spread.id}
                onClick={(e) => handleSelect(spread, e)}
                type="button"
                className={`group relative px-4 py-2.5 rounded-xl text-xs md:text-sm font-cinzel font-semibold flex items-center gap-2 shrink-0 transition-all duration-200 cursor-pointer snap-center
                  ${isSelected
                    ? 'text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/70 border border-purple-900/40 hover:border-purple-500/50 hover:bg-slate-900/90 shadow-sm'
                  }
                `}
              >
                {/* Active Tab Floating Pill with Smooth Framer Motion Glide */}
                {isSelected && (
                  <motion.div
                    layoutId="activeSpreadIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-950 via-[#1E124A] to-purple-950 border border-amber-400/90 shadow-[0_0_18px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/40 -z-0"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 relative z-10 transition-transform group-hover:rotate-12 ${isSelected ? 'text-amber-400' : 'text-purple-400'}`} />
                
                <span className="relative z-10 whitespace-nowrap">{spread.shortName}</span>
                
                {/* Badge for number of cards */}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold shrink-0 relative z-10
                  ${isSelected 
                    ? 'bg-amber-400 text-slate-950 font-black' 
                    : 'bg-purple-950/90 text-purple-300 border border-purple-800/80'
                  }
                `}>
                  {spread.cardCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Navigation Chevron Button (separated from pills) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            title="Ver mais tiragens"
            className="shrink-0 w-8 h-8 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 text-amber-300 hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
};
