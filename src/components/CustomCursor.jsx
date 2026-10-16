import React, { useEffect, useRef } from 'react';

export function CustomCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    let x = -100, y = -100, followX = -100, followY = -100;
    const move = e => {
      x = e.clientX; y = e.clientY;
      const interactive = e.target.closest('button, a, [role="button"]');
      ref.current.dataset.active = Boolean(interactive);
      ref.current.dataset.visible = 'true';
    };
    const hide = () => { ref.current.dataset.visible = 'false'; };
    const animate = () => { followX += (x - followX) * .17; followY += (y - followY) * .17; ref.current.style.transform = `translate3d(${followX}px,${followY}px,0)`; frame = requestAnimationFrame(animate); };
    const sync = () => {
      cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', hide); hide();
      if (media.matches) { window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerleave', hide); animate(); }
    };
    sync(); media.addEventListener('change', sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', hide); media.removeEventListener('change', sync); };
  }, []);
  return <div ref={ref} className="celestial-cursor" aria-hidden="true"><span /></div>;
}
