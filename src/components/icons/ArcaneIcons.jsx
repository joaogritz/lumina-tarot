import React, { forwardRef } from 'react';
import './arcane-icons.css';
export { Sun } from 'lucide-react';

// Original engraved symbols, drawn on the same optical grid.
const drawings = {
  BookOpen: 'M7 6 22 3 26 7v21L10 30 6 26V7l4 4v19M10 11 26 7M17 13l4 4-4 4-4-4Z M22 21v4M13 7l6-1',
  Bookmark: 'M9 5h17v22H9M9 5C3 5 3 11 9 11h13M9 27c-6 0-6-6 0-6h13M16 11v10l3-2 3 2V11',
  Sparkles: 'M16 2 19 12 29 16 19 19 16 30 13 19 3 16 13 12Z M7 7l3 3m12 12 3 3M25 7l-3 3M10 22l-3 3M16 12v8M12 16h8',
  Star: 'M16 3 24 25 4 11h24L8 25Z M28 16a12 12 0 0 1-24 0 12 12 0 0 1 24 0',
  Moon: 'M22 4a12 12 0 1 0 6 20A13 13 0 0 1 22 4ZM7 16h4M9 14v4M25 8v4m-2-2h4',
  Layers: 'M4 9 13 5l8 19-9 4ZM12 5l10-2 4 21-5 1M22 6l6 1-1 20-5-1M11 13l3 3-1 4-3-3Z',
  Palette: 'M28 16a12 12 0 1 1-24 0 12 12 0 0 1 24 0ZM16 4v24M4 16h24M7 7l18 18M7 25 25 7M21 16a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  Music: 'M9 5c-6 8-3 22 7 23 10-1 13-15 7-23M9 5l4 5h6l4-5M12 10v13M16 10v16M20 10v13M10 4v3M22 4v3',
  Volume2: 'M6 13h5l7-7v20l-7-7H6ZM22 11c4 3 4 7 0 10M25 6c7 6 7 14 0 20',
  VolumeX: 'M6 13h5l7-7v20l-7-7H6ZM23 12l6 8M29 12l-6 8',
  RotateCw: 'M4 8h9v16H4ZM19 8h9v16h-9ZM7 5l3-3 3 3M19 27l3 3 3-3M8 12v8M22 20v-8',
  RotateCcw: 'M8 9H3V4M3 9a13 13 0 1 1 0 14M13 8h8M13 24h8M14 8c0 5 6 11 6 16M20 8c0 5-6 11-6 16',
  Feather: 'M5 28 22 6M10 22C2 10 16 1 28 3c1 12-5 24-18 19ZM13 17h8M17 12h8',
  HelpCircle: 'M16 2 29 16 16 30 3 16ZM12 11c0-5 9-5 9 0 0 4-5 3-5 8M16 23v1',
  Oracle: 'M5 6h22M16 6v12M16 18l5 6-5 6-5-6ZM7 5l9-3 9 3M6 13v3M26 13v3',
  Destiny: 'M4 25C11 8 25 3 29 8c4 6-10 21-18 17M16 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM3 9l5-4M5 15l6-9',
  Flame: 'M16 4 29 27H3ZM16 12v8M13 18l3 4 3-4',
  Droplets: 'M3 5h26L16 28ZM16 10c-5 6-5 9 0 10 5-1 5-4 0-10Z',
  Wind: 'M16 4 29 27H3ZM8 18h16M11 22h10',
  Mountain: 'M3 5h26L16 28ZM8 14h16M12 19l4-3 4 3',
  Compass: 'M16 1v5M16 26v5M1 16h5M26 16h5M27 16a11 11 0 1 1-22 0 11 11 0 0 1 22 0ZM21 8l-3 10-8 6 3-10Z',
  Heart: 'M16 11c-7-12-20 1 0 17 20-16 7-29 0-17ZM16 14v9M12 19h8M16 2v4M4 5l3 3M28 5l-3 3',
  HeartHandshake: 'M16 3 29 25H3ZM17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM25 21a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM17 21a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  Briefcase: 'M5 12h22v15H5ZM11 12V7h10v5M5 18h22M16 15l3 3-3 3-3-3ZM8 3h16',
  PlusCircle: 'M16 2v28M2 16h28M26 16a10 10 0 1 1-20 0 10 10 0 0 1 20 0M13 2h6M13 30h6M2 13v6M30 13v6',
  Eye: 'M2 16C9 5 23 5 30 16 23 27 9 27 2 16ZM21 16a5 5 0 1 1-10 0 5 5 0 0 1 10 0M16 3v3M7 5l2 3M25 5l-2 3',
  Search: 'M21 13a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM19 20l10 10M6 13h3M12 7v3',
  ZoomIn: 'M21 13a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM19 20l10 10M7 13h10M12 8v10',
  Shuffle: 'M3 8h5c7 0 9 16 16 16h5M3 24h5c7 0 9-16 16-16h5M25 4l4 4-4 4M25 20l4 4-4 4',
  X: 'M7 7l18 18M25 7 7 25',
  Check: 'M5 17l7 8L28 6',
  ChevronLeft: 'M21 5 10 16l11 11',
  ChevronRight: 'M11 5l11 11-11 11',
  ArrowRight: 'M3 16h26M19 6l10 10-10 10M6 13v6',
  Maximize2: 'M3 12V3h9M20 3h9v9M29 20v9h-9M12 29H3v-9',
  Minimize2: 'M3 12h9V3M20 3v9h9M29 20h-9v9M12 29v-9H3',
  Calendar: 'M5 7h22v22H5ZM5 13h22M10 3v8M22 3v8M11 19h2M19 19h2M11 24h2',
  Copy: 'M11 9h17v20H11ZM6 23H3V3h18v3M16 14h7M16 19h7',
  Share2: 'M11 15 23 7M11 18l12 8M3 16l4-4 4 4-4 4ZM23 3l4 4-4 4-4-4ZM23 22l4 4-4 4-4-4Z',
  Trash2: 'M5 8h22M8 8l2 21h12l2-21M12 8V3h8v5M13 13v10M19 13v10',
  Edit3: 'M6 23 23 3l6 5-17 20-8 2ZM20 7l6 5M6 23l6 5',
  Shield: 'M16 3 28 8c0 12-4 17-12 22C8 25 4 20 4 8ZM16 8v15M11 16h10',
  Crown: 'M4 9l7 5 5-10 5 10 7-5-3 17H7ZM8 22h16M16 1v1',
  Bell: 'M7 23h18l-4-6v-5c0-8-10-8-10 0v5ZM13 27h6M16 2v3',
  BellRing: 'M7 23h18l-4-6v-5c0-8-10-8-10 0v5ZM13 27h6M16 2v3M3 8l-2 7M29 8l2 7',
  Target: 'M27 16a11 11 0 1 1-22 0 11 11 0 0 1 22 0ZM21 16a5 5 0 1 1-10 0 5 5 0 0 1 10 0M16 1v10M21 16h10M16 21v10M1 16h10',
  Dices: 'M16 2 29 9v14l-13 7L3 23V9ZM3 9l13 7 13-7M16 16v14M10 9l1 1M21 9l1 1M9 19v1M22 19v1',
  Lightbulb: 'M12 24h8M13 28h6M11 20C1 9 9 3 16 3s15 6 5 17l-1 4h-8ZM16 8v10M12 14l4 4 4-4',
  BarChart3: 'M4 3v26h25M10 23V16M17 23V7M24 23V12M7 4h6',
  Award: 'M24 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM10 19 8 30l8-4 8 4-2-11M16 7l2 4 4 1-4 2-2 4-2-4-4-2 4-1Z',
  AlertTriangle: 'M16 3 30 28H2ZM16 11v9M16 24v1',
  ShieldAlert: 'M16 3 28 8c0 12-4 17-12 22C8 25 4 20 4 8ZM16 10v9M16 23v1',
  Home: 'M2 15 16 3l14 12M6 12v17h20V12M12 29V18h8v11',
  FastForward: 'M3 6l12 10L3 26ZM16 6l12 10-12 10ZM29 5v22',
  CheckCircle2: 'M27 17a11 11 0 1 1-7-11M10 15l6 6L29 5',
  Filter: 'M3 5h26L19 17v10l-6 3V17Z',
};

export const ArcaneIcon = forwardRef(function ArcaneIcon({ name, size = 24, className = '', ...props }, ref) {
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden={props['aria-label'] ? undefined : true} focusable="false" className={`arcane-icon ${className}`} data-arcane-icon={name} {...props}><path d={drawings[name]} /></svg>;
});
const icon = (name) => {
  const Component = forwardRef((props, ref) => <ArcaneIcon ref={ref} name={name} {...props} />);
  Component.displayName = name;
  return Component;
};

export const BookOpen = icon('BookOpen');
export const Bookmark = icon('Bookmark');
export const Sparkles = icon('Sparkles');
export const Star = icon('Star');
export const Moon = icon('Moon');
export const Layers = icon('Layers');
export const Palette = icon('Palette');
export const Music = icon('Music');
export const Volume2 = icon('Volume2');
export const VolumeX = icon('VolumeX');
export const RotateCw = icon('RotateCw');
export const RotateCcw = icon('RotateCcw');
export const Feather = icon('Feather');
export const HelpCircle = icon('HelpCircle');
export const Oracle = icon('Oracle');
export const Destiny = icon('Destiny');
export const Flame = icon('Flame');
export const Droplets = icon('Droplets');
export const Wind = icon('Wind');
export const Mountain = icon('Mountain');
export const Compass = icon('Compass');
export const Heart = icon('Heart');
export const HeartHandshake = icon('HeartHandshake');
export const Briefcase = icon('Briefcase');
export const PlusCircle = icon('PlusCircle');
export const Eye = icon('Eye');
export const Search = icon('Search');
export const ZoomIn = icon('ZoomIn');
export const Shuffle = icon('Shuffle');
export const X = icon('X');
export const Check = icon('Check');
export const ChevronLeft = icon('ChevronLeft');
export const ChevronRight = icon('ChevronRight');
export const ArrowRight = icon('ArrowRight');
export const Maximize2 = icon('Maximize2');
export const Minimize2 = icon('Minimize2');
export const Calendar = icon('Calendar');
export const Copy = icon('Copy');
export const Share2 = icon('Share2');
export const Trash2 = icon('Trash2');
export const Edit3 = icon('Edit3');
export const Shield = icon('Shield');
export const Crown = icon('Crown');
export const Bell = icon('Bell');
export const BellRing = icon('BellRing');
export const Target = icon('Target');
export const Dices = icon('Dices');
export const Lightbulb = icon('Lightbulb');
export const BarChart3 = icon('BarChart3');
export const Award = icon('Award');
export const AlertTriangle = icon('AlertTriangle');
export const ShieldAlert = icon('ShieldAlert');
export const Home = icon('Home');
export const FastForward = icon('FastForward');
export const CheckCircle2 = icon('CheckCircle2');
export const Filter = icon('Filter');
