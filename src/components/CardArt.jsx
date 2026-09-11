import { LenormandSymbol } from './LenormandSymbol';
import React from 'react';
import { 
  Sparkles, Flame, Droplets, Wind, Mountain, 
  Sun, Moon, Star, Compass, Shield, Award, 
  Crown, Heart, Feather, Zap, Eye, RefreshCw, Key, Skull
} from 'lucide-react';
import { SUITS } from '../data/tarotDeck';

export const CardArt = React.memo(({ card, isMini = false, showKeywords = true }) => {
  const suitConfig = SUITS[card.suit.toUpperCase()] || SUITS.MAJOR;
  const [tilt, setTilt] = React.useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  const handleMouseMove = (e) => {
    if (isMini) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculations (-8deg to +8deg)
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 8;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    
    setTilt({ x: rotateX, y: rotateY, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  // Custom rich symbolic vector graphic generator for each Arcana
  const renderCardSymbolism = () => {
    if (card.deckId === 'lenormand') return <LenormandSymbol card={card} />;
    // 1. Major Arcana specific sacred illustrations (All 22 Major Arcana)
    if (card.arcana === 'Major') {
      switch (card.number) {
        case 0: // O Louco (The Fool)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              {/* Cliff Edge */}
              <path d="M 15 90 L 45 65 L 85 90" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              {/* Sun in corner */}
              <circle cx="25" cy="25" r="8" fill="#FDE68A" />
              {/* Staff & Bundle */}
              <line x1="40" y1="75" x2="68" y2="35" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
              <circle cx="68" cy="35" r="6" fill="#C084FC" stroke="#E9D5FF" strokeWidth="1" />
              {/* White Dog / Companion Star */}
              <polygon points="35,70 38,62 45,66" fill="#FFF" />
              {/* White Rose of Purity */}
              <circle cx="58" cy="50" r="3" fill="#FFF" />
            </svg>
          );

        case 1: // O Mago (The Magician)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
              {/* Lemniscata (Infinity) */}
              <path d="M 35 26 C 25 16, 25 36, 35 26 C 45 16, 55 36, 65 26 C 75 16, 75 36, 65 26 C 55 16, 45 36, 35 26" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
              {/* Altar with 4 elements */}
              <rect x="25" y="65" width="50" height="15" rx="3" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="33" cy="58" r="4" fill="#38BDF8" /> {/* Cup */}
              <line x1="44" y1="52" x2="44" y2="62" stroke="#F97316" strokeWidth="2.5" /> {/* Wand */}
              <line x1="56" y1="52" x2="56" y2="62" stroke="#E2E8F0" strokeWidth="2" /> {/* Sword */}
              <circle cx="67" cy="58" r="4" fill="#34D399" /> {/* Pentacle */}
              {/* Magician Upright Wand */}
              <line x1="50" y1="36" x2="50" y2="52" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );

        case 2: // A Sacerdotisa (The High Priestess)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Pillars B (Black) & J (Light) */}
              <rect x="18" y="22" width="12" height="60" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
              <rect x="70" y="22" width="12" height="60" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
              <text x="24" y="55" fill="#CBD5E1" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="serif">B</text>
              <text x="76" y="55" fill="#0F172A" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="serif">J</text>
              {/* Temple Veil with Pomegranates */}
              <path d="M 32 30 Q 50 45 68 30 Q 50 85 32 30" fill="#312E81" opacity="0.6" stroke="#818CF8" strokeWidth="1.2" />
              {/* Solar Cross on chest */}
              <path d="M 50 44 L 50 56 M 44 50 L 56 50" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
              {/* Horned Isis Crescent Moon Crown */}
              <path d="M 40 26 A 10 10 0 0 0 60 26" fill="none" stroke="#FDE68A" strokeWidth="2" />
              <circle cx="50" cy="24" r="3" fill="#FDE68A" />
              {/* Crescent at feet */}
              <path d="M 40 76 A 10 10 0 0 0 60 76 A 14 14 0 0 1 40 76" fill="#67E8F9" />
            </svg>
          );

        case 3: // A Imperatriz (The Empress)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Crown of 12 Stars */}
              <circle cx="50" cy="25" r="14" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="2 3" />
              <circle cx="50" cy="11" r="2" fill="#FDE68A" />
              <circle cx="40" cy="14" r="2" fill="#FDE68A" />
              <circle cx="60" cy="14" r="2" fill="#FDE68A" />
              {/* Venus Symbol Shield (Heart + Cross) */}
              <path d="M 50 45 C 38 32, 28 50, 50 68 C 72 50, 62 32, 50 45 Z" fill="#EC4899" opacity="0.75" stroke="#F472B6" strokeWidth="1.5" />
              <line x1="50" y1="68" x2="50" y2="82" stroke="#F472B6" strokeWidth="2.5" />
              <line x1="42" y1="75" x2="58" y2="75" stroke="#F472B6" strokeWidth="2.5" />
              {/* Wheat / Abundance Laurel */}
              <path d="M 22 75 Q 35 60 40 75 M 78 75 Q 65 60 60 75" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            </svg>
          );

        case 4: // O Imperador (The Emperor)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Stone Throne with Ram Horns */}
              <rect x="25" y="30" width="50" height="50" rx="4" fill="#3B0764" stroke="#DC2626" strokeWidth="2" />
              {/* Left & Right Ram Horns */}
              <path d="M 25 35 C 15 25, 12 40, 22 42" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <path d="M 75 35 C 85 25, 88 40, 78 42" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              {/* Ankh / Imperial Scepter */}
              <circle cx="50" cy="46" r="6" fill="none" stroke="#FBBF24" strokeWidth="2" />
              <line x1="50" y1="52" x2="50" y2="72" stroke="#FBBF24" strokeWidth="2.5" />
              <line x1="43" y1="58" x2="57" y2="58" stroke="#FBBF24" strokeWidth="2.5" />
              {/* Imperial Golden Crown */}
              <polygon points="40,25 45,18 50,23 55,18 60,25" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            </svg>
          );

        case 5: // O Hierofante (The Hierophant)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Triple Papal Cross */}
              <line x1="50" y1="18" x2="50" y2="75" stroke="#FBBF24" strokeWidth="2.5" />
              <line x1="36" y1="28" x2="64" y2="28" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="40" y1="36" x2="60" y2="36" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="44" y1="44" x2="56" y2="44" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
              {/* Crossed Sacred Golden Keys at base */}
              <line x1="35" y1="65" x2="65" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
              <line x1="65" y1="65" x2="35" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
              <circle cx="35" cy="65" r="3" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="65" cy="65" r="3" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
            </svg>
          );

        case 6: // Os Enamorados (The Lovers)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Angelic Solar Wings Above */}
              <path d="M 20 30 Q 50 15 50 38 Q 50 15 80 30" fill="none" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="50" cy="22" r="7" fill="#FDE68A" />
              {/* Twin Entwined Sacred Hearts */}
              <path d="M 40 50 C 30 40, 20 55, 40 70 C 60 55, 50 40, 40 50 Z" fill="#EF4444" opacity="0.8" stroke="#F87171" strokeWidth="1.5" />
              <path d="M 60 50 C 50 40, 40 55, 60 70 C 80 55, 70 40, 60 50 Z" fill="#EC4899" opacity="0.8" stroke="#F472B6" strokeWidth="1.5" />
              {/* Cupid Radiant Arrow */}
              <line x1="25" y1="78" x2="75" y2="42" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
              <polygon points="75,42 68,42 72,48" fill="#FBBF24" />
            </svg>
          );

        case 7: // O Carro (The Chariot)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Star Canopy */}
              <path d="M 25 30 L 75 30 L 70 20 L 30 20 Z" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              <circle cx="50" cy="25" r="2.5" fill="#FDE68A" />
              {/* Chariot Shield with Solar Wings */}
              <rect x="35" y="45" width="30" height="30" rx="3" fill="#312E81" stroke="#FBBF24" strokeWidth="1.5" />
              <circle cx="50" cy="60" r="8" fill="#F59E0B" />
              <path d="M 44 60 L 56 60 M 50 54 L 50 66" stroke="#FFF" strokeWidth="1.5" />
              {/* Twin Sphinxes Black & White */}
              <circle cx="26" cy="75" r="7" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="74" cy="75" r="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            </svg>
          );

        case 8: // A Força (Strength)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400">
              <defs>
                <linearGradient id="lionManeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="35%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="lionFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#451A03" />
                </linearGradient>
                <radialGradient id="forceAuraGrad" cx="50%" cy="32%" r="50%">
                  <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Radiant Background Sacred Aura */}
              <circle cx="50" cy="40" r="38" fill="url(#forceAuraGrad)" />

              {/* Floating Glowing Infinity Lemniscate (Divine Spirit over Matter) */}
              <g className="drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]">
                <path 
                  d="M 34 16 C 26 9, 26 23, 34 16 C 42 9, 58 23, 66 16 C 74 9, 74 23, 66 16 C 58 9, 42 23, 34 16 Z" 
                  fill="none" 
                  stroke="#FDE68A" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                />
                <circle cx="50" cy="16" r="2" fill="#FFF" />
              </g>

              {/* Majestic Regal Lion Mane */}
              <g fill="url(#lionManeGrad)" stroke="#92400E" strokeWidth="0.8">
                {/* Full mane silhouette */}
                <path d="M 50 26 Q 30 24 22 36 Q 16 48 18 64 Q 22 78 36 86 Q 50 92 64 86 Q 78 78 82 64 Q 84 48 78 36 Q 70 24 50 26 Z" />
                {/* Golden fire tufts */}
                <path d="M 22 36 Q 14 30 18 42 Q 12 48 16 58 Q 10 68 24 76" fill="none" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 78 36 Q 86 30 82 42 Q 88 48 84 58 Q 90 68 76 76" fill="none" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* Noble Lion Face */}
              <path d="M 32 44 Q 30 68 50 78 Q 70 68 68 44 Q 50 38 32 44 Z" fill="url(#lionFaceGrad)" stroke="#F59E0B" strokeWidth="1.2" />

              {/* Lion Ears */}
              <path d="M 30 38 Q 25 30 34 32 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="0.8" />
              <path d="M 70 38 Q 75 30 66 32 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="0.8" />

              {/* Serene, Peaceful Eyes (Tamed Passion) */}
              <path d="M 38 48 Q 44 45 46 50 Q 42 52 38 48 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="0.75" />
              <circle cx="43" cy="48.5" r="1.2" fill="#451A03" />
              <path d="M 62 48 Q 56 45 54 50 Q 58 52 62 48 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="0.75" />
              <circle cx="57" cy="48.5" r="1.2" fill="#451A03" />

              {/* Nose, Snout & Whiskers */}
              <polygon points="50,56 46,62 54,62" fill="#451A03" stroke="#FDE68A" strokeWidth="0.5" />
              <path d="M 50 62 L 50 67 M 50 67 Q 44 71 40 66 M 50 67 Q 56 71 60 66" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="38" y1="64" x2="26" y2="62" stroke="#FDE68A" strokeWidth="0.7" opacity="0.8" />
              <line x1="38" y1="67" x2="25" y2="68" stroke="#FDE68A" strokeWidth="0.7" opacity="0.8" />
              <line x1="62" y1="64" x2="74" y2="62" stroke="#FDE68A" strokeWidth="0.7" opacity="0.8" />
              <line x1="62" y1="67" x2="75" y2="68" stroke="#FDE68A" strokeWidth="0.7" opacity="0.8" />

              {/* Maiden's Gentle Hand with Golden Bracelet Caressing the Lion */}
              <g className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
                <path d="M 74 88 Q 66 76 56 73" fill="none" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="68" cy="80" r="3" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
                <path d="M 56 73 Q 48 76 42 71" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M 54 70 Q 48 72 44 68" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Garland of Mystic White & Gold Roses */}
              <g>
                <circle cx="28" cy="34" r="3" fill="#FFF" stroke="#FDE68A" strokeWidth="0.8" />
                <circle cx="28" cy="34" r="1" fill="#F59E0B" />
                <circle cx="72" cy="34" r="3" fill="#FFF" stroke="#FDE68A" strokeWidth="0.8" />
                <circle cx="72" cy="34" r="1" fill="#F59E0B" />
                <circle cx="50" cy="84" r="3.5" fill="#FFF" stroke="#FDE68A" strokeWidth="0.8" />
                <circle cx="50" cy="84" r="1.2" fill="#F59E0B" />
                <circle cx="36" cy="84" r="2.5" fill="#FDE68A" stroke="#D97706" strokeWidth="0.5" />
                <circle cx="64" cy="84" r="2.5" fill="#FDE68A" stroke="#D97706" strokeWidth="0.5" />
              </g>
            </svg>
          );

        case 9: // O Eremita (The Hermit)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Mountain Peak */}
              <polygon points="15,85 50,45 85,85" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              {/* Lantern with 6-pointed Star of Truth */}
              <rect x="42" y="24" width="16" height="24" rx="2" fill="#78350F" stroke="#FBBF24" strokeWidth="2" />
              <polygon points="50,28 53,35 60,35 55,39 57,46 50,42 43,46 45,39 40,35 47,35" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
              {/* Pilgrim Staff */}
              <line x1="32" y1="20" x2="32" y2="85" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );

        case 10: // Roda da Fortuna (Wheel of Fortune)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400 animate-[spin_40s_linear_infinite]">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="10" fill="#1E1B4B" stroke="#FDE68A" strokeWidth="2" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <line 
                  key={i}
                  x1="50" 
                  y1="50" 
                  x2={50 + 36 * Math.cos((angle * Math.PI) / 180)} 
                  y2={50 + 36 * Math.sin((angle * Math.PI) / 180)} 
                  stroke="#FBBF24" 
                  strokeWidth={i % 2 === 0 ? "2" : "1.2"} 
                />
              ))}
            </svg>
          );

        case 11: // A Justiça (Justice)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Upright Double-Edged Sword */}
              <line x1="50" y1="18" x2="50" y2="78" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="42" y1="30" x2="58" y2="30" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              {/* Golden Scales of Balance */}
              <line x1="25" y1="38" x2="75" y2="38" stroke="#FBBF24" strokeWidth="2" />
              {/* Left pan */}
              <line x1="25" y1="38" x2="20" y2="54" stroke="#FDE68A" strokeWidth="1" />
              <line x1="25" y1="38" x2="30" y2="54" stroke="#FDE68A" strokeWidth="1" />
              <path d="M 16 54 Q 25 60 34 54 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
              {/* Right pan */}
              <line x1="75" y1="38" x2="70" y2="54" stroke="#FDE68A" strokeWidth="1" />
              <line x1="75" y1="38" x2="80" y2="54" stroke="#FDE68A" strokeWidth="1" />
              <path d="M 66 54 Q 75 60 84 54 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            </svg>
          );

        case 12: // O Enforcado (The Hanged Man)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Living Wood Tau Cross */}
              <line x1="20" y1="20" x2="80" y2="20" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
              <line x1="50" y1="20" x2="50" y2="85" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
              {/* Inverted Figure (Leg forming 4) */}
              <line x1="50" y1="20" x2="50" y2="50" stroke="#FBBF24" strokeWidth="2" />
              <line x1="50" y1="40" x2="68" y2="50" stroke="#38BDF8" strokeWidth="2.5" />
              {/* Golden Halo of Enlightenment */}
              <circle cx="50" cy="65" r="10" fill="#FDE68A" opacity="0.8" />
              <circle cx="50" cy="65" r="4" fill="#FFF" />
            </svg>
          );

        case 13: // A Morte (Death)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Black Mysterious Banner */}
              <rect x="25" y="20" width="50" height="55" rx="3" fill="#09090B" stroke="#475569" strokeWidth="1.5" />
              {/* Mystic 5-Petal White Rose of Transformation */}
              <circle cx="50" cy="42" r="14" fill="#FFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="50" cy="42" r="6" fill="#FDE68A" />
              {/* The Harvest Scythe Curve */}
              <path d="M 28 78 Q 45 65 72 78" fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              <path d="M 72 78 Q 78 60 62 48" fill="none" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          );

        case 14: // A Temperança (Temperance)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Angel Wings */}
              <path d="M 20 40 Q 50 20 50 50 Q 50 20 80 40" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              {/* Top Chalice (Golden) */}
              <path d="M 38 32 L 48 32 L 43 42 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
              {/* Bottom Chalice (Silver) */}
              <path d="M 52 62 L 62 62 L 57 72 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              {/* Continuous Stream of Living Water */}
              <path d="M 43 38 Q 60 50 57 66" fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
              {/* Solar Crown Disc */}
              <circle cx="50" cy="22" r="6" fill="#FDE68A" />
            </svg>
          );

        case 15: // O Diabo (The Devil - Expressive Baphomet Iconography)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">
              {/* Flaming Dark Halo */}
              <circle cx="50" cy="50" r="42" fill="#2E0854" opacity="0.4" stroke="#DC2626" strokeWidth="1.5" />
              
              {/* Inverted Pentagram at Crown */}
              <polygon 
                points="50,28 44,14 58,22 42,22 56,14" 
                fill="#EF4444" 
                stroke="#B91C1C" 
                strokeWidth="1" 
              />
              
              {/* Impressive Horns */}
              <path d="M 38 38 C 24 22, 16 35, 26 48" fill="none" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 62 38 C 76 22, 84 35, 74 48" fill="none" stroke="#FBBF24" strokeWidth="3.5" strokeLinecap="round" />

              {/* Devil / Baphomet Goat Face & Beard */}
              <polygon points="50,70 35,42 65,42" fill="#450A0A" stroke="#EF4444" strokeWidth="1.8" />
              
              {/* Glowing Red Eyes */}
              <circle cx="43" cy="48" r="2.5" fill="#EF4444" className="animate-ping" />
              <circle cx="57" cy="48" r="2.5" fill="#EF4444" className="animate-ping" />
              <circle cx="43" cy="48" r="2" fill="#FEE2E2" />
              <circle cx="57" cy="48" r="2" fill="#FEE2E2" />

              {/* Bat Wings Silhouette */}
              <path d="M 22 52 Q 10 40 8 60 Q 20 62 34 56" fill="#18181B" stroke="#71717A" strokeWidth="1.2" />
              <path d="M 78 52 Q 90 40 92 60 Q 80 62 66 56" fill="#18181B" stroke="#71717A" strokeWidth="1.2" />

              {/* Flaming Torch of Passion */}
              <line x1="50" y1="70" x2="50" y2="88" stroke="#D97706" strokeWidth="3" />
              <circle cx="50" cy="88" r="4" fill="#F97316" className="animate-pulse" />
            </svg>
          );

        case 16: // A Torre (The Tower)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* The Stone Tower */}
              <polygon points="35,85 40,35 60,35 65,85" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
              <rect x="46" y="50" width="8" height="12" rx="1" fill="#FEF08A" />
              {/* Golden Crown being struck off */}
              <polygon points="38,35 42,26 50,30 58,26 62,35" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" transform="rotate(-15 50 30)" />
              {/* Lightning Bolt strike */}
              <polyline points="25,12 48,32 44,40 68,52" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              {/* Flames & Fire sparks */}
              <circle cx="34" cy="45" r="2" fill="#EF4444" />
              <circle cx="66" cy="48" r="2.5" fill="#F97316" />
              <circle cx="50" cy="22" r="2" fill="#FDE047" />
            </svg>
          );

        case 17: // A Estrela (The Star)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300">
              {/* Central 8-pointed Star */}
              <polygon points="50,15 54,38 78,38 58,52 65,75 50,60 35,75 42,52 22,38 46,38" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
              {/* 7 Surrounding Little Stars */}
              <circle cx="28" cy="25" r="3" fill="#67E8F9" />
              <circle cx="72" cy="25" r="3" fill="#67E8F9" />
              <circle cx="20" cy="65" r="2.5" fill="#67E8F9" />
              <circle cx="80" cy="65" r="2.5" fill="#67E8F9" />
              {/* Water streams onto earth & pool */}
              <path d="M 40 70 Q 30 85 20 85 M 60 70 Q 70 85 80 85" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );

        case 18: // A Lua (The Moon)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Crescent Moon Face with Solar Rays */}
              <circle cx="50" cy="30" r="16" fill="#FDE68A" />
              <circle cx="56" cy="28" r="14" fill="#0A0F24" />
              {/* Yod Dew Drops falling */}
              <circle cx="42" cy="48" r="2" fill="#FDE68A" />
              <circle cx="58" cy="48" r="2" fill="#FDE68A" />
              <circle cx="50" cy="54" r="2.5" fill="#FDE68A" />
              {/* Twin Fortified Towers */}
              <rect x="18" y="55" width="14" height="30" rx="1" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              <rect x="68" y="55" width="14" height="30" rx="1" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              {/* Pool of the Unconscious */}
              <ellipse cx="50" cy="85" rx="25" ry="6" fill="#0369A1" stroke="#38BDF8" strokeWidth="1" />
            </svg>
          );

        case 19: // O Sol (The Sun)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="20" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="15" fill="#FDE68A" />
              {/* 12 Radiant Sun rays */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <path
                  key={i}
                  d={`M ${50 + 24 * Math.cos((angle * Math.PI) / 180)} ${50 + 24 * Math.sin((angle * Math.PI) / 180)} L ${50 + 38 * Math.cos((angle * Math.PI) / 180)} ${50 + 38 * Math.sin((angle * Math.PI) / 180)}`}
                  stroke={i % 2 === 0 ? '#F59E0B' : '#FBBF24'}
                  strokeWidth={i % 2 === 0 ? '3' : '1.8'}
                  strokeLinecap="round"
                />
              ))}
            </svg>
          );

        case 20: // O Julgamento (Judgement)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Radiant Angelic Cloud */}
              <ellipse cx="50" cy="28" rx="26" ry="10" fill="#E0E7FF" opacity="0.6" />
              {/* Golden Trumpet sounding down */}
              <line x1="50" y1="26" x2="50" y2="58" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <polygon points="50,58 40,70 60,70" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              {/* White Banner with Solar Cross */}
              <rect x="50" y="32" width="20" height="16" fill="#FFF" stroke="#CBD5E1" strokeWidth="1" />
              <path d="M 60 32 L 60 48 M 50 40 L 70 40" stroke="#EF4444" strokeWidth="2" />
            </svg>
          );

        case 21: // O Mundo (The World)
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Laurel Wreath */}
              <ellipse cx="50" cy="50" rx="34" ry="38" fill="none" stroke="#34D399" strokeWidth="3" strokeDasharray="6 3" />
              <circle cx="50" cy="50" r="20" fill="#312E81" opacity="0.6" stroke="#FBBF24" strokeWidth="1.5" />
              {/* 4 Kerubs symbols in corners */}
              <circle cx="18" cy="18" r="4" fill="#FDE68A" />
              <circle cx="82" cy="18" r="4" fill="#38BDF8" />
              <circle cx="18" cy="82" r="4" fill="#F97316" />
              <circle cx="82" cy="82" r="4" fill="#34D399" />
              {/* Twin Magic Wands */}
              <line x1="44" y1="36" x2="44" y2="64" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="36" x2="56" y2="64" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          );

        default:
          return (
            <div className="flex flex-col items-center justify-center h-full text-center px-2">
              <Sparkles className="w-10 h-10 text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] mb-2" />
              <span className="text-[11px] font-cinzel text-amber-200/90 tracking-wider uppercase font-semibold">
                {card.archetype}
              </span>
            </div>
          );
      }
    }

    // 2. Minor Arcana Suits Visual Representations (Paus, Copas, Espadas, Ouros)
    if (card.suit === 'wands') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/25 rounded-full blur-md"></div>
            <Flame className="w-11 h-11 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)] relative z-10" />
          </div>
          <div className="flex gap-1 mt-2.5">
            {Array.from({ length: Math.min(card.number || 1, 5) }).map((_, i) => (
              <div key={i} className="w-1.5 h-6 bg-gradient-to-t from-amber-600 via-orange-500 to-amber-300 rounded-full shadow-sm"></div>
            ))}
          </div>
        </div>
      );
    }

    if (card.suit === 'cups') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-md"></div>
            <Droplets className="w-11 h-11 text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)] relative z-10" />
          </div>
          <div className="flex gap-1.5 mt-2.5">
            {Array.from({ length: Math.min(card.number || 1, 5) }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]"></div>
            ))}
          </div>
        </div>
      );
    }

    if (card.suit === 'swords') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/25 rounded-full blur-md"></div>
            <Wind className="w-11 h-11 text-slate-200 drop-shadow-[0_0_10px_rgba(226,232,240,0.7)] relative z-10" />
          </div>
          <div className="flex gap-1 mt-2.5">
            {Array.from({ length: Math.min(card.number || 1, 5) }).map((_, i) => (
              <div key={i} className="w-1 h-7 bg-gradient-to-t from-slate-600 via-slate-200 to-white rounded-t-sm shadow-sm"></div>
            ))}
          </div>
        </div>
      );
    }

    if (card.suit === 'pentacles') {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/25 rounded-full blur-md"></div>
            <div className="w-11 h-11 rounded-full border-2 border-amber-400 flex items-center justify-center bg-emerald-950/80 shadow-[0_0_14px_rgba(52,211,153,0.6)]">
              <Star className="w-6 h-6 text-amber-300 fill-amber-300/50" />
            </div>
          </div>
          <div className="flex gap-1.5 mt-2.5">
            {Array.from({ length: Math.min(card.number || 1, 5) }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-emerald-500/60 shadow-[0_0_4px_rgba(251,191,36,0.6)]"></div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.isHovered ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)` : 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative w-full h-full rounded-xl flex flex-col justify-between overflow-hidden border bg-gradient-to-b ${suitConfig.bgGradient} ${suitConfig.borderGlow} select-none shadow-2xl`}
    >
      {/* Holographic Specular Glaze Sheen on Tilt */}
      {tilt.isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-40 mix-blend-overlay transition-opacity duration-200 rounded-xl"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.9) 0%, rgba(251,191,36,0.4) 25%, transparent 65%)`
          }}
        />
      )}

      {/* Background Sacred Geometric Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FBBF24_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Ornate Gold Frame Border */}
      <div className="absolute inset-1.5 rounded-lg border border-amber-500/30 pointer-events-none">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-400" />
      </div>

      {/* Header: Roman Numeral / Rank & Element / Astro Indicator */}
      <div className="relative z-10 px-2.5 sm:px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-cinzel text-xs md:text-sm font-bold text-amber-300 tracking-wider">
            {card.roman}
          </span>
          {card.astroGlyph && (
            <span 
              className="text-xs text-amber-400 font-serif drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
              title={`Astrologia: ${card.planet || card.element}`}
            >
              {card.astroGlyph}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {card.isReversed && (
            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-950/90 border border-red-500/50 text-red-300 font-cinzel font-bold">
              Invertida
            </span>
          )}
          <span 
            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-400/20 bg-slate-900/70 font-medium flex items-center gap-1"
            style={{ color: suitConfig.color }}
          >
            {(card.alchemySymbol || suitConfig.alchemySymbol) && (
              <span className="text-[11px] leading-none opacity-90">{card.alchemySymbol || suitConfig.alchemySymbol}</span>
            )}
            <span>{card.arcana === 'Major' ? 'Arcano Maior' : suitConfig.element}</span>
          </span>
        </div>
      </div>

      {/* Main Center Artwork (supports 180deg flip if reversed) */}
      <div className={`relative z-10 flex-1 flex items-center justify-center p-2 transition-transform duration-500 ${card.isReversed ? 'rotate-180' : ''}`}>
        {renderCardSymbolism()}
      </div>

      {/* Footer: Card Name & Keywords */}
      <div className="relative z-10 px-2.5 pb-2.5 pt-1 text-center bg-slate-950/80 backdrop-blur-sm border-t border-amber-500/20">
        <h4 className="font-cinzel text-xs md:text-sm font-bold text-slate-100 leading-tight truncate tracking-wide flex items-center justify-center gap-1">
          <span>{card.name}</span>
          {card.isReversed && <span className="text-[9px] text-red-400 font-sans font-normal">(Inv.)</span>}
        </h4>
        
        {!isMini && (
          <p className="text-[10px] text-amber-300/80 font-cinzel truncate mt-0.5">
            {card.deckId === 'lenormand' ? `Carta ${card.number} · Petit Lenormand` : card.nameEn}
          </p>
        )}

        {showKeywords && !isMini && card.keywords && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1 overflow-hidden max-h-5">
            {card.keywords.slice(0, 2).map((kw, i) => (
              <span key={i} className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-purple-950/80 text-purple-200 border border-purple-500/30 truncate">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
