// Altar & Sanctuary Themes Configuration for Lumina Tarot
export const ALTAR_THEMES = [
  {
    id: 'cosmic',
    name: 'Noite Cósmica',
    subtitle: 'Ametista & Ouro Sagrado',
    icon: 'Sparkles',
    bgColor: '#030303',
    cardBackGradient: 'from-[#120B2E] via-[#0A0F24] to-[#1A0B36]',
    textAccent: 'text-amber-300',
    goldTextClass: 'gold-gradient-text',
    glowColor: 'rgba(251, 191, 36, 0.35)',
    nebulaColors: ['rgba(88, 28, 135, 0.14)', 'rgba(217, 119, 6, 0.08)'],
    starColors: { primary: '#C9A45C', secondary: '#BEB5A3' },
    previewDot: 'bg-amber-400',
  },
  {
    id: 'lunar',
    name: 'Luar Místico',
    subtitle: 'Prata, Safira & Esmeralda',
    icon: 'Moon',
    bgColor: '#06090C',
    cardBackGradient: 'from-[#06202E] via-[#041622] to-[#0A2D35]',
    textAccent: 'text-cyan-300',
    goldTextClass: 'silver-gradient-text',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    nebulaColors: ['rgba(6, 182, 212, 0.12)', 'rgba(16, 185, 129, 0.08)'],
    starColors: { primary: '#E0F2FE', secondary: '#A7F3D0' },
    previewDot: 'bg-cyan-400',
  },
  {
    id: 'solar',
    name: 'Alquimia Solar',
    subtitle: 'Ouro Nobre & Obsidiana',
    icon: 'Sun',
    bgColor: '#0C0A09',
    cardBackGradient: 'from-[#270E08] via-[#150604] to-[#341108]',
    textAccent: 'text-orange-300',
    goldTextClass: 'gold-gradient-text',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    nebulaColors: ['rgba(234, 88, 12, 0.13)', 'rgba(245, 158, 11, 0.09)'],
    starColors: { primary: '#FEF08A', secondary: '#FED7AA' },
    previewDot: 'bg-orange-400',
  },
  {
    id: 'crimson',
    name: 'Veludo Carmesim',
    subtitle: 'Púrpura & Rosa Mística',
    icon: 'Flame',
    bgColor: '#100708',
    cardBackGradient: 'from-[#2B0827] via-[#120311] to-[#3B092A]',
    textAccent: 'text-pink-300',
    goldTextClass: 'arcane-gradient-text',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    nebulaColors: ['rgba(219, 39, 119, 0.12)', 'rgba(147, 51, 234, 0.1)'],
    starColors: { primary: '#FBCFE8', secondary: '#E9D5FF' },
    previewDot: 'bg-pink-400',
  }
];

const THEME_STORAGE_KEY = 'lumina_tarot_theme_v1';

export const themeService = {
  getCurrentThemeId() {
    if (typeof window === 'undefined') return 'cosmic';
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'cosmic'; } catch { return 'cosmic'; }
  },

  getCurrentTheme() {
    const id = this.getCurrentThemeId();
    return ALTAR_THEMES.find(t => t.id === id) || ALTAR_THEMES[0];
  },

  setThemeId(id) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch {}
  }
};
