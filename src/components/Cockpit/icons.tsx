import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const basis = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/* Generische, selbst gezeichnete Symbole in Anlehnung an übliche Kontrollleuchten. */

export const Motor = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M3 10v5M3 12.5h2M5 9h3l1.5-2h4L15 9h2l1.5 2H20v-1.5h1.5V16H20v-1.5h-1.5L17 17H8l-3-3V9z" />
  </svg>
);

export const Abblendlicht = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M13 6c4.5 0 8 2.7 8 6s-3.5 6-8 6c-1 0-1.5-2.7-1.5-6S12 6 13 6z" />
    <path d="M9 8.5 3 10.5M9 12 3 14M9 15.5 3 17.5" />
  </svg>
);

export const Tempomat = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4.5 17a8 8 0 1 1 15 0" />
    <path d="M12 15l4-5" />
    <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
  </svg>
);

export const Lenkrad = (p: P) => (
  <svg {...basis} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M3.5 10.5 9.8 11.5M20.5 10.5l-6.3 1M12 14.2V21" />
  </svg>
);

export const Spur = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M7 21 10 3M17 21 14 3" />
    <path d="M12 6v2M12 11v2M12 16v2" />
  </svg>
);

export const Fussgaenger = (p: P) => (
  <svg {...basis} {...p}>
    <circle cx="13" cy="4" r="1.8" fill="currentColor" stroke="none" />
    <path d="M13 7.5 11 13l3 3 1 5M11 13l-2 4-2.5 4M12.5 8.5 9 10l-1 3M13 8.5l2.5 2.5 2.5 1" />
  </svg>
);

export const Glocke = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </svg>
);

export const Lautsprecher = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

export const Stumm = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
);

export const Vibration = (p: P) => (
  <svg {...basis} {...p}>
    <rect x="8" y="4" width="8" height="16" rx="2" />
    <path d="M4.5 8v8M2 10v4M19.5 8v8M22 10v4" />
  </svg>
);

export const Haken = (p: P) => (
  <svg {...basis} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const Kreuz = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Ausrufezeichen = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M12 3.5 22 20.5H2z" />
    <path d="M12 10v4.5" />
    <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
  </svg>
);

export const Pfeil = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M8 21v-9a3 3 0 0 1 3-3h7" />
    <path d="m14.5 5.5 3.5 3.5-3.5 3.5" />
  </svg>
);

/* Erfundene Symbole für die Sabotage: Niemand weiß, was sie bedeuten. */

export const Erfunden1 = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M12 12c0-1 1-2 2-1.5s1 2.5-.5 3.5-4 .5-4.5-1.5 1-4.5 3.5-5 5.5 1 6 3.5-1 6-4 7-7-.5-8-3.5" />
  </svg>
);

export const Erfunden2 = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4 18 8 6l3 8 2-5 2 6 2-4 3 7" />
    <circle cx="6" cy="20" r="1" />
  </svg>
);

export const Erfunden3 = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <rect x="9" y="9" width="6" height="6" rx="3" transform="rotate(45 12 12)" />
    <path d="m5 5 2 2M17 17l2 2" />
  </svg>
);

/* Hauptdisplay und Mittelkonsole */

export const Bluetooth = (p: P) => (
  <svg {...basis} {...p}>
    <path d="m7 7 10 10-5 4V3l5 4L7 17" />
  </svg>
);

export const Play = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

export const Pause = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M8 5v14M16 5v14" strokeWidth="3" />
  </svg>
);

export const Vor = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M5 6v12l9-6zM18 6v12" />
  </svg>
);

export const Zurueck = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M19 6v12l-9-6zM6 6v12" />
  </svg>
);

export const Navi = (p: P) => (
  <svg {...basis} {...p}>
    <path d="m12 3 7 18-7-4-7 4z" />
  </svg>
);

export const Musik = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M9 18V5l11-2v13" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </svg>
);

export const Telefon = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

export const Auto = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4 16v-4l2-5h12l2 5v4zM4 16v2h3v-2M17 16v2h3v-2M4 12h16" />
    <circle cx="7.5" cy="14" r="0.8" fill="currentColor" />
    <circle cx="16.5" cy="14" r="0.8" fill="currentColor" />
  </svg>
);

export const Apps = (p: P) => (
  <svg {...basis} {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </svg>
);

export const Sitzheizung = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M7 3c1 2-1 3 0 5M11 3c1 2-1 3 0 5M15 3c1 2-1 3 0 5M5 21h11l-1-6H8l-3-5" />
  </svg>
);

export const Luefter = (p: P) => (
  <svg {...basis} {...p}>
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 10.5c0-4 3-7 5-5s-1 5-5 5zM13.5 12c4 0 7 3 5 5s-5-1-5-5zM12 13.5c0 4-3 7-5 5s1-5 5-5zM10.5 12c-4 0-7-3-5-5s5 1 5 5z" />
  </svg>
);

export const Schneeflocke = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />
  </svg>
);

export const Scheibe = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M4 17c2-6 14-6 16 0z" />
    <path d="M9 9.5c1 1.5-1 2.5 0 4M12 9c1 1.5-1 2.5 0 4M15 9.5c1 1.5-1 2.5 0 4" />
  </svg>
);

export const Heckscheibe = (p: P) => (
  <svg {...basis} {...p}>
    <rect x="4" y="7" width="16" height="10" rx="2" />
    <path d="M8 10c1 1.5-1 2.5 0 4M12 10c1 1.5-1 2.5 0 4M16 10c1 1.5-1 2.5 0 4" />
  </svg>
);

export const Warndreieck = (p: P) => (
  <svg {...basis} {...p} strokeWidth={2.4}>
    <path d="M12 4 21 19H3z" />
    <path d="M12 9.5 16 16.5H8z" strokeWidth={1.6} />
  </svg>
);

export const BlinkerLinks = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M3 12 10 5v4h10v6H10v4z" fill="currentColor" />
  </svg>
);

export const BlinkerRechts = (p: P) => (
  <svg {...basis} {...p}>
    <path d="m21 12-7-7v4H4v6h10v4z" fill="currentColor" />
  </svg>
);

export const Plus = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Minus = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const Kompass = (p: P) => (
  <svg {...basis} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 5 2.5 7h-5z" fill="currentColor" />
  </svg>
);

export const Spurpfeil = ({ abbiegen, ...p }: P & { abbiegen?: boolean }) => (
  <svg {...basis} {...p}>
    {abbiegen ? <path d="M9 21v-8a4 4 0 0 1 4-4h5m-3-3 3 3-3 3" /> : <path d="M12 21V4m-4 4 4-4 4 4" />}
  </svg>
);

/* Weitere Symbole für App-Leiste und App-Raster */

export const Massage = (p: P) => (
  <svg {...basis} {...p}>
    <path d="M7 20V9a5 5 0 0 1 10 0v11" />
    <path d="M10 10c1 1 3 1 4 0M10 14c1 1 3 1 4 0" />
  </svg>
);

export const Kalender = (p: P) => (
  <svg {...basis} {...p}>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </svg>
);

export const Wetter = (p: P) => (
  <svg {...basis} {...p}>
    <circle cx="9" cy="9" r="3.5" />
    <path d="M9 2v1.5M2 9h1.5M4 4l1 1M14 4l-1 1M8 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.5 1.5A2.8 2.8 0 0 0 8 19z" />
  </svg>
);