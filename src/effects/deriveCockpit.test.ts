import { describe, expect, it } from 'vitest';
import type { Karte } from '../data/types';
import { deriveCockpit, zaehleInvertierte } from './deriveCockpit';

const karte = (id: string, effekt: string): Karte => ({
  id,
  kategorie: 'Test',
  vorgabe: `Vorgabe ${id}`,
  quelle: 'Test',
  quelleUrl: '',
  quelleStatus: 'prüfen',
  regel: 'Regel',
  sabotage: `Inversion ${id}`,
  korrekt: `Korrekt ${id}`,
  effekt,
});

const karten = [karte('a', 'kontrast'), karte('b', 'akustik'), karte('c', 'gibtEsNicht'), karte('d', 'kontrast')];

describe('deriveCockpit', () => {
  it('ohne invertierte Karten ist alles korrekt und ohne Meldungen', () => {
    const m = deriveCockpit(karten, {});
    expect(m.kontrast).toBe('korrekt');
    expect(m.akustik).toBe('korrekt');
    expect(m.hinweise).toEqual([]);
  });

  it('Inversionen stapeln sich', () => {
    const m = deriveCockpit(karten, { a: 'invertiert', b: 'invertiert' });
    expect(m.kontrast).toBe('invertiert');
    expect(m.akustik).toBe('invertiert');
  });

  it('teilen sich Karten einen Effekt, gewinnt die Inversion', () => {
    expect(deriveCockpit(karten, { a: 'korrekt', d: 'invertiert' }).kontrast).toBe('invertiert');
    expect(deriveCockpit(karten, { a: 'korrekt', d: 'korrekt' }).kontrast).toBe('korrekt');
  });

  it('unbekannte Effekte werden nur invertiert zur Textmeldung', () => {
    expect(deriveCockpit(karten, { c: 'invertiert' }).hinweise).toEqual([{ id: 'c', text: 'Inversion c' }]);
    expect(deriveCockpit(karten, { c: 'korrekt' }).hinweise).toEqual([]);
  });
});

describe('zaehleInvertierte', () => {
  it('zählt nur invertierte Karten', () => {
    expect(zaehleInvertierte(karten, { a: 'invertiert', b: 'korrekt', c: 'invertiert' })).toBe(2);
  });
});
