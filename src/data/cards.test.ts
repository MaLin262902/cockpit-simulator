import { describe, expect, it } from 'vitest';
import { istBekannterEffekt } from '../effects/registry';
import { cards } from './cards';

const PFLICHTFELDER = ['id', 'kategorie', 'vorgabe', 'quelle', 'regel', 'sabotage', 'korrekt', 'effekt'] as const;

describe('Kartendaten (src/data/cards.ts)', () => {
  it('enthält mindestens eine Karte', () => {
    expect(cards.length).toBeGreaterThan(0);
  });

  it.each(cards.map((k) => [k.id, k] as const))('Karte "%s" hat alle Pflichtfelder', (_id, karte) => {
    for (const feld of PFLICHTFELDER) {
      expect(karte[feld], `Feld "${feld}" fehlt oder ist leer`).toBeTruthy();
    }
    expect(['geprüft', 'prüfen']).toContain(karte.quelleStatus);
    expect(karte.id).toMatch(/^[a-z0-9-]+$/);
  });

  it('IDs sind eindeutig', () => {
    const ids = cards.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('jeder effekt-Schlüssel ist bekannt (sonst Tippfehler oder bewusst "hinweis")', () => {
    const unbekannt = cards.filter((k) => !istBekannterEffekt(k.effekt)).map((k) => `${k.id}: ${k.effekt}`);
    expect(unbekannt).toEqual([]);
  });

  it('Links sind https und nur bei vorhandener URL gesetzt', () => {
    for (const k of cards) {
      if (k.quelleUrl) expect(k.quelleUrl).toMatch(/^https:\/\//);
    }
  });
});
