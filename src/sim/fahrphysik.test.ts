import { describe, expect, it } from 'vitest';
import { fahrschritt, KREUZUNG_ABSTAND, startzustand, tempomatUmschalten, type Fahrzustand, type Pedale } from './fahrphysik';

const nichts: Pedale = { gas: false, bremse: false };
const fahre = (z: Fahrzustand, p: Pedale, sekunden: number) => {
  let x = z;
  for (let i = 0; i < sekunden * 10; i++) x = fahrschritt(x, p, 0.1);
  return x;
};

describe('Fahrphysik', () => {
  it('der Tempomat hält das Tempo ohne Pedal', () => {
    expect(fahre(startzustand, nichts, 5).tempo).toBeCloseTo(startzustand.tempo, 0);
  });

  it('Gas beschleunigt, danach kehrt der Tempomat zum Wunschtempo zurück', () => {
    const schnell = fahre(startzustand, { gas: true, bremse: false }, 3);
    expect(schnell.tempo).toBeGreaterThan(55);
    expect(fahre(schnell, nichts, 15).tempo).toBeCloseTo(startzustand.tempomatZiel, 0);
  });

  it('Bremsen schaltet den Tempomaten ab und hält im Stand (Auto Hold)', () => {
    const steht = fahre(startzustand, { gas: false, bremse: true }, 4);
    expect(steht.tempo).toBe(0);
    expect(steht.tempomat).toBe(false);
    expect(fahre(steht, nichts, 5).tempo).toBe(0);
    expect(fahre(steht, { gas: true, bremse: false }, 2).tempo).toBeGreaterThan(5);
  });

  it('ohne Tempomat rollt die Automatik aus, aber nicht unter Schritttempo', () => {
    const ohne = tempomatUmschalten(startzustand);
    const gerollt = fahre(ohne, nichts, 60);
    expect(gerollt.tempo).toBeGreaterThan(4);
    expect(gerollt.tempo).toBeLessThan(10);
  });

  it('nach der Kreuzung beginnt die Anfahrt von vorn', () => {
    const z = fahre(startzustand, nichts, 25); // 48 km/h ≈ 13 m/s
    expect(z.kreuzungen).toBe(1);
    expect(z.rest).toBeGreaterThan(0);
    expect(z.rest).toBeLessThanOrEqual(KREUZUNG_ABSTAND);
  });
});
