import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, Oracle, Palette, Moon, Sun, BookOpen, RotateCw, Bookmark, Feather, Music, Maximize2, Minimize2 } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';
import { bgMusicService } from '../utils/bgMusic';

export const Header = ({ 
  reversalsSupported = true,
  userQuestion, 
  setUserQuestion, 
  allowReversed,
  setAllowReversed,
  currentTheme,
  onOpenThemes,
  onOpenGuide,
  onOpenGrimoire,
  onOpenHistory,
  onOpenDaily,
  onOpenYesNo,
  isZenMode,
  onToggleZenMode,
  historyCount = 0
}) => {
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => bgMusicService.getIsPlaying());
  const [volume, setVolume] = useState(() => bgMusicService.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleMusicChange = (e) => {
      if (e.detail) {
        setIsMusicPlaying(e.detail.isPlaying);
        if (typeof e.detail.volume === 'number') {
          setVolume(e.detail.volume);
        }
      }
    };
    window.addEventListener('lumina_bg_music_changed', handleMusicChange);
    return () => window.removeEventListener('lumina_bg_music_changed', handleMusicChange);
  }, []);

  const toggleSound = () => {
    const nextMute = !isMuted;
    audio.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) {
      audio.playHover();
    }
  };

  const toggleMusic = () => {
    audio.playSelect();
    const active = bgMusicService.toggle();
    setIsMusicPlaying(active);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    bgMusicService.setVolume(newVol);
  };

  const toggleReversed = () => {
    audio.playSelect();
    setAllowReversed(!allowReversed);
  };

  return (
    <header className={`sanctuary-header relative w-full max-w-7xl mx-auto pt-4 sm:pt-6 pb-4 px-3 sm:px-4 flex flex-col items-center text-center transition-opacity duration-300 ${isZenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
      {/* Top Utility Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-4">
        {/* Left: Brand Tag */}
        <div className="flex items-center gap-2 text-amber-400/80">
          <Moon className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-cinzel tracking-widest text-amber-200/80 uppercase font-semibold">
            Santuário dos Arcanos
          </span>
          <Sun className="w-4 h-4 text-amber-400" />
        </div>

        {/* Right: Quick Features Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Sim / Não Oracle Button (Desktop only - covered by bottom dock on mobile) */}
          <button
            type="button"
            onClick={() => {
              audio.playInspectZoom();
              if (onOpenYesNo) onOpenYesNo();
            }}
            title="Oráculo do Sim ou Não"
            className="hidden md:inline-flex px-2.5 py-1.5 rounded-sm bg-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-cinzel font-semibold items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Oracle className="w-3.5 h-3.5 text-amber-300/80" />
            <span>Sim ou Não</span>
          </button>

          {/* Daily Card Button (Visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => {
              audio.playInspectZoom();
              if (onOpenDaily) onOpenDaily();
            }}
            title="Carta do Dia - Oráculo Diário"
            className="px-2.5 py-1.5 rounded-sm glass-panel-subtle hover:border-amber-400/60 text-amber-300 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Carta do Dia</span>
          </button>

          {/* Grimoire Codex Button (Desktop only - covered by bottom dock on mobile) */}
          <button
            type="button"
            onClick={() => {
              audio.playHover();
              if (onOpenGrimoire) onOpenGrimoire();
            }}
            title="Grimório - Enciclopédia das Cartas (Atalho: G)"
            className="hidden md:inline-flex px-2.5 py-1.5 rounded-sm glass-panel-subtle hover:border-amber-400/60 text-amber-200 text-xs font-cinzel font-semibold items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Grimório</span>
          </button>

          {/* Reading Journal History Button (Desktop only - covered by bottom dock on mobile) */}
          <button
            type="button"
            onClick={() => {
              audio.playHover();
              if (onOpenHistory) onOpenHistory();
            }}
            title="Diário Oracular - Histórico de Leituras (Atalho: H)"
            className="hidden md:inline-flex px-2.5 py-1.5 rounded-sm glass-panel-subtle hover:border-amber-400/60 text-slate-200 text-xs font-cinzel font-semibold items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Diário</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold font-sans leading-none">
                {historyCount}
              </span>
            )}
          </button>

          {/* Themes Switcher Button (Desktop only - covered by bottom dock on mobile) */}
          <button
            type="button"
            onClick={() => {
              audio.playHover();
              if (onOpenThemes) onOpenThemes();
            }}
            title={`Tema do Altar: ${currentTheme?.name || 'Padrão'} (Atalho: T)`}
            className="hidden md:inline-flex px-2.5 py-1.5 rounded-sm glass-panel-subtle hover:border-amber-400/60 text-slate-200 text-xs font-cinzel font-semibold items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300/80" />
            <span>Temas</span>
          </button>

          {/* Sanctuary Background Music Button + Volume Slider (Visible on Mobile & Desktop) */}
          <div 
            className="relative"
            onFocus={() => setShowVolumeSlider(true)}
            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setShowVolumeSlider(false); }}
            onMouseEnter={() => {
              if (window._volTimer) clearTimeout(window._volTimer);
              setShowVolumeSlider(true);
            }}
            onMouseLeave={() => {
              window._volTimer = setTimeout(() => setShowVolumeSlider(false), 350);
            }}
          >
            <button
              type="button"
              onClick={toggleMusic}
              title={isMusicPlaying ? `Música de Fundo: Ligada (${Math.round(volume * 100)}%) - Passe o mouse para ajustar` : 'Ativar Música de Fundo do Santuário'}
              className={`px-2.5 py-1.5 rounded-sm border text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95
                ${isMusicPlaying 
                  ? 'bg-amber-400/20 border-amber-400/70 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]' 
                  : 'glass-panel-subtle border-slate-700/60 text-slate-400 hover:text-slate-200'
                }
              `}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">{isMusicPlaying ? `${Math.round(volume * 100)}%` : 'Música'}</span>
            </button>

            {/* Floating Volume Slider on Hover / Focus with Invisible Bridge */}
            {showVolumeSlider && (
              <div 
                onMouseEnter={() => {
                  if (window._volTimer) clearTimeout(window._volTimer);
                }}
                onMouseLeave={() => {
                  window._volTimer = setTimeout(() => setShowVolumeSlider(false), 350);
                }}
                className="absolute top-full pt-2 left-1/2 -translate-x-1/2 z-50 min-w-[150px]"
              >
                <div className="p-2.5 rounded-sm bg-slate-900/95 backdrop-blur-2xl border border-amber-500/40 shadow-2xl shadow-stone-950/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-300 font-semibold px-0.5">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      Volume
                    </span>
                    <span className="text-[10px] text-slate-400">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    aria-label="Volume da música de fundo"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-sm cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reversed Cards Toggle (Visible on Mobile & Desktop) */}
          <button
            type="button"
            disabled={!reversalsSupported}
            aria-pressed={allowReversed}
            aria-label={reversalsSupported ? "Cartas invertidas" : "Baralho cigano usa cartas diretas"}
            onClick={toggleReversed}
            title={allowReversed ? 'Cartas Invertidas: ATIVADAS' : 'Cartas Invertidas: DESATIVADAS'}
            className={`px-2.5 py-1.5 rounded-sm border text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95
              ${allowReversed 
                ? 'bg-amber-400/20 border-amber-400/70 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]' 
                : 'glass-panel-subtle border-slate-700/60 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <RotateCw className={`w-3.5 h-3.5 ${allowReversed ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="hidden md:inline">Invertidas</span>
          </button>

          {/* Sound Effects Toggle (Visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos Sonoros'}
            className="p-2 rounded-sm glass-panel-subtle text-slate-300 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Zen Mode Toggle (Desktop only) */}
          <button
            type="button"
            onClick={onToggleZenMode}
            title={isZenMode ? 'Sair do Modo Zen' : 'Modo Foco / Zen (Oculta controles da mesa)'}
            className={`hidden md:inline-flex p-2 rounded-sm border transition-all cursor-pointer
              ${isZenMode 
                ? 'bg-amber-400/20 border-amber-400 text-amber-300' 
                : 'glass-panel-subtle border-slate-700/60 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Guide Button (Visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={onOpenGuide}
            title="Como funciona a leitura de Tarot"
            className="p-2 rounded-sm glass-panel-subtle text-slate-300 hover:text-amber-300 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-300/80" />
          </button>
        </div>
      </div>

      <div className="table-introduction">
        <p className="micro-label">I / O RITUAL DA ESCOLHA</p>
        <h1>Lumina <em>Tarot</em></h1>
        <p>Sua jornada começa com uma pergunta e uma escolha</p>
      </div>
      {/* Mentalize Question Input Box */}
      <div className="w-full max-w-2xl relative mb-2">
        <div className={`relative rounded-sm transition-all duration-300 ${
          isFocused 
            ? 'shadow-[0_0_25px_rgba(251,191,36,0.3)] border border-amber-400/80 bg-slate-950/90' 
            : 'border border-amber-500/30 bg-slate-950/60 hover:border-amber-400/50'
        }`}>
          <div className="flex items-center px-4 py-2.5">
            <Feather className="w-4 h-4 text-amber-400/80 mr-3 shrink-0" />
            <input
                  aria-label="Sua pergunta ou intenção (opcional)"
                  maxLength={1000}
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Mentalize sua intenção ou digite sua pergunta (opcional)..."
              className="w-full bg-transparent text-xs sm:text-sm md:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            {userQuestion && (
              <button
                type="button"
                onClick={() => {
                  audio.playCloseModal();
                  setUserQuestion('');
                }}
                className="text-xs text-slate-500 hover:text-amber-300 ml-2 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
