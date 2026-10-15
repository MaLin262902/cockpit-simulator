/**
 * Alle Effekte, die das Cockpit kennt. Der Schlüssel wird in `cards.ts` im Feld `effekt` verwendet.
 * Mehrere Karten dürfen denselben Effekt nutzen; dann gilt der schlechteste Zustand.
 */
export const EFFEKTE = {
  systemstatus: { bereich: 'Statusanzeige des Fahrassistenten' },
  farblogik: { bereich: 'Kontrollleuchten und Warnfarben' },
  kontrast: { bereich: 'Lesbarkeit von Tacho, Statusleiste und Navi-Hinweis' },
  akustik: { bereich: 'Navi-Ansagen und Warntöne' },
  ablenkung: { bereich: 'Menge der Informationen' },
  blickabwendung: { bereich: 'Geschwindigkeit und Bedienwege' },
  realeWelt: { bereich: 'Sprache, Einheiten und Meldungen' },
  tempowarner: { bereich: 'Tempowarner' },
  systemgrenzen: { bereich: 'Anzeige der Systemgrenzen' },
  gruppierung: { bereich: 'Gruppierung der App-Leiste' },
  lesefluss: { bereich: 'Anordnung und Lesefluss' },
  stellteile: { bereich: 'Klimabedienung und Tasten der Mittelkonsole' },
  hinweis: { bereich: 'Textmeldung im Hauptdisplay' },
} as const satisfies Record<string, { bereich: string }>;

export type EffektKey = keyof typeof EFFEKTE;

export function istBekannterEffekt(key: string): key is EffektKey {
  return Object.hasOwn(EFFEKTE, key);
}
