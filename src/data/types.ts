export type QuelleStatus = 'geprüft' | 'prüfen';

export interface Karte {
  /** Eindeutige Kennung, nur Kleinbuchstaben, Ziffern und Bindestriche. */
  id: string;
  kategorie: string;
  /** Name der Gestaltungsvorgabe. */
  vorgabe: string;
  quelle: string;
  /** Leer lassen, solange kein geprüfter Link vorliegt. */
  quelleUrl: string;
  quelleStatus: QuelleStatus;
  /** Optionale Anmerkung zur Quelle, z. B. „Übertragung aufs Fahrzeug begründen“. */
  quelleHinweis?: string;
  /** Die Regel in einem Satz. */
  regel: string;
  /** Was die Inversion im Cockpit bewirkt. */
  sabotage: string;
  /** Wie die korrekte Umsetzung aussieht. */
  korrekt: string;
  /**
   * Schlüssel für den visuellen/akustischen Effekt (siehe src/effects/registry.ts).
   * Unbekannte Schlüssel fallen auf "hinweis" zurück: Dann erscheint bei Inversion der Text aus
   * `sabotage` als Meldung im Zentraldisplay.
   */
  effekt: string;
}

/** Jede Vorgabe ist entweder korrekt umgesetzt (Standard, grün) oder invertiert (rot). */
export type KartenZustand = 'korrekt' | 'invertiert';
