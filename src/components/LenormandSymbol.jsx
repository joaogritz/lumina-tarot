import React from 'react';
import { Send as Horse, Clover, Ship, House, TreePine, Cloud, Waypoints, Archive, Flower2, Scissors, Repeat2, Bird, Baby, Squirrel, PawPrint, Stars, Feather, Dog, Building2, Trees, Mountain, Signpost, Rat, Heart, Circle, BookOpen, Mail, UserRound, Flower, Sun, Moon, KeyRound, Fish, Anchor, Cross } from 'lucide-react';
const symbols = { Horse, Clover, Ship, House, TreePine, Cloud, Waypoints, Archive, Flower2, Scissors, Repeat2, Bird, Baby, Squirrel, PawPrint, Stars, Feather, Dog, Building2, Trees, Mountain, Signpost, Rat, Heart, Circle, BookOpen, Mail, UserRound, Flower, Sun, Moon, KeyRound, Fish, Anchor, Cross };
export function LenormandSymbol({ card }) {
  if (card.number === 1) return <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-200" aria-hidden="true">
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" opacity=".25" />
    <path d="M25 72 L30 52 L45 40 L47 24 L56 33 L64 30 L73 46 L66 52 L57 45 L51 56 L60 73 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="60" cy="39" r="2" fill="currentColor" /><path d="M23 77H67M40 39L36 57" stroke="currentColor" strokeWidth="2" />
  </svg>;
  const Icon = symbols[card.symbol] || Stars;
  return <div className="relative w-full h-full flex items-center justify-center text-emerald-200" aria-hidden="true">
    <div className="absolute inset-1 rounded-full border border-emerald-300/20" />
    <div className="absolute inset-3 rounded-full border border-dashed border-amber-200/30" />
    <Icon className="w-1/2 h-1/2" strokeWidth={1.25} />
  </div>;
}
