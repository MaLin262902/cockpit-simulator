import styles from './Cockpit.module.css';

interface Props {
  /** Wie die Fahrspur markiert wird: aktiv = Spurhalten greift, aus = bereit, neutral = ohne Statusanzeige. */
  spur: 'neutral' | 'aktiv' | 'aus';
  /** Erkanntes Fahrzeug voraus mit Rahmen markieren (Systemgrenzen sichtbar). */
  erkennungZeigen: boolean;
}

function Auto({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={styles.adasAuto}>
      <rect x={-26} y={-24} width={52} height={14} rx={5} className={styles.adasScheibe} />
      <rect x={-30} y={-12} width={60} height={24} rx={8} />
      <rect x={-27} y={-5} width={9} height={4} rx={1.5} className={styles.adasLicht} />
      <rect x={18} y={-5} width={9} height={4} rx={1.5} className={styles.adasLicht} />
    </g>
  );
}

/** Stilisierte Fahrerassistenz-Ansicht wie in aktuellen Kombiinstrumenten. */
export function AdasAnsicht({ spur, erkennungZeigen }: Props) {
  return (
    <svg className={styles.adas} viewBox="0 0 200 130" data-spur={spur} aria-hidden="true">
      <defs>
        <linearGradient id="adas-boden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <path d="M86 8 L114 8 L196 130 L4 130 Z" fill="url(#adas-boden)" className={styles.adasBoden} />
      <path d="M93 8 L108 8 L150 130 L50 130 Z" className={styles.adasSchlauch} />
      <path d="M80 8 L-6 130" className={styles.adasNachbar} />
      <path d="M120 8 L206 130" className={styles.adasNachbar} />
      <path d="M93 8 L50 130" className={styles.adasLinie} />
      <path d="M107 8 L150 130" className={styles.adasLinie} />
      <Auto x={100} y={44} s={0.42} />
      {erkennungZeigen && (
        <path
          className={styles.adasRahmen}
          d="M84 31 v-4 h4 M112 27 h4 v4 M116 52 v4 h-4 M88 56 h-4 v-4"
        />
      )}
      <Auto x={100} y={112} s={1} />
    </svg>
  );
}
