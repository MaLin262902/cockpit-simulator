/** Fiktive Automarke für das Cockpit (keine echte Marke). */
export const MARKE = 'NORVIK';

/**
 * Markenzeichen als SVG-Gruppe: abgerundetes Sechseck mit einer Straße, die zum Horizont zusammenläuft.
 * Zeichnet nur Linien (Farbe über `stroke` per CSS-Klasse).
 */
export function MarkenZeichen({ cx, cy, r, className }: { cx: number; cy: number; r: number; className?: string }) {
  const ecken = Array.from({ length: 6 }, (_, i) => {
    const w = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(w)},${cy + r * Math.sin(w)}`;
  }).join(' ');
  return (
    <g className={className} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points={ecken} />
      <path d={`M${cx - r * 0.5} ${cy + r * 0.62} L${cx - r * 0.1} ${cy - r * 0.5}`} />
      <path d={`M${cx + r * 0.5} ${cy + r * 0.62} L${cx + r * 0.1} ${cy - r * 0.5}`} />
      <path d={`M${cx} ${cy + r * 0.5} V${cy + r * 0.2} M${cx} ${cy - r * 0.02} V${cy - r * 0.22}`} />
    </g>
  );
}
