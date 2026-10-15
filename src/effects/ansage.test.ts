import { describe, expect, it } from 'vitest';
import { ALLE_ANSAGEN, ansageFuer } from './ansage';

describe('Navi-Ansagen', () => {
  it('jede Ansage hat ihre eigene Audiodatei', () => {
    const dateien = ALLE_ANSAGEN.map((a) => a.datei);
    expect(new Set(dateien).size).toBe(dateien.length);
  });

  it('die korrekte Ansage passt zur Entfernung', () => {
    expect(ansageFuer('korrekt', 290).gesprochen).toContain('dreihundert');
    expect(ansageFuer('korrekt', 180).gesprochen).toContain('zweihundert');
    expect(ansageFuer('korrekt', 90).gesprochen).toContain('hundert Metern');
    expect(ansageFuer('korrekt', 20).gesprochen).toContain('Jetzt');
  });

  it('nur die korrekte Ansage nennt Richtung und Straße', () => {
    for (const info of ['rechts', 'Hauptstraße']) {
      expect(ansageFuer('korrekt', 200).gesprochen).toContain(info);
      expect(ansageFuer('invertiert', 200).gesprochen).not.toContain(info);
    }
  });
});
