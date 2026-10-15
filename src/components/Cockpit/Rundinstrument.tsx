import type { ReactNode } from 'react';
import styles from './Cockpit.module.css';

interface Props {
  /** null = keine Nadel, kein Wert (z. B. Tempo nur im Untermenü). */
  wert: number | null;
  max: number;
  /** Abstand der beschrifteten Hauptstriche */
  schritt: number;
  digital: string;
  /** Ersetzt die Digitalanzeige durch eine Grafik (SVG-Elemente um den Mittelpunkt 100/100). */
  symbol?: ReactNode;
  einheit: string;
  zusatz?: string;
  /** Ab hier wird die Skala rot. */
  rotAb?: number;
  beschriftung: string;
  dezimal?: boolean;
}

const MITTE = 100;
const RADIUS = 88;
const START = 135;
const BOGEN = 270;

function punkt(winkel: number, r: number) {
  const rad = (winkel * Math.PI) / 180;
  return { x: MITTE + r * Math.cos(rad), y: MITTE + r * Math.sin(rad) };
}

function bogen(von: number, bis: number, r: number) {
  const a = punkt(von, r);
  const b = punkt(bis, r);
  const gross = bis - von > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${gross} 1 ${b.x} ${b.y}`;
}

export function Rundinstrument({ wert, max, schritt, digital, symbol, einheit, zusatz, rotAb, beschriftung, dezimal }: Props) {
  const winkel = (v: number) => START + (BOGEN * Math.min(Math.max(v, 0), max)) / max;
  const haupt: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += schritt) haupt.push(Math.round(v * 100) / 100);
  const neben: number[] = [];
  for (let v = schritt / 2; v < max; v += schritt) neben.push(v);

  return (
    <svg className={styles.rund} viewBox="0 0 200 200" role="img" aria-label={beschriftung}>
      <path className={styles.rundSpur} d={bogen(START, START + BOGEN, RADIUS)} />
      {rotAb !== undefined && <path className={styles.rundRot} d={bogen(winkel(rotAb), START + BOGEN, RADIUS)} />}
      {wert !== null && <path className={styles.rundWert} d={bogen(START, winkel(wert), RADIUS)} />}
      {haupt.map((v) => {
        const a = punkt(winkel(v), RADIUS - 12);
        const b = punkt(winkel(v), RADIUS - 3);
        const t = punkt(winkel(v), RADIUS - 25);
        return (
          <g key={v}>
            <line className={styles.rundStrich} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <text className={styles.rundZahl} x={t.x} y={t.y} textAnchor="middle" dominantBaseline="central">
              {dezimal ? v : Math.round(v)}
            </text>
          </g>
        );
      })}
      {neben.map((v) => {
        const a = punkt(winkel(v), RADIUS - 7);
        const b = punkt(winkel(v), RADIUS - 3);
        return <line key={v} className={styles.rundStrichKlein} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}
      {wert !== null && (
        <g className={styles.nadel} style={{ transform: `translate(${MITTE}px, ${MITTE}px) rotate(${winkel(wert)}deg)` }}>
          <line x1={RADIUS * 0.42} y1={0} x2={RADIUS - 6} y2={0} />
        </g>
      )}
      {symbol ?? (
        <text className={styles.rundDigital} x={MITTE} y={MITTE + 4} textAnchor="middle" dominantBaseline="central">
          {digital}
        </text>
      )}
      <text className={styles.rundEinheit} x={MITTE} y={MITTE + 34} textAnchor="middle">
        {einheit}
      </text>
      {zusatz && (
        <text className={styles.rundZusatz} x={MITTE} y={MITTE + 62} textAnchor="middle">
          {zusatz}
        </text>
      )}
    </svg>
  );
}
