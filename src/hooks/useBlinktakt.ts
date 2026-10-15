import { useEffect, useState } from 'react';

/**
 * Blinktakt für Blinker und Warnblinker: 1 Hz (0,5 s an, 0,5 s aus), an der Uhr ausgerichtet,
 * damit alle Anzeigen gleichzeitig blinken. Bewusst per JavaScript statt CSS-Animation:
 * Ein Blinker ist eine Funktion, keine Dekoration, und muss auch bei „Bewegung reduzieren“ blinken.
 * 1 Hz liegt weit unter der Grenze von 3 Blitzen pro Sekunde (WCAG 2.3.1).
 */
export function useBlinktakt(aktiv: boolean): boolean {
  const [hell, setHell] = useState(true);
  useEffect(() => {
    if (!aktiv) return;
    let id = 0;
    const takt = () => {
      const jetzt = Date.now();
      setHell(Math.floor(jetzt / 500) % 2 === 0);
      id = window.setTimeout(takt, 500 - (jetzt % 500) + 5);
    };
    takt();
    return () => window.clearTimeout(id);
  }, [aktiv]);
  return aktiv && hell;
}
