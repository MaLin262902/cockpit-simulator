import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import styles from './Cockpit.module.css';

/** Ob Kacheln verschiebbar sind und welche Ebene als nächste oben liegt (zuletzt angefasst = vorn). */
const Ebenen = createContext<{ beweglich: boolean; nachVorne: () => number }>({ beweglich: false, nachVorne: () => 1 });

/**
 * Fläche für Kacheln. Verschieben gibt es nur als Inversion („Blickführung und Informationshierarchie“):
 * Im korrekten Cockpit hat jedes Element seinen festen Platz.
 */
export function KachelFlaeche({
  className,
  beweglich,
  children,
}: {
  className?: string;
  beweglich: boolean;
  children: ReactNode;
}) {
  const oberste = useRef(1);
  const nachVorne = useCallback(() => ++oberste.current, []);
  const wert = useMemo(() => ({ beweglich, nachVorne }), [beweglich, nachVorne]);
  return (
    <Ebenen.Provider value={wert}>
      <div className={className} data-kachelflaeche="">
        {children}
      </div>
    </Ebenen.Provider>
  );
}

interface Zug {
  zeiger: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  laeuft: boolean;
  grenzen: { minX: number; maxX: number; minY: number; maxY: number };
}

const INTERAKTIV = 'button, input, select, a, label, [role="slider"]';

/**
 * Verschiebbare Kachel im Hauptdisplay. Maus: überall ziehen (außer auf Bedienelementen).
 * Touch: nur am Griff oben rechts, damit das Wischen zum Scrollen weiter funktioniert.
 * Anklicken holt die Kachel nach vorn. `start`: Versatz in Anteilen der Displaybreite und -höhe, mit dem die Kachel
 * in der Inversion beginnt; so überlappen die Kacheln und müssen erst auseinandergezogen werden.
 */
export function Kachel({
  className,
  children,
  name,
  start,
}: {
  className?: string;
  children: ReactNode;
  name: string;
  start?: [number, number];
}) {
  const { beweglich, nachVorne } = useContext(Ebenen);
  const element = useRef<HTMLDivElement>(null);
  const zug = useRef<Zug | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ebene, setEbene] = useState(0);
  const [zieht, setZieht] = useState(false);

  // Beim Einschalten der Inversion auf den Startversatz springen (im Display gehalten), beim Ausschalten zurück.
  useLayoutEffect(() => {
    const el = element.current;
    if (!beweglich || !start || !el) {
      setPos({ x: 0, y: 0 });
      return;
    }
    const flaeche = el.closest('[data-kachelflaeche]')?.getBoundingClientRect();
    if (!flaeche) return;
    const r = el.getBoundingClientRect();
    const begrenzt = (wert: number, min: number, max: number) => Math.min(max, Math.max(min, wert));
    setPos({
      x: begrenzt(start[0] * flaeche.width, flaeche.left - r.left, flaeche.right - r.right),
      y: begrenzt(start[1] * flaeche.height, flaeche.top - r.top, flaeche.bottom - r.bottom),
    });
    // Nur beim Umschalten der Inversion, nicht bei jeder Verschiebung.
  }, [beweglich]);

  const runter = (e: PointerEvent<HTMLDivElement>) => {
    setEbene(nachVorne());
    const ziel = e.target as HTMLElement;
    if (e.button !== 0 || ziel.closest(INTERAKTIV)) return;
    if (e.pointerType !== 'mouse' && !ziel.closest('[data-griff]')) return;
    const el = element.current!;
    const flaeche = el.closest('[data-kachelflaeche]')?.getBoundingClientRect() ?? el.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // Grenzen so, dass die Kachel vollständig im Display bleibt (r enthält die aktuelle Verschiebung).
    zug.current = {
      zeiger: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: pos.x,
      y: pos.y,
      laeuft: false,
      grenzen: {
        minX: pos.x + flaeche.left - r.left,
        maxX: pos.x + flaeche.right - r.right,
        minY: pos.y + flaeche.top - r.top,
        maxY: pos.y + flaeche.bottom - r.bottom,
      },
    };
  };

  const bewegen = (e: PointerEvent<HTMLDivElement>) => {
    const z = zug.current;
    if (!z || z.zeiger !== e.pointerId) return;
    const dx = e.clientX - z.startX;
    const dy = e.clientY - z.startY;
    if (!z.laeuft) {
      if (Math.hypot(dx, dy) < 4) return; // kleine Zitterbewegung ist ein Klick, kein Ziehen
      z.laeuft = true;
      element.current!.setPointerCapture(e.pointerId);
      setZieht(true);
    }
    const { minX, maxX, minY, maxY } = z.grenzen;
    setPos({
      x: Math.min(maxX, Math.max(minX, z.x + dx)),
      y: Math.min(maxY, Math.max(minY, z.y + dy)),
    });
  };

  const loslassen = () => {
    zug.current = null;
    setZieht(false);
  };

  // Fest stehende Kachel im korrekten Cockpit: keine Griffe, keine Verschiebung.
  if (!beweglich) return <div className={className}>{children}</div>;

  const verschoben = pos.x !== 0 || pos.y !== 0;

  return (
    <div
      ref={element}
      className={`${styles.kachel} ${className ?? ''}`}
      data-zieht={zieht}
      data-verschoben={verschoben}
      style={{ transform: verschoben ? `translate(${pos.x}px, ${pos.y}px)` : undefined, zIndex: ebene || undefined }}
      onPointerDown={runter}
      onPointerMove={bewegen}
      onPointerUp={loslassen}
      onPointerCancel={loslassen}
    >
      {children}
      <span className={styles.griff} data-griff="" title={`${name} verschieben`} aria-hidden="true" />
    </div>
  );
}
