import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';
import { bgMusicService } from '../utils/bgMusic';

// Maison masthead: a quiet bar (menu, wordmark, journal) and an editorial opening chapter.
// Every tool lives in one full-screen index instead of a row of competing buttons.
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleMusicChange = (e) => {
      if (e.detail) {
        setIsMusicPlaying(e.detail.isPlaying);
        if (typeof e.detail.volume === 'number') setVolume(e.detail.volume);
      }
    };
    window.addEventListener('lumina_bg_music_changed', handleMusicChange);
    return () => window.removeEventListener('lumina_bg_music_changed', handleMusicChange);
  }, []);

  useEffect(() => {
    const dialog = menuRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Menu entries close the index first so the chosen window opens on a calm page.
  const go = (action) => () => {
    audio.playSelect();
    setMenuOpen(false);
    action?.();
  };

  const toggleSound = () => {
    const nextMute = !isMuted;
    audio.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) audio.playHover();
  };

  const toggleMusic = () => {
    audio.playSelect();
    setIsMusicPlaying(bgMusicService.toggle());
  };

  const handleVolumeChange = (e) => {
    const next = parseFloat(e.target.value);
    setVolume(next);
    bgMusicService.setVolume(next);
  };

  const index = [
    ['Sim ou Não', 'Uma carta para uma pergunta direta', onOpenYesNo],
    ['Carta do dia', 'Um arcano para acompanhar o dia', onOpenDaily],
    ['Grimório', 'O significado de cada carta', onOpenGrimoire],
    ['Diário', historyCount ? `${historyCount} ${historyCount === 1 ? 'leitura guardada' : 'leituras guardadas'}` : 'Suas leituras guardadas', onOpenHistory],
    ['Como ler', 'O método, passo a passo', onOpenGuide],
    ['Atmosferas', currentTheme?.name || 'A cor do altar', onOpenThemes],
  ];

  const preferences = [
    ['Cartas invertidas', reversalsSupported ? (allowReversed ? 'Sim' : 'Não') : 'Indisponível no Cigano', () => { audio.playSelect(); setAllowReversed(!allowReversed); }, !reversalsSupported, allowReversed],
    ['Música', isMusicPlaying ? `${Math.round(volume * 100)}%` : 'Desligada', toggleMusic, false, isMusicPlaying],
    ['Efeitos sonoros', isMuted ? 'Desligados' : 'Ligados', toggleSound, false, !isMuted],
    ['Modo foco', isZenMode ? 'Ligado' : 'Desligado', () => { audio.playSelect(); onToggleZenMode?.(); }, false, isZenMode],
  ];

  return (
    <header className="maison-masthead">
      <div className="maison-bar">
        <button
          ref={menuButtonRef}
          type="button"
          className="maison-bar-link"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="maison-menu"
          onClick={() => { audio.playHover(); setMenuOpen(true); }}
        >
          <span className="maison-menu-glyph" aria-hidden="true"><i /><i /></span>
          Menu
        </button>
        <p className="maison-wordmark" aria-label="Lumina">
          <span>Lumina</span>
          <small>Tarot &amp; Baralho Cigano</small>
        </p>
        <div className="maison-bar-end">
          <button type="button" className="maison-bar-link maison-hide-mobile" onClick={go(onOpenYesNo)}>Sim ou Não</button>
          <button type="button" className="maison-bar-link" onClick={go(onOpenHistory)}>
            Diário{historyCount > 0 && <sup>{historyCount}</sup>}
          </button>
        </div>
      </div>

      <section className={`maison-opening ${isZenMode ? 'is-quiet' : ''}`} aria-labelledby="maison-question-title">
        <p className="maison-chapter"><span>I</span>A pergunta</p>
        <h1 id="maison-question-title">Sobre o que<br /><em>deseja refletir?</em></h1>
        <div className="maison-question">
          <label htmlFor="reading-intention">Sua pergunta <span>opcional</span></label>
          <div className="maison-question-field">
            <input
              id="reading-intention"
              enterKeyHint="done"
              maxLength={1000}
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Escreva com suas palavras"
              autoComplete="off"
            />
            {userQuestion && (
              <button type="button" onClick={() => { audio.playCloseModal(); setUserQuestion(''); }}>Apagar</button>
            )}
          </div>
          <p>Sem pergunta, as cartas oferecem uma leitura aberta do momento.</p>
        </div>
      </section>

      <dialog
        ref={menuRef}
        id="maison-menu"
        className="maison-menu"
        aria-label="Menu"
        onCancel={(e) => { e.preventDefault(); closeMenu(); }}
        onClick={(e) => { if (e.target === e.currentTarget) closeMenu(); }}
      >
        <div className="maison-menu-inner">
          <div className="maison-menu-top">
            <p className="maison-wordmark"><span>Lumina</span></p>
            <button type="button" className="maison-bar-link" onClick={closeMenu}>Fechar</button>
          </div>
          <nav className="maison-index" aria-label="Consultas e ferramentas">
            {index.map(([label, note, action], i) => (
              <button key={label} type="button" onClick={go(action)}>
                <span className="maison-index-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="maison-index-label">{label}</span>
                <span className="maison-index-note">{note}</span>
              </button>
            ))}
            <a href={`${import.meta.env.BASE_URL}mesa-3d/`}>
              <span className="maison-index-number">{String(index.length + 1).padStart(2, '0')}</span>
              <span className="maison-index-label">Mesa 3D</span>
              <span className="maison-index-note">Uma mesa livre para dispor as cartas</span>
            </a>
          </nav>
          <section className="maison-preferences" aria-label="Preferências">
            <p className="maison-chapter">Preferências</p>
            {preferences.map(([label, state, action, disabled, on]) => (
              <button key={label} type="button" disabled={disabled} aria-pressed={Boolean(on)} onClick={action}>
                <span>{label}</span><span>{state}</span>
              </button>
            ))}
            {isMusicPlaying && (
              <label className="maison-volume">
                <span>Volume</span>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} aria-label="Volume da música" />
              </label>
            )}
            <a className="maison-menu-foot" href="./privacidade.html" target="_blank" rel="noopener">Privacidade</a>
          </section>
        </div>
      </dialog>
    </header>
  );
};
