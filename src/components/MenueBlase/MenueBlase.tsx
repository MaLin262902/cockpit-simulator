import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { zaehleInvertierte } from '../../effects/deriveCockpit';
import { useKarten } from '../../state/cockpitState';
import { CardList } from '../CardList/CardList';
import styles from './MenueBlase.module.css';

/** So lange bleibt die Blase offen, nachdem die Maus sie verlassen hat. */
const SCHLIESSEN_NACH_MS = 350;

/**
 * Die Kartenliste als schwebende Blase über dem Cockpit.
 * Maus: klappt beim Darüberfahren auf und nach dem Verlassen wieder zu, damit die Sicht aufs Cockpit frei wird.
 * Finger und Tastatur: Antippen bzw. Enter öffnet, Antippen außerhalb oder Esc schließt.
 */
export function MenueBlase() {
  const { karten, zustaende } = useKarten();
  const gesamt = zaehleInvertierte(karten, zustaende);
  const [hover, setHover] = useState(false);
  const [fokus, setFokus] = useState(false);
  const [angetippt, setAngetippt] = useState(false);
  const offen = hover || fokus || angetippt;
  const blase = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const zeiger = useRef<string>('');

  const zuMitVerzoegerung = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHover(false), SCHLIESSEN_NACH_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Angetippt offen: Tippen außerhalb schließt.
  useEffect(() => {
    if (!angetippt) return;
    const aussen = (e: globalThis.PointerEvent) => {
      if (!blase.current?.contains(e.target as Node)) setAngetippt(false);
    };
    document.addEventListener('pointerdown', aussen);
    return () => document.removeEventListener('pointerdown', aussen);
  }, [angetippt]);

  const rein = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(timer.current);
    setHover(true);
  };
  const raus = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') zuMitVerzoegerung();
  };
  // Nur Tastaturfokus hält die Blase offen; ein Mausklick hinterlässt zwar Fokus, soll sie aber nicht festhalten.
  const fokusRein = (e: FocusEvent) => {
    if ((e.target as HTMLElement).matches(':focus-visible')) setFokus(true);
  };
  const fokusRaus = (e: FocusEvent) => {
    if (!blase.current?.contains(e.relatedTarget as Node)) setFokus(false);
  };
  const taste = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    setHover(false);
    setFokus(false);
    setAngetippt(false);
    (document.activeElement as HTMLElement | null)?.blur();
  };
  const knopf = () => {
    // Mit der Maus öffnet schon das Darüberfahren; Finger und Tastatur schalten um.
    if (zeiger.current === 'mouse') return;
    setAngetippt(!offen);
    if (offen) setFokus(false);
  };

  return (
    <div
      ref={blase}
      className={styles.blase}
      data-offen={offen}
      onPointerEnter={rein}
      onPointerLeave={raus}
      onFocus={fokusRein}
      onBlur={fokusRaus}
      onKeyDown={taste}
    >
      <button
        type="button"
        id="menue-knopf"
        className={styles.knopf}
        aria-expanded={offen}
        aria-controls="menue-inhalt"
        onPointerDown={(e) => (zeiger.current = e.pointerType)}
        onKeyDown={() => (zeiger.current = 'tastatur')}
        onClick={knopf}
      >
        <span className={styles.symbol} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={styles.name}>Gestaltungsvorgaben</span>
        <span className={styles.zaehler} data-invertiert={gesamt > 0}>
          {gesamt}/{karten.length}
          <span className="visually-hidden"> invertiert</span>
        </span>
      </button>
      <div id="menue-inhalt" className={styles.inhalt} inert={!offen}>
        <CardList />
      </div>
    </div>
  );
}
