import type { Karte, KartenZustand } from '../data/types';
import { EFFEKTE, istBekannterEffekt, type EffektKey } from './registry';

/** Zustand eines Cockpit-Effekts: korrekt umgesetzt (Standard) oder invertiert. */
export type Modus = KartenZustand;
/** Nur invertierte Karten müssen eingetragen sein; alles andere gilt als korrekt. */
export type Zustaende = Record<string, KartenZustand>;

type BildEffekt = Exclude<EffektKey, 'hinweis'>;

export interface Hinweis {
  id: string;
  text: string;
}

export type CockpitModel = Record<BildEffekt, Modus> & { hinweise: Hinweis[] };

export function effektVon(karte: Karte): EffektKey {
  return istBekannterEffekt(karte.effekt) ? karte.effekt : 'hinweis';
}

export function zustandVon(zustaende: Zustaende, id: string): KartenZustand {
  return zustaende[id] ?? 'korrekt';
}

export function korrektesModell(): CockpitModel {
  const modell = { hinweise: [] } as unknown as CockpitModel;
  for (const key of Object.keys(EFFEKTE) as EffektKey[]) {
    if (key !== 'hinweis') modell[key] = 'korrekt';
  }
  return modell;
}

/** Berechnet aus den Kartenzuständen, wie das Cockpit aussieht. Invertierte Effekte stapeln sich. */
export function deriveCockpit(karten: Karte[], zustaende: Zustaende): CockpitModel {
  const modell = korrektesModell();
  for (const karte of karten) {
    if (zustandVon(zustaende, karte.id) !== 'invertiert') continue;
    const effekt = effektVon(karte);
    // Im korrekten Cockpit gibt es keine Meldungen; nur die Inversion erzeugt einen Hinweis.
    if (effekt === 'hinweis') modell.hinweise.push({ id: karte.id, text: karte.sabotage });
    else modell[effekt] = 'invertiert';
  }
  return modell;
}

export function zaehleInvertierte(karten: Karte[], zustaende: Zustaende): number {
  return karten.filter((k) => zustandVon(zustaende, k.id) === 'invertiert').length;
}
