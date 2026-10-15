import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  audioAusschalten,
  audioEinschalten,
  ansageVorladen,
  setzeLautstaerke,
  sprachStatusAbonnieren,
  type SprachStatus,
} from './audioEngine';
import { ALLE_ANSAGEN } from '../effects/ansage';

interface AudioKontext {
  an: boolean;
  umschalten: () => void;
  /** Schaltet den Ton ein, falls er aus ist (z. B. beim Druck auf den Ansage-Knopf). */
  einschalten: () => void;
  lautstaerke: number;
  sprachStatus: SprachStatus;
  setLautstaerke: (wert: number) => void;
}

const Kontext = createContext<AudioKontext | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [an, setAn] = useState(false);
  const [lautstaerke, setLaut] = useState(0.6);
  const [sprachStatus, setSprachStatus] = useState<SprachStatus>('still');

  useEffect(() => sprachStatusAbonnieren(setSprachStatus), []);
  useEffect(() => {
    for (const a of ALLE_ANSAGEN) void ansageVorladen(a.datei).catch(() => {});
  }, []);

  const wert = useMemo<AudioKontext>(
    () => ({
      an,
      lautstaerke,
      sprachStatus,
      umschalten: () => {
        if (an) {
          void audioAusschalten();
          setAn(false);
        } else {
          void audioEinschalten();
          setAn(true);
        }
      },
      einschalten: () => {
        if (an) return;
        void audioEinschalten();
        setAn(true);
      },
      setLautstaerke: (w) => {
        setzeLautstaerke(w);
        setLaut(w);
      },
    }),
    [an, lautstaerke, sprachStatus],
  );
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useAudio(): AudioKontext {
  const k = useContext(Kontext);
  if (!k) throw new Error('useAudio außerhalb von AudioProvider');
  return k;
}
