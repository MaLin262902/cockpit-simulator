import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useInterval } from '../hooks/useInterval';
import { drehzahl, fahrschritt, startzustand, tempomatUmschalten, type Fahrzustand, type Pedale } from './fahrphysik';

export type Blinker = 'links' | 'aus' | 'rechts';

/** Simulierte Fahrt: Pedale, Lenkstock, Tempomat und Navi-Entfernung. */
interface Sim {
  /** Sekundentakt (Uhr, Mini-Anzeigen, Assistent) */
  takt: number;
  /** km/h, gerundet */
  tempo: number;
  tempolimit: number;
  /** Motordrehzahl in 1000/min */
  drehzahl: number;
  /** Meter bis zur nächsten Kreuzung (Navi) */
  rest: number;
  /** Zähler der passierten Kreuzungen; ändert sich beim Abbiegen */
  kreuzungen: number;
  tempomat: boolean;
  tempomatZiel: number;
  tempomatUmschalten: () => void;
  pedale: Pedale;
  setPedal: (pedal: keyof Pedale, gedrueckt: boolean) => void;
  blinker: Blinker;
  setBlinker: (b: Blinker) => void;
  assistAktiv: boolean;
  isaAus: boolean;
  setIsaAus: (aus: boolean) => void;
  warnblinker: boolean;
  setWarnblinker: (an: boolean) => void;
}

const SCHRITT_MS = 100;
const Kontext = createContext<Sim | null>(null);

export function SimProvider({ children }: { children: ReactNode }) {
  const [takt, setTakt] = useState(0);
  const [fahrt, setFahrt] = useState<Fahrzustand>(startzustand);
  const [pedale, setPedale] = useState<Pedale>({ gas: false, bremse: false });
  const [blinker, setBlinker] = useState<Blinker>('aus');
  const [isaAus, setIsaAus] = useState(false);
  const [warnblinker, setWarnblinker] = useState(false);
  const pedaleRef = useRef(pedale);
  pedaleRef.current = pedale;

  useInterval(() => setTakt((t) => t + 1), 1000);
  useInterval(() => setFahrt((z) => fahrschritt(z, pedaleRef.current, SCHRITT_MS / 1000)), SCHRITT_MS);

  // Nach dem Abbiegen an der Kreuzung stellt sich der Lenkstock zurück, wie im echten Auto.
  const kreuzungen = fahrt.kreuzungen;
  useEffect(() => {
    if (kreuzungen > 0) setBlinker('aus');
  }, [kreuzungen]);

  const setPedal = useCallback((pedal: keyof Pedale, gedrueckt: boolean) => {
    setPedale((p) => (p[pedal] === gedrueckt ? p : { ...p, [pedal]: gedrueckt }));
  }, []);
  const tempomatSchalten = useCallback(() => setFahrt(tempomatUmschalten), []);

  const tempo = Math.round(fahrt.tempo);
  const wert = useMemo<Sim>(
    () => ({
      takt,
      tempo,
      tempolimit: 50,
      drehzahl: drehzahl(fahrt.tempo, pedale.gas),
      rest: fahrt.rest,
      kreuzungen: fahrt.kreuzungen,
      tempomat: fahrt.tempomat,
      tempomatZiel: fahrt.tempomatZiel,
      tempomatUmschalten: tempomatSchalten,
      pedale,
      setPedal,
      blinker,
      setBlinker,
      // Der Spurhalteassistent wechselt alle 8 s zwischen „greift ein“ und „bereit“.
      assistAktiv: Math.floor(takt / 8) % 2 === 0,
      isaAus,
      setIsaAus,
      warnblinker,
      setWarnblinker,
    }),
    [takt, tempo, fahrt, pedale, setPedal, tempomatSchalten, blinker, isaAus, warnblinker],
  );

  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useSim(): Sim {
  const k = useContext(Kontext);
  if (!k) throw new Error('useSim außerhalb von SimProvider');
  return k;
}
