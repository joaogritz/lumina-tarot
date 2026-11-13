import React, { useEffect, useState } from 'react';
import { Layers, BookOpen, Bookmark, Palette, Oracle, Destiny, X } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';
import { useModalAccessibility } from '../utils/useModalAccessibility';
import { t } from '../i18n';

export const MobileBottomDock = ({
  onScrollToAltar, onOpenDestiny, onOpenYesNo, onOpenGrimoire, onOpenHistory, onOpenThemes,
  historyCount = 0,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const modalRef = useModalAccessibility(toolsOpen, () => setToolsOpen(false));
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeHiddenSheet = () => { if (desktop.matches) setToolsOpen(false); };
    desktop.addEventListener('change', closeHiddenSheet);
    return () => desktop.removeEventListener('change', closeHiddenSheet);
  }, []);
  const openTool = callback => {
    audio.playHover();
    setToolsOpen(false);
    callback?.();
  };
  return <>
    <nav aria-label={t('dock.label')} className="mobile-reading-dock md:hidden">
      <button type="button" onClick={() => { audio.playHover(); onScrollToAltar?.(); }}><Layers /><span>{t('dock.table')}</span></button>
      <button type="button" onClick={onOpenDestiny} className="dock-destiny"><Destiny /><span>{t('dock.random')}</span></button>
      <button type="button" onClick={() => { audio.playHover(); onOpenGrimoire?.(); }}><BookOpen /><span>{t('menu.grimoire')}</span></button>
      <button type="button" aria-haspopup="dialog" aria-expanded={toolsOpen} onClick={() => setToolsOpen(true)}><Palette /><span>{t('dock.more')}</span></button>
    </nav>
    {toolsOpen && <div className="mobile-tools-layer md:hidden">
      <div className="mobile-tools-backdrop" onClick={() => setToolsOpen(false)} />
      <section ref={modalRef} role="dialog" aria-modal="true" aria-label={t('dock.sheetLabel')} className="mobile-tools-sheet">
        <div className="mobile-sheet-heading"><h2>{t('dock.more')}</h2><button type="button" aria-label={t('dock.closeSheet')} onClick={() => setToolsOpen(false)}><X /></button></div>
        <p>{t('dock.sheetText')}</p>
        <button type="button" onClick={() => openTool(onOpenYesNo)}><Oracle /><span>{t('header.yesNo')}<small>{t('dock.yesNoNote')}</small></span></button>
        <button type="button" onClick={() => openTool(onOpenHistory)}><Bookmark /><span>{t('dock.journal')}<small>{historyCount ? t('menu.journalCount', { count: historyCount }) : t('dock.journalNote')}</small></span></button>
        <button type="button" onClick={() => openTool(onOpenThemes)}><Palette /><span>{t('menu.themes')}<small>{t('dock.themesNote')}</small></span></button>
      </section>
    </div>}
  </>;
};
