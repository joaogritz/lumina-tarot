// Altar & Sanctuary Themes Configuration for Lumina Tarot
export const ALTAR_THEMES = [
  {
    id: 'cosmic',
    name: 'Noir',
    subtitle: 'Tinta e ouro champanhe',
    icon: 'Sparkles',
    bgColor: '#0A0908',
    cardBackGradient: 'from-[#120B2E] via-[#0A0F24] to-[#1A0B36]',
    textAccent: 'text-amber-300',
    goldTextClass: 'gold-gradient-text',
    glowColor: 'rgba(181, 149, 92, 0.18)',
    nebulaColors: ['rgba(181, 149, 92, 0.05)', 'rgba(236, 230, 218, 0.03)'],
    starColors: { primary: '#D4B98A', secondary: '#A39B8C' },
    previewDot: 'bg-[#b5955c]',
  },
  {
    id: 'lunar',
    name: 'Nuit',
    subtitle: 'Azul de meia-noite e prata',
    icon: 'Moon',
    bgColor: '#080A0E',
    cardBackGradient: 'from-[#06202E] via-[#041622] to-[#0A2D35]',
    textAccent: 'text-cyan-300',
    goldTextClass: 'silver-gradient-text',
    glowColor: 'rgba(176, 186, 196, 0.16)',
    nebulaColors: ['rgba(120, 136, 156, 0.06)', 'rgba(236, 230, 218, 0.03)'],
    starColors: { primary: '#C9D0D6', secondary: '#8E98A3' },
    previewDot: 'bg-[#9aa6b2]',
  },
  {
    id: 'solar',
    name: 'Ambre',
    subtitle: 'Âmbar escuro e latão',
    icon: 'Sun',
    bgColor: '#0D0A07',
    cardBackGradient: 'from-[#270E08] via-[#150604] to-[#341108]',
    textAccent: 'text-orange-300',
    goldTextClass: 'gold-gradient-text',
    glowColor: 'rgba(196, 150, 96, 0.18)',
    nebulaColors: ['rgba(176, 120, 60, 0.06)', 'rgba(236, 230, 218, 0.03)'],
    starColors: { primary: '#D9B47E', secondary: '#A88C68' },
    previewDot: 'bg-[#c49660]',
  },
  {
    id: 'crimson',
    name: 'Bordeaux',
    subtitle: 'Vinho profundo e marfim',
    icon: 'Flame',
    bgColor: '#0E0808',
    cardBackGradient: 'from-[#2B0827] via-[#120311] to-[#3B092A]',
    textAccent: 'text-pink-300',
    goldTextClass: 'arcane-gradient-text',
    glowColor: 'rgba(150, 70, 70, 0.18)',
    nebulaColors: ['rgba(110, 40, 44, 0.07)', 'rgba(236, 230, 218, 0.03)'],
    starColors: { primary: '#D8B6A8', secondary: '#9C7A72' },
    previewDot: 'bg-[#7a2e33]',
  },
  {
    id: 'ivoire',
    name: 'Ivoire',
    subtitle: 'Marfim, tinta e ouro velho',
    icon: 'Sun',
    bgColor: '#F1ECE2',
    cardBackGradient: 'from-[#120B2E] via-[#0A0F24] to-[#1A0B36]',
    textAccent: 'text-amber-300',
    goldTextClass: 'gold-gradient-text',
    glowColor: 'rgba(138, 109, 59, 0.14)',
    nebulaColors: ['rgba(138, 109, 59, 0.04)', 'rgba(29, 26, 22, 0.02)'],
    starColors: { primary: '#8A6D3B', secondary: '#9C9385' },
    previewDot: 'bg-[#efe8da]',
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
