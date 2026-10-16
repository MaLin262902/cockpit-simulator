import { useEffect, useState, type CSSProperties, type ReactNode, type SVGProps } from 'react';
import { useAudio } from '../../audio/AudioContext';
import { ansageAbspielen } from '../../audio/audioEngine';
import { ansageFuer, type Ansage } from '../../effects/ansage';
import { KREUZUNG_ABSTAND } from '../../sim/fahrphysik';
import type { CockpitModel, Modus } from '../../effects/deriveCockpit';
import { useSim } from '../../sim/SimContext';
import type { Fahrlage } from './Cockpit';
import styles from './Cockpit.module.css';
import * as I from './icons';
import { Kachel, KachelFlaeche } from './Kachel';

interface Props {
  m: CockpitModel;
  lage: Fahrlage;
}

type Temperaturen = { links: number; rechts: number };
type Ansicht = 'navi' | 'medien' | 'telefon' | 'fahrzeug' | 'apps';
type IconTyp = (p: SVGProps<SVGSVGElement>) => ReactNode;

/** Hauptdisplay in der Mitte: Navigation, Medien, Telefon, Fahrzeug, Apps, Klima. */
export function Zentraldisplay({ m, lage }: Props) {
  const en = m.realeWelt === 'invertiert';
  const [ansicht, setAnsicht] = useState<Ansicht>('navi');
  const [menueOffen, setMenueOffen] = useState(false);
  const [temp, setTemp] = useState<Temperaturen>({ links: 21, rechts: 21.5 });
  const reduziert = m.ablenkung === 'korrekt';
  const audio = useAudio();
  const { rest } = useSim();
  // Navi-Ansage nur auf Knopfdruck; der Untertitel steht so lange wie die Aufnahme.
  const [untertitel, setUntertitel] = useState<Ansage | null>(null);
  useEffect(() => {
    if (!untertitel) return;
    const id = window.setTimeout(() => setUntertitel(null), untertitel.dauer * 1000);
    return () => window.clearTimeout(id);
  }, [untertitel]);
  const ansageSpielen = () => {
    const ansage = ansageFuer(m.akustik, rest);
    audio.einschalten();
    void ansageAbspielen(ansage.datei);
    setUntertitel({ ...ansage });
  };

  return (
    <section className={styles.center} aria-label="Hauptdisplay">
      <KachelFlaeche className={styles.centerInner} beweglich={m.lesefluss === 'invertiert'}>
        <Kopfzeile m={m} en={en} />

        <div className={styles.hauptbereich}>
          <Kachel name={ansicht === 'navi' ? 'Karte' : 'Ansicht'} className={styles.hauptansicht}>
            {ansicht === 'navi' && <Navigation m={m} en={en} ansageSpielen={ansageSpielen} spricht={untertitel !== null} />}
            {ansicht === 'medien' && <MedienAnsicht en={en} />}
            {ansicht === 'telefon' && <TelefonAnsicht en={en} />}
            {ansicht === 'fahrzeug' && <FahrzeugAnsicht modus={m.farblogik} en={en} />}
            {ansicht === 'apps' && <AppRaster m={m} en={en} oeffneMedien={() => setAnsicht('medien')} />}
            {untertitel && <Untertitel ansage={untertitel} modus={m.akustik} />}
          </Kachel>
          <div className={styles.seite}>
            {ansicht !== 'medien' && (
              <Kachel name="Medien" start={[0.36, 0.1]}>
                <Medien kompakt={reduziert} en={en} />
              </Kachel>
            )}
            {ansicht !== 'fahrzeug' && (
              <Kachel name="Reifendruck" start={[0.28, -0.16]}>
                <Fahrzeugstatus modus={m.farblogik} en={en} />
              </Kachel>
            )}
            {m.ablenkung === 'invertiert' && (
              <Kachel name="Werbung" start={[0.18, -0.3]}>
                <Werbung en={en} />
              </Kachel>
            )}
            {reduziert && <p className={styles.standHinweis}>Weitere Inhalte im Stand</p>}
          </div>
          {menueOffen && (
            <Menue
              m={m}
              tempo={lage.tempo}
              temp={temp}
              setTemp={setTemp}
              en={en}
              schliessen={() => setMenueOffen(false)}
            />
          )}
        </div>

        <Meldungen m={m} />

        <Klimaleiste
          m={m}
          en={en}
          temp={temp}
          setTemp={setTemp}
          ansicht={ansicht}
          setAnsicht={setAnsicht}
          menueOffen={menueOffen}
          setMenueOffen={setMenueOffen}
        />
      </KachelFlaeche>
    </section>
  );
}

function uhrzeit(en: boolean, plusMinuten = 0, sekunden = false) {
  return new Date(Date.now() + plusMinuten * 60000).toLocaleTimeString(en ? 'en-US' : 'de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    ...(sekunden ? { second: '2-digit' } : {}),
  });
}

function Kopfzeile({ m, en }: { m: CockpitModel; en: boolean }) {
  return (
    <div className={styles.statusbar}>
      {/* Inversion Informationsreduktion: Uhrzeit sekundengenau, die Zahl ändert sich ständig. */}
      <span className={styles.uhr}>{uhrzeit(en, 0, m.ablenkung === 'invertiert')}</span>
      <span className={styles.statusbarMitte}>
        {m.ablenkung === 'invertiert' && <span className={styles.chipLaut}>🔔 12</span>}
        {m.ablenkung === 'invertiert' && <span className={styles.chipLaut}>{en ? 'Update ready!' : 'Update verfügbar!'}</span>}
        {en && <span className={styles.chipCode}>SW v4.2.1-rc3</span>}
      </span>
      <span className={styles.statusbarRechts}>
        <span>{en ? '46 °F' : '8 °C'}</span>
        {/* Inversion reale Welt: Systembegriff statt bekanntem Symbol. */}
        {en ? <span className={styles.chipCode}>Bluetooth_on</span> : <I.Bluetooth className={styles.statusIcon} />}
        {/* Inversion Symbolkonventionen: Empfangsbalken fallen nach rechts ab statt anzusteigen (CSS). */}
        <span className={styles.empfang} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
    </div>
  );
}

/** Untertitel der Navi-Ansage: sichtbar auch ohne Ton. */
function Untertitel({ ansage, modus }: { ansage: Ansage; modus: Modus }) {
  return (
    <p className={styles.untertitel} data-modus={modus} aria-live="polite">
      <I.Lautsprecher />
      <span>{ansage.untertitel}</span>
    </p>
  );
}

function Navigation({
  m,
  en,
  ansageSpielen,
  spricht,
}: {
  m: CockpitModel;
  en: boolean;
  ansageSpielen: () => void;
  spricht: boolean;
}) {
  const ablenkung = m.ablenkung;
  const { rest, kreuzungen } = useSim();
  // Die Karte rollt dem Fahrzeug entgegen: 300 m bis zur Kreuzung entsprechen 86 Karteneinheiten.
  const versatz = ((KREUZUNG_ABSTAND - rest) / KREUZUNG_ABSTAND) * 86;
  const gefahrenKm = (kreuzungen * KREUZUNG_ABSTAND + KREUZUNG_ABSTAND - rest) / 1000;
  const restKm = Math.max(0.1, 12 - gefahrenKm);
  const restMin = Math.max(1, Math.round((restKm / 40) * 60));
  let entfernung: string;
  if (en) entfernung = `${(rest / 1609).toFixed(2)} mi`;
  else if (rest < 25) entfernung = 'Jetzt';
  else entfernung = `${Math.round(rest / 10) * 10} m`;
  return (
    <div className={styles.navi} data-modus={ablenkung}>
      <svg className={styles.naviKarte} viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="260" className={styles.karteGrund} />
        {/* Nach der Kreuzung springt die Karte zurück: Die Anfahrt beginnt in einer Schleife von vorn. */}
        <g key={kreuzungen} className={styles.karteRollt} style={{ transform: `translateY(${versatz}px)` }}>
          <path className={styles.kartePark} d="M18 128h86v66H18zM290 128h56v44h-56z" />
          <path className={styles.karteGewaesser} d="M0 218c70-22 130 18 210 4s130-30 190-14v52H0z" />
          <path
            className={styles.karteBlock}
            d="M18 -86h70v60H18zM106 -86h78v84h-78zM216 -86h32v84h-32zM274 -86h66v60h-66zM352 -86h40v84h-40zM18 14h70v40H18zM18 66h70v32H18zM106 14h78v84h-78zM216 14h32v40h-32zM216 66h32v32h-32zM274 66h66v32h-66zM352 14h40v84h-40zM216 128h32v60h-32zM120 128h66v70h-66zM274 14h46v40h-46z"
          />
          <path className={styles.karteNebenstrasse} d="M0 60H400M100 -100V220M210 110V220M346 -100V200M270 110V200M0 120H200M0 -20H400" />
          <path className={styles.karteHauptstrasse} d="M0 110H400M200 -100V260M260 -100V110" />
          <text className={styles.karteLabel} x="40" y="104">
            {en ? 'Main St' : 'Hauptstraße'}
          </text>
          <text className={styles.karteLabel} x="204" y="160" transform="rotate(90 204 160)">
            {en ? 'Station Rd' : 'Bahnhofstr.'}
          </text>
          <text className={styles.karteLabel} x="300" y="245">
            {en ? 'River' : 'Am Fluss'}
          </text>
          <path className={styles.karteRouteGefahren} d="M200 260V196" />
          <path className={styles.karteRouteRand} d="M200 196V110H260V36H330" />
          <path className={styles.karteRoute} d="M200 196V110H260V36H330" />
          {m.systemgrenzen === 'korrekt' && (
            <>
              <path className={styles.karteAssist} d="M200 196V110H260V74" />
              <path className={styles.karteKeinAssist} d="M260 74V36H330" />
            </>
          )}
          <g transform="translate(330 36)" className={styles.karteZiel}>
            <path d="M0 0v-16l12 5-12 5" />
          </g>
        </g>
        <circle cx="200" cy="196" r="16" className={styles.kartePositionKreis} />
        <path d="M200 186l-8 16 8-5 8 5z" className={styles.kartePosition} />
        {ablenkung === 'invertiert' &&
          [
            [40, 30], [300, 30], [60, 150], [320, 150], [150, 160],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5.5" className={styles.kartePoi} style={{ fill: `hsl(${i * 72} 80% 60%)` }} />
          ))}
      </svg>

      <div className={styles.manoever}>
        <div className={styles.manoeverHaupt}>
          <I.Pfeil />
          <span>
            <strong>{entfernung}</strong>
            <span>{en ? 'Main St' : 'Hauptstraße'}</span>
          </span>
        </div>
        <div className={styles.spuren} role="img" aria-label={en ? 'Lanes' : 'Fahrspurempfehlung: rechte Spur'}>
          <I.Spurpfeil />
          <I.Spurpfeil />
          <I.Spurpfeil abbiegen data-empfohlen="true" />
        </div>
      </div>

      <div className={styles.naviKnoepfe}>
        <button type="button" className={styles.naviKnopf} aria-label="Hineinzoomen">
          <I.Plus />
        </button>
        <button type="button" className={styles.naviKnopf} aria-label="Herauszoomen">
          <I.Minus />
        </button>
        <span className={styles.naviKnopf} role="img" aria-label="Kompass, Norden oben">
          <I.Kompass />
        </span>
        <button
          type="button"
          className={styles.naviKnopf}
          data-ansage=""
          aria-pressed={spricht}
          aria-label={en ? 'Play voice guidance' : 'Navi-Ansage abspielen'}
          title={en ? 'Voice guidance' : 'Navi-Ansage abspielen'}
          onClick={ansageSpielen}
        >
          <I.Lautsprecher />
        </button>
      </div>

      {m.systemgrenzen === 'korrekt' && (
        <div className={styles.assistLegende}>
          <span>
            <i data-art="ja" />
            {en ? 'Assist available' : 'Assistenz verfügbar'}
          </span>
          <span>
            <i data-art="nein" />
            {en ? 'not available' : 'ab Baustelle nicht verfügbar'}
          </span>
        </div>
      )}
      {m.systemgrenzen === 'invertiert' && (
        <div className={styles.assistAlles}>
          <I.Haken />
          {en ? 'AUTOPILOT: ENTIRE ROUTE' : 'AUTOPILOT AUF GESAMTER STRECKE'}
        </div>
      )}

      <div className={styles.eta}>
        <span>
          {en ? 'ETA' : 'Ankunft'} <strong>{uhrzeit(en, restMin)}</strong>
        </span>
        <span>{restMin} min</span>
        <span>{en ? `${(restKm * 0.621).toFixed(1)} mi` : `${restKm.toFixed(1).replace('.', ',')} km`}</span>
      </div>

      {ablenkung === 'invertiert' && (
        <div className={styles.benachrichtigungen} aria-hidden="true">
          <span>💬 {en ? '3 new messages' : '3 neue Nachrichten'}</span>
          <span>📈 {en ? 'Stocks +2.4%' : 'Aktien ▲ 2,4 %'}</span>
          <span>♎ {en ? 'Horoscope: be brave!' : 'Horoskop: Mut!'}</span>
        </div>
      )}
    </div>
  );
}

function useWiedergabe() {
  const { takt } = useSim();
  const [spielt, setSpielt] = useState(true);
  const [start] = useState(() => takt);
  const dauer = 214;
  const position = spielt ? (takt - start + 83) % dauer : 83;
  return { spielt, setSpielt, dauer, position };
}

const zeit = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Medien({ kompakt, en }: { kompakt: boolean; en: boolean }) {
  const { spielt, setSpielt, dauer, position } = useWiedergabe();
  return (
    <div className={styles.medien} data-kompakt={kompakt}>
      <div className={styles.cover} aria-hidden="true" />
      <div className={styles.medienText}>
        <span className={styles.medienQuelle}>
          <I.Bluetooth />
          {en ? 'SRC: BT_A2DP' : 'Bluetooth · Mein Handy'}
        </span>
        <strong>Nachtfahrt</strong>
        <span>Die Sinusfrequenzen</span>
      </div>
      {!kompakt && (
        <div className={styles.fortschritt}>
          <div className={styles.fortschrittBalken}>
            <span style={{ width: `${(position / dauer) * 100}%` }} />
          </div>
          <span>{zeit(position)}</span>
          <span>{zeit(dauer)}</span>
        </div>
      )}
      <Medienknoepfe spielt={spielt} setSpielt={setSpielt} />
    </div>
  );
}

function Medienknoepfe({ spielt, setSpielt }: { spielt: boolean; setSpielt: (s: boolean) => void }) {
  return (
    <div className={styles.medienKnoepfe}>
      <button type="button" className={styles.medienKnopf} aria-label="Vorheriger Titel">
        <I.Zurueck />
      </button>
      <button
        type="button"
        className={styles.medienKnopf}
        data-haupt="true"
        aria-label={spielt ? 'Pause' : 'Wiedergabe'}
        onClick={() => setSpielt(!spielt)}
      >
        {spielt ? <I.Pause /> : <I.Play />}
      </button>
      <button type="button" className={styles.medienKnopf} aria-label="Nächster Titel">
        <I.Vor />
      </button>
    </div>
  );
}

function MedienAnsicht({ en }: { en: boolean }) {
  const { spielt, setSpielt, dauer, position } = useWiedergabe();
  const titel = [
    ['Nachtfahrt', '3:34'],
    ['Tempo 50', '2:58'],
    ['Grüne Welle', '4:12'],
    ['Stau im Kopf', '3:21'],
  ];
  return (
    <div className={styles.vollansicht}>
      <div className={styles.medienGross}>
        <div className={`${styles.cover} ${styles.coverGross}`} aria-hidden="true" />
        <div className={styles.medienText}>
          <span className={styles.medienQuelle}>
            <I.Bluetooth />
            {en ? 'SRC: BT_A2DP' : 'Bluetooth · Mein Handy'}
          </span>
          <strong>Nachtfahrt</strong>
          <span>Die Sinusfrequenzen · Album „Gleichstrom“</span>
          <div className={styles.fortschritt}>
            <div className={styles.fortschrittBalken}>
              <span style={{ width: `${(position / dauer) * 100}%` }} />
            </div>
            <span>{zeit(position)}</span>
            <span>{zeit(dauer)}</span>
          </div>
          <Medienknoepfe spielt={spielt} setSpielt={setSpielt} />
        </div>
      </div>
      <ol className={styles.liste}>
        {titel.map(([name, laenge], i) => (
          <li key={name} data-aktiv={i === 0}>
            <span>{name}</span>
            <span>{laenge}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TelefonAnsicht({ en }: { en: boolean }) {
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const anrufe = en
    ? [['Mom', 'yesterday'], ['Garage', 'Mon'], ['Unknown', '3×'], ['Office', 'Fri']]
    : [['Mama', 'gestern'], ['Werkstatt', 'Mo'], ['Unbekannt', '3×'], ['Büro', 'Fr']];
  return (
    <div className={styles.vollansicht}>
      <h3 className={styles.vollTitel}>{en ? 'Recent calls' : 'Letzte Anrufe'}</h3>
      <ol className={styles.liste}>
        {anrufe.map(([name, wann]) => (
          <li key={name} data-aktiv={gewaehlt === name}>
            <span>{name}</span>
            <span className={styles.listeRechts}>
              {wann}
              <button
                type="button"
                className={styles.medienKnopf}
                aria-label={`${name} anrufen`}
                onClick={() => setGewaehlt(gewaehlt === name ? null : name)}
              >
                <I.Telefon />
              </button>
            </span>
          </li>
        ))}
      </ol>
      {gewaehlt && <p className={styles.standHinweis}>{en ? `Calling ${gewaehlt} … (simulated)` : `Rufe ${gewaehlt} an … (nur simuliert)`}</p>}
    </div>
  );
}

function FahrzeugAnsicht({ modus, en }: { modus: Modus; en: boolean }) {
  return (
    <div className={styles.vollansicht}>
      <h3 className={styles.vollTitel}>{en ? 'Vehicle' : 'Fahrzeug'}</h3>
      <Fahrzeugstatus modus={modus} en={en} />
      <ol className={styles.liste}>
        <li>
          <span>{en ? 'Service' : 'Inspektion'}</span>
          <span>{en ? 'in 2,600 mi' : 'in 4.200 km'}</span>
        </li>
        {/* Elektroauto: kein Motoröl, aber Kühlmittel für Akku und Antrieb */}
        <li>
          <span>{en ? 'Coolant' : 'Kühlmittel'}</span>
          <span>{en ? 'OK' : 'in Ordnung'}</span>
        </li>
        {/* Korrekt ohne Warnung; nur die englische Inversion (reale Welt) zeigt einen Systemcode */}
        <li>
          <span>{en ? 'Washer fluid' : 'Scheibenwaschwasser'}</span>
          <span>{en ? 'LOW_LVL' : 'voll'}</span>
        </li>
      </ol>
    </div>
  );
}

const APP_RASTER: { name: string; nameEn: string; Icon: IconTyp }[] = [
  { name: 'Wetter', nameEn: 'Weather', Icon: I.Wetter },
  { name: 'Kalender', nameEn: 'Calendar', Icon: I.Kalender },
  { name: 'Parken', nameEn: 'Parking', Icon: I.Auto },
  { name: 'Sitzmassage', nameEn: 'Massage', Icon: I.Massage },
  { name: 'Radio', nameEn: 'Radio', Icon: I.Musik },
  { name: 'Bordbuch', nameEn: 'Manual', Icon: I.Apps },
];

/** Radio wechselt in die Medienansicht, die anderen Kacheln zeigen nur, dass sie gewählt sind. */
function AppRaster({ m, en, oeffneMedien }: { m: CockpitModel; en: boolean; oeffneMedien: () => void }) {
  const [offen, setOffen] = useState<string | null>(null);
  const liste = m.gruppierung === 'invertiert' ? [3, 0, 5, 2, 4, 1].map((i) => APP_RASTER[i]) : APP_RASTER;
  return (
    <div className={styles.vollansicht}>
      <h3 className={styles.vollTitel}>Apps</h3>
      <div className={styles.appRaster} data-gruppierung={m.gruppierung}>
        {liste.map(({ name, nameEn, Icon }) => (
          <button
            key={name}
            type="button"
            className={styles.appKachel}
            aria-pressed={offen === name}
            aria-label={en ? nameEn : name}
            onClick={() => (name === 'Radio' ? oeffneMedien() : setOffen(offen === name ? null : name))}
          >
            <Icon />
            <span>{en ? nameEn : name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const REIFEN = [
  { pos: 'VL', bar: 2.4 },
  { pos: 'VR', bar: 2.4 },
  { pos: 'HL', bar: 2.3 },
  { pos: 'HR', bar: 2.3 },
];

/**
 * Im korrekten Cockpit sind alle Reifen in Ordnung. Nur die Inversion der Farblogik zeigt einen
 * Druckverlust, und zwar ausgerechnet in Grün, während die guten Werte rot sind.
 */
function Fahrzeugstatus({ modus, en }: { modus: Modus; en: boolean }) {
  const invertiert = modus === 'invertiert';
  const reifen = REIFEN.map((r) => (invertiert && r.pos === 'VL' ? { ...r, bar: 1.9, niedrig: true } : { ...r, niedrig: false }));
  const wert = (bar: number) => (en ? `${(bar * 14.5).toFixed(1)} psi` : `${bar.toFixed(1).replace('.', ',')} bar`);
  return (
    <div className={styles.fahrzeug} data-farblogik={modus}>
      <div className={styles.fahrzeugKopf}>
        <span>{en ? 'TPMS' : 'Reifendruck'}</span>
        {invertiert && en && <span className={styles.chipCode}>TPMS_FL_LOW</span>}
      </div>
      <div className={styles.reifenRaster}>
        {reifen.map((r) => (
          <span key={r.pos} className={styles.reifen} data-niedrig={r.niedrig} data-pos={r.pos}>
            {invertiert ? <I.Erfunden3 /> : null}
            {wert(r.bar)}
          </span>
        ))}
        <svg className={styles.fahrzeugBild} viewBox="0 0 40 70" aria-hidden="true">
          <rect x="6" y="4" width="28" height="62" rx="10" />
          <rect x="10" y="16" width="20" height="12" rx="3" className={styles.fahrzeugScheibe} />
          <rect x="10" y="46" width="20" height="8" rx="3" className={styles.fahrzeugScheibe} />
        </svg>
      </div>
      <div className={styles.verbrauch}>
        <span>{en ? 'AVG 3.7 mi/kWh' : 'Ø 16,8 kWh/100 km'}</span>
        <span>{en ? 'RNG 256 mi' : 'Reichweite 412 km'}</span>
      </div>
    </div>
  );
}

function Werbung({ en }: { en: boolean }) {
  return (
    <div className={styles.werbung} aria-hidden="true">
      {en ? 'SEAT HEATING SUBSCRIPTION' : 'Sitzheizung im Abo'}
      <span className={styles.werbungKlein}>
        {en ? 'Only today: 3 months free! Tap here now!' : 'Nur heute: 3 Monate gratis! Jetzt antippen!'}
      </span>
    </div>
  );
}

/** Meldungen gibt es nur im invertierten Cockpit; das korrekte Cockpit ist fehlerfrei. */
function Meldungen({ m }: { m: CockpitModel }) {
  const texte = [
    ...(m.realeWelt === 'invertiert'
      ? [{ id: 'realeWelt', text: 'ERR 0x8004E00F: Operation failed successfully (LKA_CAM_04, status 0 = OK)' }]
      : []),
    ...m.hinweise,
  ];
  if (texte.length === 0) return null;
  return (
    <Kachel name="Meldung" className={styles.meldungen}>
      {texte.map((h) => (
        <p key={h.id} className={`${styles.meldung} ${styles.blende}`} data-modus="invertiert">
          {h.text}
        </p>
      ))}
    </Kachel>
  );
}

function tempText(t: number, en: boolean) {
  return en ? `${Math.round((t * 9) / 5 + 32)} °F` : `${t.toFixed(1).replace('.', ',')}°`;
}

/** Klimabedienung je nach Karte „Passende Stellteile“. */
function Klimaregler({
  seite,
  m,
  en,
  temp,
  setTemp,
}: {
  seite: keyof Temperaturen;
  m: CockpitModel;
  en: boolean;
  temp: Temperaturen;
  setTemp: (t: Temperaturen) => void;
}) {
  const wer = seite === 'links' ? 'Fahrer' : 'Beifahrer';
  if (m.stellteile === 'invertiert') {
    // Sabotage: winziger Schieberegler, „Komfortindex“ statt °C, und der Regler springt in die Gegenrichtung.
    const komfort = Math.round(((28 - temp[seite]) / 12) * 100);
    return (
      <label className={styles.klimaSchieber}>
        <span>
          ◀ {en ? 'warmer' : 'wärmer'} · {en ? 'colder' : 'kälter'} ▶
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={100 - komfort}
          aria-label={`${wer}: Komfortindex`}
          onChange={(e) => setTemp({ ...temp, [seite]: 16 + (Number(e.target.value) / 100) * 12 })}
        />
        <span>
          {en ? 'Comfort' : 'Komfortindex'} {komfort} %
        </span>
      </label>
    );
  }
  const gross = m.stellteile === 'korrekt';
  return (
    <div className={styles.temperatur} data-gross={gross}>
      <button
        type="button"
        className={styles.klimaKnopf}
        aria-label={`${wer}: kälter`}
        onClick={() => setTemp({ ...temp, [seite]: Math.max(16, temp[seite] - 0.5) })}
      >
        <I.Minus />
      </button>
      <span className={styles.tempWert}>
        {tempText(temp[seite], en)}
        {gross && <small>{wer}</small>}
      </span>
      <button
        type="button"
        className={styles.klimaKnopf}
        aria-label={`${wer}: wärmer`}
        onClick={() => setTemp({ ...temp, [seite]: Math.min(28, temp[seite] + 0.5) })}
      >
        <I.Plus />
      </button>
    </div>
  );
}

interface AppEintrag {
  id: string;
  name: string;
  Icon: IconTyp;
  ansicht: Ansicht;
  gruppe: 'fahren' | 'unterhaltung' | 'weitere';
}

function Klimaleiste({
  m,
  en,
  temp,
  setTemp,
  ansicht,
  setAnsicht,
  menueOffen,
  setMenueOffen,
}: {
  m: CockpitModel;
  en: boolean;
  temp: Temperaturen;
  setTemp: (t: Temperaturen) => void;
  ansicht: Ansicht;
  setAnsicht: (a: Ansicht) => void;
  menueOffen: boolean;
  setMenueOffen: (offen: boolean) => void;
}) {

  const apps: AppEintrag[] = [
    { id: 'navi', name: en ? 'Nav' : 'Navi', Icon: I.Navi, ansicht: 'navi', gruppe: 'fahren' },
    { id: 'fahrzeug', name: en ? 'Vehicle' : 'Fahrzeug', Icon: I.Auto, ansicht: 'fahrzeug', gruppe: 'fahren' },
    { id: 'medien', name: en ? 'Media' : 'Medien', Icon: I.Musik, ansicht: 'medien', gruppe: 'unterhaltung' },
    { id: 'telefon', name: en ? 'Phone' : 'Telefon', Icon: I.Telefon, ansicht: 'telefon', gruppe: 'unterhaltung' },
    { id: 'apps', name: 'Apps', Icon: I.Apps, ansicht: 'apps', gruppe: 'weitere' },
  ];
  // Sabotage Gruppierung: Fremdes dazwischen, Reihenfolge und Abstände beliebig.
  const fremde: AppEintrag[] = [
    { id: 'massage', name: en ? 'Massage' : 'Sitzmassage', Icon: I.Massage, ansicht: 'apps', gruppe: 'weitere' },
    { id: 'wetter', name: en ? 'Weather' : 'Wetter', Icon: I.Wetter, ansicht: 'apps', gruppe: 'weitere' },
    { id: 'kalender', name: en ? 'Calendar' : 'Kalender', Icon: I.Kalender, ansicht: 'apps', gruppe: 'weitere' },
  ];
  const abstaende = [0, 22, 2, 36, 6, 0, 18, 3];

  const knopf = (a: AppEintrag, stil?: CSSProperties) => (
    <button
      key={a.id}
      type="button"
      className={styles.app}
      style={stil}
      aria-pressed={ansicht === a.ansicht && (a.id === a.ansicht || a.ansicht !== 'apps')}
      aria-label={a.name}
      onClick={() => setAnsicht(a.ansicht)}
    >
      <a.Icon />
      <span>{a.name}</span>
    </button>
  );

  let dock: ReactNode;
  if (m.gruppierung === 'invertiert') {
    const gemischt = [apps[3], fremde[0], apps[0], fremde[1], apps[1], fremde[2], apps[2], apps[4]];
    dock = (
      <>
        {gemischt.map((a, i) => knopf(a, { marginLeft: abstaende[i] }))}
      </>
    );
  } else {
    const gruppen: { id: AppEintrag['gruppe']; titel: string }[] = [
      { id: 'fahren', titel: en ? 'DRIVE' : 'Fahren' },
      { id: 'unterhaltung', titel: en ? 'MEDIA' : 'Unterhaltung' },
      { id: 'weitere', titel: en ? 'MORE' : 'Weitere' },
    ];
    const gruppe = (id: string, titel: string, inhalt: ReactNode) => (
      <span key={id} className={styles.appGruppe}>
        <span className={styles.appGruppeTitel}>{titel}</span>
        <span className={styles.appGruppeInhalt}>{inhalt}</span>
      </span>
    );
    dock = (
      <>
        {gruppen.map((g) => gruppe(g.id, g.titel, apps.filter((a) => a.gruppe === g.id).map((a) => knopf(a))))}
      </>
    );
  }

  return (
    <div
      className={styles.klimaleiste}
      data-direkt={m.blickabwendung === 'korrekt'}
      data-gruppiert={m.gruppierung === 'korrekt'}
    >
      <Klimaregler seite="links" m={m} en={en} temp={temp} setTemp={setTemp} />
      <div className={styles.dock} role="group" aria-label="App-Leiste" data-gruppierung={m.gruppierung}>
        {dock}
        <button
          type="button"
          className={styles.app}
          aria-expanded={menueOffen}
          onClick={() => setMenueOffen(!menueOffen)}
        >
          <span className={styles.menueSymbol}>☰</span>
          <span>{en ? 'Menu' : 'Menü'}</span>
        </button>
      </div>
      <Klimaregler seite="rechts" m={m} en={en} temp={temp} setTemp={setTemp} />
    </div>
  );
}

interface Knoten {
  label: string;
  kinder?: Knoten[];
  inhalt?: ReactNode;
}

const AMBIENTE = ['Abendrot', 'Polarlicht', 'Neon-Pink', 'Büro-Weiß', 'Aquarium', 'Diskothek'];
const MASSAGE = ['Welle', 'Katze', 'Presslufthammer', 'Sanfter Tsunami', 'Aus'];

/**
 * Menü im Hauptdisplay. Korrekt flach und aufgabenorientiert; invertiert (Karte „Blickabwendung“) tief verschachtelt
 * und unsinnig sortiert. Alle Einträge funktionieren tatsächlich, invertiert findet man sie nur nicht.
 */
function Menue({
  m,
  tempo,
  temp,
  setTemp,
  en,
  schliessen,
}: {
  m: CockpitModel;
  tempo: number;
  temp: Temperaturen;
  setTemp: (t: Temperaturen) => void;
  en: boolean;
  schliessen: () => void;
}) {
  const { isaAus, setIsaAus, warnblinker, setWarnblinker } = useSim();
  const [pfad, setPfad] = useState<string[]>([]);
  const [ambiente, setAmbiente] = useState(0);
  const [massage, setMassage] = useState(4);
  const [sender, setSender] = useState('101,3');
  const [sprache, setSprache] = useState('Deutsch');
  const blick = m.blickabwendung === 'invertiert';
  const tempoImMenue = m.systemstatus === 'invertiert';
  const tempoAnzeige = (
    <span className={styles.menueTempo}>
      {en ? Math.round(tempo * 0.621) : tempo} {en ? 'mph' : 'km/h'}
    </span>
  );

  const schalter = (text: string, an: boolean, umschalten: () => void) => (
    <button type="button" className={styles.menuePunkt} aria-pressed={an} onClick={umschalten}>
      {text}: {an ? 'AN' : 'AUS'}
    </button>
  );

  // Korrekt: flach und nach Aufgaben sortiert, jede Einstellung nach zwei Schritten erreichbar.
  const flach: Knoten[] = [
    ...(tempoImMenue ? [{ label: 'Anzeigen', kinder: [{ label: 'Geschwindigkeit', inhalt: tempoAnzeige }] }] : []),
    {
      label: 'Klima',
      kinder: [
        {
          label: 'Temperatur Fahrer',
          inhalt: (
            <span className={styles.menueReihe}>
              <button type="button" className={styles.menuePunkt} onClick={() => setTemp({ ...temp, links: Math.max(16, temp.links - 0.5) })}>
                −
              </button>
              <span className={styles.menueTempo}>{tempText(temp.links, en)}</span>
              <button type="button" className={styles.menuePunkt} onClick={() => setTemp({ ...temp, links: Math.min(28, temp.links + 0.5) })}>
                +
              </button>
            </span>
          ),
        },
      ],
    },
    {
      label: 'Fahrerassistenz',
      kinder: [
        { label: 'Tempowarner', inhalt: schalter('Tempowarner', !isaAus, () => setIsaAus(!isaAus)) },
        { label: 'Spurhalteassistent', inhalt: 'Spurhalteassistent: an' },
      ],
    },
    {
      label: 'Licht',
      kinder: [
        {
          label: 'Ambientelicht',
          inhalt: (
            <button type="button" className={styles.menuePunkt} onClick={() => setAmbiente((ambiente + 1) % AMBIENTE.length)}>
              Farbe: {AMBIENTE[ambiente]} ›
            </button>
          ),
        },
      ],
    },
    {
      label: 'Sitz',
      kinder: [
        {
          label: 'Massage',
          inhalt: (
            <button type="button" className={styles.menuePunkt} onClick={() => setMassage((massage + 1) % MASSAGE.length)}>
              Programm: {MASSAGE[massage]} ›
            </button>
          ),
        },
      ],
    },
    {
      label: 'Sprache',
      inhalt: (
        <span className={styles.menueReihe}>
          {['Deutsch', 'English'].map((s) => (
            <button key={s} type="button" className={styles.menuePunkt} aria-pressed={sprache === s} onClick={() => setSprache(s)}>
              {s}
            </button>
          ))}
        </span>
      ),
    },
  ];

  // Invertiert (Blickabwendung): tief verschachtelt und unsinnig sortiert; ist der Tacho leer, steckt das Tempo tief drin.
  const tief: Knoten[] = [
    {
      label: 'Favoriten',
      inhalt: 'Keine Favoriten. Favoriten anlegen unter: Einstellungen › Favoriten › Favoriten verwalten › Favorit hinzufügen.',
    },
    {
      label: 'Multimedia',
      kinder: [
        {
          label: 'Klima',
          kinder: [
            {
              label: 'Temperatur (Fahrer)',
              inhalt: (
                <span className={styles.menueReihe}>
                  <button type="button" className={styles.menuePunkt} onClick={() => setTemp({ ...temp, links: temp.links - 0.1 })}>
                    −0,1
                  </button>
                  <span className={styles.menueTempo}>{tempText(temp.links, en)}</span>
                  <button type="button" className={styles.menuePunkt} onClick={() => setTemp({ ...temp, links: temp.links + 0.1 })}>
                    +0,1
                  </button>
                </span>
              ),
            },
            { label: 'Gebläse', inhalt: 'Gebläse wird automatisch geregelt. Manuell: siehe Bordbuch, Seite 412.' },
          ],
        },
        {
          label: 'Radio',
          kinder: [
            {
              label: 'Sender',
              inhalt: (
                <span className={styles.menueReihe}>
                  {['87,6', '101,3', '104,9'].map((s) => (
                    <button key={s} type="button" className={styles.menuePunkt} aria-pressed={sender === s} onClick={() => setSender(s)}>
                      {s}
                    </button>
                  ))}
                </span>
              ),
            },
          ],
        },
        {
          label: 'Ambientelicht',
          kinder: [
            {
              label: '64 Farben',
              inhalt: (
                <button type="button" className={styles.menuePunkt} onClick={() => setAmbiente((ambiente + 1) % AMBIENTE.length)}>
                  Farbe {ambiente * 11 + 7} von 64: {AMBIENTE[ambiente]} ›
                </button>
              ),
            },
          ],
        },
      ],
    },
    {
      label: 'Fahrzeug',
      kinder: [
        {
          label: 'Komfort',
          kinder: [
            {
              label: 'Sitz',
              kinder: [
                {
                  label: 'Massage',
                  inhalt: (
                    <button type="button" className={styles.menuePunkt} onClick={() => setMassage((massage + 1) % MASSAGE.length)}>
                      Programm: {MASSAGE[massage]} ›
                    </button>
                  ),
                },
              ],
            },
          ],
        },
        ...(tempoImMenue
          ? [
              {
                label: 'Anzeigen',
                kinder: [{ label: 'Tacho', kinder: [{ label: 'Geschwindigkeit anzeigen', inhalt: tempoAnzeige }] }],
              },
            ]
          : []),
      ],
    },
    {
      label: 'Einstellungen',
      kinder: [
        {
          label: 'Allgemein',
          kinder: [
            {
              label: 'Weitere Einstellungen',
              kinder: [
                {
                  label: 'Erweitert',
                  kinder: [
                    {
                      label: 'Fahrerassistenz',
                      kinder: [
                        { label: 'Tempowarner', inhalt: schalter('Tempowarner', !isaAus, () => setIsaAus(!isaAus)) },
                        { label: 'Spurhalten', inhalt: 'Spurhalten: Standard (nicht änderbar)' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Datenschutz',
          kinder: [{ label: 'Warnblinker', inhalt: schalter('Warnblinker', warnblinker, () => setWarnblinker(!warnblinker)) }],
        },
        {
          label: 'Sprache',
          inhalt: (
            <span className={styles.menueReihe}>
              {['Deutsch', 'English', 'Latein', 'Morsecode'].map((s) => (
                <button key={s} type="button" className={styles.menuePunkt} aria-pressed={sprache === s} onClick={() => setSprache(s)}>
                  {s}
                </button>
              ))}
            </span>
          ),
        },
      ],
    },
    {
      label: 'Hilfe',
      kinder: [{ label: 'Hilfe', kinder: [{ label: 'Hilfe zur Hilfe', inhalt: 'Hilfe finden Sie unter: Menü › Hilfe.' }] }],
    },
  ];

  const baum = blick ? tief : flach;

  // Pfad auflösen; fällt ein Eintrag weg, springt das Menü zurück.
  let ebene: Knoten[] = baum;
  let aktuell: Knoten | null = null;
  const gueltig: string[] = [];
  for (const label of pfad) {
    const knoten = ebene.find((k) => k.label === label);
    if (!knoten) break;
    gueltig.push(label);
    aktuell = knoten;
    if (!knoten.kinder) break;
    ebene = knoten.kinder;
  }

  return (
    <div className={styles.menue} role="dialog" aria-label={en ? 'Menu' : 'Menü'}>
      <div className={styles.menueKopf}>
        <span className={styles.menuePfad}>{[en ? 'Menu' : 'Menü', ...gueltig].join(' › ')}</span>
        <button type="button" className={styles.menueZu} onClick={schliessen} aria-label="Menü schließen">
          ×
        </button>
      </div>
      {aktuell?.inhalt !== undefined ? (
        <div className={styles.menueInhalt}>{aktuell.inhalt}</div>
      ) : (
        <div className={styles.menueListe}>
          {ebene.map((k) => (
            <button key={k.label} type="button" className={styles.menuePunkt} onClick={() => setPfad([...gueltig, k.label])}>
              {k.label} ›
            </button>
          ))}
        </div>
      )}
      {gueltig.length > 0 && (
        <button type="button" className={styles.menueZurueck} onClick={() => setPfad(gueltig.slice(0, -1))}>
          ‹ {en ? 'Back' : 'Zurück'}
        </button>
      )}
    </div>
  );
}
