import type { CSSProperties } from 'react';
import type { CockpitModel, Modus } from '../../effects/deriveCockpit';
import { useBlinktakt } from '../../hooks/useBlinktakt';
import { useSim } from '../../sim/SimContext';
import { AdasAnsicht } from './AdasAnsicht';
import type { Fahrlage } from './Cockpit';
import styles from './Cockpit.module.css';
import * as I from './icons';
import { Rundinstrument } from './Rundinstrument';

interface Props {
  m: CockpitModel;
  lage: Fahrlage;
}

export function Kombiinstrument({ m, lage }: Props) {
  const sim = useSim();
  const en = m.realeWelt === 'invertiert';
  // Blinker kommen vom Lenkstockschalter, der Warnblinker schaltet beide.
  const blinktLinks = sim.warnblinker || sim.blinker === 'links';
  const blinktRechts = sim.warnblinker || sim.blinker === 'rechts';
  const blinkerAussen = m.lesefluss === 'korrekt';

  return (
    <section className={styles.cluster} aria-label="Kombiinstrument">
      {m.ablenkung === 'invertiert' && <Laufschrift en={en} />}
      <div className={styles.clusterGrid}>
        <div className={styles.kopf}>
          {blinkerAussen && <BlinkerPfeil seite="links" an={blinktLinks} />}
          <div className={styles.kopfMitte}>
            <Kontrollleuchten modus={m.farblogik} en={en} tempomat={sim.tempomat} />
            <div className={styles.kopfRechts}>
              <AkustikHinweis modus={m.akustik} />
              <AssistStatus modus={m.systemstatus} en={en} aktiv={sim.assistAktiv} />
            </div>
          </div>
          {blinkerAussen && <BlinkerPfeil seite="rechts" an={blinktRechts} />}
        </div>

        <div className={styles.tachoBereich}>
          <Tacho m={m} tempo={lage.tempo} en={en} />
        </div>

        <div className={styles.mitte}>
          <div className={styles.mitteOben}>
            {!blinkerAussen && (
              // Übereinander und vertauscht: Der obere Pfeil zeigt nach links, leuchtet aber beim Rechtsblinken.
              <span className={styles.blinkerStapel}>
                <BlinkerPfeil seite="links" an={blinktRechts} />
                <BlinkerPfeil seite="rechts" an={blinktLinks} />
              </span>
            )}
            <Tempolimit modus={m.tempowarner} tempo={lage.tempo} en={en} />
            {m.systemgrenzen === 'invertiert' && (
              // Übervertrauen: groß „100 % sicher“, die Einschränkung nur als Kleingedrucktes mit Sternchen.
              <div className={`${styles.grenzenSabotage} ${styles.blende}`}>
                <I.Haken />
                <span>AUTOPILOT: {en ? '100% SAFE*' : '100 % SICHER*'}</span>
                <small className={styles.kleingedruckt}>{en ? '*not for road works' : '*nicht für Baustellen'}</small>
              </div>
            )}
          </div>
          <AdasAnsicht
            spur={m.systemstatus === 'korrekt' ? (sim.assistAktiv ? 'aktiv' : 'aus') : 'neutral'}
            erkennungZeigen={m.systemgrenzen === 'korrekt'}
          />
          {m.systemgrenzen === 'korrekt' && <Systemgrenzen en={en} />}
        </div>

        <div className={styles.drehzahlBereich}>
          <Rundinstrument
            wert={sim.drehzahl}
            max={7}
            schritt={1}
            rotAb={6}
            digital="D"
            einheit={en ? 'RPM x1000' : '1/min × 1000'}
            beschriftung="Drehzahlmesser, Gang D"
          />
        </div>

        {m.ablenkung === 'invertiert' && <MiniAnzeigen />}

        <Statusleiste en={en} sekunden={m.ablenkung === 'invertiert'} />
      </div>
    </section>
  );
}

function Laufschrift({ en }: { en: boolean }) {
  const text = en
    ? '+++ NEW: PREMIUM SOUND SUBSCRIPTION – 3 MONTHS FREE +++ YOUR HOROSCOPE: A GREAT DAY FOR SPEED +++ 3 NEW MESSAGES +++ COFFEE? NEXT REST STOP 12 MI +++'
    : '+++ NEU: Premium-Sound-Abo – 3 Monate gratis +++ Ihr Horoskop: Heute ist ein guter Tag für Abenteuer +++ 3 neue Nachrichten +++ Kaffeepause? Nächste Raststätte in 18 km +++';
  return (
    <div className={styles.laufschrift} aria-hidden="true">
      <span>{text}</span>
    </div>
  );
}

/** Die Motorwarnung gibt es nur im invertierten Cockpit: Im korrekten Zustand ist das Fahrzeug fehlerfrei. */
const LAMPEN = [
  { id: 'motor', art: 'warnung', Symbol: I.Motor, Erfunden: I.Erfunden1, text: 'Motor prüfen', textEn: 'CHK ENG' },
  { id: 'licht', art: 'aktiv', Symbol: I.Abblendlicht, Erfunden: I.Erfunden2, text: 'Abblendlicht', textEn: 'LO BM' },
  { id: 'tempomat', art: 'aktiv', Symbol: I.Tempomat, Erfunden: I.Erfunden3, text: 'Tempomat', textEn: 'CC' },
] as const;

function BlinkerPfeil({ seite, an }: { seite: 'links' | 'rechts'; an: boolean }) {
  const Icon = seite === 'links' ? I.BlinkerLinks : I.BlinkerRechts;
  const hell = useBlinktakt(an);
  return (
    <span className={styles.blinkerPfeil} data-an={hell} role="img" aria-label={`Blinker ${seite}${an ? ' an' : ''}`}>
      <Icon />
    </span>
  );
}

function Kontrollleuchten({ modus, en, tempomat }: { modus: Modus; en: boolean; tempomat: boolean }) {
  const lampen = LAMPEN.filter((l) => (modus === 'invertiert' || l.art !== 'warnung') && (tempomat || l.id !== 'tempomat'));
  return (
    <ul key={modus} className={`${styles.lampen} ${styles.blende}`} aria-label="Kontrollleuchten">
      {lampen.map(({ id, art, Symbol, Erfunden, text, textEn }) => {
        const Icon = modus === 'invertiert' ? Erfunden : Symbol;
        const beschriftung = en ? textEn : text;
        return (
          <li key={id} className={styles.lampe} data-art={art}>
            <Icon className={styles.lampenSymbol} />
            {modus === 'korrekt' ? (
              <span className={styles.lampenText}>{beschriftung}</span>
            ) : (
              <span className="visually-hidden">{beschriftung}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AssistStatus({ modus, en, aktiv }: { modus: Modus; en: boolean; aktiv: boolean }) {
  if (modus === 'invertiert') return null;
  // Wie im echten Auto: grün = greift ein, grau = eingeschaltet, aber gerade nicht aktiv.
  return (
    <div key={String(aktiv)} className={styles.statusKlar} data-aktiv={aktiv} role="status">
      <I.Spur className={styles.statusSymbol} />
      <span className={styles.statusText}>
        <span>{en ? 'Lane Assist' : 'Spurhalteassistent'}</span>
        <strong>{aktiv ? (en ? 'ACTIVE' : 'aktiv') : en ? 'STANDBY' : 'bereit'}</strong>
      </span>
    </div>
  );
}

function AkustikHinweis({ modus }: { modus: Modus }) {
  if (modus === 'invertiert') {
    return (
      <div className={`${styles.akustik} ${styles.blende}`} data-modus="invertiert">
        <I.Glocke className={styles.glocke} />
      </div>
    );
  }
  return (
    <div className={`${styles.akustik} ${styles.blende}`} data-modus="korrekt" title="Kurze Ansagen, Warntöne nur bei Gefahr">
      <I.Lautsprecher />
    </div>
  );
}

function Tacho({ m, tempo, en }: { m: CockpitModel; tempo: number; en: boolean }) {
  const versteckt = m.blickabwendung === 'invertiert';
  const wert = en ? Math.round(tempo * 0.621) : tempo;
  return (
    <Rundinstrument
      wert={versteckt ? null : wert}
      max={en ? 150 : 240}
      schritt={en ? 30 : 40}
      digital={String(wert)}
      // Inversion Blickabwendung: Statt der Zahl ein hübsches Auto, das Tempo steht im Menü.
      symbol={versteckt ? <AutoVonHinten /> : undefined}
      einheit={versteckt ? '' : en ? 'mph' : 'km/h'}
      zusatz={versteckt ? (en ? 'SPD: see menu' : 'Tempo: siehe Menü') : undefined}
      beschriftung={versteckt ? 'Tacho ohne Geschwindigkeit' : `Tacho: ${wert} ${en ? 'mph' : 'km/h'}`}
    />
  );
}

/** Eigenes Fahrzeug von hinten, ersetzt im invertierten Tacho die Geschwindigkeit. */
function AutoVonHinten() {
  return (
    <g className={styles.rundAuto} transform="translate(100 100)">
      <path className={styles.rundAutoDach} d="M-21 -6 L-15 -21 Q-13 -25 -8 -25 H8 Q13 -25 15 -21 L21 -6 Z" />
      <rect x="-31" y="-7" width="62" height="21" rx="6" />
      <rect className={styles.rundAutoLicht} x="-27" y="-1" width="11" height="5" rx="2" />
      <rect className={styles.rundAutoLicht} x="16" y="-1" width="11" height="5" rx="2" />
      <rect x="-27" y="13" width="9" height="8" rx="2" />
      <rect x="18" y="13" width="9" height="8" rx="2" />
    </g>
  );
}

function Tempolimit({ modus, tempo, en }: { modus: Modus; tempo: number; en: boolean }) {
  const { tempolimit, isaAus } = useSim();
  const ueber = tempo > tempolimit && !isaAus;
  return (
    <div className={styles.tempolimit}>
      <div className={styles.schild} role="img" aria-label={`Tempolimit ${tempolimit} km/h`}>
        {tempolimit}
      </div>
      {ueber && modus === 'invertiert' && (
        <div className={styles.tempoAlarm}>{en ? 'SPEED LIMIT EXCEEDED!' : 'TEMPOLIMIT ÜBERSCHRITTEN!'}</div>
      )}
      {/* Korrekt: Nur wenn wirklich zu schnell gefahren wird, ein dezenter Hinweis mit Pedal-Impuls. */}
      {ueber && modus === 'korrekt' && (
        <div className={styles.tempoDezent}>
          <I.Vibration />
          <span>
            +{tempo - tempolimit} km/h · {en ? 'pedal pulse' : 'Pedal-Impuls'}
          </span>
        </div>
      )}
      {isaAus && <div className={styles.tempoAus}>{en ? 'ISA OFF' : 'Tempowarner aus'}</div>}
    </div>
  );
}

/** Was das System gerade erkennt, als ruhige Bestätigung. Wo es endet, zeigt die Navi-Karte entlang der Route. */
function Systemgrenzen({ en }: { en: boolean }) {
  return (
    <ul className={`${styles.grenzen} ${styles.blende}`} aria-label={en ? 'System detects' : 'Das System erkennt'}>
      <li data-art="gut">
        <I.Haken />
        <span>{en ? 'Lane · vehicle ahead detected' : 'Fahrspur · Fahrzeug voraus erkannt'}</span>
      </li>
    </ul>
  );
}

function Statusleiste({ en, sekunden }: { en: boolean; sekunden: boolean }) {
  const uhrzeit = new Date().toLocaleTimeString(en ? 'en-US' : 'de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    ...(sekunden ? { second: '2-digit' } : {}),
  });
  const felder = en
    ? ['RNG 256 mi', '46 °F', uhrzeit, 'ODO 19,472 mi']
    : ['Reichweite 412 km', '8 °C', uhrzeit, '31 337 km'];
  return (
    <div className={styles.statusleiste}>
      {felder.map((f) => (
        <span key={f === uhrzeit ? 'uhr' : f}>{f}</span>
      ))}
    </div>
  );
}

const MINI = ['Öl', 'Feuchte', 'Höhe', 'Kompass', 'Puls', 'Aktien', 'Mond', 'Schritte', 'kcal', 'Mails', 'Likes', 'Laut'];

function MiniAnzeigen() {
  const { takt } = useSim();
  return (
    <div className={styles.mini} aria-hidden="true">
      {MINI.map((name, i) => {
        const wert = (takt * (i + 3) + i * 17) % 97;
        return (
          <div key={name} className={styles.miniInstr} style={{ '--h': (i * 47) % 360 } as CSSProperties}>
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" pathLength={100} className={styles.miniSpur} />
              <circle
                cx="18"
                cy="18"
                r="14"
                pathLength={100}
                className={styles.miniWert}
                strokeDasharray={`${wert} 100`}
              />
              <text x="18" y="19" textAnchor="middle" dominantBaseline="central">
                {wert}
              </text>
            </svg>
            <span>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
