import React, { useEffect, useState } from 'react';
import { Layers, BookOpen, Bookmark, Palette, Oracle, Destiny, X } from './icons/ArcaneIcons';
import { audio } from '../utils/audio';
import { useModalAccessibility } from '../utils/useModalAccessibility';

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
    <nav aria-label="Navegação Rápida Mobile" className="mobile-reading-dock md:hidden">
      <button type="button" onClick={() => { audio.playHover(); onScrollToAltar?.(); }}><Layers /><span>Mesa</span></button>
      <button type="button" onClick={onOpenDestiny} className="dock-destiny"><Destiny /><span>Ao acaso</span></button>
      <button type="button" onClick={() => { audio.playHover(); onOpenGrimoire?.(); }}><BookOpen /><span>Grimório</span></button>
      <button type="button" aria-haspopup="dialog" aria-expanded={toolsOpen} onClick={() => setToolsOpen(true)}><Palette /><span>Mais</span></button>
    </nav>
    {toolsOpen && <div className="mobile-tools-layer md:hidden">
      <div className="mobile-tools-backdrop" onClick={() => setToolsOpen(false)} />
      <section ref={modalRef} role="dialog" aria-modal="true" aria-label="Ferramentas do santuário" className="mobile-tools-sheet">
        <div className="mobile-sheet-heading"><h2>Mais</h2><button type="button" aria-label="Fechar ferramentas" onClick={() => setToolsOpen(false)}><X /></button></div>
        <p>Outras consultas e preferências.</p>
        <button type="button" onClick={() => openTool(onOpenYesNo)}><Oracle /><span>Sim ou Não<small>Uma carta para sua pergunta</small></span></button>
        <button type="button" onClick={() => openTool(onOpenHistory)}><Bookmark /><span>Diário de leituras<small>{historyCount ? `${historyCount} leituras guardadas` : 'Revisite suas reflexões'}</small></span></button>
        <button type="button" onClick={() => openTool(onOpenThemes)}><Palette /><span>Atmosferas<small>Escolha a atmosfera da sua mesa</small></span></button>
      </section>
    </div>}
  </>;
};
