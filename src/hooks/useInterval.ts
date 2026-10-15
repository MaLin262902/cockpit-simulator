import { useEffect, useRef } from 'react';

/** Ruft `callback` alle `ms` Millisekunden auf; `null` pausiert. */
export function useInterval(callback: () => void, ms: number | null) {
  const gespeichert = useRef(callback);
  useEffect(() => {
    gespeichert.current = callback;
  });
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => gespeichert.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
