import type { Modus } from './deriveCockpit';

export interface Ansage {
  /** Gesprochener Text (so steht er auch in scripts/ansagen.ps1). */
  gesprochen: string;
  /** Text für den Untertitel im Hauptdisplay. */
  untertitel: string;
  /** Audiodatei in public/audio, erzeugt mit scripts/ansagen.ps1. */
  datei: string;
  /** So lange (Sekunden) bleibt der Untertitel stehen, etwa die Länge der Aufnahme. */
  dauer: number;
}

const korrekt = (entfernung: string, zahl: string, datei: string): Ansage => ({
  gesprochen: `${entfernung} rechts abbiegen, auf die Hauptstraße.`,
  untertitel: `„${zahl} rechts abbiegen, auf die Hauptstraße.“`,
  datei,
  dauer: 5,
});

/** Korrekte Ansagen nach Entfernung zur Kreuzung, von weit nach nah. */
const KORREKT: { abMeter: number; ansage: Ansage }[] = [
  { abMeter: 250, ansage: korrekt('In dreihundert Metern', 'In 300 Metern', 'ansage-300.wav') },
  { abMeter: 150, ansage: korrekt('In zweihundert Metern', 'In 200 Metern', 'ansage-200.wav') },
  { abMeter: 60, ansage: korrekt('In hundert Metern', 'In 100 Metern', 'ansage-100.wav') },
  { abMeter: 0, ansage: korrekt('Jetzt', 'Jetzt', 'ansage-jetzt.wav') },
];

/** Inversion: klingt flüssig und freundlich, enthält aber weder Entfernung noch Richtung noch Straße. */
const INVERTIERT: Ansage = {
  gesprochen: 'Weiter vorne abbiegen.',
  untertitel: '„Weiter vorne abbiegen.“',
  datei: 'ansage-invertiert.wav',
  dauer: 3,
};

/**
 * Navi-Ansage je nach Gestaltung der Karte „Akustische Informationsdarstellung“ und Entfernung zur Kreuzung.
 * Abgespielt wird sie nur auf Knopfdruck (Lautsprecher-Knopf in der Navi-Karte).
 */
export function ansageFuer(modus: Modus, restMeter: number): Ansage {
  if (modus === 'invertiert') return INVERTIERT;
  return (KORREKT.find((k) => restMeter >= k.abMeter) ?? KORREKT[KORREKT.length - 1]).ansage;
}

/** Alle Audiodateien, damit sie beim Start vorgeladen werden können. */
export const ALLE_ANSAGEN: Ansage[] = [...KORREKT.map((k) => k.ansage), INVERTIERT];
