import { useEffect, useRef } from 'react';
import { useAudio } from '../audio/AudioContext';
import { signale } from '../audio/audioEngine';
import type { CockpitModel } from '../effects/deriveCockpit';
import { useBlinktakt } from '../hooks/useBlinktakt';
import { useInterval } from '../hooks/useInterval';
import { useSim } from '../sim/SimContext';

/** Erst wenn das Tempo so weit unter dem Limit war, gibt es beim nächsten Überschreiten wieder einen Hinweiston. */
const WIEDER_SCHARF_UNTER = 2;

/**
 * Spielt automatische Töne zum aktuellen Cockpit-Zustand (Karte „Akustische Informationsdarstellung“).
 * Ohne „Ton an“ passiert nichts. Die Navi-Ansage startet nicht automatisch, sondern über den Lautsprecher-Knopf.
 */
export function SoundDirector({ modell }: { modell: CockpitModel }) {
  const { an } = useAudio();
  const sim = useSim();
  const falsch = modell.akustik === 'invertiert';
  const zuSchnell = sim.tempo > sim.tempolimit && !sim.isaAus;

  // Inversion: Über dem Tempolimit piept es ohne Pause.
  useInterval(signale.dauerPiep, an && falsch && zuSchnell ? 650 : null);

  // Korrekt: ein einzelner Hinweiston beim Überschreiten, erst nach deutlichem Unterschreiten wieder.
  const scharf = useRef(true);
  useEffect(() => {
    if (sim.tempo <= sim.tempolimit - WIEDER_SCHARF_UNTER) scharf.current = true;
    if (zuSchnell && scharf.current) {
      scharf.current = false;
      if (an && !falsch) signale.tempoHinweis();
    }
  }, [sim.tempo, sim.tempolimit, zuSchnell, an, falsch]);

  // Blinker im Blinktakt: korrekt ein Relais-Klicken (tick beim Aufleuchten, tack beim Erlöschen),
  // invertiert eine Türklingel bei jedem Aufleuchten.
  const blinkt = sim.blinker !== 'aus' || sim.warnblinker;
  const hell = useBlinktakt(an && blinkt);
  useEffect(() => {
    if (!an || !blinkt) return;
    if (falsch) {
      if (hell) signale.tuerklingel();
    } else {
      signale.blinkerKlick(hell);
    }
  }, [hell]); // nur beim Wechsel hell/dunkel

  return null;
}
