import { useEffect, type KeyboardEvent, type PointerEvent } from 'react';
import type { Pedale } from '../../sim/fahrphysik';
import { useSim, type Blinker } from '../../sim/SimContext';
import styles from './Cockpit.module.css';

/**
 * Fußraum unter dem Lenkrad: Tempomat-Taste und Pedale einer Automatik (Bremse, Gas).
 * Pedale wirken, solange sie gedrückt werden: Maus, Finger oder Tastatur.
 */
export function Fahrerbedienung({ en }: { en: boolean }) {
  const { tempomat, tempomatZiel, tempomatUmschalten, pedale, setPedal } = useSim();

  return (
    <div className={styles.fussraum}>
      <button type="button" className={styles.tempomatTaste} aria-pressed={tempomat} onClick={tempomatUmschalten}>
        <span>{en ? 'Cruise' : 'Tempomat'}</span>
        <strong>{tempomat ? (en ? `${Math.round(tempomatZiel * 0.621)} mph` : `${tempomatZiel} km/h`) : en ? 'off' : 'aus'}</strong>
      </button>

      <div className={styles.pedale}>
        <Pedal art="bremse" name={en ? 'Brake' : 'Bremse'} gedrueckt={pedale.bremse} setPedal={setPedal} />
        <Pedal art="gas" name={en ? 'Accelerator' : 'Gas'} gedrueckt={pedale.gas} setPedal={setPedal} />
      </div>

    </div>
  );
}

const STELLUNGEN: Blinker[] = ['links', 'aus', 'rechts'];

/**
 * Lenkstockschalter mit drei Stellungen: oben (Blinker links), Mitte (aus), unten (Blinker rechts).
 * Er bewegt sich wie der Lenkradkranz auf seiner Seite: Beim Rechtsdrehen geht die rechte Seite nach unten.
 * Über dem Hebel antippen drückt ihn eine Raste nach oben, darunter eine Raste nach unten.
 * Der Hebel ist im Lenkrad gezeichnet (hinter dem Kranz); ohne Lenkrad zeigt ein kleiner Hebel die Stellung.
 */
export function Lenkstockschalter({ en }: { en: boolean }) {
  const { blinker, setBlinker } = useSim();
  const index = STELLUNGEN.indexOf(blinker);
  const stellung = en
    ? { links: 'up, left turn signal', aus: 'centre, off', rechts: 'down, right turn signal' }[blinker]
    : { links: 'oben, Blinker links', aus: 'Mitte, aus', rechts: 'unten, Blinker rechts' }[blinker];
  return (
    <div className={styles.lenkstock} role="group" aria-label={`${en ? 'Turn signal stalk' : 'Lenkstockschalter'}: ${stellung}`}>
      <span className={styles.hebelMini} data-stellung={blinker} aria-hidden="true">
        <span />
      </span>
      <button
        type="button"
        className={styles.hebelZone}
        data-zone="oben"
        aria-label={en ? 'Push stalk up' : 'Hebel nach oben'}
        disabled={index === 0}
        onClick={() => setBlinker(STELLUNGEN[index - 1])}
      />
      <button
        type="button"
        className={styles.hebelZone}
        data-zone="unten"
        aria-label={en ? 'Push stalk down' : 'Hebel nach unten'}
        disabled={index === STELLUNGEN.length - 1}
        onClick={() => setBlinker(STELLUNGEN[index + 1])}
      />
    </div>
  );
}

function Pedal({
  art,
  name,
  gedrueckt,
  setPedal,
}: {
  art: keyof Pedale;
  name: string;
  gedrueckt: boolean;
  setPedal: (pedal: keyof Pedale, gedrueckt: boolean) => void;
}) {
  const runter = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setPedal(art, true);
  };
  const hoch = () => setPedal(art, false);
  const taste = (e: KeyboardEvent<HTMLButtonElement>, gedrueckt: boolean) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setPedal(art, gedrueckt);
    }
  };
  return (
    <button
      type="button"
      className={styles.pedal}
      data-art={art}
      aria-pressed={gedrueckt}
      onPointerDown={runter}
      onPointerUp={hoch}
      onPointerCancel={hoch}
      onLostPointerCapture={hoch}
      onKeyDown={(e) => taste(e, true)}
      onKeyUp={(e) => taste(e, false)}
      onBlur={hoch}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className={styles.pedalPlatte} aria-hidden="true" />
      <span className={styles.pedalName}>{name}</span>
    </button>
  );
}

const IGNORIEREN = 'input, textarea, select, [contenteditable="true"]';

/**
 * Tastatursteuerung für die ganze Seite: ↑/W Gas, ↓/S Bremse (halten), ←/A und →/D Blinker, T Tempomat.
 * Wird einmal in der App eingebunden, auch wenn im Vergleich zwei Cockpits zu sehen sind.
 */
export function useTastatursteuerung() {
  const { setPedal, setBlinker, blinker, tempomatUmschalten } = useSim();
  useEffect(() => {
    const ziel = (e: globalThis.KeyboardEvent) =>
      e.target instanceof HTMLElement && e.target.closest(IGNORIEREN) !== null;
    const pedalTaste = (key: string): keyof Pedale | null => {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') return 'gas';
      if (key === 'ArrowDown' || key === 's' || key === 'S') return 'bremse';
      return null;
    };
    const runter = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || ziel(e)) return;
      const pedal = pedalTaste(e.key);
      if (pedal) {
        e.preventDefault();
        setPedal(pedal, true);
        return;
      }
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setBlinker(blinker === 'links' ? 'aus' : 'links');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setBlinker(blinker === 'rechts' ? 'aus' : 'rechts');
      } else if (e.key === 't' || e.key === 'T') {
        tempomatUmschalten();
      }
    };
    const hoch = (e: globalThis.KeyboardEvent) => {
      const pedal = pedalTaste(e.key);
      if (pedal) setPedal(pedal, false);
    };
    // Fenster verliert den Fokus: Pedale loslassen, damit nichts „hängen bleibt“.
    const loslassen = () => {
      setPedal('gas', false);
      setPedal('bremse', false);
    };
    window.addEventListener('keydown', runter);
    window.addEventListener('keyup', hoch);
    window.addEventListener('blur', loslassen);
    return () => {
      window.removeEventListener('keydown', runter);
      window.removeEventListener('keyup', hoch);
      window.removeEventListener('blur', loslassen);
    };
  }, [setPedal, setBlinker, blinker, tempomatUmschalten]);
}
