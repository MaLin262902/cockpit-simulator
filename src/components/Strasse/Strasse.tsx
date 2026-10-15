import { useSim } from '../../sim/SimContext';
import styles from './Strasse.module.css';

/** Blick durch die Windschutzscheibe: stilisierte Straße mit Fahrzeug voraus. */
export function Strasse() {
  const { tempo } = useSim();
  // Mittellinie läuft mit dem Tempo (in 5-km/h-Stufen, damit die Animation nicht ständig neu startet).
  const stufe = Math.round(tempo / 5) * 5;
  const linie = stufe < 3 ? { animationPlayState: 'paused' } : { animationDuration: `${(0.9 * 48) / stufe}s` };
  return (
    <div className={styles.strasse} role="img" aria-label="Straße vor dem Fahrzeug">
      <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2745" />
            <stop offset="0.7" stopColor="#7d5a73" />
            <stop offset="1" stopColor="#e3956a" />
          </linearGradient>
          <linearGradient id="boden" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2620" />
            <stop offset="1" stopColor="#0d1310" />
          </linearGradient>
        </defs>
        <rect width="1600" height="84" fill="url(#himmel)" />
        <path d="M0 84 Q180 52 380 74 T760 66 T1140 72 T1600 70 V84 H0Z" fill="#141e2a" />
        <rect y="84" width="1600" height="116" fill="url(#boden)" />
        <path d="M760 84 L840 84 L1260 200 L340 200 Z" fill="#2c3038" />
        <path d="M762 84 L370 200" stroke="#d9dde3" strokeWidth="3" />
        <path d="M838 84 L1230 200" stroke="#d9dde3" strokeWidth="3" />
        <path className={styles.mittellinie} style={linie} d="M800 84 L800 200" stroke="#f1f1f1" strokeWidth="4" strokeDasharray="14 14" />
        <g transform="translate(822 104)">
          <rect x="-14" y="-12" width="28" height="9" rx="3" fill="#20262e" />
          <rect x="-16" y="-4" width="32" height="13" rx="4" fill="#3c4653" />
          <rect x="-14" y="0" width="5" height="3" rx="1" fill="#ff4d4d" />
          <rect x="9" y="0" width="5" height="3" rx="1" fill="#ff4d4d" />
        </g>
      </svg>
    </div>
  );
}
