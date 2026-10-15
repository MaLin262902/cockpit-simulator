import type { CockpitModel } from '../../effects/deriveCockpit';
import { useBlinktakt } from '../../hooks/useBlinktakt';
import { useSim } from '../../sim/SimContext';
import styles from './Cockpit.module.css';
import * as I from './icons';
import { Fahrerbedienung, Lenkstockschalter } from './Fahrerbedienung';
import { Kombiinstrument } from './Kombiinstrument';
import { Zentraldisplay } from './Zentraldisplay';

/** Aktuelle Fahrsituation. */
export interface Fahrlage {
  tempo: number;
}

interface Props {
  modell: CockpitModel;
  beschriftung?: string;
}

/** Jeder Effekt landet als data-Attribut am Cockpit; das CSS kombiniert sie. */
function datenAttribute(modell: CockpitModel): Record<string, string> {
  const attribute: Record<string, string> = {};
  for (const [schluessel, wert] of Object.entries(modell)) {
    if (typeof wert === 'string') attribute[`data-${schluessel.toLowerCase()}`] = wert;
  }
  return attribute;
}

export function Cockpit({ modell, beschriftung = 'Fahrzeug-Cockpit' }: Props) {
  const sim = useSim();
  const lage: Fahrlage = { tempo: sim.tempo };

  return (
    <div
      className={styles.cockpit}
      data-testid="cockpit"
      role="region"
      aria-label={beschriftung}
      {...datenAttribute(modell)}
    >
      <div className={styles.armaturen}>
        <div className={styles.fahrerplatz}>
          <Kombiinstrument m={modell} lage={lage} />
          <div className={styles.lenkradBereich}>
            <Lenkrad />
            <Lenkstockschalter en={modell.realeWelt === 'invertiert'} />
          </div>
          <Fahrerbedienung en={modell.realeWelt === 'invertiert'} />
        </div>
        <div className={styles.konsole}>
          <Zentraldisplay m={modell} lage={lage} />
          <Bedienteil m={modell} />
        </div>
      </div>
    </div>
  );
}

/** Lüftungsdüsen und echte Tasten unter dem Hauptdisplay (Karte „Blickabwendung“). */
function Bedienteil({ m }: { m: CockpitModel }) {
  const { warnblinker, setWarnblinker } = useSim();
  const hell = useBlinktakt(warnblinker);
  const en = m.realeWelt === 'invertiert';
  const nurTouch = m.blickabwendung === 'invertiert';
  const beschriften = m.blickabwendung === 'korrekt';

  const tasten = [
    { name: en ? 'A/C' : 'Klima', Icon: I.Schneeflocke },
    { name: en ? 'DEF F' : 'Frontscheibe', Icon: I.Scheibe },
    { name: en ? 'DEF R' : 'Heckscheibe', Icon: I.Heckscheibe },
    { name: en ? 'SEAT' : 'Sitzheizung', Icon: I.Sitzheizung },
  ];

  const warn = (
    <button
      type="button"
      className={styles.warnblinkTaste}
      aria-pressed={warnblinker}
      data-hell={hell}
      aria-label="Warnblinker"
      onClick={() => setWarnblinker(!warnblinker)}
    >
      <I.Warndreieck />
    </button>
  );

  const taste = ({ name, Icon }: (typeof tasten)[number]) => (
    <button key={name} type="button" className={styles.hardtaste} aria-label={name}>
      <Icon />
      {beschriften && <span>{name}</span>}
    </button>
  );

  return (
    <div className={styles.bedienteil}>
      <div className={styles.duesen} aria-hidden="true">
        <span className={styles.duese} />
        <span className={styles.duese} />
      </div>
      <div className={styles.tastenreihe} data-beschriftet={beschriften}>
        {nurTouch ? (
          <>
            <span className={styles.klavierlack} aria-hidden="true" />
            {warn}
            <span className={styles.klavierlack} aria-hidden="true" />
          </>
        ) : (
          <>
            {tasten.slice(0, 2).map(taste)}
            {warn}
            {tasten.slice(2).map(taste)}
            <span className={styles.drehknopf} role="img" aria-label={en ? 'VOL' : 'Lautstärkeregler'}>
              {beschriften && <span>{en ? 'VOL' : 'Lautstärke'}</span>}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Lenkrad aus Fahrersicht mit Kranz, Speichen und Prallplatte, rein dekorativ.
 * Der Lenkstockhebel kommt mittig hinter dem Lenkrad aus der Lenksäule und ragt rechts über den Kranz hinaus.
 */
function Lenkrad() {
  const { blinker } = useSim();
  return (
    <svg className={styles.lenkrad} viewBox="0 0 1000 400" preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id="lenkrad-kranz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4048" />
          <stop offset="0.25" stopColor="#1d2025" />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
        <linearGradient id="lenkrad-nabe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2e35" />
          <stop offset="1" stopColor="#111317" />
        </linearGradient>
      </defs>
      {/* Vor dem Kranz gezeichnet, liegt also dahinter. Drehpunkt an der Lenksäule. */}
      <g className={styles.hebel} data-stellung={blinker}>
        <path d="M540 304L884 300a14 14 0 0 1 0 28L540 322z" fill="url(#lenkrad-kranz)" stroke="#2c3138" strokeWidth="2" />
        <path d="M858 302v24" stroke="#4a515b" strokeWidth="3" />
      </g>
      <path
        fillRule="evenodd"
        fill="url(#lenkrad-kranz)"
        d="M160 380a340 340 0 1 1 680 0a340 340 0 1 1-680 0zM206 380a294 294 0 1 0 588 0a294 294 0 1 0-588 0z"
      />
      <path d="M190 380a310 310 0 0 1 620 0" fill="none" stroke="rgb(255 255 255 / 9%)" strokeWidth="3" strokeDasharray="7 7" />
      <path d="M206 350h170l40 30v20H206zM794 350H624l-40 30v20h210z" fill="url(#lenkrad-nabe)" />
      <circle cx="270" cy="372" r="11" fill="#2c3138" />
      <circle cx="306" cy="372" r="11" fill="#2c3138" />
      <circle cx="694" cy="372" r="11" fill="#2c3138" />
      <circle cx="730" cy="372" r="11" fill="#2c3138" />
      <rect x="390" y="300" width="220" height="110" rx="46" fill="url(#lenkrad-nabe)" stroke="#2c3138" strokeWidth="2" />
      <circle cx="500" cy="352" r="16" fill="none" stroke="#3a4048" strokeWidth="3" />
    </svg>
  );
}
