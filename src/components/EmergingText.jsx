import React, { useEffect, useMemo, useState } from 'react';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Text that surfaces word by word out of a golden haze, as if the oracle were writing it.
// Words already shown keep their element, so only newly arrived ones animate. The pace follows the
// backlog: a steady trickle while the reading streams in, a quick flow when a whole text arrives at once.
export function EmergingText({ text, active = false, className }) {
  const words = useMemo(() => text.match(/\S+\s*/g) || [], [text]);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? Infinity : 0));
  const visible = Math.min(shown, words.length);

  useEffect(() => {
    if (shown >= words.length) return undefined;
    const id = setTimeout(() => {
      setShown(s => Math.min(words.length, s + Math.max(1, Math.ceil((words.length - s) / 14))));
    }, 55);
    return () => clearTimeout(id);
  }, [shown, words.length]);

  return (
    <p className={className}>
      {words.slice(0, visible).map((word, i) => <span key={i} className="oracle-word">{word}</span>)}
      {(active || visible < words.length) && <span className="oracle-quill" aria-hidden="true">✦</span>}
    </p>
  );
}
