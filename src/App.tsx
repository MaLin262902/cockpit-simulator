import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioProvider } from './audio/AudioContext';
import { CardList } from './components/CardList/CardList';
import { Cockpit } from './components/Cockpit/Cockpit';
import { useTastatursteuerung } from './components/Cockpit/Fahrerbedienung';
import { Vergleich } from './components/Compare/Vergleich';
import { QrDialog } from './components/QrDialog/QrDialog';
import { SoundDirector } from './components/SoundDirector';
import { Strasse } from './components/Strasse/Strasse';
import { Toolbar } from './components/Toolbar/Toolbar';
import { deriveCockpit } from './effects/deriveCockpit';
import { SimProvider } from './sim/SimContext';
import { KartenProvider, useKarten } from './state/cockpitState';
import styles from './App.module.css';

export default function App() {
  return (
    <KartenProvider>
      <SimProvider>
        <AudioProvider>
          <Oberflaeche />
        </AudioProvider>
      </SimProvider>
    </KartenProvider>
  );
}

function Oberflaeche() {
  const { karten, zustaende } = useKarten();
  const [qr, setQr] = useState(false);
  const [vergleich, setVergleich] = useState(false);
  const [kartenZu, setKartenZu] = useState(false);
  useTastatursteuerung();

  const modell = useMemo(() => deriveCockpit(karten, zustaende), [karten, zustaende]);
  const schliesseQr = useCallback(() => setQr(false), []);

  // Höhe der festen Kopfleiste messen, damit das klebende Cockpit darunter beginnt.
  const kopf = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = kopf.current;
    if (!element) return;
    const beobachter = new ResizeObserver(() =>
      document.documentElement.style.setProperty('--kopf-hoehe', `${element.offsetHeight}px`),
    );
    beobachter.observe(element);
    return () => beobachter.disconnect();
  }, []);

  return (
    <>
      <div className={styles.app} inert={qr}>
        <header ref={kopf} className={styles.kopf}>
          <div className={styles.marke}>
            <h1 className={styles.titel}>Invertiertes Cockpit</h1>
          </div>
          <Toolbar vergleich={vergleich} setVergleich={setVergleich} oeffneQr={() => setQr(true)} />
        </header>

        <main className={styles.haupt} data-karten={kartenZu ? 'zu' : 'offen'}>
          <section className={styles.buehne} aria-label="Cockpit-Ansicht">
            {vergleich ? (
              <Vergleich />
            ) : (
              <>
                <Strasse />
                <Cockpit modell={modell} />
              </>
            )}
          </section>
          <aside className={styles.karten} aria-label="Karten">
            <CardList eingeklappt={kartenZu} setEingeklappt={setKartenZu} />
          </aside>
        </main>

        <footer className={styles.fuss}>
          Projekt im Modul „Digitale Intelligenz“, M.Sc. Human Factors, Hochschule Furtwangen. Fiktives
          Cockpit ohne echte Marken. Läuft komplett im Browser: keine Cookies, kein Tracking, keine
          Datenübertragung.
        </footer>
      </div>

      <SoundDirector modell={modell} />
      {qr && <QrDialog schliessen={schliesseQr} />}
    </>
  );
}
