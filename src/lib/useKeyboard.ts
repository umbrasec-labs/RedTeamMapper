import { useEffect } from 'react';

/** True when focus is in a text field, where single-key shortcuts must not fire. */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

/** Subscribe to window keydown for the lifetime of the component. */
export function useKeydown(handler: (e: KeyboardEvent) => void, deps: unknown[] = []) {
  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
