/**
 * Stark vereinfachte Längsdynamik eines Automatikfahrzeugs, nur für die Simulation.
 * Werte sind frei gewählt, damit es sich plausibel anfühlt; keine Messwerte.
 */

/** Abstand zur nächsten Kreuzung, an der abgebogen wird (Meter). Danach beginnt die Anfahrt von vorn. */
export const KREUZUNG_ABSTAND = 300;
export const TEMPOMAT_START = 48;

export interface Fahrzustand {
  /** km/h */
  tempo: number;
  tempomat: boolean;
  /** Wunschtempo des Tempomaten in km/h */
  tempomatZiel: number;
  /** Auto Hold: hält das Fahrzeug nach dem Anhalten, bis Gas gegeben wird. */
  halten: boolean;
  /** Meter bis zur nächsten Kreuzung */
  rest: number;
  /** Anzahl der bisher passierten Kreuzungen */
  kreuzungen: number;
}

export interface Pedale {
  gas: boolean;
  bremse: boolean;
}

export const startzustand: Fahrzustand = {
  tempo: TEMPOMAT_START,
  tempomat: true,
  tempomatZiel: TEMPOMAT_START,
  halten: false,
  rest: KREUZUNG_ABSTAND,
  kreuzungen: 0,
};

const MAX_TEMPO = 180;
const KRIECHTEMPO = 6;

/** Beschleunigung in km/h pro Sekunde. */
function beschleunigung(z: Fahrzustand, p: Pedale): number {
  if (p.bremse) return -28;
  if (p.gas) return 9 * (1 - z.tempo / MAX_TEMPO);
  if (z.halten) return 0;
  if (z.tempomat) return Math.max(-2.5, Math.min(3, (z.tempomatZiel - z.tempo) * 0.8));
  // Automatik ohne Pedal: rollt langsam aus, kriecht aber im Stand mit Schritttempo los.
  if (z.tempo < KRIECHTEMPO) return 2;
  return -1.5;
}

/** Ein Simulationsschritt über `dt` Sekunden. */
export function fahrschritt(z: Fahrzustand, p: Pedale, dt: number): Fahrzustand {
  // Bremsen schaltet den Tempomaten ab; Gas übersteuert ihn nur.
  const tempomat = z.tempomat && !p.bremse;
  let tempo = Math.min(MAX_TEMPO, Math.max(0, z.tempo + beschleunigung({ ...z, tempomat }, p) * dt));
  const halten = p.gas ? false : z.halten || (p.bremse && tempo === 0);
  if (halten) tempo = 0;

  let rest = z.rest - (tempo / 3.6) * dt;
  let kreuzungen = z.kreuzungen;
  if (rest <= 0) {
    rest += KREUZUNG_ABSTAND;
    kreuzungen += 1;
  }
  return { ...z, tempo, tempomat, halten, rest, kreuzungen };
}

/** Tempomat an (übernimmt das aktuelle Tempo, mindestens 30 km/h) oder aus. */
export function tempomatUmschalten(z: Fahrzustand): Fahrzustand {
  if (z.tempomat) return { ...z, tempomat: false };
  return { ...z, tempomat: true, halten: false, tempomatZiel: Math.max(30, Math.round(z.tempo)) };
}

/** Drehzahl in 1000/min, grob aus Tempo und Gaspedal. */
export function drehzahl(tempo: number, gas: boolean): number {
  if (tempo === 0) return 0.8;
  return Math.min(6.5, 0.9 + (tempo % 45) / 45 + tempo / 60 + (gas ? 1.2 : 0));
}
