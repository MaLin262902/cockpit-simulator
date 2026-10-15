import { useEffect } from 'react';
import { useAudio } from '../audio/AudioContext';
import { signale } from '../audio/audioEngine';
import type { CockpitModel } from '../effects/deriveCockpit';
import { useBlinktakt } from '../hooks/useBlinktakt';
import { useInterval } from '../hooks/useInterval';
import { useSim } from '../sim/SimContext';

/**
 * Spielt automatische Töne zum aktuellen Cockpit-Zustand. Ohne „Ton an“ passiert nichts.
 * Die Navi-Ansage startet nicht automatisch, sondern über den Lautsprecher-Knopf in der Navi-Karte.
 */
export function SoundDirector({ modell }: { modell: CockpitModel }) {
  const { an } = useAudio();
  const sim = useSim();
  const zuSchnell = modell.tempowarner === 'invertiert' && sim.tempo > sim.tempolimit && !sim.isaAus;

  // Inversion Tempowarner: Piepen bei jeder Überschreitung um 1 km/h.
  useInterval(signale.einheitsPiep, an && zuSchnell ? 900 : null);

  // Leises Ticken des Blinkers im Blinktakt.
  const tickt = useBlinktakt(an && (sim.blinker !== 'aus' || sim.warnblinker));
  useEffect(() => {
    if (an && (sim.blinker !== 'aus' || sim.warnblinker)) signale.blinkerTick(tickt);
  }, [tickt]); // nur beim Wechsel an/aus

  return null;
}
