import React, { useEffect, useRef } from 'react';

// Low-density dust: render once for reduced motion, pause when the tab is hidden.
export const BackgroundStars = React.memo(({ theme }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(pointer: coarse)').matches;
    let frame, width, height, last = 0;
    const stars = Array.from({ length: mobile ? 22 : 48 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * .8 + .3, a: Math.random() * .24 + .08, speed: Math.random() * .000005 + .000002 }));
    const paint = (time = 0) => {
      const delta = Math.min(time - last, 50); last = time;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = theme?.starColors?.primary || '#C9A45C';
      for (const star of stars) {
        if (!motion.matches) star.y = (star.y - star.speed * delta + 1) % 1;
        ctx.globalAlpha = star.a;
        ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const restart = () => { cancelAnimationFrame(frame); last = performance.now(); paint(last); };
    const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; restart(); };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', restart); motion.removeEventListener('change', restart); };
  }, [theme]);
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none z-0" />;
});
