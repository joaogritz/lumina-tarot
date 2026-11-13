import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';
import { CelestialRing } from './CelestialRing';
import { t, privacyUrl, LOCALES, getLocale, setLocale } from '../i18n';

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
  historyCount = 0
}) => {
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

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

  const index = [
    [t('header.yesNo'), t('menu.yesNoNote'), onOpenYesNo],
    [t('menu.daily'), t('menu.dailyNote'), onOpenDaily],
    [t('menu.grimoire'), t('menu.grimoireNote'), onOpenGrimoire],
    [t('header.journal'), historyCount ? t('menu.journalCount', { count: historyCount }) : t('menu.journalNote'), onOpenHistory],
    [t('menu.guide'), t('menu.guideNote'), onOpenGuide],
    [t('menu.themes'), currentTheme?.name || t('menu.themesNote'), onOpenThemes],
  ];

  const preferences = [
    [t('menu.reversed'), reversalsSupported ? (allowReversed ? t('common.yes') : t('common.no')) : t('menu.reversedNA'), () => { audio.playSelect(); setAllowReversed(!allowReversed); }, !reversalsSupported, allowReversed],
    [t('menu.sound'), isMuted ? t('menu.off') : t('menu.on'), toggleSound, false, !isMuted],
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
          {t('header.menu')}
        </button>
        <p className="maison-wordmark" aria-label="Lumina">
          <span>Lumina</span>
          <small>{t('common.tagline')}</small>
        </p>
        <div className="maison-bar-end">
          <button type="button" className="maison-bar-link maison-hide-mobile" onClick={go(onOpenYesNo)}>{t('header.yesNo')}</button>
          <button type="button" className="maison-bar-link" onClick={go(onOpenHistory)}>
            {t('header.journal')}{historyCount > 0 && <sup>{historyCount}</sup>}
          </button>
        </div>
      </div>

      <section className="maison-opening" aria-labelledby="maison-question-title">
        <p className="maison-chapter"><span>I</span>{t('opening.chapter')}</p>
        <h1 id="maison-question-title">{t('opening.title1')}<br /><em>{t('opening.title2')}</em></h1>
        <div className="maison-question">
          <label htmlFor="reading-intention">{t('opening.label')} <span>{t('opening.optional')}</span></label>
          <div className="maison-question-field">
            <input
              id="reading-intention"
              enterKeyHint="done"
              maxLength={1000}
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder={t('opening.placeholder')}
              autoComplete="off"
            />
            {userQuestion && (
              <button type="button" onClick={() => { audio.playCloseModal(); setUserQuestion(''); }}>{t('opening.clear')}</button>
            )}
          </div>
          <p>{t('opening.hint')}</p>
        </div>
      </section>

      <dialog
        ref={menuRef}
        id="maison-menu"
        className="maison-menu"
        aria-label={t('header.menu')}
        onCancel={(e) => { e.preventDefault(); closeMenu(); }}
        onClick={(e) => { if (e.target === e.currentTarget) closeMenu(); }}
      >
        <CelestialRing className="maison-menu-ring" />
        <div className="maison-menu-inner">
          <div className="maison-menu-top">
            <p className="maison-menu-kicker">{t('menu.kicker')}</p>
            <p className="maison-wordmark"><span>Lumina</span><small>{t('common.tagline')}</small></p>
            <button type="button" className="maison-bar-link maison-menu-close" onClick={closeMenu}>
              {t('common.close')} <span className="maison-close-glyph" aria-hidden="true" />
            </button>
          </div>
          <nav className="maison-index" aria-label={t('menu.navLabel')}>
            {index.map(([label, note, action], i) => (
              <button key={label} type="button" onClick={go(action)}>
                <span className="maison-index-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="maison-index-label">{label}</span>
                <span className="maison-index-note">{note}</span>
              </button>
            ))}
            <a href={`${import.meta.env.BASE_URL}mesa-3d/`}>
              <span className="maison-index-number">{String(index.length + 1).padStart(2, '0')}</span>
              <span className="maison-index-label">{t('menu.table3d')}</span>
              <span className="maison-index-note">{t('menu.table3dNote')}</span>
            </a>
          </nav>
          <section className="maison-preferences" aria-label={t('menu.preferences')}>
            <p className="maison-chapter">{t('menu.preferences')}</p>
            {preferences.map(([label, state, action, disabled, on]) => (
              <button key={label} type="button" disabled={disabled} aria-pressed={Boolean(on)} onClick={action}>
                <span>{label}</span>
                <span className="maison-pref-state">
                  <span>{state}</span>
                  <span className="maison-switch" aria-hidden="true"><i /></span>
                </span>
              </button>
            ))}
            <div className="maison-lang" role="group" aria-label={t('menu.language')}>
              <span>{t('menu.language')}</span>
              <span className="maison-lang-options">
                {LOCALES.map((locale) => (
                  <button key={locale.id} type="button" lang={locale.htmlLang} title={locale.label}
                    aria-pressed={locale.id === getLocale()}
                    onClick={() => { if (locale.id !== getLocale()) setLocale(locale.id); }}>
                    {locale.id.toUpperCase()}
                  </button>
                ))}
              </span>
            </div>
          </section>
          <footer className="maison-menu-footer">
            <span>{t('menu.footer')}</span>
            <a href={privacyUrl()} target="_blank" rel="noopener">{t('common.privacy')}</a>
          </footer>
        </div>
      </dialog>
    </header>
  );
};
