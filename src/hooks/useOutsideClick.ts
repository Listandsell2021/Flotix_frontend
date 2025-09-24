import { useEffect, RefObject } from 'react';

/**
 * useOutsideClick
 * Calls the handler when a click occurs outside the referenced element.
 * @param ref - React ref to the element
 * @param handler - Function to call on outside click
 * @param enabled - If false, disables the listener
 */
export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler, enabled]);
}
