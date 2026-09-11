import { useEffect, useRef } from 'react';
const stack = [];
let originalOverflow;
export function useModalAccessibility(open, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const panel = ref.current;
    if (!open || !panel) return;
    const previous = document.activeElement;
    if (!stack.length) { originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    stack.push(panel);
    const focusables = () => [...panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    panel.tabIndex = -1;
    (focusables()[0] || panel).focus();
    const keydown = e => {
      if (stack.at(-1) !== panel) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeRef.current?.(); }
      if (e.key === 'Tab') {
        const items = focusables();
        const first = items[0] || panel;
        const last = items.at(-1) || panel;
        if (!panel.contains(document.activeElement) || (e.shiftKey && (document.activeElement === first || document.activeElement === panel))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel)) { e.preventDefault(); first.focus(); }
      }
    };
    const keepFocus = e => { if (stack.at(-1) === panel && !panel.contains(e.target)) (focusables()[0] || panel).focus(); };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', keepFocus);
    return () => {
      stack.splice(stack.indexOf(panel), 1);
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', keepFocus);
      if (!stack.length) document.body.style.overflow = originalOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return ref;
}
